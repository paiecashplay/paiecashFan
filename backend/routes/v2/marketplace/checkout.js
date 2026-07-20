// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/checkout.js — Checkout billetterie (multi-rails)
// ---------------------------------------------------------------
// Délègue le paiement à PaieCashCoin. Le prix est TOUJOURS recalculé
// serveur. Le fan est identifié par l'email de sa session.
//
// Modes :
//   • pcc_full          → débit PCC immédiat, commande "completed" (multi-clubs OK).
//   • card_full / pcc_split / bnpl → PaieCashCoin renvoie une Stripe Checkout URL.
//     On crée une commande "pending", on redirige vers Stripe ; la confirmation
//     réelle se fait via le webhook Stripe côté PaieCashCoin. Au retour, la page
//     /checkout/success interroge GET /status qui réconcilie via /pay/history.
//     (1 seul club à la fois pour les modes carte — une seule session Stripe.)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth } = require('../../../middleware/auth');
const supabase = require('../../../db/supabase');
const tenantsDb = require('../../../db/tenants');
const ordersDb = require('../../../db/orders');
const productsDb = require('../../../db/products');
const pcc = require('../../../services/paiecashcoin');
const { resolveOffers } = require('../../../services/ticketingPricing');

const router = express.Router();
router.use(requireAuth);

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400, extra = {}) =>
  res.status(s).json({ success: false, data: null, error: msg, ...extra });

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const MODES = ['pcc_full', 'pcc_split', 'card_full', 'bnpl'];
const safeParse = (s) => { try { return typeof s === 'string' ? JSON.parse(s) : (s || {}); } catch { return {}; } };
const KIND_LABEL = { ticketing: 'Billetterie', boutique: 'Boutique' };
const describe = (kind, tenant, items) => `${KIND_LABEL[kind] || 'PaieCashFan'} ${tenant.name} — ${items.reduce((s, i) => s + i.quantity, 0)} article(s)`;

// Origine (pour construire successUrl/cancelUrl) : celle envoyée par le front,
// validée (https ou localhost), sinon repli sur l'en-tête Origin / env.
function cleanOrigin(raw, req) {
  const cand = (typeof raw === 'string' && raw) || req.headers.origin || process.env.PUBLIC_APP_URL || '';
  try {
    const u = new URL(cand);
    if (u.protocol === 'https:' || u.hostname === 'localhost') return u.origin;
  } catch { /* invalide */ }
  return '';
}

// Fusionne des champs dans metadata.notes (préserve items / total_eur).
async function mergeNotes(order, patch) {
  const metadata = { ...(order.metadata || {}) };
  metadata.notes = JSON.stringify({ ...safeParse(metadata.notes), ...patch });
  await supabase.from('orders').update({ metadata }).eq('id', order.id);
}

// Valide le panier et recalcule les prix serveur → groupes par club.
async function buildGroups(items, res) {
  const bySlug = {};
  for (const it of items) {
    const slug = it?.clubSlug;
    const offerId = it?.offerId || it?.id;
    const quantity = Math.max(1, parseInt(it?.quantity, 10) || 1);
    if (!slug || !offerId) { fail(res, 'Article invalide (club ou offre manquant).'); return null; }
    (bySlug[slug] ||= []).push({ offerId, quantity });
  }

  const groups = [];
  let grandTotalEur = 0;
  for (const [slug, lines] of Object.entries(bySlug)) {
    const tenant = await tenantsDb.getTenantBySlugFlexible(slug);
    if (!tenant) { fail(res, `Club introuvable : ${slug}`, 404); return null; }

    const offers = resolveOffers(tenant);
    const orderItems = [];
    let clubTotalEur = 0, clubTotalPcc = 0;
    for (const line of lines) {
      const offer = offers.get(line.offerId);
      if (!offer) { fail(res, `Offre indisponible : ${line.offerId}`, 404); return null; }
      const qty = offer.type === 'subscription' ? 1 : line.quantity;
      clubTotalEur += offer.price_eur * qty;
      clubTotalPcc += offer.price * qty;
      orderItems.push({ offerId: offer.id, name: offer.name, type: offer.type, quantity: qty, price: offer.price, price_eur: offer.price_eur });
    }
    clubTotalEur = round2(clubTotalEur);
    if (clubTotalEur <= 0) { fail(res, `Montant invalide pour ${tenant.name}.`); return null; }
    grandTotalEur += clubTotalEur;
    groups.push({ tenant, merchantRef: `paiecashfan:${tenant.slug}`, orderItems, totalEur: clubTotalEur, totalPcc: round2(clubTotalPcc) });
  }
  return { groups, grandTotalEur: round2(grandTotalEur) };
}

// Idem pour la BOUTIQUE : valide chaque ligne contre la table `products`
// (prix recalculé serveur, stock vérifié) → groupes par club. La taille (`size`)
// est conservée en métadonnée de commande ; elle n'a pas de stock propre.
async function buildBoutiqueGroups(items, res) {
  const groups = [];
  const byTenant = new Map();   // tenantId → { tenant, orderItems, totalEur, totalPcc }
  let grandTotalEur = 0;

  for (const it of items) {
    const productId = it?.product_id || it?.productId || it?.id;
    const quantity = Math.max(1, parseInt(it?.quantity, 10) || 1);
    if (!productId) { fail(res, 'Article invalide (produit manquant).'); return null; }

    const product = await productsDb.getProductById(productId);
    // Seuls les produits actifs sont vendables (exclut inactive / sold_out).
    if (!product || product.status !== 'active') { fail(res, `Produit indisponible : ${productId}`, 404); return null; }
    // Stock : -1 = illimité ; sinon on vérifie le disponible (stock - déjà vendus).
    if (product.stock >= 0 && product.stock - (product.total_sold || 0) < quantity) {
      fail(res, `Stock insuffisant pour « ${product.name} ».`, 409); return null;
    }
    const pccPrice = Number(product.pcc_price) || 0;
    const eurPrice = Number(product.eur_price) || 0;
    if (eurPrice <= 0) { fail(res, `Prix indisponible pour « ${product.name} ».`); return null; }

    const g = byTenant.get(product.tenant_id) || { tenant: null, orderItems: [], totalEur: 0, totalPcc: 0 };
    if (!g.tenant) {
      const tenant = await tenantsDb.getTenantById(product.tenant_id);
      if (!tenant) { fail(res, 'Club du produit introuvable.', 404); return null; }
      g.tenant = tenant;
    }
    g.orderItems.push({ productId: product.id, name: product.name, type: 'merchandise', size: it?.size || null, quantity, price: pccPrice, price_eur: eurPrice });
    g.totalEur += eurPrice * quantity;
    g.totalPcc += pccPrice * quantity;
    byTenant.set(product.tenant_id, g);
  }

  for (const g of byTenant.values()) {
    const totalEur = round2(g.totalEur);
    if (totalEur <= 0) { fail(res, `Montant invalide pour ${g.tenant.name}.`); return null; }
    grandTotalEur += totalEur;
    groups.push({ tenant: g.tenant, merchantRef: `paiecashfan:${g.tenant.slug}`, orderItems: g.orderItems, totalEur, totalPcc: round2(g.totalPcc) });
  }
  return { groups, grandTotalEur: round2(grandTotalEur) };
}

// Règlement commun à la billetterie et à la boutique. Les groupes/total sont
// déjà validés et recalculés serveur (buildGroups / buildBoutiqueGroups) ; seul
// le `kind` change (libellé, notes de commande). Répond directement sur `res`.
async function settleCheckout(req, res, { groups, grandTotalEur, mode, kind }) {
  const { email, id: authId } = req.authUser;

  // ── Mode PCC intégral : débit immédiat, multi-clubs OK ──────
  if (mode === 'pcc_full') {
    const resolved = await pcc.resolveUser(email).catch(() => null);
    if (!resolved?.found || !resolved?.walletReady) {
      // found permet au front de choisir la bonne redirection (connexion vs inscription).
      return fail(res, "Ton wallet PaieCashCoin n'est pas encore prêt. Recharge tes PCC sur PaieCashCoin, puis réessaie.", 402, { needTopUp: true, found: !!resolved?.found });
    }
    const q = await pcc.quote({ userEmail: email, amountEur: grandTotalEur, preferredMode: 'pcc_full' });
    const balance = Number(q?.currentPccBalance) || 0;
    if (balance < grandTotalEur) {
      return fail(res, 'Solde PCC disponible insuffisant.', 402, { needTopUp: true, found: true, balance, totalPcc: grandTotalEur, missing: round2(grandTotalEur - balance) });
    }

    const results = [];
    for (const g of groups) {
      const pay = await pcc.execute({
        userEmail: email, userAuthId: authId, amountEur: g.totalEur,
        description: describe(kind, g.tenant, g.orderItems), merchantRef: g.merchantRef,
        merchantName: g.tenant.name || 'PaieCashFan', preferredMode: 'pcc_full',
      });
      // pcc_full aboutit immédiatement (status 'completed' avec le nouveau
      // contrat ; on n'exige pas le champ pour rester tolérant).
      if (!pay?.success || pay.mode !== 'pcc_full' || (pay.status && pay.status !== 'completed')) {
        return fail(res, pay?.error || 'Paiement PCC non abouti. Ton solde a peut-être changé, réessaie.', 402, { needTopUp: true, partial: results });
      }
      let orderId = null;
      try {
        const order = await ordersDb.createOrder({
          user_id: authId, tenant_id: g.tenant.id, transaction_id: null,
          items: g.orderItems, total_pcc: g.totalPcc, total_eur: g.totalEur,
          notes: JSON.stringify({ kind, mode: 'pcc_full', pccReference: pay.reference, pccTransactionId: pay.transactionId ?? null, pccUsed: pay.pccUsed, paidAt: new Date().toISOString() }),
        });
        orderId = order.id;
        await ordersDb.updateOrderStatus(order.id, 'completed');
      } catch (e) {
        console.error(`[CHECKOUT] pcc_full: paiement OK mais échec createOrder (${g.tenant.slug}):`, e.message);
      }
      results.push({ clubSlug: g.tenant.slug, clubName: g.tenant.name, orderId, reference: pay.reference, totalEur: g.totalEur, totalPcc: g.totalPcc, pccUsed: pay.pccUsed });
    }
    console.log(`[CHECKOUT] ${kind} PCC full payé — user=${email} | clubs=${results.length} | total=${grandTotalEur}€`);
    return ok(res, { paid: true, mode: 'pcc_full', totalEur: grandTotalEur, totalPcc: grandTotalEur, orders: results });
  }

  // ── Modes carte / mixte / BNPL : redirection Stripe, 1 club ──
  if (groups.length > 1) {
    return fail(res, 'Le paiement par carte se fait un club à la fois. Règle un club, puis reviens pour le suivant.', 400);
  }
  const g = groups[0];
  const origin = cleanOrigin(req.body?.origin, req);
  if (!origin) return fail(res, 'Origine invalide pour la redirection de paiement.', 400);

  // 1. Commande "pending" (permet la réconciliation au retour de Stripe).
  const order = await ordersDb.createOrder({
    user_id: authId, tenant_id: g.tenant.id, transaction_id: null,
    items: g.orderItems, total_pcc: g.totalPcc, total_eur: g.totalEur,
    notes: JSON.stringify({ kind, mode, pending: true, createdAt: new Date().toISOString() }),
  });

  // 2. Exécution → Stripe Checkout URL.
  let pay;
  try {
    pay = await pcc.execute({
      userEmail: email, userAuthId: authId, amountEur: g.totalEur,
      description: describe(kind, g.tenant, g.orderItems), merchantRef: g.merchantRef,
      merchantName: g.tenant.name || 'PaieCashFan', preferredMode: mode,
      bnplInstallments: req.body?.bnplInstallments,
      successUrl: `${origin}/checkout/success?order=${order.id}`,
      cancelUrl: `${origin}/checkout/cancel?order=${order.id}`,
      origin, idempotencyKey: String(order.id),
    });
  } catch (e) {
    await ordersDb.updateOrderStatus(order.id, 'cancelled').catch(() => {});
    return fail(res, 'Paiement impossible : ' + e.message, 502);
  }

  // Cas limite : PaieCashCoin a finalement tout couvert en PCC.
  if (pay?.status === 'completed') {
    await mergeNotes(order, { pccReference: pay.reference, pccUsed: pay.pccUsed, mode: pay.mode, paidAt: new Date().toISOString(), pending: false });
    await ordersDb.updateOrderStatus(order.id, 'completed');
    return ok(res, { paid: true, mode: pay.mode, orders: [{ clubSlug: g.tenant.slug, clubName: g.tenant.name, orderId: order.id, reference: pay.reference, totalEur: g.totalEur, totalPcc: g.totalPcc }] });
  }

  if (pay?.stripeCheckoutUrl && pay?.reference) {
    await mergeNotes(order, { pccReference: pay.reference, pccPlanned: pay.pccPlanned ?? 0, cardAmountEur: pay.cardAmountEur ?? g.totalEur, mode: pay.mode });
    console.log(`[CHECKOUT] ${kind} ${pay.mode} → Stripe — order=${order.id} ref=${pay.reference}`);
    return ok(res, { redirect: pay.stripeCheckoutUrl, orderId: order.id, reference: pay.reference, mode: pay.mode });
  }

  await ordersDb.updateOrderStatus(order.id, 'cancelled').catch(() => {});
  return fail(res, pay?.error || 'Paiement non abouti (aucune redirection reçue).', 502);
}

// POST /api/v2/checkout/ticketing
// Body: { items:[{clubSlug,offerId,quantity}], mode?, origin?, bnplInstallments? }
router.post('/ticketing', async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 'Panier vide.');
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : 'pcc_full';

    const built = await buildGroups(items, res);
    if (!built) return; // buildGroups a déjà répondu
    return settleCheckout(req, res, { ...built, mode, kind: 'ticketing' });
  } catch (err) {
    console.error('[CHECKOUT] Erreur:', err.message);
    return fail(res, `Échec du paiement : ${err.message}`, 500);
  }
});

// POST /api/v2/checkout/boutique
// Body: { items:[{product_id,quantity,size?}], mode?, origin?, bnplInstallments? }
router.post('/boutique', async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 'Panier vide.');
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : 'pcc_full';

    const built = await buildBoutiqueGroups(items, res);
    if (!built) return; // buildBoutiqueGroups a déjà répondu
    return settleCheckout(req, res, { ...built, mode, kind: 'boutique' });
  } catch (err) {
    console.error('[CHECKOUT] Erreur:', err.message);
    return fail(res, `Échec du paiement : ${err.message}`, 500);
  }
});

// GET /api/v2/checkout/status?order=<id>
// Réconcilie une commande carte au retour de Stripe (via /pay/history).
router.get('/status', async (req, res) => {
  try {
    const { email, id: authId } = req.authUser;
    const order = await ordersDb.getOrderById(req.query.order);
    if (!order || order.user_id !== authId) return fail(res, 'Commande introuvable.', 404);

    const shape = (o) => ({
      orderId: o.id, status: o.status,
      totalPcc: Number(o.total_pcc || 0),
      totalEur: Number(o.metadata?.total_eur || 0),
      clubSlug: null, reference: safeParse(o.metadata?.notes)?.pccReference || null,
      items: o.metadata?.items || [],
    });

    if (order.status === 'completed') return ok(res, { status: 'completed', order: shape(order) });

    const ref = safeParse(order.metadata?.notes)?.pccReference;
    if (ref && pcc.isConfigured()) {
      const resolved = await pcc.resolveUser(email).catch(() => null);
      if (resolved?.userId != null) {
        const hist = await pcc.history({ userId: resolved.userId, limit: 50 }).catch(() => []);
        const tx = (Array.isArray(hist) ? hist : []).find((t) => t.reference === ref);
        if (tx?.status === 'completed') {
          await ordersDb.updateOrderStatus(order.id, 'completed');
          return ok(res, { status: 'completed', order: shape({ ...order, status: 'completed' }) });
        }
        if (tx && ['failed', 'refunded'].includes(tx.status)) {
          await ordersDb.updateOrderStatus(order.id, 'cancelled');
          return ok(res, { status: 'failed' });
        }
      }
    }
    return ok(res, { status: order.status || 'pending' }); // encore en attente
  } catch (err) {
    return fail(res, 'Statut indisponible : ' + err.message, 500);
  }
});

// POST /api/v2/checkout/cancel  { order }
// Marque une commande "pending" comme annulée (retour cancel de Stripe).
router.post('/cancel', async (req, res) => {
  try {
    const { id: authId } = req.authUser;
    const order = await ordersDb.getOrderById(req.body?.order);
    if (!order || order.user_id !== authId) return fail(res, 'Commande introuvable.', 404);
    if (order.status === 'pending') await ordersDb.updateOrderStatus(order.id, 'cancelled');
    return ok(res, { status: 'cancelled' });
  } catch (err) {
    return fail(res, 'Annulation impossible : ' + err.message, 500);
  }
});

module.exports = router;
