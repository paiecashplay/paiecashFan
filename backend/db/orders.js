// ═══════════════════════════════════════════════════════════════
// db/orders.js - Order CRUD operations via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createOrder(data) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: data.user_id,
      tenant_id: data.tenant_id,
      transaction_id: data.transaction_id || null,
      total_pcc: data.total_pcc,
      status: 'pending',
      metadata: {
        items: data.items || [],
        total_eur: data.total_eur || 0,
        notes: data.notes || null
      }
    })
    .select()
    .single();

  if (error) throw new Error(`createOrder: ${error.message}`);
  return order;
}

async function getOrderById(id) {
  const { data: order, error } = await supabase
    .from('orders').select('*').eq('id', id).single();
  if (error) return null;
  return order;
}

async function getOrdersByUser(userId) {
  const { data, error } = await supabase
    .from('orders').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getOrdersByUser: ${error.message}`);
  return data;
}

async function getOrdersByTenant(tenantId) {
  const { data, error } = await supabase
    .from('orders').select('*').eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`getOrdersByTenant: ${error.message}`);
  return data;
}

async function updateOrderStatus(id, status, notes = null) {
  const updates = { status };
  if (notes) updates.notes = notes;
  const { data: order, error } = await supabase
    .from('orders').update(updates).eq('id', id).select().single();
  if (error) throw new Error(`updateOrderStatus: ${error.message}`);
  return order;
}

module.exports = { createOrder, getOrderById, getOrdersByUser, getOrdersByTenant, updateOrderStatus };
