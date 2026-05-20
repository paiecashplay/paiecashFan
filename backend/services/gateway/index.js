// ═══════════════════════════════════════════════════════════════
// services/gateway/index.js - GatewayRouter
// Orchestrates provider selection, order creation, webhook
// handling, and crypto→PCC minting
// ═══════════════════════════════════════════════════════════════

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const TransakGateway = require('./transakGateway');
const MoonPayGateway = require('./moonpayGateway');
const {
  SUPPORTED_CRYPTOS,
  PROVIDER_CRYPTO_SUPPORT,
  PROVIDER_BLOCKED_COUNTRIES,
} = require('./gatewayConfig');

const cryptoOrdersDb = require('../../db/cryptoOrders');
const usersDb = require('../../db/users');
const walletsDb = require('../../db/wallets');
const tenantsDb = require('../../db/tenants');
const transactionsDb = require('../../db/transactions');
const notificationsDb = require('../../db/notifications');
const auditDb = require('../../db/audit');
const circle = require('../../circleService');
const rateConfig = require('../../rateConfig');

// ─── Provider Instances ────────────────────────────────────

const providers = {};

// Initialize Transak if configured
if (process.env.TRANSAK_API_KEY) {
  providers.transak = new TransakGateway({
    apiKey: process.env.TRANSAK_API_KEY,
    secret: process.env.TRANSAK_API_SECRET,
    webhookSecret: process.env.TRANSAK_WEBHOOK_SECRET || process.env.TRANSAK_API_SECRET,
    environment: process.env.TRANSAK_ENVIRONMENT || 'STAGING',
  });
  console.log('  ✅ Transak gateway initialized');
}

// Initialize MoonPay if configured
if (process.env.MOONPAY_PUBLISHABLE_KEY || process.env.MOONPAY_API_KEY) {
  providers.moonpay = new MoonPayGateway({
    apiKey: process.env.MOONPAY_PUBLISHABLE_KEY || process.env.MOONPAY_API_KEY,
    secret: process.env.MOONPAY_SECRET_KEY,
    webhookSecret: process.env.MOONPAY_WEBHOOK_SECRET,
    environment: process.env.MOONPAY_ENVIRONMENT || 'sandbox',
  });
  console.log('  ✅ MoonPay gateway initialized');
}

const PRIMARY_PROVIDER = process.env.CRYPTO_GATEWAY_PRIMARY || 'transak';
const FALLBACK_PROVIDER = process.env.CRYPTO_GATEWAY_FALLBACK || 'moonpay';
const TREASURY_ADDRESS = process.env.TREASURY_WALLET_ADDRESS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ═══════════════════════════════════════════════════════════════
// PROVIDER SELECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Select the best available provider for a given crypto + country
 *
 * Priority:
 *   1. Try primary provider
 *   2. Check crypto support
 *   3. Check country availability
 *   4. If primary fails → try fallback
 *   5. If both fail → throw ERR_NO_PROVIDER_AVAILABLE
 */
function selectProvider(cryptoCurrency, userCountry = 'GLOBAL') {
  const crypto = cryptoCurrency.toUpperCase();
  const country = (userCountry || 'GLOBAL').toUpperCase();

  // Try primary
  const primary = providers[PRIMARY_PROVIDER];
  if (primary) {
    const supported = PROVIDER_CRYPTO_SUPPORT[PRIMARY_PROVIDER] || [];
    const blocked = PROVIDER_BLOCKED_COUNTRIES[PRIMARY_PROVIDER] || [];

    if (supported.includes(crypto) && !blocked.includes(country)) {
      return primary;
    }
  }

  // Try fallback
  const fallback = providers[FALLBACK_PROVIDER];
  if (fallback) {
    const supported = PROVIDER_CRYPTO_SUPPORT[FALLBACK_PROVIDER] || [];
    const blocked = PROVIDER_BLOCKED_COUNTRIES[FALLBACK_PROVIDER] || [];

    if (supported.includes(crypto) && !blocked.includes(country)) {
      return fallback;
    }
  }

  // Try any other configured provider
  for (const [name, provider] of Object.entries(providers)) {
    if (name === PRIMARY_PROVIDER || name === FALLBACK_PROVIDER) continue;
    const supported = PROVIDER_CRYPTO_SUPPORT[name] || [];
    const blocked = PROVIDER_BLOCKED_COUNTRIES[name] || [];
    if (supported.includes(crypto) && !blocked.includes(country)) {
      return provider;
    }
  }

  throw new Error('ERR_NO_PROVIDER_AVAILABLE');
}

// ═══════════════════════════════════════════════════════════════
// AVAILABLE CRYPTOS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all available cryptos for a given country, across all providers
 */
function getAvailableCryptos(userCountry = 'GLOBAL') {
  const country = (userCountry || 'GLOBAL').toUpperCase();
  const result = [];

  for (const [symbol, meta] of Object.entries(SUPPORTED_CRYPTOS)) {
    const availableProviders = [];

    for (const [name, provider] of Object.entries(providers)) {
      const supported = PROVIDER_CRYPTO_SUPPORT[name] || [];
      const blocked = PROVIDER_BLOCKED_COUNTRIES[name] || [];

      if (supported.includes(symbol) && !blocked.includes(country)) {
        availableProviders.push(name);
      }
    }

    if (availableProviders.length > 0) {
      result.push({
        symbol: meta.symbol,
        name: meta.name,
        logo: meta.logo,
        network: meta.network,
        providers: availableProviders,
      });
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// INITIATE CRYPTO TOP-UP
// ═══════════════════════════════════════════════════════════════

/**
 * Start a crypto top-up flow for a fan
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.tenantId
 * @param {string} params.cryptoCurrency - e.g. 'ETH'
 * @param {number} params.fiatAmount     - EUR amount (optional)
 * @param {string} params.fiatCurrency   - default 'EUR'
 * @param {string} params.userCountry    - ISO country code
 *
 * @returns {Promise<{orderId, provider, widgetUrl, idempotencyKey, expiresAt}>}
 */
async function initiateCryptoTopup(params) {
  const {
    userId,
    tenantId,
    cryptoCurrency,
    fiatAmount,
    fiatCurrency = 'EUR',
    userCountry = 'GLOBAL',
  } = params;

  // 1. Select provider
  const provider = selectProvider(cryptoCurrency, userCountry);

  // 2. Generate idempotency key
  const idempotencyKey = `crypto_${userId}_${Date.now()}`;

  // 3. Load user for email pre-fill
  const user = await usersDb.getUserById(userId);
  if (!user) throw new Error('User not found');

  // 4. Create order via provider
  const redirectUrl = `${FRONTEND_URL}/crypto-success`;

  const orderResult = await provider.createOrder({
    userId,
    tenantId,
    cryptoCurrency: cryptoCurrency.toUpperCase(),
    fiatAmount,
    fiatCurrency,
    walletAddress: TREASURY_ADDRESS,
    email: user.email,
    idempotencyKey,
    redirectUrl,
    frontendUrl: FRONTEND_URL,
  });

  // 5. Save to crypto_orders table
  const dbOrder = await cryptoOrdersDb.createCryptoOrder({
    user_id: userId,
    tenant_id: tenantId || null,
    provider: provider.name,
    provider_order_id: orderResult.orderId,
    crypto_currency: cryptoCurrency.toUpperCase(),
    fiat_amount: fiatAmount || null,
    fiat_currency: fiatCurrency,
    idempotency_key: idempotencyKey,
    status: 'initiated',
    metadata: {
      widget_url: orderResult.widgetUrl,
      user_email: user.email,
      user_country: userCountry,
    },
  });

  console.log(`[CryptoGateway] Order initiated: ${dbOrder.id} via ${provider.name} for user ${userId}`);

  // 6. Return
  return {
    orderId: dbOrder.id,
    provider: provider.name,
    widgetUrl: orderResult.widgetUrl,
    idempotencyKey,
    expiresAt: orderResult.expiresAt,
    supportedCryptos: provider.getSupportedCryptos(),
  };
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLING
// ═══════════════════════════════════════════════════════════════

/**
 * Handle an incoming webhook from a crypto provider
 *
 * @param {string}        providerName - 'transak' | 'moonpay'
 * @param {Buffer|string} rawBody      - Raw request body
 * @param {string}        signature    - Signature from headers
 * @param {object}        payload      - Parsed JSON body
 */
async function handleWebhook(providerName, rawBody, signature, payload) {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }

  // 1. Verify signature
  const isValid = provider.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error(`[CryptoGateway] ❌ Invalid ${providerName} webhook signature`);
    throw new Error('INVALID_WEBHOOK_SIGNATURE');
  }

  // 2. Parse event
  const event = provider.parseWebhookEvent(payload);
  console.log(`[CryptoGateway] Webhook from ${providerName}: event=${event.rawEvent} status=${event.status} orderId=${event.orderId}`);

  // 3. Find the crypto order by partnerOrderId (idempotency key) or provider order ID
  let cryptoOrder = null;
  if (event.partnerOrderId) {
    cryptoOrder = await cryptoOrdersDb.getCryptoOrderByIdempotencyKey(event.partnerOrderId);
  }
  if (!cryptoOrder && event.orderId) {
    cryptoOrder = await cryptoOrdersDb.getCryptoOrderByProviderOrderId(event.orderId);
  }

  if (!cryptoOrder) {
    // First time seeing this order - try to find by provider_order_id = partnerOrderId
    // This happens when the widget creates the order before our DB record gets the provider ID
    console.warn(`[CryptoGateway] Order not found for event: orderId=${event.orderId}, partnerOrderId=${event.partnerOrderId}`);

    // Try updating the provider_order_id if we find by idempotency key
    if (event.partnerOrderId) {
      cryptoOrder = await cryptoOrdersDb.getCryptoOrderByIdempotencyKey(event.partnerOrderId);
      if (cryptoOrder && event.orderId) {
        await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, {
          provider_order_id: event.orderId,
        });
      }
    }

    if (!cryptoOrder) {
      console.error(`[CryptoGateway] ❌ Could not find crypto order for webhook event`);
      return { handled: false, reason: 'order_not_found' };
    }
  }

  // Update provider_order_id if it was our idempotency key
  if (event.orderId && cryptoOrder.provider_order_id !== event.orderId) {
    try {
      await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, {
        provider_order_id: event.orderId,
      });
    } catch (e) {
      // Non-critical - the unique constraint might prevent this
      console.warn(`[CryptoGateway] Could not update provider_order_id: ${e.message}`);
    }
  }

  // 4. Route based on status
  const updates = {
    provider_status: event.rawEvent,
    status: event.status,
  };

  // Always use ACTUAL amounts from the webhook (not what fan initially claimed)
  if (event.cryptoAmount) updates.crypto_amount = event.cryptoAmount;
  if (event.fiatAmount) updates.fiat_amount = event.fiatAmount;
  if (event.fiatCurrency) updates.fiat_currency = event.fiatCurrency;
  if (event.receivedAmount) updates.received_amount = event.receivedAmount;
  if (event.receivedCurrency) updates.received_currency = event.receivedCurrency;
  if (event.providerFee) updates.provider_fee = event.providerFee;

  // Status-specific handling
  switch (event.status) {
    case 'completed':
      updates.completed_at = new Date().toISOString();
      await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, updates);
      // Trigger minting
      console.log(`[CryptoGateway] ✅ Payment completed - initiating PCC mint for order ${cryptoOrder.id}`);
      try {
        await mintFromCrypto(cryptoOrder.id);
      } catch (mintErr) {
        console.error(`[CryptoGateway] ❌ Mint failed (will retry): ${mintErr.message}`);
        // Don't throw - return 200 to provider, retry job will pick it up
      }
      break;

    case 'failed':
      updates.failure_reason = event.rawEvent;
      await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, updates);
      // Notify fan
      await notificationsDb.createNotification({
        user_id: cryptoOrder.user_id,
        type: 'system',
        title: 'Crypto Payment Failed',
        message: `Your ${cryptoOrder.crypto_currency} payment could not be processed. No PCC was deducted.`,
        metadata: { crypto_order_id: cryptoOrder.id, provider: providerName },
      });
      break;

    case 'refunded':
      await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, updates);
      // Notify fan
      await notificationsDb.createNotification({
        user_id: cryptoOrder.user_id,
        type: 'system',
        title: 'Crypto Payment Refunded',
        message: `Your ${cryptoOrder.crypto_currency} payment has been refunded by ${providerName}.`,
        metadata: { crypto_order_id: cryptoOrder.id, provider: providerName },
      });
      break;

    default:
      // pending, processing, unknown - just update
      await cryptoOrdersDb.updateCryptoOrder(cryptoOrder.id, updates);
      break;
  }

  return { handled: true, status: event.status, orderId: cryptoOrder.id };
}

// ═══════════════════════════════════════════════════════════════
// MINT PCC FROM COMPLETED CRYPTO ORDER
// ═══════════════════════════════════════════════════════════════

/**
 * Mint PCC to the fan's wallet after crypto payment is confirmed
 *
 * @param {string} orderId - crypto_orders.id (our internal UUID)
 */
async function mintFromCrypto(orderId) {
  // 1. Load the crypto order
  const order = await cryptoOrdersDb.getCryptoOrderById(orderId);
  if (!order) throw new Error(`Crypto order not found: ${orderId}`);

  // 2. Guard: only mint from 'completed' status
  if (order.status === 'minted') {
    console.log(`[CryptoGateway] Order ${orderId} already minted - skipping`);
    return { alreadyMinted: true };
  }
  if (order.status !== 'completed') {
    throw new Error(`Cannot mint from status '${order.status}' - expected 'completed'`);
  }

  // 3. Idempotency check - prevent double mint
  const alreadyUsed = await cryptoOrdersDb.isIdempotencyKeyUsed(order.idempotency_key);
  if (alreadyUsed) {
    console.log(`[CryptoGateway] Idempotency key ${order.idempotency_key} already used - skipping mint`);
    return { alreadyMinted: true };
  }

  // 4. Load fan wallet
  const wallet = await walletsDb.getWalletByUserId(order.user_id);
  if (!wallet) throw new Error(`Wallet not found for user ${order.user_id}`);

  // 5. Calculate PCC amount based on the fiat value the fan paid
  let pccAmount = 0;

  if (order.fiat_amount && parseFloat(order.fiat_amount) > 0) {
    pccAmount = parseFloat(order.fiat_amount);
    const fiatCurrency = (order.fiat_currency || 'EUR').toUpperCase();

    // If the fiat currency isn't EUR, convert it using real-time rates
    if (fiatCurrency !== 'EUR') {
      pccAmount = await rateConfig.convertToEURC(fiatCurrency.toLowerCase(), pccAmount);
    }
  } else {
    // Fallback: Use received_amount if fiat_amount is somehow missing
    pccAmount = parseFloat(order.received_amount) || 0;

    // If received in USDC, convert USD to EUR (PCC)
    if (order.received_currency === 'USDC') {
      pccAmount = await rateConfig.convertToEURC('usd', pccAmount);
    } else if (order.received_currency !== 'EURC') {
      // If they sent raw ETH/BTC and we have no fiat amount, we'd need a live crypto/EUR price.
      // Since we don't have that in rateConfig easily, and fiat_amount should always exist
      // from MoonPay/Transak, this fallback will likely only hit if data is corrupted.
      console.warn(`[CryptoGateway] Warning: Missing fiat amount for ${order.received_currency} order`);
    }
  }

  // If tenant has a custom exchange rate, apply it
  if (order.tenant_id) {
    const tenant = await tenantsDb.getTenantById(order.tenant_id);
    if (tenant && tenant.exchange_rate) {
      // Keep 1:1 for now as per platform model (1 EURC = 1 PCC)
    }
  }

  pccAmount = Math.floor(pccAmount * 100) / 100; // Round to 2 decimals
  if (pccAmount <= 0) throw new Error(`Calculated PCC amount is zero or negative (fiat: ${order.fiat_amount} ${order.fiat_currency})`);

  console.log(`[CryptoGateway] Minting ${pccAmount} PCC to ${wallet.walletAddress} for order ${orderId}`);

  // 6. Create transaction record
  const txRecord = await transactionsDb.createTransaction({
    userId: order.user_id,
    tenant_id: order.tenant_id,
    type: 'mint',
    payment_rail: 'crypto',
    source_currency: order.fiat_currency || 'EUR',
    source_amount: order.fiat_amount,
    amount: pccAmount,
    status: 'pending',
    idempotency_key: order.idempotency_key,
    metadata: {
      crypto_order_id: order.id,
      provider: order.provider,
      crypto_currency: order.crypto_currency,
      crypto_amount: order.crypto_amount,
      received_amount: order.received_amount,
      received_currency: order.received_currency,
    },
  });

  // 7. Mint PCC via Circle
  let circleTxId;
  try {
    circleTxId = await circle.mintPCC(wallet.walletAddress, pccAmount);
    console.log(`[CryptoGateway] Circle mint initiated: ${circleTxId}`);
  } catch (mintErr) {
    // Update transaction as failed
    await transactionsDb.updateTransactionStatus(txRecord.id, 'failed');
    throw new Error(`Circle mint failed: ${mintErr.message}`);
  }

  // 8. Update crypto_order with transaction link and PCC amount
  await cryptoOrdersDb.updateCryptoOrder(orderId, {
    transaction_id: txRecord.id,
    pcc_amount: pccAmount,
    exchange_rate: 1.0,
    status: 'minted',
    minted_at: new Date().toISOString(),
  });

  // 9. Poll for on-chain confirmation in background
  circle.waitForTx(circleTxId).then(async (txData) => {
    await transactionsDb.updateTransactionStatus(txRecord.id, 'complete', txData.txHash);
    console.log(`[CryptoGateway] ✅ PCC minted successfully: ${pccAmount} PCC → ${wallet.walletAddress} (tx: ${txData.txHash})`);

    // Optimistically update the database balance so the frontend gets it immediately before Circle indexer updates
    try {
      const newBalance = wallet.balance + pccAmount;
      await walletsDb.updateBalance(order.user_id, newBalance);
      console.log(`[CryptoGateway] Optimistic balance updated: ${newBalance} PCC`);
    } catch (balErr) {
      console.error('[CryptoGateway] Failed to optimistically update balance:', balErr.message);
    }

    // Notify fan
    await notificationsDb.createNotification({
      user_id: order.user_id,
      type: 'system',
      title: 'PCC Credited! 🎉',
      message: `${pccAmount} PCC has been added to your wallet from your ${order.crypto_currency} payment.`,
      metadata: {
        crypto_order_id: order.id,
        pcc_amount: pccAmount,
        tx_hash: txData.txHash,
      },
    });

    // Audit log
    await auditDb.createAuditLog({
      user_id: order.user_id,
      action: 'crypto_mint_success',
      entity_type: 'crypto_order',
      entity_id: order.id,
      metadata: {
        provider: order.provider,
        crypto: order.crypto_currency,
        pcc_minted: pccAmount,
        tx_hash: txData.txHash,
      },
    });
  }).catch(async (err) => {
    await transactionsDb.updateTransactionStatus(txRecord.id, 'failed');
    // Revert crypto_order status so retry job can pick it up
    await cryptoOrdersDb.updateCryptoOrder(orderId, {
      status: 'completed',
      transaction_id: null,
      failure_reason: `Chain confirmation failed: ${err.message}`,
    });
    console.error(`[CryptoGateway] ❌ PCC mint confirmation failed for order ${orderId}:`, err.message);
  });

  return {
    orderId,
    pccAmount,
    transactionId: txRecord.id,
    circleTxId,
  };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Provider management
  providers,
  selectProvider,
  getAvailableCryptos,

  // Core flows
  initiateCryptoTopup,
  handleWebhook,
  mintFromCrypto,

  // Config
  PRIMARY_PROVIDER,
  FALLBACK_PROVIDER,
  TREASURY_ADDRESS,
};
