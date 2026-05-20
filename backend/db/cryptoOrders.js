// ═══════════════════════════════════════════════════════════════
// db/cryptoOrders.js - Crypto Orders CRUD via Supabase
// Handles the crypto_orders table for Transak / MoonPay flows
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

/**
 * Create a new crypto order record
 * Called when a fan initiates a crypto top-up
 */
async function createCryptoOrder(data) {
  const insertData = {
    user_id: data.user_id,
    tenant_id: data.tenant_id || null,
    provider: data.provider,
    provider_order_id: data.provider_order_id,
    provider_status: data.provider_status || null,
    crypto_currency: data.crypto_currency,
    crypto_amount: data.crypto_amount || null,
    fiat_currency: data.fiat_currency || 'EUR',
    fiat_amount: data.fiat_amount || null,
    received_currency: data.received_currency || 'USDC',
    received_amount: data.received_amount || null,
    pcc_amount: data.pcc_amount || null,
    exchange_rate: data.exchange_rate || null,
    idempotency_key: data.idempotency_key,
    status: data.status || 'initiated',
    provider_fee: data.provider_fee || null,
    metadata: data.metadata || {},
  };

  const { data: order, error } = await supabase
    .from('crypto_orders')
    .insert(insertData)
    .select()
    .single();

  if (error) throw new Error(`createCryptoOrder: ${error.message}`);
  return order;
}

/**
 * Get a crypto order by its internal UUID
 */
async function getCryptoOrderById(id) {
  const { data: order, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return order;
}

/**
 * Get a crypto order by the provider's order ID
 */
async function getCryptoOrderByProviderOrderId(providerOrderId) {
  const { data: order, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('provider_order_id', providerOrderId)
    .single();

  if (error) return null;
  return order;
}

/**
 * Get a crypto order by idempotency key
 */
async function getCryptoOrderByIdempotencyKey(idempotencyKey) {
  const { data: order, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();

  if (error) return null;
  return order;
}

/**
 * Update a crypto order's status and optional fields
 */
async function updateCryptoOrder(id, updates) {
  const allowedFields = [
    'provider_status', 'crypto_amount', 'fiat_amount',
    'received_currency', 'received_amount', 'pcc_amount',
    'exchange_rate', 'transaction_id', 'status',
    'failure_reason', 'provider_fee', 'metadata',
    'completed_at', 'minted_at',
  ];

  const sanitized = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      sanitized[key] = updates[key];
    }
  }

  const { data: order, error } = await supabase
    .from('crypto_orders')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateCryptoOrder: ${error.message}`);
  return order;
}

/**
 * Update crypto order status by provider_order_id
 * Used by webhook handlers that only know the provider's ID
 */
async function updateCryptoOrderByProviderOrderId(providerOrderId, updates) {
  const existing = await getCryptoOrderByProviderOrderId(providerOrderId);
  if (!existing) throw new Error(`Crypto order not found for provider_order_id: ${providerOrderId}`);
  return updateCryptoOrder(existing.id, updates);
}

/**
 * Get all crypto orders for a specific user (newest first)
 */
async function getCryptoOrdersByUserId(userId, limit = 50) {
  const { data: orders, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('user_id', userId)
    .order('initiated_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getCryptoOrdersByUserId: ${error.message}`);
  return orders || [];
}

/**
 * Find orders that completed (EURC/USDC received) but were never minted
 * Used by the retry cron job
 */
async function getUnmintedCompletedOrders(maxAgeHours = 2) {
  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('status', 'completed')
    .is('transaction_id', null)
    .gte('initiated_at', cutoff)
    .order('initiated_at', { ascending: true });

  if (error) throw new Error(`getUnmintedCompletedOrders: ${error.message}`);
  return orders || [];
}

/**
 * Find expired initiated orders (older than 30 minutes, still 'initiated')
 * Used by cleanup cron job
 */
async function getExpiredInitiatedOrders(maxAgeMinutes = 30) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();

  const { data: orders, error } = await supabase
    .from('crypto_orders')
    .select('*')
    .eq('status', 'initiated')
    .lte('initiated_at', cutoff);

  if (error) throw new Error(`getExpiredInitiatedOrders: ${error.message}`);
  return orders || [];
}

/**
 * Check if an idempotency key already exists in the transactions table
 * Used to prevent double minting
 */
async function isIdempotencyKeyUsed(idempotencyKey) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .limit(1);

  if (error) return false;
  return data && data.length > 0;
}

module.exports = {
  createCryptoOrder,
  getCryptoOrderById,
  getCryptoOrderByProviderOrderId,
  getCryptoOrderByIdempotencyKey,
  updateCryptoOrder,
  updateCryptoOrderByProviderOrderId,
  getCryptoOrdersByUserId,
  getUnmintedCompletedOrders,
  getExpiredInitiatedOrders,
  isIdempotencyKeyUsed,
};
