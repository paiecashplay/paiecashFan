// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/fan-feed.js — Fan Club (feed + chat par club)
// Monté sur /api/v2/clubs. Toutes les routes exigent une session
// (requireAuth) — tout fan connecté peut lire et publier.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, optionalAuth } = require('../../../middleware/auth');
const fanFeed = require('../../../db/fanFeed');
const mod = require('../../../db/chatModeration');
const aiMod = require('../../../services/moderation');
const favorites = require('../../../db/favorites');
const { requireClubModerator } = require('../../../middleware/clubModerator');
const supabase = require('../../../db/supabase');

const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const MAX = 2000;
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

// Pré-classement IA : APRÈS publication, sans await — le supporter ne doit
// jamais attendre l'IA, et une panne de l'IA ne doit jamais casser l'envoi.
function screenAsync(args) {
  aiMod.screenContent(args).catch((e) => console.warn('[moderation] pré-classement échoué :', e.message));
}

// Résout le club (slug → tenant) et le pose sur req.
async function withTenant(req, res, next) {
  const tenant = await fanFeed.resolveTenantId(req.params.slug);
  if (!tenant) return fail(res, 'Club introuvable.', 404);
  req.tenant = tenant;
  next();
}

// Garde d'écriture du salon : AUCUNE sanction bloquante + charte acceptée.
// Appliquée à TOUT ce qui publie (chat, publications, commentaires) : la charte
// ne doit pas être contournable par un autre endpoint.
async function requireChatAccess(req, res, next) {
  try {
    const sanction = await mod.getActiveSanction(req.authUser.id, req.tenant.id);
    if (sanction) return fail(res, sanctionMessage(sanction), 403, { sanction });
    if (await mod.needsCharter(req.tenant.id, req.authUser.id)) {
      return fail(res, 'Tu dois accepter la charte du salon avant de publier.', 403,
        { needsCharter: true, charterVersion: mod.CHARTER_VERSION });
    }
    next();
  } catch (err) { return fail(res, 'Vérification d\'accès impossible : ' + err.message, 500); }
}

// GET /api/v2/clubs/:slug/fan-feed — public (consultable sans connexion).
// Si l'utilisateur est connecté (optionalAuth), on renvoie aussi likedByMe.
router.get('/:slug/fan-feed', optionalAuth, withTenant, async (req, res) => {
  try {
    const data = await fanFeed.getFeed(req.tenant.id, req.authUser?.id || null);
    return ok(res, data);
  } catch (err) {
    return fail(res, 'Chargement du fan club impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts  { content }
router.post('/:slug/fan-feed/posts', requireAuth, withTenant, requireChatAccess, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le message est vide.');
  if (content.length > MAX) return fail(res, 'Message trop long.');
  try {
    const post = await fanFeed.createPost(req.tenant.id, req.authUser.id, content);
    screenAsync({ contentType: 'post', contentId: post.id, tenantId: req.tenant.id, authorId: req.authUser.id, content });
    return ok(res, { post });
  } catch (err) {
    return fail(res, 'Publication impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts/:postId/comments  { content }
router.post('/:slug/fan-feed/posts/:postId/comments', requireAuth, withTenant, requireChatAccess, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le commentaire est vide.');
  if (content.length > MAX) return fail(res, 'Commentaire trop long.');
  try {
    const comment = await fanFeed.addComment(req.params.postId, req.authUser.id, content);
    screenAsync({ contentType: 'comment', contentId: comment.id, tenantId: req.tenant.id, authorId: req.authUser.id, content });
    return ok(res, { comment });
  } catch (err) {
    return fail(res, 'Commentaire impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/posts/:postId/like  → toggle
router.post('/:slug/fan-feed/posts/:postId/like', requireAuth, withTenant, async (req, res) => {
  try {
    const result = await fanFeed.toggleLike(req.params.postId, req.authUser.id);
    return ok(res, result);
  } catch (err) {
    return fail(res, 'Like impossible : ' + err.message, 500);
  }
});

// POST /api/v2/clubs/:slug/fan-feed/messages  { content }
// Garde serveur (requireChatAccess) : charte acceptée + aucune sanction.
router.post('/:slug/fan-feed/messages', requireAuth, withTenant, requireChatAccess, async (req, res) => {
  const content = clean(req.body?.content);
  if (!content) return fail(res, 'Le message est vide.');
  if (content.length > MAX) return fail(res, 'Message trop long.');
  try {
    const message = await fanFeed.createMessage(req.tenant.id, req.authUser.id, content);
    screenAsync({ contentType: 'message', contentId: message.id, tenantId: req.tenant.id, authorId: req.authUser.id, content });
    return ok(res, { message, moderation: { status: 'published', reason: null, canAppeal: false } });
  } catch (err) {
    return fail(res, 'Envoi impossible : ' + err.message, 500);
  }
});

// ── Modération : accès au salon, charte, signalement ─────────

// GET /api/v2/clubs/:slug/chat-access — état d'accès du visiteur au salon.
// Public (optionalAuth) : dit au front quoi afficher (charte renforcée, sanction…).
router.get('/:slug/chat-access', optionalAuth, withTenant, async (req, res) => {
  try {
    const clubName = req.tenant.name;
    const userId = req.authUser?.id || null;
    if (!userId) {
      return ok(res, {
        canRead: true, canWrite: false, isLoggedIn: false, clubName,
        isFavorite: false, favoriteClubName: null,
        needsCharter: false, charterVersion: mod.CHARTER_VERSION, activeSanction: null,
      });
    }

    const [favs, needsCharter, sanction] = await Promise.all([
      favorites.listFavorites(userId),
      mod.needsCharter(req.tenant.id, userId),
      mod.getActiveSanction(userId, req.tenant.id),
    ]);
    const isFavorite = favs.some((f) => f.club.id === req.tenant.id);
    const primary = favs.find((f) => f.isPrimary);

    return ok(res, {
      canRead: true,
      canWrite: !sanction,                 // la charte est un préalable géré via needsCharter
      isLoggedIn: true,
      clubName,
      isFavorite,
      favoriteClubName: primary?.club?.name || null,
      favoriteClubSlug: primary?.club?.slug || null,
      needsCharter,
      charterVersion: mod.CHARTER_VERSION,
      activeSanction: sanction,
    });
  } catch (err) { return fail(res, 'Accès au salon : ' + err.message, 500); }
});

// POST /api/v2/clubs/:slug/chat-charter/accept — enregistre l'acceptation.
router.post('/:slug/chat-charter/accept', requireAuth, withTenant, async (req, res) => {
  try { return ok(res, await mod.acceptCharter(req.tenant.id, req.authUser.id)); }
  catch (err) { return fail(res, 'Acceptation impossible : ' + err.message, 500); }
});

// ── Signalement (chat, posts ET commentaires) ────────────────
// Handler unique et polymorphe : une seule garde à maintenir pour les 3
// surfaces. Un contenu ne peut être signalé qu'une fois par supporter, et le
// signalant reste anonyme.
function reportHandler(contentType) {
  return async (req, res) => {
    try {
      const contentId = req.params.contentId;
      const content = await mod.getContent(contentType, contentId);
      if (!content) return fail(res, 'Contenu introuvable.', 404);
      // Cloisonnement : on ne signale que dans le salon courant.
      // (Pour un commentaire, tenant_id est résolu via le post parent.)
      if (content.tenant_id !== req.tenant.id) return fail(res, 'Contenu introuvable.', 404);
      if (content.author_id === req.authUser.id) return fail(res, 'Tu ne peux pas signaler ton propre contenu.', 400);

      const report = await mod.createReport({
        contentType, contentId: content.id, tenantId: req.tenant.id,
        reporterUserId: req.authUser.id, reportedUserId: content.author_id,
        reason: clean(req.body?.reason), comment: clean(req.body?.comment) || null,
      });
      return ok(res, { reported: true, reportId: report.id });
    } catch (err) {
      if (err.code === 'ALREADY_REPORTED') return fail(res, err.message, 409);
      if (err.code === 'BAD_REASON') return fail(res, err.message, 400);
      return fail(res, 'Signalement impossible : ' + err.message, 500);
    }
  };
}

router.post('/:slug/fan-feed/messages/:contentId/report', requireAuth, withTenant, reportHandler('message'));
router.post('/:slug/fan-feed/posts/:contentId/report', requireAuth, withTenant, reportHandler('post'));
router.post('/:slug/fan-feed/comments/:contentId/report', requireAuth, withTenant, reportHandler('comment'));

// ── Modération côté club_admin (borné à SON salon) ───────────
// GET /api/v2/clubs/:slug/moderation/cases?status=&priority=
router.get('/:slug/moderation/cases', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    const cases = await mod.listCases({
      tenantId: req.tenant.id,                    // ← toujours borné au salon
      status: req.query.status || null,
      priority: req.query.priority || null,
    });
    return ok(res, { cases, moderatorType: req.moderatorType });
  } catch (err) { return fail(res, 'File de modération : ' + err.message, 500); }
});

// GET /api/v2/clubs/:slug/moderation/cases/:id — détail (vérif d'appartenance).
router.get('/:slug/moderation/cases/:id', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    const c = await mod.getCase(req.params.id);
    if (!c) return fail(res, 'Dossier introuvable.', 404);
    if (c.tenant_id !== req.tenant.id) return fail(res, 'Ce dossier ne concerne pas ton salon.', 403);
    return ok(res, { case: c });
  } catch (err) { return fail(res, err.message, 500); }
});

// POST /api/v2/clubs/:slug/moderation/cases/:id/decision  { decision, reason }
router.post('/:slug/moderation/cases/:id/decision', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    // Le dossier doit appartenir au salon du club_admin.
    const c = await mod.getCase(req.params.id);
    if (!c) return fail(res, 'Dossier introuvable.', 404);
    if (c.tenant_id !== req.tenant.id) return fail(res, 'Ce dossier ne concerne pas ton salon.', 403);

    const result = await mod.decideCase({
      caseId: req.params.id,
      decision: req.body?.decision,
      reason: req.body?.reason || null,
      sanction: req.body?.sanction || null,       // types globaux refusés pour un club_admin
      actorId: req.authUser.id,
      actorType: req.moderatorType,               // club_admin | super_admin
    });
    return ok(res, result);
  } catch (err) {
    if (['BAD_DECISION', 'BAD_TYPE', 'BAD_PERMANENT', 'DURATION_REQUIRED', 'NEEDS_HUMAN'].includes(err.code)) return fail(res, err.message, 400);
    if (err.code === 'FORBIDDEN_TYPE') return fail(res, err.message, 403);
    if (err.code === 'ALREADY_CLOSED') return fail(res, err.message, 409);
    return fail(res, 'Décision impossible : ' + err.message, 500);
  }
});

// GET /api/v2/clubs/:slug/moderation/config — sanctions permises au modérateur.
router.get('/:slug/moderation/config', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  return ok(res, {
    sanctionTypes: mod.allowedSanctionsFor(req.moderatorType),
    permanentAllowed: mod.PERMANENT_ALLOWED,
    decisions: mod.CASE_DECISIONS,
    labels: mod.SANCTION_LABEL,
    moderatorType: req.moderatorType,
  });
});

// GET /api/v2/clubs/:slug/moderation/users/:userId — profil, borné au salon.
router.get('/:slug/moderation/users/:userId', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    // club_admin : on ne montre QUE son salon (+ sanctions globales qui l'impactent).
    const scope = req.moderatorType === 'super_admin' ? {} : { tenantId: req.tenant.id };
    return ok(res, await mod.getUserModerationHistory(req.params.userId, scope));
  } catch (err) { return fail(res, 'Historique : ' + err.message, 500); }
});

// GET /api/v2/clubs/:slug/moderation/audit — journal d'audit du salon.
router.get('/:slug/moderation/audit', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    const logs = await mod.listAuditLogs({
      tenantId: req.tenant.id,                   // ← toujours borné au salon
      caseId: req.query.caseId || null,
      limit: Math.min(200, parseInt(req.query.limit, 10) || 100),
    });
    return ok(res, { logs });
  } catch (err) { return fail(res, 'Journal : ' + err.message, 500); }
});

// POST /api/v2/clubs/:slug/moderation/sanctions/:id/revoke — lève une sanction du salon.
router.post('/:slug/moderation/sanctions/:id/revoke', requireAuth, withTenant, requireClubModerator, async (req, res) => {
  try {
    // Un club_admin ne lève que les sanctions de SON salon.
    const { data: s } = await supabase.from('chat_sanctions').select('id, tenant_id, scope').eq('id', req.params.id).maybeSingle();
    if (!s) return fail(res, 'Sanction introuvable.', 404);
    if (req.moderatorType !== 'super_admin' && (s.scope === 'global' || s.tenant_id !== req.tenant.id)) {
      return fail(res, 'Cette sanction ne concerne pas ton salon.', 403);
    }
    return ok(res, await mod.revokeSanction({ sanctionId: req.params.id, actorId: req.authUser.id, actorType: req.moderatorType }));
  } catch (err) {
    if (err.code === 'ALREADY_REVOKED') return fail(res, err.message, 409);
    return fail(res, 'Révocation impossible : ' + err.message, 500);
  }
});

// Message joueur selon la sanction active.
function sanctionMessage(s) {
  const until = s.endsAt ? ` jusqu'au ${new Date(s.endsAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}` : '';
  switch (s.type) {
    case 'mute': return `Tu es temporairement en lecture seule${until}.`;
    case 'room_suspension': return `Tu es suspendu de ce salon${until}.`;
    case 'room_ban': return 'Tu es exclu de ce salon.';
    case 'global_chat_ban': return 'Tu es exclu de tous les salons.';
    default: return 'Tu ne peux pas publier pour le moment.';
  }
}

module.exports = router;
