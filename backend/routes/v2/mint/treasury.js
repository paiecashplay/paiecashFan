// ═══════════════════════════════════════════════════════════════
// routes/v2/mint/treasury.js - Treasury visibility for users
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const treasuryService = require('../../../services/treasury-service');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/mint/treasury/summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await treasuryService.getTreasurySummary();
    return ok(res, summary);
  } catch (err) {
    return fail(res, 'Treasury data unavailable', 500);
  }
});

// GET /api/v2/mint/treasury/activity
router.get('/activity', async (req, res) => {
  try {
    const logs = await treasuryService.getTreasuryLogs(parseInt(req.query.limit) || 20);
    return ok(res, { logs });
  } catch (err) {
    return fail(res, 'Activity log unavailable', 500);
  }
});

module.exports = router;
