// ═══════════════════════════════════════════════════════════════
// routes/v2/tombola.js — Tombola (campagnes + achat de tickets + tirage)
// Monté sur /api/v2/tombola.
//   • GET  /            liste des tombolas (public)
//   • GET  /:id         détail (+ mes tickets si connecté)
//   • POST /:id/buy     acheter des tickets (requireAuth, paiement PCC)
//   • POST /            créer (super_admin = plateforme/club ; club_admin = son club)
//   • PUT/DELETE /:id   gérer (propriétaire)
//   • POST /:id/draw    tirage manuel (super_admin)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth, optionalAuth } = require('../../middleware/auth');
const tombola = require('../../db/tombola');
const pcc = require('../../services/paiecashcoin');

const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400, extra = {}) => res.status(s).json({ success: false, data: null, error: msg, ...extra });
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// ── Lecture (public) ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.clubId) filter.tenantId = req.query.clubId;
    const campaigns = await tombola.listCampaigns(filter);
    return ok(res, { campaigns });
  } catch (err) { return fail(res, 'Chargement des tombolas impossible : ' + err.message, 500); }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const c = await tombola.getCampaign(req.params.id, req.authUser?.id || null);
    if (!c) return fail(res, 'Tombola introuvable.', 404);
    return ok(res, { campaign: c });
  } catch (err) { return fail(res, 'Chargement impossible : ' + err.message, 500); }
});

// ── Achat de tickets (paiement PCC via PaieCashCoin) ─────────
// MVP : PCC intégral (débit immédiat). Carte/mixte/BNPL réutiliseront le flux
// de la billetterie (redirection Stripe) dans un second temps.
router.post('/:id/buy', requireAuth, async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible.', 503);
    const { email, id: authId } = req.authUser;
    const quantity = Math.max(1, parseInt(req.body?.quantity, 10) || 1);

    const c = await tombola.getCampaign(req.params.id);
    if (!c) return fail(res, 'Tombola introuvable.', 404);
    if (c.status !== 'active') return fail(res, 'Cette tombola n\'est plus ouverte.', 409);
    if (new Date(c.endsAt) <= new Date()) return fail(res, 'Cette tombola est terminée.', 409);
    if (c.ticketsTotal != null && c.ticketsSold + quantity > c.ticketsTotal) {
      return fail(res, `Il ne reste que ${Math.max(0, c.ticketsTotal - c.ticketsSold)} ticket(s).`, 409);
    }

    const totalEur = round2(quantity * c.ticketPricePcc);
    if (totalEur <= 0) return fail(res, 'Montant invalide.');

    // Vérif solde PCC disponible
    const resolved = await pcc.resolveUser(email).catch(() => null);
    if (!resolved?.found || !resolved?.walletReady) {
      return fail(res, "Ton wallet PaieCashCoin n'est pas prêt. Recharge tes PCC, puis réessaie.", 402, { needTopUp: true });
    }
    const q = await pcc.quote({ userEmail: email, amountEur: totalEur, preferredMode: 'pcc_full' });
    if ((Number(q?.currentPccBalance) || 0) < totalEur) {
      return fail(res, 'Solde PCC insuffisant.', 402, { needTopUp: true, balance: Number(q?.currentPccBalance) || 0, missing: round2(totalEur - (Number(q?.currentPccBalance) || 0)) });
    }

    const pay = await pcc.execute({
      userEmail: email, userAuthId: authId, amountEur: totalEur,
      description: `Tombola : ${c.title} — ${quantity} ticket(s)`,
      merchantRef: `paiecashfan:tombola:${c.id}`,
      merchantName: c.clubName || 'PaieCashFan Tombola',
      preferredMode: 'pcc_full',
    });
    if (!pay?.success || pay.mode !== 'pcc_full' || (pay.status && pay.status !== 'completed')) {
      return fail(res, pay?.error || 'Paiement non abouti. Réessaie.', 402, { needTopUp: true });
    }

    const ticketId = await tombola.recordTickets({ campaignId: c.id, userId: authId, quantity, totalPcc: totalEur, reference: pay.reference });
    console.log(`[TOMBOLA] Achat — user=${email} | campagne=${c.id} | ${quantity} ticket(s) | ${totalEur} PCC`);
    return ok(res, { paid: true, ticketId, quantity, totalPcc: totalEur, reference: pay.reference });
  } catch (err) {
    console.error('[TOMBOLA] buy error:', err.message);
    return fail(res, 'Achat impossible : ' + err.message, 500);
  }
});

// ── Création / gestion (admin plateforme ou club) ────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { role, club_id } = req.authUser;
    let tenantId = req.body?.tenantId ?? null;

    if (role === 'super_admin') {
      // peut créer une tombola plateforme (null) ou pour un club (tenantId fourni)
    } else if (role === 'club_admin') {
      if (!club_id) return fail(res, 'Aucun club rattaché.', 403);
      tenantId = club_id; // forcé à SON club
    } else {
      return fail(res, 'Accès refusé.', 403);
    }

    if (!req.body?.title) return fail(res, 'Titre requis.');
    if (!req.body?.endsAt) return fail(res, 'Date de fin requise.');

    const campaign = await tombola.createCampaign({
      tenantId,
      title: req.body.title,
      description: req.body.description,
      prizeLabel: req.body.prizeLabel,
      imageUrl: req.body.imageUrl,
      ticketPricePcc: req.body.ticketPricePcc,
      ticketsTotal: req.body.ticketsTotal,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      status: req.body.status || 'active',
      createdBy: req.authUser.id,
    });
    return ok(res, { campaign });
  } catch (err) { return fail(res, 'Création impossible : ' + err.message, 500); }
});

// Vérifie que l'appelant possède la campagne (super_admin, ou club_admin du club).
async function ownsCampaign(req, res, next) {
  const raw = await tombola.getCampaignRaw(req.params.id);
  if (!raw) return fail(res, 'Tombola introuvable.', 404);
  const { role, club_id } = req.authUser;
  if (role === 'super_admin' || (role === 'club_admin' && raw.tenant_id && raw.tenant_id === club_id)) {
    req.campaign = raw;
    return next();
  }
  return fail(res, 'Accès refusé.', 403);
}

router.put('/:id', requireAuth, ownsCampaign, async (req, res) => {
  try {
    const campaign = await tombola.updateCampaign(req.params.id, req.body || {});
    return ok(res, { campaign });
  } catch (err) { return fail(res, 'Mise à jour impossible : ' + err.message, 500); }
});

router.delete('/:id', requireAuth, ownsCampaign, async (req, res) => {
  try {
    await tombola.deleteCampaign(req.params.id);
    return ok(res, { deleted: true });
  } catch (err) { return fail(res, 'Suppression impossible : ' + err.message, 500); }
});

// Tirage manuel (super_admin uniquement).
router.post('/:id/draw', requireAuth, async (req, res) => {
  if (req.authUser.role !== 'super_admin') return fail(res, 'Accès refusé.', 403);
  try {
    const result = await tombola.drawWinner(req.params.id);
    return ok(res, result);
  } catch (err) { return fail(res, 'Tirage impossible : ' + err.message, 500); }
});

module.exports = router;
