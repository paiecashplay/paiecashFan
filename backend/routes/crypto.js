// ═══════════════════════════════════════════════════════════════
// routes/crypto.js - /api/crypto/* endpoints
// Fan-facing crypto top-up API + webhook endpoints for providers
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

const gateway = require('../services/gateway');
const cryptoOrdersDb = require('../db/cryptoOrders');
const usersDb = require('../db/users');
const { SUPPORTED_CRYPTOS } = require('../services/gateway/gatewayConfig');

// ─── Middleware: Simple JWT auth check ─────────────────────
// Reuses the same pattern as existing routes
function requireAuth(req, res, next) {
  // Check for userId in headers (set by upstream auth middleware)
  // or in query params for simple demo auth
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }
  req.userId = userId;
  next();
}

// ═══════════════════════════════════════════════════════════════
// GET /api/crypto/options
// Returns available cryptos for the user's country
// ═══════════════════════════════════════════════════════════════

router.get('/options', requireAuth, async (req, res) => {
  try {
    const country = req.query.country || 'GLOBAL';

    // Get user's country from profile if not provided
    let userCountry = country;
    if (country === 'GLOBAL') {
      const user = await usersDb.getUserById(req.userId);
      if (user && user.country && user.country !== 'GLOBAL') {
        userCountry = user.country;
      }
    }

    const availableCryptos = gateway.getAvailableCryptos(userCountry);

    return res.json({
      success: true,
      data: {
        availableCryptos,
        primaryProvider: gateway.PRIMARY_PROVIDER,
        fallbackProvider: gateway.FALLBACK_PROVIDER,
        conversionNote: 'Crypto converts to EURC then to PCC automatically',
        available: availableCryptos.length > 0,
      },
      error: '',
    });
  } catch (err) {
    console.error('[Crypto] GET /options error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/crypto/initiate
// Start a crypto top-up - returns the widget URL for the fan
// ═══════════════════════════════════════════════════════════════

router.post('/initiate', requireAuth, async (req, res) => {
  try {
    const { cryptoCurrency, fiatAmount, fiatCurrency, tenantId } = req.body;

    // Validate crypto currency
    if (!cryptoCurrency || !SUPPORTED_CRYPTOS[cryptoCurrency.toUpperCase()]) {
      return res.status(400).json({
        success: false,
        error: `Unsupported cryptocurrency: ${cryptoCurrency}. Supported: ${Object.keys(SUPPORTED_CRYPTOS).join(', ')}`,
      });
    }

    // Validate fiat amount if provided
    if (fiatAmount !== undefined && fiatAmount !== null && fiatAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'fiatAmount must be greater than 0',
      });
    }

    // Load user for country
    const user = await usersDb.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const result = await gateway.initiateCryptoTopup({
      userId: req.userId,
      tenantId: tenantId || null,
      cryptoCurrency: cryptoCurrency.toUpperCase(),
      fiatAmount: fiatAmount || null,
      fiatCurrency: (fiatCurrency || 'EUR').toUpperCase(),
      userCountry: user.country || 'GLOBAL',
    });

    return res.json({
      success: true,
      data: result,
      error: '',
    });
  } catch (err) {
    console.error('[Crypto] POST /initiate error:', err.message);

    // Handle specific errors
    if (err.message === 'ERR_NO_PROVIDER_AVAILABLE') {
      return res.status(503).json({
        success: false,
        error: 'Crypto top-up is not available for this cryptocurrency in your country',
        data: { available: false, reason: 'not_supported_in_country' },
      });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/crypto/order/:orderId
// Poll order status (used by frontend after widget closes)
// ═══════════════════════════════════════════════════════════════

router.get('/order/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Load crypto order
    const order = await cryptoOrdersDb.getCryptoOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Ensure user can only see their own orders
    if (order.user_id !== req.userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // If order is still in progress, try to get live status from provider
    if (['initiated', 'pending', 'processing'].includes(order.status)) {
      try {
        const provider = gateway.providers[order.provider];
        if (provider) {
          const liveStatus = await provider.getOrderStatus(order.provider_order_id);
          // Only update if we got useful data back
          if (liveStatus.status && liveStatus.status !== 'unknown') {
            // Map provider status to our status if needed
            const statusMap = {
              COMPLETED: 'completed',
              FAILED: 'failed',
              EXPIRED: 'failed',
              PROCESSING: 'processing',
              PENDING: 'pending',
              completed: 'completed',
              failed: 'failed',
              pending: 'pending',
              waitingPayment: 'pending',
            };
            const mappedStatus = statusMap[liveStatus.status] || order.status;

            if (mappedStatus !== order.status) {
              await cryptoOrdersDb.updateCryptoOrder(order.id, {
                status: mappedStatus,
                crypto_amount: liveStatus.cryptoAmount || order.crypto_amount,
                fiat_amount: liveStatus.fiatAmount || order.fiat_amount,
                provider_fee: liveStatus.providerFee || order.provider_fee,
              });
              order.status = mappedStatus;
            }
          }
        }
      } catch (pollErr) {
        // Non-critical - just return what we have in DB
        console.warn(`[Crypto] Status poll error for ${orderId}:`, pollErr.message);
      }
    }

    return res.json({
      success: true,
      data: {
        id: order.id,
        status: order.status,
        provider: order.provider,
        cryptoCurrency: order.crypto_currency,
        cryptoAmount: order.crypto_amount,
        fiatAmount: order.fiat_amount,
        fiatCurrency: order.fiat_currency,
        pccAmount: order.pcc_amount,
        receivedAmount: order.received_amount,
        receivedCurrency: order.received_currency,
        providerFee: order.provider_fee,
        transactionId: order.transaction_id,
        initiatedAt: order.initiated_at,
        completedAt: order.completed_at,
        mintedAt: order.minted_at,
        failureReason: order.failure_reason,
      },
      error: '',
    });
  } catch (err) {
    console.error('[Crypto] GET /order/:orderId error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/crypto/history
// Returns all crypto orders for the authenticated user
// ═══════════════════════════════════════════════════════════════

router.get('/history', requireAuth, async (req, res) => {
  try {
    const orders = await cryptoOrdersDb.getCryptoOrdersByUserId(req.userId);

    const formatted = orders.map(order => ({
      id: order.id,
      provider: order.provider,
      cryptoCurrency: order.crypto_currency,
      cryptoAmount: order.crypto_amount,
      fiatAmount: order.fiat_amount,
      fiatCurrency: order.fiat_currency,
      pccAmount: order.pcc_amount,
      status: order.status,
      initiatedAt: order.initiated_at,
      completedAt: order.completed_at,
      mintedAt: order.minted_at,
    }));

    return res.json({
      success: true,
      data: formatted,
      error: '',
    });
  } catch (err) {
    console.error('[Crypto] GET /history error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/crypto/webhooks/transak
// Transak webhook endpoint - signature verified, no JWT auth
//
// CRITICAL: This route must use express.raw() body parser
//           (configured in server.js BEFORE express.json())
// ═══════════════════════════════════════════════════════════════

router.post('/webhooks/transak', async (req, res) => {
  try {
    // Get raw body and signature
    const rawBody = req.rawBody || req.body;
    const signature = req.headers['x-transak-signature']
      || req.headers['x-webhook-signature']
      || req.headers['signature']
      || '';

    // Parse payload (may already be parsed if rawBody capture middleware is used)
    let payload;
    if (typeof rawBody === 'string' || Buffer.isBuffer(rawBody)) {
      try {
        payload = JSON.parse(rawBody.toString('utf8'));
      } catch (e) {
        payload = req.body;
      }
    } else {
      payload = rawBody;
    }

    console.log(`[Transak Webhook] Received event: ${payload.eventID || 'unknown'}`);

    const result = await gateway.handleWebhook('transak', rawBody, signature, payload);

    // Always return 200 to Transak (even on internal errors)
    // Transak retries on non-200, idempotency key prevents double processing
    return res.status(200).json({ success: true, received: true });
  } catch (err) {
    if (err.message === 'INVALID_WEBHOOK_SIGNATURE') {
      console.error('[Transak Webhook] ❌ Signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.error('[Transak Webhook] Error:', err.message);
    // Still return 200 to prevent retry storms
    return res.status(200).json({ success: true, received: true });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/crypto/webhooks/moonpay
// MoonPay webhook endpoint - signature verified, no JWT auth
// ═══════════════════════════════════════════════════════════════

router.post('/webhooks/moonpay', async (req, res) => {
  try {
    const rawBody = req.rawBody || req.body;
    const signature = req.headers['moonpay-signature-v2'] || '';

    let payload;
    if (typeof rawBody === 'string' || Buffer.isBuffer(rawBody)) {
      try {
        payload = JSON.parse(rawBody.toString('utf8'));
      } catch (e) {
        payload = req.body;
      }
    } else {
      payload = rawBody;
    }

    console.log(`[MoonPay Webhook] Received event: ${payload.type || 'unknown'}`);

    const result = await gateway.handleWebhook('moonpay', rawBody, signature, payload);

    return res.status(200).json({ success: true, received: true });
  } catch (err) {
    if (err.message === 'INVALID_WEBHOOK_SIGNATURE') {
      console.error('[MoonPay Webhook] ❌ Signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.error('[MoonPay Webhook] Error:', err.message);
    return res.status(200).json({ success: true, received: true });
  }
});

module.exports = router;
