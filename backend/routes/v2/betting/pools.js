// ═══════════════════════════════════════════════════════════════
// routes/v2/betting/pools.js - Betting pools & bets
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const sharedDb = require('../../../services/shared-db');
const db = require('../../../database');
const router = express.Router();

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/betting/pools
router.get('/', async (req, res) => {
  try {
    const pools = await sharedDb.getPools(req.query);
    return ok(res, { pools });
  } catch (err) {
    return fail(res, 'Failed to fetch pools', 500);
  }
});

// GET /api/v2/betting/pools/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = await sharedDb.getPoolById(req.params.id);
    if (!pool) return fail(res, 'Pool not found', 404);
    const bets = await sharedDb.getBetsByPool(pool.id);
    return ok(res, { pool, bets, totalBets: bets.length });
  } catch (err) {
    return fail(res, 'Pool fetch failed', 500);
  }
});

// POST /api/v2/betting/pools/:id/bet
router.post('/:id/bet', async (req, res) => {
  try {
    const { userId, selectedOption, stakePcc } = req.body;
    if (!userId || !selectedOption || !stakePcc) return fail(res, 'Missing required fields');

    const stake = parseFloat(stakePcc);
    if (stake <= 0) return fail(res, 'Invalid stake amount');

    // Handle mock demo matches from frontend (IDs like 'm1', 'm2', etc.)
    const poolId = req.params.id;
    if (poolId.startsWith('m')) {
      const wallet = await db.getWalletByUserId(userId);
      if (!wallet || wallet.balance < stake) return fail(res, 'Insufficient balance');

      // Deduct stake for demo match
      await db.updateBalance(userId, wallet.balance - stake);

      return ok(res, {
        id: "mock-bet-" + Date.now(),
        user_id: userId,
        pool_id: poolId,
        selected_option: selectedOption,
        stake_pcc: stake,
        status: "pending"
      }, 201);
    }

    const pool = await sharedDb.getPoolById(req.params.id);
    if (!pool) return fail(res, 'Pool not found', 404);
    if (pool.status !== 'open') return fail(res, 'Pool is not accepting bets');

    // Check balance
    const wallet = await db.getWalletByUserId(userId);
    if (!wallet || wallet.balance < stake) return fail(res, 'Insufficient balance');

    // Deduct stake
    await db.updateBalance(userId, wallet.balance - stake);

    // Calculate simple odds
    const totalPool = parseFloat(pool.total_pool_pcc) + stake;
    const optionBets = (await sharedDb.getBetsByPool(pool.id))
      .filter(b => b.selected_option === selectedOption)
      .reduce((sum, b) => sum + parseFloat(b.stake_pcc), 0) + stake;
    const odds = totalPool / optionBets;

    const bet = await sharedDb.placeBet({
      pool_id: pool.id, user_id: userId,
      selected_option: selectedOption, stake_pcc: stake,
      potential_payout: stake * odds, odds_at_time: odds
    });

    return ok(res, bet, 201);
  } catch (err) {
    return fail(res, 'Bet placement failed: ' + err.message, 500);
  }
});

// GET /api/v2/betting/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const bets = await sharedDb.getBetsByUser(req.params.userId);
    return ok(res, { bets });
  } catch (err) {
    return fail(res, 'Failed to fetch bets', 500);
  }
});

module.exports = router;
