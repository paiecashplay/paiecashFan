// ═══════════════════════════════════════════════════════════════
// db/wallet.js — Portefeuille virtuel (Fan Credits) + ledger immuable.
// Crédits VIRTUELS uniquement (aucune valeur monétaire, aucun retrait,
// aucun transfert). Chaque mouvement est journalisé avec balance_before/after
// et une idempotency_key (rejoue sans double effet). Service-role only.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

const START_BALANCE = 500;

async function ensureWallet(userId) {
  const { data } = await supabase.from('virtual_wallets').select('*').eq('user_id', userId).maybeSingle();
  if (data) return data;
  const { data: created, error } = await supabase.from('virtual_wallets').insert({ user_id: userId, balance: START_BALANCE }).select('*').single();
  if (error) {
    // Course : un autre appel l'a créé entre-temps
    const { data: again } = await supabase.from('virtual_wallets').select('*').eq('user_id', userId).maybeSingle();
    if (again) return again;
    throw new Error(error.message);
  }
  // Trace du bonus d'inscription
  await supabase.from('virtual_wallet_transactions').insert({
    wallet_id: created.id, user_id: userId, amount: START_BALANCE, transaction_type: 'signup_bonus',
    idempotency_key: `signup:${userId}`, balance_before: 0, balance_after: START_BALANCE,
  }).then(() => {}, () => {});
  return created;
}

async function getBalance(userId) {
  const w = await ensureWallet(userId);
  return w.balance;
}

// Enregistre un mouvement. amount signé. Idempotent via idempotency_key.
// Renvoie { ok, balance, replayed?, reason? }.
async function record({ userId, amount, type, referenceType = null, referenceId = null, idempotencyKey = null }) {
  if (idempotencyKey) {
    const { data: existing } = await supabase.from('virtual_wallet_transactions').select('balance_after').eq('idempotency_key', idempotencyKey).maybeSingle();
    if (existing) { const w = await ensureWallet(userId); return { ok: true, replayed: true, balance: w.balance }; }
  }
  const wallet = await ensureWallet(userId);
  const before = wallet.balance;
  const after = before + amount;
  if (amount < 0 && after < 0) return { ok: false, reason: 'insufficient', balance: before };

  const { error: txErr } = await supabase.from('virtual_wallet_transactions').insert({
    wallet_id: wallet.id, user_id: userId, amount, transaction_type: type,
    reference_type: referenceType, reference_id: referenceId, idempotency_key: idempotencyKey,
    balance_before: before, balance_after: after,
  });
  if (txErr) {
    // Conflit d'idempotence (rejoue concurrent) → considéré comme déjà appliqué
    if (String(txErr.message).includes('duplicate') || txErr.code === '23505') {
      const w = await ensureWallet(userId); return { ok: true, replayed: true, balance: w.balance };
    }
    throw new Error(txErr.message);
  }
  await supabase.from('virtual_wallets').update({ balance: after, updated_at: new Date().toISOString() }).eq('id', wallet.id);
  return { ok: true, balance: after };
}

async function listTransactions(userId, limit = 30) {
  const { data } = await supabase.from('virtual_wallet_transactions')
    .select('id, amount, transaction_type, reference_type, balance_after, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

module.exports = { START_BALANCE, ensureWallet, getBalance, record, listTransactions };
