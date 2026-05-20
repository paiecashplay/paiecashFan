// ═══════════════════════════════════════════════════════════════
// routes/v2/gaming/contests.js - Gaming contests & entries
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const sharedDb = require('../../../services/shared-db');
const db = require('../../../database');
const router = express.Router();

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/gaming/contests
router.get('/', async (req, res) => {
  try {
    const contests = await sharedDb.getContests(req.query);
    return ok(res, { contests });
  } catch (err) {
    return fail(res, 'Failed to fetch contests', 500);
  }
});

// GET /api/v2/gaming/contests/:id
router.get('/:id', async (req, res) => {
  try {
    const contest = await sharedDb.getContestById(req.params.id);
    if (!contest) return fail(res, 'Contest not found', 404);
    const entries = await sharedDb.getEntriesByContest(contest.id);
    return ok(res, { contest, entries, entryCount: entries.length });
  } catch (err) {
    return fail(res, 'Contest fetch failed', 500);
  }
});

// POST /api/v2/gaming/contests/:id/enter
router.post('/:id/enter', async (req, res) => {
  try {
    const { userId, selections } = req.body;
    if (!userId) return fail(res, 'Missing userId');

    const contest = await sharedDb.getContestById(req.params.id);
    if (!contest) return fail(res, 'Contest not found', 404);
    if (contest.status !== 'upcoming' && contest.status !== 'live') return fail(res, 'Contest not accepting entries');
    if (contest.max_entries > 0 && contest.current_entries >= contest.max_entries) return fail(res, 'Contest is full');

    // Deduct entry fee if applicable
    if (contest.entry_fee_pcc > 0) {
      const wallet = await db.getWalletByUserId(userId);
      if (!wallet || wallet.balance < contest.entry_fee_pcc) return fail(res, 'Insufficient balance for entry fee');
      await db.updateBalance(userId, wallet.balance - parseFloat(contest.entry_fee_pcc));
    }

    const entry = await sharedDb.createEntry({
      contest_id: contest.id, user_id: userId,
      entry_fee_paid: contest.entry_fee_pcc, selections: selections || {}
    });

    return ok(res, entry, 201);
  } catch (err) {
    return fail(res, 'Entry failed: ' + err.message, 500);
  }
});

// GET /api/v2/gaming/contests/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const entries = await sharedDb.getEntriesByUser(req.params.userId);
    return ok(res, { entries });
  } catch (err) {
    return fail(res, 'Failed to fetch entries', 500);
  }
});

// GET /api/v2/gaming/leaderboards
router.get('/leaderboards/:type', async (req, res) => {
  try {
    const board = await sharedDb.getLeaderboard(req.params.type, req.query);
    return ok(res, { leaderboard: board });
  } catch (err) {
    return fail(res, 'Leaderboard fetch failed', 500);
  }
});

module.exports = router;
