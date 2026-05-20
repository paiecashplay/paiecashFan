// ═══════════════════════════════════════════════════════════════
// routes/v2/gaming/sessions.js - Game session recording
// Records completed Aviator / Slots / Roulette plays with
// real PCC balance deduction and transaction logging.
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const sharedDb = require('../../../services/shared-db');
const db = require('../../../database');

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/gaming/sessions - record a completed game round
// Body: { userId, gameId, betAmount, result, payout, gameData }
router.post('/', async (req, res) => {
  try {
    const { userId, gameId, betAmount, result, payout, gameData } = req.body;
    if (!userId || !gameId || !betAmount || !result) {
      return fail(res, 'Missing required fields: userId, gameId, betAmount, result');
    }

    // 1. Get current wallet balance
    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) return fail(res, 'Wallet not found', 404);
    const balanceBefore = parseFloat(wallet.pcc_balance || wallet.balance || 0);

    // 2. Check sufficient balance for bet
    const bet = parseFloat(betAmount);
    if (balanceBefore < bet) {
      return fail(res, 'Insufficient PCC balance');
    }

    // 3. Calculate new balance
    let balanceAfter;
    const pay = parseFloat(payout || 0);
    if (result === 'win') {
      balanceAfter = +(balanceBefore - bet + pay).toFixed(2);
    } else {
      balanceAfter = +(balanceBefore - bet).toFixed(2);
    }

    // 4. Update wallet balance
    await db.updateBalance(userId, balanceAfter);

    // 5. Record transaction in transactions table
    await db.createTransaction({
      userId,
      type: result === 'win' ? 'mint' : 'spend',
      amount: result === 'win' ? pay - bet : bet,
      status: 'complete',
      metadata: { gameId, result, betAmount: bet, payout: pay, gameData }
    });

    // 6. Record game session
    const session = await sharedDb.createGameSession({
      userId, gameId, betAmount: bet,
      result, payout: pay,
      gameData: gameData || {}, balanceBefore, balanceAfter
    });

    return ok(res, {
      session,
      balanceBefore,
      balanceAfter,
      netPnl: +(balanceAfter - balanceBefore).toFixed(2)
    });
  } catch (err) {
    console.error('Game session error:', err);
    return fail(res, 'Game session failed: ' + err.message, 500);
  }
});

// GET /api/v2/gaming/sessions/:userId - user's game history
router.get('/:userId', async (req, res) => {
  try {
    const sessions = await sharedDb.getGameSessionsByUser(req.params.userId);
    return ok(res, { sessions });
  } catch (err) {
    return fail(res, 'Failed to fetch game history: ' + err.message, 500);
  }
});

module.exports = router;
