// ═══════════════════════════════════════════════════════════════
// db/transactions.js - Transaction CRUD via Supabase (Unified Schema)
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createTransaction(data) {
  const insertData = {
    user_id: data.userId || data.user_id,
    tenant_id: data.tenant_id || null,
    type: data.type,
    pcc_amount: data.amount || data.pcc_amount,
    tx_hash: data.txHash || data.tx_hash || null,
    blockchain_status: data.blockchain_status || 'pending',
    internal_status: data.status || data.internal_status || 'pending',
    idempotency_key: data.idempotency_key || null,
    metadata: data.metadata || {}
  };

  // Ensure metadata is an object
  if (typeof insertData.metadata === 'string') {
    try { insertData.metadata = JSON.parse(insertData.metadata); } catch (e) { insertData.metadata = {}; }
  }

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`createTransaction: ${error.message}`);

  // Normalize response for backend services
  if (tx) {
    tx.userId = tx.user_id;
    tx.amount = parseFloat(tx.pcc_amount);
    tx.txHash = tx.tx_hash;
    tx.status = tx.internal_status;
  }
  return tx;
}

async function getUserTransactions(userId) {
  const { data: txs, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getUserTransactions: ${error.message}`);
  return (txs || []).map(tx => ({
    ...tx,
    userId: tx.user_id,
    amount: parseFloat(tx.pcc_amount),
    txHash: tx.tx_hash,
    status: tx.internal_status
  }));
}

async function getTransactionById(id) {
  const { data: tx, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`getTransactionById: ${error.message}`);
  if (!tx) return null;

  return {
    ...tx,
    userId: tx.user_id,
    amount: parseFloat(tx.pcc_amount),
    txHash: tx.tx_hash,
    status: tx.internal_status
  };
}

async function updateTransactionStatus(id, status, txHash = null) {
  const updates = { internal_status: status };
  if (txHash) {
    updates.tx_hash = txHash;
    if (status === 'complete') {
      updates.blockchain_status = 'confirmed';
    } else if (status === 'failed') {
      updates.blockchain_status = 'failed';
    } else {
      updates.blockchain_status = 'pending';
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(`updateTransactionStatus: ${error.message}`);
}

async function getAllTransactions(filters = {}) {
  let query = supabase.from('transactions').select('*');

  if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.internal_status) query = query.eq('internal_status', filters.internal_status);
  if (filters.since) query = query.gte('created_at', filters.since);
  if (filters.until) query = query.lte('created_at', filters.until);

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 100;
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  query = query.order('created_at', { ascending: false });

  const { data: txs, error } = await query;
  if (error) throw new Error(`getAllTransactions: ${error.message}`);
  return (txs || []).map(tx => ({
    ...tx,
    userId: tx.user_id,
    amount: parseFloat(tx.pcc_amount),
    txHash: tx.tx_hash,
    status: tx.internal_status
  }));
}

async function getTransactionsByTenant(tenantId) {
  return getAllTransactions({ tenant_id: tenantId });
}

async function getTransactionStats(filters = {}) {
  let query = supabase.from('transactions').select('type, pcc_amount, internal_status');
  if (filters.since) query = query.gte('created_at', filters.since);
  if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id);

  const { data: txs, error } = await query;
  if (error) throw new Error(`getTransactionStats: ${error.message}`);

  let totalMinted = 0, totalSpent = 0, count = 0;
  txs.forEach(tx => {
    const amt = parseFloat(tx.pcc_amount) || 0;
    if (tx.type === 'mint' && tx.internal_status === 'complete') {
      totalMinted += amt;
    }
    if (tx.type === 'spend' && tx.internal_status === 'complete') {
      totalSpent += amt;
    }
    count++;
  });

  return { totalCount: count, totalPCCMinted: totalMinted, totalPCCSpent: totalSpent };
}

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionsByTenant,
  getTransactionStats
};
