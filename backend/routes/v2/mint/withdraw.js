// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/withdraw.js - User withdrawal requests
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../../../database');
const sharedDb = require('../../../services/shared-db');
const rateConfig = require('../../../rateConfig');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/mint/withdraw
router.post('/', async (req, res) => {
  try {
    const { userId, amount, method, accountRef } = req.body;
    if (!userId || !amount || !method || !accountRef) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const numAmount = parseFloat(amount);
    if (numAmount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal is 10 PCC' });
    }

    const db = require('../../../database');
    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const currentBalance = parseFloat(wallet.pcc_balance || wallet.balance || 0);
    if (currentBalance < numAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct balance immediately (lock funds)
    const fee = +(numAmount * 0.025).toFixed(2);
    const newBalance = +(currentBalance - numAmount).toFixed(2);
    await db.updateBalance(userId, newBalance);

    // Record in transactions table
    const supabase = require('../../../db/supabase');
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'spend',
      payment_rail: method === 'crypto' ? 'crypto' :
        method === 'mobile' ? 'mobile_money' : 'internal',
      pcc_amount: numAmount,
      internal_status: 'complete',
      metadata: {
        withdrawal: true,
        method,
        accountRef,
        fee,
        netAmount: numAmount - fee,
        requestedAt: new Date().toISOString()
      }
    });

    // Record in cashouts table if it exists
    await supabase.from('cashouts').insert({
      user_id: userId,
      amount_pcc: numAmount,
      fee_pcc: fee,
      net_amount_pcc: numAmount - fee,
      method,
      account_ref: accountRef,
      status: 'complete'
    }).catch(() => { }); // non-fatal if cashouts table schema differs

    return res.json({
      success: true,
      message: 'Withdrawal request submitted',
      amountPCC: numAmount,
      feePCC: fee,
      netPCC: numAmount - fee,
      newBalance
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/v2/mint/withdraw/:userId
router.get('/:userId', async (req, res) => {
  try {
    const withdrawals = await sharedDb.getWithdrawalsByUser(req.params.userId);
    return ok(res, { withdrawals });
  } catch (err) {
    return fail(res, 'Failed to fetch withdrawals', 500);
  }
});

module.exports = router;
