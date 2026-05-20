// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/wallet.js - Wallet Balance & Management
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../../../database');
const circle = require('../../../circleService');
const walletService = require('../../../services/wallet-service');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/mint/wallet/:userId
router.get('/:userId', async (req, res) => {
  try {
    const state = await walletService.getWalletState(req.params.userId);
    if (!state) return fail(res, 'Wallet not found', 404);
    return ok(res, state);
  } catch (err) {
    return fail(res, 'Wallet fetch failed: ' + err.message, 500);
  }
});

// GET /api/v2/mint/wallet/:userId/balance
router.get('/:userId/balance', async (req, res) => {
  try {
    const state = await walletService.getWalletState(req.params.userId);
    if (!state) return fail(res, 'Wallet not found', 404);
    return ok(res, {
      balance: state.balance,
      subBalances: state.subBalances,
      walletAddress: state.walletAddress,
      network: process.env.BLOCKCHAIN
    });
  } catch (err) {
    return fail(res, 'Balance fetch failed: ' + err.message, 500);
  }
});

// GET /api/v2/mint/wallet/:userId/analytics
router.get('/:userId/analytics', async (req, res) => {
  try {
    const txs = await db.getUserTransactions(req.params.userId);
    const wallet = await db.getWalletByUserId(req.params.userId);

    let totalMinted = 0, totalSpent = 0, totalSent = 0, totalReceived = 0;
    txs.forEach(tx => {
      const amt = parseFloat(tx.pcc_amount || tx.amount || 0);
      if (tx.type === 'mint' || tx.type === 'mint_crypto') totalMinted += amt;
      if (tx.type === 'spend') totalSpent += amt;
      if (tx.type === 'send') totalSent += amt;
      if (tx.type === 'receive') totalReceived += amt;
    });

    return ok(res, {
      balance: wallet?.balance || 0,
      totalMinted, totalSpent, totalSent, totalReceived,
      totalTransactions: txs.length,
      recentTransactions: txs.slice(0, 10)
    });
  } catch (err) {
    return fail(res, 'Analytics failed: ' + err.message, 500);
  }
});

// GET /api/v2/mint/wallet/:userId/transactions
router.get('/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const supabase = require('../../../db/supabase');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return res.json({ transactions: data || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
