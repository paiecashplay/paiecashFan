// ═══════════════════════════════════════════════════════════════
// services/paiecashcoin.js — Client de l'API PaieCashCoin (v1)
// ---------------------------------------------------------------
// PaieCashCoin héberge le wallet PCC (Crossmint + ledger off-chain).
// PaieCashFan délègue les paiements ici. Les deux apps ont des bases
// Supabase distinctes : le lien se fait par EMAIL (jamais par un id
// interne). La clé API (pcc_live_…) est un secret SERVEUR uniquement,
// ne JAMAIS l'exposer au frontend.
//
// Env requis (backend/.env + Railway) :
//   PAIECASHCOIN_API_URL  = https://www.paiecashcoin.com/api/v1
//   PAIECASHCOIN_API_KEY  = pcc_live_xxxxxxxxxxxxxxxxxx
//
// ⚠️ Utiliser www. (sans www → 301 qui strippe l'Authorization).
// ═══════════════════════════════════════════════════════════════

const API_URL = (process.env.PAIECASHCOIN_API_URL || 'https://www.paiecashcoin.com/api/v1').replace(/\/+$/, '');
const API_KEY = process.env.PAIECASHCOIN_API_KEY || '';

function isConfigured() {
  return Boolean(API_KEY);
}

// Clé API dédiée au compte « PaieCash Store » (reversement des commissions
// plateforme → club). Distincte de PAIECASHCOIN_API_KEY (le store est un user
// PCC à part qui s'auto-authentifie pour débiter SON propre solde).
const STORE_API_KEY = process.env.PAIECASH_STORE_API_KEY || '';

function isStoreConfigured() {
  return Boolean(STORE_API_KEY);
}

// Appel bas niveau : ajoute l'auth Bearer + parse l'enveloppe { success, data, error }.
// `apiKey` permet d'utiliser une clé différente (ex. celle du PaieCash Store).
async function call(path, { method = 'GET', body, apiKey } = {}) {
  const key = apiKey || API_KEY;
  if (!key) {
    throw new Error('PAIECASHCOIN_API_KEY manquante côté serveur');
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (err) {
    // Réseau / DNS / timeout : erreur transport, jamais un débit effectué.
    throw new Error(`PaieCashCoin injoignable: ${err.message}`);
  }

  let json = null;
  try { json = await res.json(); } catch { /* réponse non-JSON */ }

  if (!res.ok || !json?.success) {
    const msg = json?.error || `PaieCashCoin ${res.status} sur ${path}`;
    const e = new Error(msg);
    e.status = res.status;
    e.code = json?.code || null;
    throw e;
  }

  return json.data;
}

// GET /users/resolve?email= → { found, userId, walletReady }
// Idempotent, sans effet de bord. walletReady=false ⇒ pas encore de solde PCC.
async function resolveUser(email) {
  return call(`/users/resolve?email=${encodeURIComponent(email)}`);
}

// POST /pay/quote → devis SANS effet de bord.
// { mode, totalAmountEur, pccToUse, cardAmountEur, currentPccBalance, pccCoveragePercent, summary }
async function quote({ userEmail, amountEur, preferredMode }) {
  return call('/pay/quote', {
    method: 'POST',
    body: { userEmail, amountEur, preferredMode },
  });
}

// POST /pay/execute (scope pay:write) → exécute (débite le PCC).
// ⚠️ NE PAS retenter en cas de timeout : pas de clé d'idempotence côté API,
// un retry pourrait double-débiter. Un seul appel, on remonte l'erreur sinon.
// merchantName : affiché côté payeur (Stripe Checkout, emails, dashboard).
// Modes carte/mixte/BNPL : fournir successUrl/cancelUrl/origin (redirection
// Stripe) + idempotencyKey (retry safe). Réponse :
//   - pcc_full → { status:'completed', pccUsed, reference, remainingPccBalance }
//   - card/mixed/bnpl → { status:'pending_card', reference, pccPlanned,
//                         cardAmountEur, stripeCheckoutUrl }
async function execute({
  userEmail, userAuthId, amountEur, description, merchantRef, merchantName,
  recipientSlug, preferredMode, bnplInstallments, successUrl, cancelUrl, origin, idempotencyKey,
  apiKey,
}) {
  return call('/pay/execute', {
    method: 'POST',
    apiKey,
    body: {
      userEmail, userAuthId, amountEur, description, merchantRef, merchantName,
      recipientSlug, preferredMode, bnplInstallments, successUrl, cancelUrl, origin, idempotencyKey,
    },
  });
}

// Reversement de commission plateforme → club, en PCC pur (instantané, sans Stripe).
// Débite le solde du PaieCash Store (clé STORE_API_KEY) et crédite le club.
async function payoutToClub({ clubSlug, amountEur, description, idempotencyKey, origin }) {
  if (!STORE_API_KEY) throw new Error('PAIECASH_STORE_API_KEY manquante côté serveur');
  const storeEmail = process.env.PAIECASH_STORE_EMAIL || 'paiecashstore@paiecashcoin.com';
  return call('/pay/execute', {
    method: 'POST',
    apiKey: STORE_API_KEY,
    body: {
      userEmail: storeEmail,
      amountEur,
      description,
      recipientSlug: clubSlug,
      merchantRef: `paiecashfan:revshare:${idempotencyKey}`,
      preferredMode: 'pcc_full',
      idempotencyKey,
      origin: origin || process.env.PUBLIC_APP_URL || 'https://paiecashfan.com',
    },
  });
}

// GET /pay/history?userId=&limit= → historique des paiements PCC du user.
// L'API attend l'id interne PaieCashCoin (obtenu via resolveUser), pas l'email.
async function history({ userId, limit = 20 }) {
  return call(`/pay/history?userId=${encodeURIComponent(userId)}&limit=${limit}`);
}

module.exports = { isConfigured, isStoreConfigured, resolveUser, quote, execute, payoutToClub, history };
