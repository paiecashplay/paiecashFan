const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { deliverPCC } = require('../services/pccDelivery');
const verifyMoonpayWebhook = require('../middlewares/moonpayWebhook');
const db = require('../database');

// ─────────────────────────────────────────────────────
// HELPER: Generate MoonPay widget URL with signed params
// MoonPay requires URL signature for security
// ─────────────────────────────────────────────────────
function generateMoonPayUrl(params) {
  const baseUrl = process.env.MOONPAY_ENVIRONMENT === 'production'
    ? 'https://buy.moonpay.com'
    : 'https://buy-sandbox.moonpay.com';

  // Build query string
  const queryParams = {
    apiKey: process.env.MOONPAY_PUBLISHABLE_KEY,
    currencyCode: params.currencyCode || 'eurc_polygon',
    walletAddress: params.walletAddress,
    externalTransactionId: params.externalTransactionId,
    externalCustomerId: params.externalCustomerId,
    colorCode: '#0066FF',
    redirectURL: params.redirectURL || '',
    showWalletAddressForm: 'false',
  };

  // Pre-fill amount if provided
  if (params.quoteCurrencyAmount) {
    queryParams.quoteCurrencyAmount = params.quoteCurrencyAmount;
  }

  const queryString = new URLSearchParams(queryParams).toString();

  // Sign the URL with secret key (MoonPay requirement)
  const signature = crypto
    .createHmac('sha256', process.env.MOONPAY_SECRET_KEY)
    .update('?' + queryString)
    .digest('base64');

  return `${baseUrl}?${queryString}&signature=${encodeURIComponent(signature)}`;
}

// ─────────────────────────────────────────────────────
// ENDPOINT 1: GET /api/moonpay/config
// Frontend calls this before opening MoonPay widget
// Returns everything frontend needs to initialize widget
// Uses 'x-user-id' header for auth (existing pattern)
// ─────────────────────────────────────────────────────
router.get('/config', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { amount } = req.query; // Amount of PCC user wants to buy

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid PCC amount is required' });
    }

    // Fetch user from existing database
    const user = db.getUserById(userId);
    const wallet = db.getWalletByUserId(userId);

    if (!user || !wallet) {
      return res.status(404).json({ error: 'User or wallet not found' });
    }

    if (!wallet.walletAddress) {
      return res.status(400).json({ error: 'Wallet address not found for user' });
    }

    const treasuryAddress = process.env.TREASURY_WALLET_ADDRESS;
    if (!treasuryAddress) {
      return res.status(500).json({ error: 'Treasury wallet not configured' });
    }

    // Generate unique order ID for this payment session
    const externalTransactionId = uuidv4();

    // 1 PCC = 1 EURC mapping
    const pccAmount = parseFloat(amount);
    const eurcAmount = pccAmount;

    // Save order as INITIATED in DB
    // We store the user's wallet address here so we know where to mint the PCC later
    db.createMoonpayOrder({
      id: uuidv4(),
      userId: userId,
      userWalletAddress: wallet.walletAddress, // MINT TARGET
      externalTransactionId: externalTransactionId,
      status: 'INITIATED',
      eurcEquivalent: eurcAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate signed MoonPay widget URL
    // Settlement goes to TREASURY, user gets PCC from backend
    const testCurrency = process.env.MOONPAY_ENVIRONMENT === 'sandbox' ? 'eth' : 'eurc_polygon';

    const widgetUrl = generateMoonPayUrl({
      currencyCode: testCurrency,
      walletAddress: treasuryAddress, // SETTLEMENT TARGET
      quoteCurrencyAmount: eurcAmount,
      externalTransactionId: externalTransactionId,
      externalCustomerId: userId,
      redirectURL: (process.env.FRONTEND_URL || 'http://localhost:3000') + '/index.html'
    });

    // Return config to frontend
    res.json({
      publishableKey: process.env.MOONPAY_PUBLISHABLE_KEY,
      environment: process.env.MOONPAY_ENVIRONMENT,
      walletAddress: treasuryAddress, // Settlement address
      userWalletAddress: wallet.walletAddress, // Mint target
      externalTransactionId: externalTransactionId,
      widgetUrl: widgetUrl,
      currencyCode: testCurrency,
      quoteCurrencyAmount: eurcAmount,
      colorCode: '#0066FF'
    });

  } catch (error) {
    console.error('[MoonPay Config] Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// ─────────────────────────────────────────────────────
// ENDPOINT 2: POST /api/moonpay/webhook
// MoonPay server calls this when order status changes
// THIS IS WHERE PCC GETS MINTED - most critical endpoint
// No auth middleware - security via signature verification
// ─────────────────────────────────────────────────────
router.post(
  '/webhook',
  express.json(),
  verifyMoonpayWebhook,
  async (req, res) => {

    // ALWAYS respond 200 immediately
    // MoonPay will retry if it gets non-200
    res.status(200).json({ received: true });

    const webhookData = req.body;
    console.log('[MoonPay Webhook] Received:', JSON.stringify(webhookData));

    try {
      const {
        type,           // Event type: transaction_updated, transaction_created
        data            // Transaction data object
      } = webhookData;

      if (!data) {
        console.error('[MoonPay Webhook] No data in webhook body');
        return;
      }

      const {
        id: moonpayTransactionId,
        externalTransactionId,
        status,
        baseCurrencyCode,    // What user paid with (eurc, eth, btc, usdc)
        baseCurrencyAmount,  // How much user paid
        quoteCurrencyCode,   // eurc_polygon
        quoteCurrencyAmount, // EURC amount = PCC amount to mint
        walletAddress,
        networkFeeAmount,
        feeAmount
      } = data;

      // Find order using our externalTransactionId
      const order = db.getMoonpayOrderByExternalId(externalTransactionId);

      if (!order) {
        console.error(`[MoonPay Webhook] Order not found: ${externalTransactionId}`);
        return;
      }

      let updates = { updatedAt: new Date().toISOString() };

      // Update MoonPay transaction ID if not set
      if (!order.moonpayTransactionId) {
        updates.moonpayTransactionId = moonpayTransactionId;
        updates.cryptoCurrency = baseCurrencyCode;
        updates.cryptoAmount = baseCurrencyAmount;
        updates.moonpayFee = feeAmount || 0;
        updates.networkFee = networkFeeAmount || 0;
        updates.webhookRawData = webhookData;
      }

      // Handle order status
      if (status === 'completed') {

        // ── IDEMPOTENCY CHECK ──
        // Most critical check - never mint twice for same order
        if (order.status === 'COMPLETED') {
          console.warn(`[MoonPay Webhook] Already completed: ${externalTransactionId}`);
          return;
        }

        // Calculate PCC to mint
        // quoteCurrencyAmount is always in EURC (our settlement currency)
        // 1 PCC = 1 EURC so mint exactly quoteCurrencyAmount PCC
        const pccToMint = parseFloat(quoteCurrencyAmount);

        if (!pccToMint || pccToMint <= 0) {
          console.error(`[MoonPay Webhook] Invalid PCC amount: ${pccToMint}`);
          updates.status = 'DELIVERY_FAILED';
          db.updateMoonpayOrder(externalTransactionId, updates);
          return;
        }

        updates.eurcEquivalent = pccToMint;
        updates.status = 'PENDING';
        db.updateMoonpayOrder(externalTransactionId, updates);

        console.log(`[MoonPay Webhook] Minting ${pccToMint} PCC to ${order.userWalletAddress}`);

        // Mint PCC on Polygon
        try {
          const delivery = await deliverPCC(order.userWalletAddress, pccToMint);

          // Mark order as fully completed
          db.updateMoonpayOrder(externalTransactionId, {
            status: 'COMPLETED',
            pccAmountMinted: delivery.pccMinted,
            txHash: delivery.txHash,
            updatedAt: new Date().toISOString()
          });

          // Update user balance in local DB
          const currentWallet = db.getWalletByUserId(order.userId);
          if (currentWallet) {
            db.updateBalance(order.userId, currentWallet.balance + pccToMint);
          }

          console.log(`[MoonPay] SUCCESS: ${pccToMint} PCC → ${order.userWalletAddress} | Tx: ${delivery.txHash}`);
        } catch (mintError) {
          console.error('[MoonPay Webhook] Minting error:', mintError);
          db.updateMoonpayOrder(externalTransactionId, {
            status: 'DELIVERY_FAILED',
            updatedAt: new Date().toISOString()
          });
        }

      } else if (status === 'failed') {
        updates.status = 'FAILED';
        updates.webhookRawData = webhookData;
        db.updateMoonpayOrder(externalTransactionId, updates);
        console.log(`[MoonPay Webhook] Payment failed: ${externalTransactionId}`);

      } else if (status === 'refunded') {
        updates.status = 'REFUNDED';
        db.updateMoonpayOrder(externalTransactionId, updates);
        console.log(`[MoonPay Webhook] Payment refunded: ${externalTransactionId}`);

      } else {
        // waitingPayment, pending, processing etc.
        updates.status = 'PENDING';
        updates.webhookRawData = webhookData;
        db.updateMoonpayOrder(externalTransactionId, updates);
        console.log(`[MoonPay Webhook] Status update: ${status} for ${externalTransactionId}`);
      }

    } catch (error) {
      console.error('[MoonPay Webhook] Processing error:', error);
    }
  }
);

// ─────────────────────────────────────────────────────
// ENDPOINT 3: GET /api/moonpay/order/:externalTransactionId
// Frontend polls this to check order and PCC delivery status
// Uses 'x-user-id' header for auth (existing pattern)
// ─────────────────────────────────────────────────────
router.get('/order/:externalTransactionId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const order = db.getMoonpayOrderByExternalId(req.params.externalTransactionId);

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      externalTransactionId: order.externalTransactionId,
      status: order.status,
      cryptoCurrency: order.cryptoCurrency,
      cryptoAmount: order.cryptoAmount,
      pccMinted: order.pccAmountMinted,
      txHash: order.txHash,
      createdAt: order.createdAt
    });

  } catch (error) {
    console.error('[MoonPay Order Status] Error:', error);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

module.exports = router;
