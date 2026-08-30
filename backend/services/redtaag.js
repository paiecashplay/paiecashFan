// ═══════════════════════════════════════════════════════════════
// services/redtaag.js — Client de l'API billetterie Redtaag (mode B
// headless / vente prépayée backoffice). On encaisse le PCC de notre côté,
// puis on émet le billet chez Redtaag via `finalize_directly` (pas de /ipn).
//
// Flux vérifié (Swagger officiel, 2026-08-30) :
//   /auth → /prices|/salequotas → /bookseat|/bookbyarticle → /addtocart
//   → /ordercart (finalize_directly) → /ticketdocuments/{email}
//
// ⚠️ Aucune clé en dur : tout vient des variables d'env backend
//   REDTAAG_API_URL / REDTAAG_API_ID / REDTAAG_API_SECRET
//   (+ REDTAAG_PMT_TYPE optionnel = nom du mode de paiement configuré
//    dans l'admin Redtaag, ex. "Crypto").
// ═══════════════════════════════════════════════════════════════

const BASE = (process.env.REDTAAG_API_URL || '').replace(/\/+$/, '');
const API_ID = process.env.REDTAAG_API_ID || '';
const API_SECRET = process.env.REDTAAG_API_SECRET || '';
const PMT_TYPE = process.env.REDTAAG_PMT_TYPE || 'Crypto';
const DISPATCH = process.env.REDTAAG_DISPATCH || 'digital';

function isConfigured() {
  return Boolean(BASE && API_ID && API_SECRET);
}

// ─── Cache du JWT ──────────────────────────────────────────────
let tokenCache = { token: null, exp: 0 };

// Décode l'exp (secondes epoch) d'un JWT sans vérifier la signature.
function jwtExp(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8')
    );
    return Number(payload?.exp) || 0;
  } catch {
    return 0;
  }
}

async function authenticate() {
  if (!isConfigured()) {
    throw new Error('Redtaag non configuré (REDTAAG_API_URL/ID/SECRET).');
  }
  const res = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: API_ID,
      secret: API_SECRET,
      authType: 'api',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Redtaag /auth ${res.status}: ${data?.message || data?.error || 'échec authentification'}`
    );
  }
  // La réponse peut porter le token sous plusieurs formes selon la version.
  const token =
    data?.token || data?.jwt || data?.access_token || data?.data?.token;
  if (!token) {
    throw new Error('Redtaag /auth : token absent de la réponse.');
  }
  const exp = jwtExp(token);
  tokenCache = {
    token,
    // Marge de 60 s ; repli à ~50 min si l'exp est illisible.
    exp: exp ? exp - 60 : Math.floor(Date.now() / 1000) + 3000,
  };
  return token;
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.exp > now) return tokenCache.token;
  return authenticate();
}

// ─── Appel générique authentifié ───────────────────────────────
// IMPORTANT : Redtaag maintient la session panier via le JWT envoyé EN COOKIE
// (`token=<jwt>`), pas seulement en Bearer. Sans ce cookie, /addtocart et
// /ordercart renvoient "Session Expired" / "no_session". On envoie donc les deux.
async function call(method, path, body) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `token=${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || data?.msg || res.statusText;
    const err = new Error(`Redtaag ${method} ${path} ${res.status}: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ─── Lectures ──────────────────────────────────────────────────
const getPrices = (eventId) => call('GET', `/prices/${eventId}`);
const getSaleQuotas = (eventId) => call('GET', `/salequotas/${eventId}`);
const checkSeats = (eventId) => call('GET', `/checkseats/${eventId}`);
const getAllSeats = (eventId) => call('GET', `/allseats/${eventId}`);

// ─── Réservation ───────────────────────────────────────────────
// Placement numéroté : réserve `combien` sièges d'une catégorie.
const bookSeat = ({ event, section, categorie, combien = 1 }) =>
  call('POST', '/bookseat', {
    event: Number(event),
    section: Number(section),
    categorie: String(categorie),
    combien: Number(combien),
  });

// Placement libre (recommandé) : réserve un quota d'article sur une catégorie.
// seats = { [sectionId]: { [categoryCode]: { count, articles: { [articleId]: qty } } } }
const bookByArticle = ({ event, seats }) =>
  call('POST', '/bookbyarticle', { event: Number(event), seats });

// ─── Panier ────────────────────────────────────────────────────
// addToCart pour un billet : articles = { [seatId]: articleId } (seatId "0" en libre).
const addToCart = (payload) => call('POST', '/addtocart', payload);

// ─── Commande + finalisation immédiate (vente prépayée) ────────
// contact = { firstname, lastname, email, mobile }
// pmtSplit = [{ type, amount }]  (amount en CENTIMES)
const orderCart = ({
  contact,
  dispatch = DISPATCH,
  finalizeDirectly = true,
  pmtType = PMT_TYPE,
  pmtSplit,
}) =>
  call('POST', '/ordercart', {
    contact,
    dispatch,
    finalize_directly: finalizeDirectly,
    ...(finalizeDirectly
      ? { pmt_type: pmtType, pmt_split: pmtSplit }
      : {}),
  });

// ─── Confirmation de paiement (émission réelle du billet) ──────
// Étape 2 du flux : après `/ordercart` (commande "en attente"), on confirme
// la transaction → Redtaag émet le billet (et l'envoie par email au titulaire,
// dispatch:"digital"). `amountCents` DOIT correspondre au montant de la commande.
const ipn = ({
  cartReference,
  transactionReference,
  amountCents,
  transactionId,
  dispatch = DISPATCH,
}) =>
  call('POST', '/ipn', {
    cart_reference: cartReference,
    transaction_reference: transactionReference,
    amount: Number(amountCents),
    transaction_status: 'Completed',
    transaction_id: transactionId,
    dispatch,
  });

// ─── Récupération du billet émis (QR / PDF) ────────────────────
// ⚠️ Avec la clé backoffice actuelle, /ticketdocuments et /ticketsearch
// renvoient "405 unknown method" → indisponibles. La livraison se fait donc
// par l'email digital envoyé par Redtaag au titulaire. (À réévaluer si Redtaag
// active un endpoint de récupération pour les clés API.)
const getTicketDocuments = (email) =>
  call('GET', `/ticketdocuments/${encodeURIComponent(email)}`);
const ticketSearch = (payload) => call('POST', '/ticketsearch', payload);

// ═══════════════════════════════════════════════════════════════
// Émission prépayée de bout en bout — flux VÉRIFIÉ (2026-08-30) :
//   bookSeat (→ ids de siège) → addtocart (par siège) → ordercart
//   (commande "en attente") → ipn (Completed) → billet émis + emailé.
// À appeler APRÈS encaissement du PCC/CB côté PaieCashFan.
//   contact    : { firstname, lastname, email, mobile }  (nominatif requis)
//   amountEur  : montant total encaissé (EUR) → converti en centimes
//   paymentRef : notre réf de transaction (PCC/Stripe) → tracée dans Redtaag
// Retourne { order, confirm, seatIds }.
// NB : le flux /ipn ne requiert AUCUN "poste de caisse" / moyen de paiement
// configuré côté Redtaag (contrairement à finalize_directly).
// ═══════════════════════════════════════════════════════════════
async function emitPrepaidTickets({
  event,
  section,
  categorie,
  articleId,
  quantity = 1,
  contact,
  amountEur,
  paymentRef,
}) {
  if (!contact?.email) {
    throw new Error('emitPrepaidTickets : email du titulaire requis (nominatif).');
  }

  // 1) Réservation des sièges (retourne les ids de siège dans `seats`).
  const booking = await bookSeat({
    event,
    section,
    categorie,
    combien: quantity,
  });
  const seatIds = Object.keys(booking?.seats || {});
  if (!seatIds.length) {
    throw new Error('Redtaag : aucun siège réservé (bookSeat).');
  }

  // 2) Ajout au panier : chaque siège → l'article (tarif) choisi.
  const articles = {};
  seatIds.forEach((seatId) => {
    articles[seatId] = Number(articleId);
  });
  await addToCart({
    type: 'ticket',
    event: Number(event),
    section: Number(section),
    categorie: String(categorie),
    articles,
  });

  // 3) Commande "en attente" (sans finalize_directly).
  const order = await orderCart({
    contact,
    dispatch: DISPATCH,
    finalizeDirectly: false,
  });
  const cartReference = order?.cart_reference;
  const transactionReference = order?.transaction_reference;
  if (!cartReference) {
    throw new Error('Redtaag : /ordercart sans cart_reference.');
  }

  // 4) Confirmation du paiement → émission réelle du billet (+ email au fan).
  const amountCents =
    Number(order?.amount) || Math.round(Number(amountEur || 0) * 100);
  const confirm = await ipn({
    cartReference,
    transactionReference,
    amountCents,
    transactionId: paymentRef || transactionReference,
    dispatch: DISPATCH,
  });

  return { order, confirm, seatIds };
}

module.exports = {
  isConfigured,
  authenticate,
  getPrices,
  getSaleQuotas,
  checkSeats,
  getAllSeats,
  bookSeat,
  bookByArticle,
  addToCart,
  orderCart,
  ipn,
  getTicketDocuments,
  ticketSearch,
  emitPrepaidTickets,
};
