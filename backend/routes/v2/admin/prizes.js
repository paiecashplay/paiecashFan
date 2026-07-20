// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/prizes.js — Remise des lots gagnés (BO club + super admin)
// ---------------------------------------------------------------
// · super_admin : voit et traite TOUS les gains (y compris plateforme).
// · club_admin  : uniquement les gains de SON club (tenant_id === club_id).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, requireRole } = require('../../../middleware/auth');
const prizeClaims = require('../../../db/prizeClaims');

const router = express.Router();
router.use(requireAuth, requireRole('super_admin', 'club_admin'));

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/admin/prizes?status=&gameType=
router.get('/', async (req, res) => {
  try {
    const { role, club_id } = req.authUser;
    // Un club_admin sans club rattaché ne voit rien (jamais les gains plateforme).
    if (role === 'club_admin' && !club_id) return ok(res, { prizes: [] });
    const tenantId = role === 'super_admin' ? undefined : club_id;
    const prizes = await prizeClaims.listClaims({ tenantId, status: req.query.status || null, gameType: req.query.gameType || null });
    return ok(res, { prizes });
  } catch (err) { return fail(res, 'Chargement des gains : ' + err.message, 500); }
});

// PATCH /api/v2/admin/prizes/:id  { status?, carrier?, trackingNumber?, trackingUrl?, notes? }
router.patch('/:id', async (req, res) => {
  try {
    const { role, club_id } = req.authUser;
    const raw = await prizeClaims.getClaimRaw(req.params.id);
    if (!raw) return fail(res, 'Gain introuvable.', 404);
    // Cloisonnement : le club_admin ne peut agir que sur les gains de son club.
    if (role !== 'super_admin' && raw.tenant_id !== club_id) return fail(res, 'Accès refusé.', 403);

    const prize = await prizeClaims.updateFulfillment(req.params.id, req.body || {});
    return ok(res, { prize });
  } catch (err) {
    if (err.code === 'NOT_FOUND') return fail(res, err.message, 404);
    if (err.code === 'BAD_INPUT') return fail(res, err.message, 400);
    if (err.code === 'NO_ADDRESS') return fail(res, err.message, 409);
    return fail(res, 'Mise à jour impossible : ' + err.message, 500);
  }
});

// POST /api/v2/admin/prizes/:id/remind — relance le gagnant (adresse manquante).
router.post('/:id/remind', async (req, res) => {
  try {
    const { role, club_id } = req.authUser;
    const raw = await prizeClaims.getClaimRaw(req.params.id);
    if (!raw) return fail(res, 'Gain introuvable.', 404);
    if (role !== 'super_admin' && raw.tenant_id !== club_id) return fail(res, 'Accès refusé.', 403);
    const r = await prizeClaims.remindAddress(req.params.id);
    return ok(res, r);
  } catch (err) {
    if (err.code === 'NOT_FOUND') return fail(res, err.message, 404);
    if (err.code === 'HAS_ADDRESS') return fail(res, err.message, 409);
    return fail(res, 'Relance impossible : ' + err.message, 500);
  }
});

module.exports = router;
