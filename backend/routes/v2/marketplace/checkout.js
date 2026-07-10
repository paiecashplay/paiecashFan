// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/checkout.js — Checkout billetterie (PCC)
// ---------------------------------------------------------------
// Délègue le paiement à PaieCashCoin (rail PCC uniquement pour le MVP).
// Le prix est TOUJOURS recalculé serveur (jamais le montant client).
// Le fan est identifié par l'email de sa session Supabase (req.authUser).
//
// MVP : PCC full only. Si le solde PCC ne couvre pas le total → 402
// { needTopUp } et AUCUN paiement n'est exécuté (le fan doit recharger
// son wallet sur PaieCashCoin). Carte / mixte / BNPL viendront quand
// PaieCashCoin renverra une URL de redirection Stripe.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth } = require('../../../middleware/auth');
const tenantsDb = require('../../../db/tenants');
const ordersDb = require('../../../db/orders');
const pcc = require('../../../services/paiecashcoin');
const { resolveOffers } = require('../../../services/ticketingPricing');

const router = express.Router();
router.use(requireAuth);

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400, extra = {}) =>
  res.status(s).json({ success: false, data: null, error: msg, ...extra });

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// POST /api/v2/checkout/ticketing
// Body: { items: [{ clubSlug, offerId, quantity }] }
router.post('/ticketing', async (req, res) => {
  try {
    if (!pcc.isConfigured()) {
      return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    }

    const { email, id: authId } = req.authUser;
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 'Panier vide.');

    // ── 1. Regrouper par club ────────────────────────────────────
    const bySlug = {};
    for (const it of items) {
      const slug = it?.clubSlug;
      const offerId = it?.offerId || it?.id;
      const quantity = Math.max(1, parseInt(it?.quantity, 10) || 1);
      if (!slug || !offerId) return fail(res, 'Article invalide (club ou offre manquant).');
      (bySlug[slug] ||= []).push({ offerId, quantity });
    }

    // ── 2. Valider + recalculer les prix serveur, par club ────────
    const groups = [];
    let grandTotalEur = 0;
    for (const [slug, lines] of Object.entries(bySlug)) {
      const tenant = await tenantsDb.getTenantBySlug(slug);
      if (!tenant) return fail(res, `Club introuvable : ${slug}`, 404);

      const offers = resolveOffers(tenant);
      const orderItems = [];
      let clubTotalEur = 0;
      let clubTotalPcc = 0;

      for (const line of lines) {
        const offer = offers.get(line.offerId);
        if (!offer) return fail(res, `Offre indisponible : ${line.offerId}`, 404);
        // Un abonnement est unitaire (quantité forcée à 1).
        const qty = offer.type === 'subscription' ? 1 : line.quantity;
        clubTotalEur += offer.price_eur * qty;
        clubTotalPcc += offer.price * qty;
        orderItems.push({
          offerId: offer.id,
          name: offer.name,
          type: offer.type,
          quantity: qty,
          price: offer.price,
          price_eur: offer.price_eur,
        });
      }

      clubTotalEur = round2(clubTotalEur);
      if (clubTotalEur <= 0) return fail(res, `Montant invalide pour ${tenant.club_name}.`);
      grandTotalEur += clubTotalEur;

      groups.push({
        tenant,
        merchantRef: `paiecashfan:${tenant.slug}`,
        orderItems,
        totalEur: clubTotalEur,
        totalPcc: round2(clubTotalPcc),
      });
    }
    grandTotalEur = round2(grandTotalEur);

    // ── 3. Vérifier le wallet + le solde PCC (aucun débit ici) ────
    const resolved = await pcc.resolveUser(email).catch(() => null);
    if (!resolved?.found || !resolved?.walletReady) {
      return fail(
        res,
        "Ton wallet PaieCashCoin n'est pas encore prêt. Inscris-toi / recharge tes PCC sur PaieCashCoin, puis réessaie.",
        402,
        { needTopUp: true, walletReady: false }
      );
    }

    const q = await pcc.quote({ userEmail: email, amountEur: grandTotalEur, preferredMode: 'pcc_full' });
    const balance = Number(q?.currentPccBalance) || 0;
    if (balance < grandTotalEur) {
      return fail(res, 'Solde PCC insuffisant.', 402, {
        needTopUp: true,
        balance,
        totalPcc: grandTotalEur,
        missing: round2(grandTotalEur - balance),
      });
    }

    // ── 4. Exécuter le paiement PCC par club, puis créer la commande
    const results = [];
    for (const g of groups) {
      const description = `Billetterie ${g.tenant.club_name} — ${g.orderItems.reduce((s, i) => s + i.quantity, 0)} article(s)`;

      const pay = await pcc.execute({
        userEmail: email,
        userAuthId: authId,
        amountEur: g.totalEur,
        description,
        merchantRef: g.merchantRef,
        preferredMode: 'pcc_full',
      });

      // Garde-fou : en PCC-only, tout autre mode (split/card) = échec pour nous
      // (le PCC partiel a pu être débité côté PaieCashCoin, mais aucune redirection
      // carte n'existe encore). On s'arrête et on remonte l'état.
      if (!pay?.success || pay.mode !== 'pcc_full') {
        return fail(
          res,
          pay?.error || 'Paiement PCC non abouti. Ton solde a peut-être changé, réessaie.',
          402,
          { needTopUp: true, partial: results }
        );
      }

      // Commande PaieCashFan (traçabilité, historique fan + club).
      // NB : `orders.transaction_id` est un uuid (FK ledger interne) → on n'y
      // met PAS la référence PaieCashCoin (format "PCC-…"), elle est stockée
      // dans metadata.notes. Statut "completed" (paiement abouti) — "paid"
      // n'est pas autorisé par la contrainte orders_status_check.
      let orderId = null;
      try {
        const order = await ordersDb.createOrder({
          user_id: authId,
          tenant_id: g.tenant.id,
          transaction_id: null,
          items: g.orderItems,
          total_pcc: g.totalPcc,
          total_eur: g.totalEur,
          notes: JSON.stringify({
            kind: 'ticketing',
            pccReference: pay.reference,
            pccTransactionId: pay.transactionId ?? null,
            mode: pay.mode,
            pccUsed: pay.pccUsed,
            paidAt: new Date().toISOString(),
          }),
        });
        orderId = order.id;
        await ordersDb.updateOrderStatus(order.id, 'completed');
      } catch (orderErr) {
        // Le paiement a réussi : on ne bloque pas le fan si la commande locale
        // échoue à s'écrire, mais on le logue pour réconciliation.
        console.error(`[CHECKOUT] Paiement OK mais échec createOrder (${g.tenant.slug}):`, orderErr.message);
      }

      results.push({
        clubSlug: g.tenant.slug,
        clubName: g.tenant.club_name,
        orderId,
        reference: pay.reference,
        totalEur: g.totalEur,
        totalPcc: g.totalPcc,
        pccUsed: pay.pccUsed,
      });
    }

    console.log(`[CHECKOUT] Billetterie payée — user=${email} | clubs=${results.length} | total=${grandTotalEur}€`);

    return ok(res, {
      paid: true,
      totalEur: grandTotalEur,
      totalPcc: grandTotalEur,
      orders: results,
    });
  } catch (err) {
    console.error('[CHECKOUT] Erreur:', err.message);
    return fail(res, `Échec du paiement : ${err.message}`, 500);
  }
});

module.exports = router;
