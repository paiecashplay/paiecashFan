// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/moderation.js — File de modération (super_admin).
// Monté sur /api/v2/admin/moderation. Le club_admin passe par
// /api/v2/clubs/:slug/moderation/* (borné à son salon).
//
// Le signalant n'est JAMAIS exposé (getCase ne sélectionne pas reporter_user_id).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, requireRole } = require('../../../middleware/auth');
const mod = require('../../../db/chatModeration');

const router = express.Router();
const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

router.use(requireAuth, requireRole('super_admin'));

// GET /api/v2/admin/moderation/cases?status=&priority=&tenantId=
router.get('/cases', async (req, res) => {
  try {
    const cases = await mod.listCases({
      tenantId: req.query.tenantId || null,
      status: req.query.status || null,
      priority: req.query.priority || null,
    });
    return ok(res, { cases });
  } catch (err) { return fail(res, 'File de modération : ' + err.message, 500); }
});

// GET /api/v2/admin/moderation/stats — compteurs de la file.
router.get('/stats', async (req, res) => {
  try {
    const all = await mod.listCases({ limit: 500 });
    const open = all.filter((c) => c.status === 'open').length;
    const inReview = all.filter((c) => c.status === 'in_review').length;
    const resolved = all.filter((c) => c.status === 'resolved').length;
    const dismissed = all.filter((c) => c.status === 'dismissed').length;
    const critical = all.filter((c) => ['high', 'critical'].includes(c.priority) && c.status === 'open').length;
    return ok(res, { stats: { total: all.length, open, inReview, resolved, dismissed, urgent: critical } });
  } catch (err) { return fail(res, err.message, 500); }
});

// GET /api/v2/admin/moderation/cases/:id — détail + contexte + historique.
router.get('/cases/:id', async (req, res) => {
  try {
    const c = await mod.getCase(req.params.id);
    if (!c) return fail(res, 'Dossier introuvable.', 404);
    return ok(res, { case: c });
  } catch (err) { return fail(res, err.message, 500); }
});

// POST /api/v2/admin/moderation/cases/:id/decision
// { decision, reason, sanction?: { type, durationHours, isPermanent, reasonCode } }
router.post('/cases/:id/decision', async (req, res) => {
  try {
    const result = await mod.decideCase({
      caseId: req.params.id,
      decision: req.body?.decision,
      reason: req.body?.reason || null,
      sanction: req.body?.sanction || null,
      actorId: req.authUser.id,
      actorType: 'super_admin',
    });
    return ok(res, result);
  } catch (err) {
    if (['BAD_DECISION', 'BAD_TYPE', 'BAD_PERMANENT', 'DURATION_REQUIRED', 'NEEDS_HUMAN'].includes(err.code)) return fail(res, err.message, 400);
    if (err.code === 'FORBIDDEN_TYPE') return fail(res, err.message, 403);
    if (err.code === 'NOT_FOUND') return fail(res, err.message, 404);
    if (err.code === 'ALREADY_CLOSED') return fail(res, err.message, 409);
    return fail(res, 'Décision impossible : ' + err.message, 500);
  }
});

// GET /api/v2/admin/moderation/config — types de sanctions autorisés + motifs.
router.get('/config', async (req, res) => {
  return ok(res, {
    charterVersion: mod.CHARTER_VERSION,
    reportReasons: mod.REPORT_REASONS,
    decisions: mod.CASE_DECISIONS,
    sanctionTypes: mod.allowedSanctionsFor('super_admin'),
    permanentAllowed: mod.PERMANENT_ALLOWED,
    labels: mod.SANCTION_LABEL,
  });
});

// GET /api/v2/admin/moderation/users/:userId — profil de modération complet.
router.get('/users/:userId', async (req, res) => {
  try { return ok(res, await mod.getUserModerationHistory(req.params.userId)); }
  catch (err) { return fail(res, 'Historique : ' + err.message, 500); }
});

// GET /api/v2/admin/moderation/audit?caseId=&actorId=&limit= — journal d'audit.
router.get('/audit', async (req, res) => {
  try {
    const logs = await mod.listAuditLogs({
      caseId: req.query.caseId || null,
      tenantId: req.query.tenantId || null,
      actorId: req.query.actorId || null,
      limit: Math.min(200, parseInt(req.query.limit, 10) || 100),
    });
    return ok(res, { logs });
  } catch (err) { return fail(res, 'Journal : ' + err.message, 500); }
});

// POST /api/v2/admin/moderation/sanctions/:id/revoke — lève une sanction.
router.post('/sanctions/:id/revoke', async (req, res) => {
  try {
    return ok(res, await mod.revokeSanction({ sanctionId: req.params.id, actorId: req.authUser.id, actorType: 'super_admin' }));
  } catch (err) {
    if (err.code === 'NOT_FOUND') return fail(res, err.message, 404);
    if (err.code === 'ALREADY_REVOKED') return fail(res, err.message, 409);
    return fail(res, 'Révocation impossible : ' + err.message, 500);
  }
});

module.exports = router;
