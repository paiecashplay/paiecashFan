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

// Appel bas niveau : ajoute l'auth Bearer + parse l'enveloppe { success, data, error }.
async function call(path, { method = 'GET', body } = {}) {
  if (!API_KEY) {
    throw new Error('PAIECASHCOIN_API_KEY manquante côté serveur');
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
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
// merchantName (optionnel) : affiché côté payeur (Stripe Checkout, emails,
// dashboard "Mes paiements", metadata Stripe). On y met le nom du club.
// { success, transactionId, reference, mode, pccUsed, cardAmountEur, remainingPccBalance }
async function execute({ userEmail, userAuthId, amountEur, description, merchantRef, merchantName, preferredMode }) {
  return call('/pay/execute', {
    method: 'POST',
    body: { userEmail, userAuthId, amountEur, description, merchantRef, merchantName, preferredMode },
  });
}

// GET /pay/history?userId=&limit= → historique des paiements PCC du user.
// L'API attend l'id interne PaieCashCoin (obtenu via resolveUser), pas l'email.
async function history({ userId, limit = 20 }) {
  return call(`/pay/history?userId=${encodeURIComponent(userId)}&limit=${limit}`);
}

module.exports = { isConfigured, resolveUser, quote, execute, history };
