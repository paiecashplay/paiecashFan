// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/fan-feed.js — Fan Club (feed + chat par club)
// Monté sur /api/v2/clubs. Toutes les routes exigent une session
// (requireAuth) — tout fan connecté peut lire et publier.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, optionalAuth } = require('../../../middleware/auth');
const fanFeed = require('../../../db/fanFeed');
const mod = require('../../../db/chatModeration');
const favorites = require('../../../db/favorites');
const { requireClubModerator } = require('../../../middleware/clubModerator');

const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const MAX = 2000;
const clean = (v) => (typeof v === 'string' ? v.trim() : '');

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

// POST /api/v2/clubs/:slug/fan-feed/messages/:messageId/report  { reason, comment? }
// Un seul signalement par utilisateur/message. Le signalant reste anonyme.
router.post('/:slug/fan-feed/messages/:messageId/report', requireAuth, withTenant, async (req, res) => {
  try {
    const message = await mod.getMessage(req.params.messageId);
    if (!message || message.tenant_id !== req.tenant.id) return fail(res, 'Message introuvable.', 404);
    if (message.author_id === req.authUser.id) return fail(res, 'Tu ne peux pas signaler ton propre message.', 400);

    const report = await mod.createReport({
      messageId: message.id, tenantId: req.tenant.id,
      reporterUserId: req.authUser.id, reportedUserId: message.author_id,
      reason: clean(req.body?.reason), comment: clean(req.body?.comment) || null,
    });
    // (Lot 2 : ce signalement alimentera la file de modération.)
    return ok(res, { reported: true, reportId: report.id });
  } catch (err) {
    if (err.code === 'ALREADY_REPORTED') return fail(res, err.message, 409);
    if (err.code === 'BAD_REASON') return fail(res, err.message, 400);
    return fail(res, 'Signalement impossible : ' + err.message, 500);
  }
});

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
      actorId: req.authUser.id,
      actorType: req.moderatorType,               // club_admin | super_admin
    });
    return ok(res, result);
  } catch (err) {
    if (err.code === 'BAD_DECISION') return fail(res, err.message, 400);
    if (err.code === 'ALREADY_CLOSED') return fail(res, err.message, 409);
    return fail(res, 'Décision impossible : ' + err.message, 500);
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
