// ═══════════════════════════════════════════════════════════════
// db/cashouts.js - Cashout request management via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createCashout(data) {
  const { data: cashout, error } = await supabase
    .from('cashout_requests')
    .insert({
      tenant_id: data.tenant_id,
      requested_by: data.requested_by,
      pcc_amount: data.pcc_amount || data.pccAmount,
      fiat_amount: data.fiat_amount || data.fiatAmount,
      fee_amount: data.fee_amount || 0,
      net_fiat_amount: data.net_fiat_amount || data.fiat_amount || data.fiatAmount,
      exchange_rate_used: data.exchange_rate_used || 100,
      fiat_currency: data.fiat_currency || data.currency || 'EUR',
      bank_details: data.bank_details || {},
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(`createCashout: ${error.message}`);
  return cashout;
}

async function getCashoutById(id) {
  const { data, error } = await supabase
    .from('cashout_requests').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

async function getAllCashouts(filters = {}) {
  let query = supabase.from('cashout_requests').select('*');
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id);
  query = query.order('requested_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(`getAllCashouts: ${error.message}`);
  return data;
}

async function getCashoutsByTenant(tenantId) {
  return getAllCashouts({ tenant_id: tenantId });
}

async function updateCashoutStatus(id, status, extras = {}) {
  const updates = { status };
  if (extras.admin_notes) updates.admin_notes = extras.admin_notes;
  if (extras.rejection_reason) updates.rejection_reason = extras.rejection_reason;
  if (status === 'under_review' || status === 'approved' || status === 'rejected') {
    updates.reviewed_at = new Date().toISOString();
  }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('cashout_requests').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`updateCashoutStatus: ${error.message}`);
  return data;
}

async function getCashoutStats() {
  const { data, error } = await supabase
    .from('cashout_requests').select('status, fiat_amount, fee_amount, net_fiat_amount');
  if (error) throw new Error(`getCashoutStats: ${error.message}`);

  let pendingCount = 0, pendingValue = 0, completedCount = 0, completedValue = 0, totalFees = 0;
  (data || []).forEach(c => {
    const fiat = parseFloat(c.fiat_amount) || 0;
    const fee = parseFloat(c.fee_amount) || 0;
    if (c.status === 'pending' || c.status === 'under_review') { pendingCount++; pendingValue += fiat; }
    if (c.status === 'completed') { completedCount++; completedValue += fiat; }
    totalFees += fee;
  });
  return { pendingCount, pendingValueEUR: pendingValue, completedCount, completedValueEUR: completedValue, totalFeesCollectedEUR: totalFees };
}

module.exports = { createCashout, getCashoutById, getAllCashouts, getCashoutsByTenant, updateCashoutStatus, getCashoutStats };
