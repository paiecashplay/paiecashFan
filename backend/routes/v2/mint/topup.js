// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/topup.js - Fiat & Crypto top-up routes
// Preserves ALL existing Stripe + Transak + Crypto flows
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../../../database');
const circle = require('../../../circleService');
const stripeService = require('../../../stripeService');
const rateConfig = require('../../../rateConfig');
const sharedDb = require('../../../services/shared-db');
const treasuryService = require('../../../services/treasury-service');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/mint/topup/stripe - Create Stripe checkout
router.post('/stripe', async (req, res) => {
  try {
    const { userId, pccAmount, currency } = req.body;
    if (!userId || !pccAmount) return fail(res, 'Missing fields');

    const coins = parseFloat(pccAmount);
    if (coins <= 0 || isNaN(coins)) return fail(res, 'Invalid PCC amount');

    const user = await db.getUserById(userId);
    if (!user) return fail(res, 'User not found', 404);

    const pricing = await rateConfig.calculatePrice(currency || 'eur', coins);
    if (pricing.fiatTotal < 0.50) return fail(res, 'Amount too small for Stripe');

    const session = await stripeService.createCheckoutSession(userId, coins, pricing.fiatTotal, currency || 'eur');

    // Log mint transaction as pending - webhook will update to 'complete' after payment
    await sharedDb.createMintTransaction({
      user_id: userId,
      payment_rail: 'stripe',
      source_currency: (currency || 'EUR').toUpperCase(),
      source_amount: pricing.fiatTotal,
      eurc_amount: coins,
      pcc_amount: coins,
      exchange_rate: pricing.pricePerPCC,
      stripe_session: session.id,
      status: 'pending',
      metadata: { pricing }
    });

    return ok(res, { url: session.url, pricing });
  } catch (err) {
    return fail(res, 'Checkout failed: ' + err.message, 500);
  }
});

// POST /api/v2/mint/topup/crypto - Get crypto deposit address
router.post('/crypto', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return fail(res, 'Missing userId');

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return fail(res, 'Wallet not found', 404);

    return ok(res, {
      depositAddress: wallet.walletAddress,
      assets: {
        EURC: process.env.EURC_CONTRACT_ADDRESS,
        USDC: process.env.USDC_CONTRACT_ADDRESS
      },
      network: process.env.BLOCKCHAIN || 'MATIC-AMOY',
      rate: '1 EURC = 1 PCC | USDC = Live FX Rate'
    });
  } catch (err) {
    return fail(res, 'Failed: ' + err.message, 500);
  }
});

// GET /api/v2/mint/topup/rates
router.get('/rates', async (req, res) => {
  try {
    const { currency, pccAmount } = req.query;
    if (currency && pccAmount) {
      const result = await rateConfig.calculatePrice(currency, parseFloat(pccAmount));
      return ok(res, result);
    }
    const tiers = await rateConfig.getAllTiers();
    return ok(res, { tiers, feeRate: rateConfig.FEE_RATE, conversionModel: 'Fiat → EURC → PCC (1:1)' });
  } catch (err) {
    return fail(res, 'Rates failed', 500);
  }
});

module.exports = router;
