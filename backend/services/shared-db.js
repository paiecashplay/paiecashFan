// ═══════════════════════════════════════════════════════════════
// services/shared-db.js - Shared DB helpers for v2 routes (Unified Schema)
// ═══════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Mint Transactions ─────────────────────────────────────

async function createMintTransaction(data) {
  const txId = uuidv4();
  const row = {
    id: txId,
    user_id: data.user_id,
    type: 'mint',
    pcc_amount: data.pcc_amount,
    internal_status: data.status || 'complete',
    idempotency_key: data.stripe_session || null,
    metadata: { ...data.metadata, session: data.stripe_session },
    created_at: new Date().toISOString()
  };

  const { error: txErr } = await supabase.from('transactions').insert(row);
  if (txErr) throw new Error(txErr.message);

  const detailRow = {
    id: txId,
    payment_rail: data.payment_rail || 'stripe',
    source_currency: data.source_currency || 'EUR',
    source_amount: data.source_amount || 0,
    stripe_session: data.stripe_session,
    circle_tx_id: data.circle_tx_id
  };
  await supabase.from('mint_transactions').insert(detailRow);

  return row;
}

// ─── P2P Transactions ─────────────────────────────────────

async function createP2PTransaction(data) {
  const p2pId = uuidv4();
  const sendTxId = uuidv4();
  const receiveTxId = uuidv4();

  // 1. Sender Transaction
  await supabase.from('transactions').insert({
    id: sendTxId,
    user_id: data.sender_id,
    type: 'send',
    pcc_amount: data.amount,
    internal_status: data.status || 'complete',
    metadata: { ...data.metadata, pairedTxId: receiveTxId, p2pId },
    created_at: new Date().toISOString()
  });

  // 2. Recipient Transaction
  await supabase.from('transactions').insert({
    id: receiveTxId,
    user_id: data.recipient_id,
    type: 'receive',
    pcc_amount: data.amount,
    internal_status: data.status || 'complete',
    metadata: { ...data.metadata, pairedTxId: sendTxId, p2pId },
    created_at: new Date().toISOString()
  });

  // 3. P2P Detail Record (link to sender tx as primary)
  const detailRow = {
    id: sendTxId, // We use the sender tx id as the key for detail
    recipient_id: data.recipient_id,
    sender_wallet: data.sender_wallet,
    recipient_wallet: data.recipient_wallet,
    note: data.note
  };
  await supabase.from('p2p_transactions').insert(detailRow);

  return { id: sendTxId, receiveTxId, p2pId };
}

// ─── Withdrawals ────────────────────────────────────────────

async function getAllWithdrawals(filters = {}) {
  let query = supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false });
  if (filters.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function createWithdrawal(data) {
  const row = {
    id: uuidv4(),
    user_id: data.user_id,
    pcc_amount: data.pcc_amount,
    fiat_amount: data.fiat_amount,
    fiat_currency: data.fiat_currency || 'EUR',
    bank_details: data.bank_details,
    status: 'complete',
    created_at: new Date().toISOString()
  };
  const { data: result, error } = await supabase.from('withdrawal_requests').insert(row).select().single();
  if (error) throw new Error(error.message);
  return result;
}

async function updateWithdrawalStatus(id, status, extra = {}) {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Club Applications ─────────────────────────────────────

async function getClubApplications(filters = {}) {
  let query = supabase.from('tenants').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  const { data } = await query;
  return data || [];
}

// ─── Fraud Flags ────────────────────────────────────────────

async function getFraudFlags(filters = {}) {
  const { data } = await supabase.from('fraud_flags').select('*').order('created_at', { ascending: false });
  return data || [];
}

// ─── Approval / Audit Logs ─────────────────────────────────

async function createApprovalLog(data) {
  const row = {
    id: uuidv4(),
    admin_id: data.admin_id,
    action: data.action,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    new_state: data.new_state,
    created_at: new Date().toISOString()
  };
  const { data: result, error } = await supabase.from('audit_logs').insert(row).select().single();
  if (error) {
    console.warn('[SharedDB] Audit log insert failed:', error.message);
    return row;
  }
  return result;
}

async function getApprovalLogs(filters = {}) {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  return data || [];
}

// ─── Settings ───────────────────────────────────────────────

async function getAllSettings() {
  const { data } = await supabase.from('platform_settings').select('*');
  return data || [];
}

async function updateSetting(key, value, adminId) {
  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_by: adminId, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── CONTESTS ─────────────────────────────────────────────

async function getContests(params = {}) {
  let query = supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false });
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.game_id) query = query.eq('game_id', params.game_id);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getContestById(id) {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function getEntriesByContest(contestId) {
  const { data, error } = await supabase
    .from('contest_entries')
    .select('*, users(full_name, email)')
    .eq('contest_id', contestId)
    .order('score', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function createEntry(data) {
  const { data: entry, error } = await supabase
    .from('contest_entries')
    .insert({
      contest_id: data.contest_id,
      user_id: data.user_id,
      entry_fee_paid: data.entry_fee_paid || 0,
      selections: data.selections || {},
      status: 'entered'
    })
    .select()
    .single();
  if (error) throw error;
  // Increment contest current_entries
  await supabase
    .from('contests')
    .update({ current_entries: supabase.raw ? undefined : undefined })
    .eq('id', data.contest_id)
    .then(() => { })
    .catch(() => { });
  return entry;
}

async function getEntriesByUser(userId) {
  const { data, error } = await supabase
    .from('contest_entries')
    .select('*, contests(title, game_id, status, prize_pool_pcc)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getLeaderboard(type, params = {}) {
  const { data, error } = await supabase
    .from('contest_entries')
    .select('*, users(full_name), contests(title, game_id)')
    .eq('status', 'won')
    .order('prize_won', { ascending: false })
    .limit(params.limit || 50);
  if (error) throw error;
  return data || [];
}

// ─── BETTING POOLS ────────────────────────────────────────

async function getPools(params = {}) {
  let query = supabase.from('betting_pools').select('*').order('created_at', { ascending: false });
  if (params.status) query = query.eq('status', params.status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getPoolById(id) {
  const { data, error } = await supabase.from('betting_pools').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

async function getBetsByPool(poolId) {
  const { data, error } = await supabase.from('bets').select('*').eq('pool_id', poolId);
  if (error) throw error;
  return data || [];
}

async function placeBet(data) {
  const { data: bet, error } = await supabase.from('bets').insert(data).select().single();
  if (error) throw error;
  return bet;
}

async function getBetsByUser(userId) {
  const { data, error } = await supabase.from('bets').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─── GAME SESSIONS (Aviator / Slots / Roulette) ──────────

async function createGameSession({ userId, gameId, betAmount, result, payout, gameData, balanceBefore, balanceAfter }) {
  const netPnl = result === 'win' ? payout - betAmount : -betAmount;
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      user_id: userId,
      game_id: gameId,
      bet_amount: betAmount,
      result,
      payout: payout || 0,
      net_pnl: netPnl,
      game_data: gameData || {},
      balance_before: balanceBefore,
      balance_after: balanceAfter
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getGameSessionsByUser(userId, limit = 20) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

module.exports = {
  // Existing exports
  createMintTransaction,
  getAllWithdrawals,
  createWithdrawal,
  updateWithdrawalStatus,
  createP2PTransaction,
  getClubApplications,
  getFraudFlags,
  createApprovalLog,
  getApprovalLogs,
  getAllSettings,
  updateSetting,
  // Contests
  getContests,
  getContestById,
  getEntriesByContest,
  createEntry,
  getEntriesByUser,
  getLeaderboard,
  // Betting Pools
  getPools,
  getPoolById,
  getBetsByPool,
  placeBet,
  getBetsByUser,
  // Game Sessions
  createGameSession,
  getGameSessionsByUser,
};
