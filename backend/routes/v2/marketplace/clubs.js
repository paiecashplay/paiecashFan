// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/clubs.js - Club management & onboarding
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../../../database');
const sharedDb = require('../../../services/shared-db');
const router = express.Router();

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/marketplace/clubs - Browse all active clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await db.getAllTenants({ status: 'active', ...req.query });
    const enriched = await Promise.all(clubs.map(async c => {
      const profile = await sharedDb.getClubProfile(c.id);
      return { ...c, profile: profile || {} };
    }));
    return ok(res, { clubs: enriched });
  } catch (err) {
    return fail(res, 'Failed to fetch clubs', 500);
  }
});

// GET /api/v2/marketplace/clubs/:slugOrId
router.get('/:slugOrId', async (req, res) => {
  try {
    const p = req.params.slugOrId;
    let club = p.length === 36 ? await db.getTenantById(p) : await db.getTenantBySlug(p);
    if (!club) return fail(res, 'Club not found', 404);

    const profile = await sharedDb.getClubProfile(club.id);
    const products = await db.getProductsByTenant(club.id);
    return ok(res, { club, profile: profile || {}, products });
  } catch (err) {
    return fail(res, 'Club fetch failed', 500);
  }
});

// POST /api/v2/marketplace/clubs/apply - Club application
router.post('/apply', async (req, res) => {
  try {
    const { applicantName, applicantEmail, clubName, country, sport, website, description } = req.body;
    if (!applicantName || !applicantEmail || !clubName || !country) return fail(res, 'Missing required fields');

    const app = await sharedDb.createClubApplication({
      applicant_name: applicantName, applicant_email: applicantEmail,
      club_name: clubName, country, sport, website, description
    });
    return ok(res, app, 201);
  } catch (err) {
    return fail(res, 'Application failed: ' + err.message, 500);
  }
});

// GET /api/v2/marketplace/clubs/:tenantId/dashboard - Club admin dashboard
router.get('/:tenantId/dashboard', async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const club = await db.getTenantById(tenantId);
    if (!club) return fail(res, 'Club not found', 404);

    const products = await db.getProductsByTenant(tenantId);
    const txs = await db.getTransactionsByTenant(tenantId);
    const earnings = txs.reduce((sum, tx) => {
      if (tx.type === 'spend' && (tx.internal_status === 'complete' || tx.internal_status === 'success')) {
        return sum + parseFloat(tx.pcc_amount || 0);
      }
      return sum;
    }, 0);

    return ok(res, {
      club, products, earnings,
      totalSales: txs.length,
      recentSales: txs.slice(0, 20)
    });
  } catch (err) {
    return fail(res, 'Dashboard fetch failed', 500);
  }
});

module.exports = router;
