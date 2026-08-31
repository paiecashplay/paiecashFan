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
const tombolaDb = require('../../../db/tombola');
const commissionsDb = require('../../../db/commissions');
const revshareDb = require('../../../db/revshare');
const revshareProcessor = require('../../../services/revshareProcessor');
const pcc = require('../../../services/paiecashcoin');

// Handle PaieCashCoin du compte encaisseur plateforme (reçoit la vente Aivora).
const STORE_SLUG = process.env.PAIECASH_STORE_SLUG || 'paiecashstore';

// Taux de commission par défaut reversé au club sur un produit plateforme (%).
const DEFAULT_COMMISSION_PCT = 10;
function commissionPctOf(product) {
  const raw = Number(product?.metadata?.commissionPct);
  if (!Number.isFinite(raw)) return DEFAULT_COMMISSION_PCT;
  return Math.min(100, Math.max(0, raw));
}
const { resolveOffers } = require('../../../services/ticketingPricing');
const redtaag = require('../../../services/redtaag');

const router = express.Router();
router.use(requireAuth);

// Contact nominatif pour Redtaag à partir de l'utilisateur connecté.
// Redtaag exige nom + prénom pour envoyer l'e-billet par email (retour support
// 2026-08-31). Le contact accepte 2 variantes de clés (EN firstname/lastname
// + FR prenom/nom) → on renseigne les DEUX pour être sûr que le nom s'enregistre.
function redtaagContact(u) {
  const name = String(u?.display_name || '').trim();
  const parts = name ? name.split(/\s+/) : [];
  const firstname = parts[0] || String(u?.email || '').split('@')[0] || 'Client';
  const lastname = parts.slice(1).join(' ') || 'PaieCashFan';
  return {
    firstname, lastname,
    prenom: firstname, nom: lastname,
    email: u?.email || '',
    mobile: '',
  };
}

// Émission des billets via Redtaag APRÈS paiement (best-effort : n'échoue
// JAMAIS le checkout — le fan a déjà payé). Ne concerne que les offres billet
// disposant d'un mapping Redtaag { event, section, categorie, articleId }.
// Le résultat (réfs commande Redtaag ou erreur) est tracé dans les notes.
async function emitRedtaagTickets(order, group, contact) {
  if (!order || !redtaag.isConfigured()) return;
  const items = (group.orderItems || []).filter(
    (it) => it.type === 'ticket' && it.redtaag && it.redtaag.event
  );
  if (!items.length) return;

  const emitted = [];
  for (const it of items) {
    try {
      const r = await redtaag.emitPrepaidTickets({
        event: it.redtaag.event,
        section: it.redtaag.section,
        categorie: it.redtaag.categorie,
        articleId: it.redtaag.articleId,
        quantity: it.quantity,
        contact,
        amountEur: round2((it.price_eur || 0) * it.quantity),
        paymentRef: `pcf-order-${order.id}`,
      });
      emitted.push({
        offerId: it.offerId,
        cartRef: r?.order?.cart_reference || null,
        redtaagOrders: Object.keys(r?.confirm?.orders || {}),
      });
    } catch (e) {
      console.error(`[CHECKOUT] Redtaag émission échec (order ${order.id}, offre ${it.offerId}):`, e.message);
      emitted.push({ offerId: it.offerId, error: e.message });
    }
  }
  if (emitted.length) {
    await mergeNotes(order, { redtaag: emitted }).catch(() => {});
  }
}

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
      orderItems.push({ offerId: offer.id, name: offer.name, type: offer.type, quantity: qty, price: offer.price, price_eur: offer.price_eur, redtaag: offer.redtaag || null });
    }
    clubTotalEur = round2(clubTotalEur);
    if (clubTotalEur <= 0) { fail(res, `Montant invalide pour ${tenant.name}.`); return null; }
    grandTotalEur += clubTotalEur;
    groups.push({ kind: 'ticketing', tenant, merchantRef: `paiecashfan:${tenant.slug}`, orderItems, totalEur: clubTotalEur, totalPcc: round2(clubTotalPcc) });
  }
  return { groups, grandTotalEur: round2(grandTotalEur) };
}

// Idem pour la BOUTIQUE : valide chaque ligne contre la table `products`
// (prix recalculé serveur, stock vérifié) → groupes par club. La taille (`size`)
// est conservée en métadonnée de commande ; elle n'a pas de stock propre.
async function buildBoutiqueGroups(items, res, originSlug = null) {
  const groups = [];
  const byTenant = new Map();   // tenantId → { tenant, orderItems, totalEur, totalPcc, _global:[] }
  let grandTotalEur = 0;

  // Club de la boutique visitée (pour reverser la commission des produits globaux).
  const originTenant = originSlug ? await tenantsDb.getTenantBySlugFlexible(originSlug).catch(() => null) : null;

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

    const g = byTenant.get(product.tenant_id) || { tenant: null, orderItems: [], totalEur: 0, totalPcc: 0, _global: [] };
    if (!g.tenant) {
      const tenant = await tenantsDb.getTenantById(product.tenant_id);
      if (!tenant) { fail(res, 'Club du produit introuvable.', 404); return null; }
      g.tenant = tenant;
    }
    g.orderItems.push({ productId: product.id, name: product.name, type: 'merchandise', size: it?.size || null, quantity, price: pccPrice, price_eur: eurPrice, isGlobal: !!product.is_global });
    g.totalEur += eurPrice * quantity;
    g.totalPcc += pccPrice * quantity;
    // Produit plateforme → mémorise la base commissionnable (avant frais de port).
    if (product.is_global) {
      g._global.push({ productId: product.id, lineEur: eurPrice * quantity, linePcc: pccPrice * quantity, pct: commissionPctOf(product) });
    }
    byTenant.set(product.tenant_id, g);
  }

  for (const g of byTenant.values()) {
    const totalEur = round2(g.totalEur);
    if (totalEur <= 0) { fail(res, `Montant invalide pour ${g.tenant.name}.`); return null; }
    grandTotalEur += totalEur;

    const group = { kind: 'boutique', tenant: g.tenant, merchantRef: `paiecashfan:${g.tenant.slug}`, orderItems: g.orderItems, totalEur, totalPcc: round2(g.totalPcc) };

    // Répartition plateforme→club : si ce groupe est le PaieCash Store et que la
    // boutique d'origine est un vrai club différent, on prépare la commission.
    if (g.tenant.metadata?.platformStore && g._global.length && originTenant && originTenant.id !== g.tenant.id) {
      let grossEur = 0, grossPcc = 0, commissionEur = 0, commissionPcc = 0, pct = DEFAULT_COMMISSION_PCT;
      for (const l of g._global) {
        grossEur += l.lineEur; grossPcc += l.linePcc; pct = l.pct;
        commissionEur += round2(l.lineEur * l.pct / 100);
        commissionPcc += round2(l.linePcc * l.pct / 100);
      }
      group.commission = {
        originTenantId: originTenant.id,
        originSlug: originTenant.slug,             // = public_slug PCC du club (reversement)
        merchantRef: `paiecashfan:${originTenant.slug}`,
        originName: originTenant.name,
        productId: g._global[0].productId,
        rate: pct,
        grossEur: round2(grossEur), grossPcc: round2(grossPcc),
        commissionEur: round2(commissionEur), commissionPcc: round2(commissionPcc),
      };
    }
    groups.push(group);
  }
  return { groups, grandTotalEur: round2(grandTotalEur) };
}

// Idem pour la TOMBOLA : valide chaque campagne (active, disponibilité), recalcule
// le prix serveur. Le ticket n'est PAS créé ici — il l'est à la confirmation du
// paiement (grantGameEntitlements), pour que la carte (async Stripe) soit sûre.
async function buildTombolaGroups(items, res) {
  const groups = [];
  let grandTotalEur = 0;
  for (const it of items) {
    const campaignId = it?.campaignId || it?.id;
    const quantity = Math.max(1, parseInt(it?.quantity, 10) || 1);
    if (!campaignId) { fail(res, 'Tombola invalide.'); return null; }

    const c = await tombolaDb.getCampaign(campaignId);
    if (!c || c.status !== 'active') { fail(res, "Cette tombola n'est plus disponible.", 409); return null; }
    if (c.ticketsTotal != null && c.ticketsSold + quantity > c.ticketsTotal) {
      fail(res, `Il ne reste que ${Math.max(0, c.ticketsTotal - c.ticketsSold)} ticket(s).`, 409); return null;
    }
    const unit = Number(c.ticketPricePcc) || 0;
    if (unit <= 0) { fail(res, 'Prix de ticket invalide.'); return null; }
    const totalEur = round2(unit * quantity);
    grandTotalEur += totalEur;

    // Tombola de club → tenant réel ; tombola plateforme (tenantId null) → PaieCashFan.
    const tenant = c.tenantId
      ? { id: c.tenantId, name: c.clubName || 'PaieCashFan', slug: c.clubSlug || 'paiecashfan' }
      : { id: null, name: 'PaieCashFan', slug: 'paiecashfan' };
    groups.push({
      tenant, merchantRef: `paiecashfan:tombola:${campaignId}`,
      orderItems: [{ campaignId, name: `Tombola — ${c.title}`, type: 'tombola', quantity, price: unit, price_eur: unit }],
      totalEur, totalPcc: totalEur,
    });
  }
  return { groups, grandTotalEur: round2(grandTotalEur) };
}

// Attribue les entrées de jeu (ex : tickets tombola) une fois le paiement d'une
// commande CONFIRMÉ. Idempotent via le flag `granted` dans les notes. No-op pour
// la billetterie / boutique (kind différent).
async function grantGameEntitlements(order) {
  const notes = safeParse(order.metadata?.notes);
  if (notes?.granted) return;                      // déjà attribué
  const items = order.metadata?.items || [];
  const reference = notes?.pccReference || null;

  if (notes?.kind === 'tombola') {
    for (const it of items) {
      if (!it.campaignId) continue;
      try {
        await tombolaDb.recordTickets({
          campaignId: it.campaignId, userId: order.user_id, quantity: it.quantity,
          totalPcc: round2((it.price_eur || it.price || 0) * it.quantity), reference,
        });
      } catch (e) { console.error('[CHECKOUT] grant tombola:', e.message); }
    }
  }
  await mergeNotes(order, { granted: true }).catch(() => {});
}

// Règlement commun à la billetterie et à la boutique. Les groupes/total sont
// déjà validés et recalculés serveur (buildGroups / buildBoutiqueGroups) ; seul
// le `kind` change (libellé, notes de commande). Répond directement sur `res`.
// Frais de port par ZONE (PCC = EUR 1:1). Décidés SERVEUR (jamais côté client).
// La zone est déduite du pays de livraison.
const SHIPPING_ZONES = {
  france:        { standard: 5,  express: 12 },
  europe:        { standard: 12, express: 22 },
  international: { standard: 20, express: 35 },
};
// Pays d'Europe (livraison "europe"). Reconnaît nom FR (minuscules) et code ISO2.
const EUROPE = new Set([
  'allemagne', 'de', 'belgique', 'be', 'pays-bas', 'nl', 'luxembourg', 'lu', 'espagne', 'es',
  'italie', 'it', 'portugal', 'pt', 'irlande', 'ie', 'autriche', 'at', 'suisse', 'ch',
  'royaume-uni', 'gb', 'uk', 'pologne', 'pl', 'suede', 'suède', 'se', 'danemark', 'dk',
  'finlande', 'fi', 'norvege', 'norvège', 'no', 'grece', 'grèce', 'gr', 'republique tcheque', 'cz',
  'hongrie', 'hu', 'roumanie', 'ro', 'bulgarie', 'bg', 'croatie', 'hr', 'slovaquie', 'sk',
  'slovenie', 'slovénie', 'si', 'lituanie', 'lt', 'lettonie', 'lv', 'estonie', 'ee', 'malte', 'mt', 'chypre', 'cy',
]);
function shippingZone(country) {
  const c = String(country || '').trim().toLowerCase();
  if (!c || c === 'france' || c === 'fr') return 'france';
  if (EUROPE.has(c)) return 'europe';
  return 'international';
}

// Normalise/valide une adresse de livraison. Renvoie l'objet propre ou null si
// incomplet (nom, adresse, code postal, ville obligatoires).
function cleanShipping(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const firstName = String(raw.firstName || '').trim();
  const lastName = String(raw.lastName || '').trim();
  const name = String(raw.name || `${firstName} ${lastName}`).trim();
  const s = {
    firstName: firstName || null,
    lastName: lastName || null,
    name,
    email: String(raw.email || '').trim() || null,
    phone: String(raw.phone || '').trim() || null,
    address1: String(raw.address1 || '').trim(),
    address2: String(raw.address2 || '').trim() || null,
    postalCode: String(raw.postalCode || '').trim(),
    city: String(raw.city || '').trim(),
    country: String(raw.country || '').trim() || 'France',
  };
  if (!s.name || !s.address1 || !s.postalCode || !s.city) return null;
  return s;
}

async function settleCheckout(req, res, { groups, grandTotalEur, mode, kind, shipping = null }) {
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
      const commission = g.commission || null;

      // ── Produit plateforme (Aivora) : OPTION A — charge UNIQUE au PaieCash
      //    Store (montant plein), puis reversement PCC de la commission au club
      //    (async, fiable). Le fan n'est débité qu'une fois.
      if (commission) {
        // Commande d'abord → id stable (merchantRef + idempotence revshare).
        let order;
        try {
          order = await ordersDb.createOrder({
            user_id: authId, tenant_id: g.tenant.id, transaction_id: null,
            items: g.orderItems, total_pcc: g.totalPcc, total_eur: g.totalEur,
            notes: JSON.stringify({ kind: g.kind || kind, mode: 'pcc_full', pending: true, createdAt: new Date().toISOString(), shipping, shippingStatus: shipping ? 'preparing' : undefined }),
          });
        } catch (e) {
          console.error('[CHECKOUT] platform createOrder:', e.message);
          return fail(res, 'Commande impossible, réessaie.', 500, { partial: results });
        }

        const pay = await pcc.execute({
          userEmail: email, userAuthId: authId, amountEur: g.totalEur,
          description: describe(g.kind || kind, g.tenant, g.orderItems),
          merchantRef: `paiecashfan:${STORE_SLUG}:${order.id}`, recipientSlug: STORE_SLUG,
          merchantName: 'PaieCash Store', preferredMode: 'pcc_full', idempotencyKey: String(order.id),
        });
        if (!pay?.success || pay.mode !== 'pcc_full' || (pay.status && pay.status !== 'completed')) {
          await ordersDb.updateOrderStatus(order.id, 'cancelled').catch(() => {});
          return fail(res, pay?.error || 'Paiement PCC non abouti. Ton solde a peut-être changé, réessaie.', 402, { needTopUp: true, partial: results });
        }
        await ordersDb.updateOrderStatus(order.id, 'completed');
        await mergeNotes(order, { pending: false, pccReference: pay.reference, pccUsed: pay.pccUsed, paidAt: new Date().toISOString(), commission: { clubTenantId: commission.originTenantId, rate: commission.rate, commissionEur: commission.commissionEur } }).catch(() => {});

        // Commission tracée 'pending' → reversement PCC au club (best-effort
        // immédiat ; le cron + le webhook rattrapent en cas d'échec).
        let commissionStatus = 'pending';
        if (commission.commissionEur > 0) {
          const crow = await commissionsDb.recordCommission({
            orderId: order.id, clubTenantId: commission.originTenantId, productId: commission.productId, buyerUserId: authId,
            grossPcc: commission.grossPcc, grossEur: commission.grossEur, rate: commission.rate,
            commissionPcc: commission.commissionPcc, commissionEur: commission.commissionEur,
            reference: pay.reference, status: 'pending',
          }).catch((e) => { console.error('[CHECKOUT] recordCommission:', e.message); return null; });
          try {
            const rev = await revshareDb.enqueue({
              orderId: order.id, commissionId: crow?.id || null, clubSlug: commission.originSlug, clubTenantId: commission.originTenantId,
              amountEur: commission.commissionEur, saleReference: pay.reference, idempotencyKey: `revshare-${order.id}`,
            });
            if (rev && (await revshareProcessor.processRow(rev)) === 'done') commissionStatus = 'paid';
          } catch (e) { console.error('[CHECKOUT] revshare:', e.message); }
        }
        results.push({ clubSlug: g.tenant.slug, clubName: g.tenant.name, orderId: order.id, reference: pay.reference, totalEur: g.totalEur, totalPcc: g.totalPcc, pccUsed: pay.pccUsed, commission: { to: commission.originName, eur: commission.commissionEur, status: commissionStatus } });
        continue;
      }

      // ── Groupe club normal ──
      const pay = await pcc.execute({
        userEmail: email, userAuthId: authId, amountEur: g.totalEur,
        description: describe(g.kind || kind, g.tenant, g.orderItems), merchantRef: g.merchantRef,
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
          notes: JSON.stringify({ kind: g.kind || kind, mode: 'pcc_full', pccReference: pay.reference, pccTransactionId: pay.transactionId ?? null, pccUsed: pay.pccUsed, paidAt: new Date().toISOString(), shipping, shippingStatus: shipping ? 'preparing' : undefined }),
        });
        orderId = order.id;
        await ordersDb.updateOrderStatus(order.id, 'completed');
        await grantGameEntitlements(order);   // tombola : crée le(s) ticket(s)
        // Billetterie : émission des billets via Redtaag (best-effort) pour les
        // offres qui ont un mapping Redtaag. N'échoue jamais le paiement.
        // `g.kind` (panier mixte) prime sur le kind global du checkout.
        if ((g.kind || kind) === 'ticketing') {
          await emitRedtaagTickets(order, g, redtaagContact(req.authUser));
        }
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
    notes: JSON.stringify({ kind: g.kind || kind, mode, pending: true, createdAt: new Date().toISOString(), shipping, shippingStatus: shipping ? 'preparing' : undefined }),
  });

  // Produit plateforme payé par carte : le split n'est pas possible en une seule
  // session Stripe → on trace la commission « en attente » (régularisable au BO).
  if (g.commission && g.commission.commissionEur > 0) {
    await commissionsDb.recordCommission({
      orderId: order.id, clubTenantId: g.commission.originTenantId, productId: g.commission.productId, buyerUserId: authId,
      grossPcc: g.commission.grossPcc, grossEur: g.commission.grossEur, rate: g.commission.rate,
      commissionPcc: g.commission.commissionPcc, commissionEur: g.commission.commissionEur,
      reference: null, status: 'pending',
    }).catch((e) => console.error('[CHECKOUT] recordCommission (card):', e.message));
  }

  // 2. Exécution → Stripe Checkout URL.
  // Produit plateforme : le paiement est crédité au PaieCash Store (recipientSlug),
  // et le reversement au club sera déclenché par le webhook payment.completed.
  const isPlatform = !!g.commission;
  let pay;
  try {
    pay = await pcc.execute({
      userEmail: email, userAuthId: authId, amountEur: g.totalEur,
      description: describe(g.kind || kind, g.tenant, g.orderItems),
      merchantRef: isPlatform ? `paiecashfan:${STORE_SLUG}:${order.id}` : g.merchantRef,
      recipientSlug: isPlatform ? STORE_SLUG : undefined,
      merchantName: isPlatform ? 'PaieCash Store' : (g.tenant.name || 'PaieCashFan'), preferredMode: mode,
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
    const fresh = await ordersDb.getOrderById(order.id).catch(() => order);
    await grantGameEntitlements(fresh || order);   // tombola : crée le(s) ticket(s)
    if ((g.kind || kind) === 'ticketing') {
      await emitRedtaagTickets(fresh || order, g, redtaagContact(req.authUser));
    }
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
// Body: { items:[{product_id,quantity,size?}], mode?, origin?, shipping:{...} }
// Produits physiques → adresse de livraison OBLIGATOIRE.
router.post('/boutique', async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 'Panier vide.');
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : 'pcc_full';

    const shipping = cleanShipping(req.body?.shipping);
    if (!shipping) return fail(res, 'Adresse de livraison requise (nom, adresse, code postal et ville).');

    // Mode + zone + frais de livraison décidés serveur (jamais le client).
    const shippingMethod = req.body?.shippingMethod === 'express' ? 'express' : 'standard';
    const zone = shippingZone(shipping.country);
    const shippingFeeEur = SHIPPING_ZONES[zone]?.[shippingMethod] ?? 0;

    // boutiqueSlug = club de la boutique visitée (pour reverser la commission
    // des produits plateforme comme Aivora au bon club).
    const built = await buildBoutiqueGroups(items, res, req.body?.boutiqueSlug || null);
    if (!built) return; // buildBoutiqueGroups a déjà répondu

    // Ajoute les frais de port (boutique = un seul club → un seul groupe).
    if (shippingFeeEur > 0 && built.groups.length) {
      built.groups[0].totalEur = round2(built.groups[0].totalEur + shippingFeeEur);
      built.groups[0].totalPcc = round2(built.groups[0].totalPcc + shippingFeeEur);
      built.grandTotalEur = round2(built.grandTotalEur + shippingFeeEur);
    }
    const shippingFull = { ...shipping, method: shippingMethod, zone, feeEur: shippingFeeEur };
    return settleCheckout(req, res, { ...built, mode, kind: 'boutique', shipping: shippingFull });
  } catch (err) {
    console.error('[CHECKOUT] Erreur:', err.message);
    return fail(res, `Échec du paiement : ${err.message}`, 500);
  }
});

// POST /api/v2/checkout/mixed — panier unifié billetterie + boutique.
// Body: { ticketing:[{clubSlug,offerId,quantity}], boutique:[{product_id,quantity,size?}],
//         boutiqueSlug?, mode?, origin?, shipping?, shippingMethod? }
// Chaque groupe garde son `kind` (émission Redtaag pour les billets, livraison
// pour la boutique). En PCC : paiement multi-clubs OK. En carte : un seul
// marchand à la fois (contrainte Stripe existante).
router.post('/mixed', async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    const ticketingItems = Array.isArray(req.body?.ticketing) ? req.body.ticketing : [];
    const boutiqueItems = Array.isArray(req.body?.boutique) ? req.body.boutique : [];
    if (!ticketingItems.length && !boutiqueItems.length) return fail(res, 'Panier vide.');
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : 'pcc_full';

    const groups = [];
    let grandTotalEur = 0;
    let shippingFull = null;

    // Billetterie
    if (ticketingItems.length) {
      const bt = await buildGroups(ticketingItems, res);
      if (!bt) return; // a déjà répondu
      groups.push(...bt.groups);
      grandTotalEur += bt.grandTotalEur;
    }

    // Boutique (adresse de livraison requise pour les produits physiques)
    if (boutiqueItems.length) {
      const shipping = cleanShipping(req.body?.shipping);
      if (!shipping) return fail(res, 'Adresse de livraison requise pour les produits boutique.');
      const shippingMethod = req.body?.shippingMethod === 'express' ? 'express' : 'standard';
      const zone = shippingZone(shipping.country);
      const shippingFeeEur = SHIPPING_ZONES[zone]?.[shippingMethod] ?? 0;
      const bb = await buildBoutiqueGroups(boutiqueItems, res, req.body?.boutiqueSlug || null);
      if (!bb) return; // a déjà répondu
      if (shippingFeeEur > 0 && bb.groups.length) {
        bb.groups[0].totalEur = round2(bb.groups[0].totalEur + shippingFeeEur);
        bb.groups[0].totalPcc = round2(bb.groups[0].totalPcc + shippingFeeEur);
        bb.grandTotalEur = round2(bb.grandTotalEur + shippingFeeEur);
      }
      shippingFull = { ...shipping, method: shippingMethod, zone, feeEur: shippingFeeEur };
      groups.push(...bb.groups);
      grandTotalEur += bb.grandTotalEur;
    }

    return settleCheckout(req, res, { groups, grandTotalEur: round2(grandTotalEur), mode, kind: 'mixed', shipping: shippingFull });
  } catch (err) {
    console.error('[CHECKOUT] Erreur (mixed):', err.message);
    return fail(res, `Échec du paiement : ${err.message}`, 500);
  }
});

// POST /api/v2/checkout/tombola
// Body: { items:[{campaignId,quantity}], mode?, origin?, bnplInstallments? }
// Le ticket est créé à la confirmation du paiement (grantGameEntitlements).
router.post('/tombola', async (req, res) => {
  try {
    if (!pcc.isConfigured()) return fail(res, 'Paiement momentanément indisponible (configuration manquante).', 503);
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (!items.length) return fail(res, 'Aucun ticket sélectionné.');
    const mode = MODES.includes(req.body?.mode) ? req.body.mode : 'pcc_full';

    const built = await buildTombolaGroups(items, res);
    if (!built) return; // buildTombolaGroups a déjà répondu
    return settleCheckout(req, res, { ...built, mode, kind: 'tombola' });
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

    if (order.status === 'completed') {
      await grantGameEntitlements(order);   // défensif : attribue si pas déjà fait
      return ok(res, { status: 'completed', order: shape(order) });
    }

    const ref = safeParse(order.metadata?.notes)?.pccReference;
    if (ref && pcc.isConfigured()) {
      const resolved = await pcc.resolveUser(email).catch(() => null);
      if (resolved?.userId != null) {
        const hist = await pcc.history({ userId: resolved.userId, limit: 50 }).catch(() => []);
        const tx = (Array.isArray(hist) ? hist : []).find((t) => t.reference === ref);
        if (tx?.status === 'completed') {
          await ordersDb.updateOrderStatus(order.id, 'completed');
          await grantGameEntitlements(order);   // tombola payée par carte : crée le ticket
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
