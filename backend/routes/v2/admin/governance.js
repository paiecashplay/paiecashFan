// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/governance.js - Super Admin governance APIs
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../../../database');
const sharedDb = require('../../../services/shared-db');
const treasuryService = require('../../../services/treasury-service');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// POST /api/v2/admin/governance/contests - create a new contest
router.post('/contests', async (req, res) => {
  try {
    const { title, description, game_id, entry_fee_pcc,
      prize_pool_pcc, max_entries, status } = req.body;
    if (!title || !game_id) {
      return res.status(400).json({ error: 'title and game_id are required' });
    }
    const supabase = require('../../../db/supabase');
    const { data, error } = await supabase
      .from('contests')
      .insert({
        title, description: description || '',
        game_id, contest_type: 'arcade',
        entry_fee_pcc: parseFloat(entry_fee_pcc) || 0,
        prize_pool_pcc: parseFloat(prize_pool_pcc) || 0,
        max_entries: parseInt(max_entries) || 0,
        current_entries: 0,
        status: status || 'upcoming'
      })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ contest: data });
  } catch (err) {
    console.error('Create contest error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/v2/admin/governance/contests - list all contests
router.get('/contests', async (req, res) => {
  try {
    const supabase = require('../../../db/supabase');
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: { contests: data || [] } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v2/admin/governance/contests/:id - update a contest
router.put('/contests/:id', async (req, res) => {
  try {
    const supabase = require('../../../db/supabase');
    const allowed = ['title', 'description', 'game_id', 'status',
      'entry_fee_pcc', 'prize_pool_pcc', 'max_entries',
      'starts_at', 'ends_at'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('contests')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data: { contest: data } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v2/admin/governance/contests/:id - delete a contest
router.delete('/contests/:id', async (req, res) => {
  try {
    const supabase = require('../../../db/supabase');
    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v2/admin/governance/contests/:id/status - quick status change
router.patch('/contests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['upcoming', 'live', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const supabase = require('../../../db/supabase');
    const { data, error } = await supabase
      .from('contests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    return res.json({ success: true, data: { contest: data } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v2/admin/overview
// Stats réelles calculées depuis Supabase (source de vérité du marketplace) +
// alertes / treasury legacy (tolérantes aux erreurs : un échec n'empêche pas
// le reste de s'afficher).
router.get('/overview', async (req, res) => {
  const supabase = require('../../../db/supabase');

  const countRows = async (table, build) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (build) q = build(q);
    const { count, error } = await q;
    return error ? null : count;
  };
  const safe = async (fn, fallback) => { try { return await fn(); } catch { return fallback; } };

  try {
    const [totalUsers, activeClubs, totalClubs, totalFederations, totalProducts] = await Promise.all([
      countRows('profiles'),
      countRows('tenants', (q) => q.eq('type', 'club').not('is_federation_hub', 'is', true).eq('status', 'active')),
      countRows('tenants', (q) => q.eq('type', 'club').not('is_federation_hub', 'is', true)),
      countRows('federations'),
      countRows('products'),
    ]);

    // Transactions = commandes hors panier ; volume = somme des total_pcc.
    let totalTransactions = 0, totalVolumePCC = 0;
    const { data: orders } = await supabase.from('orders').select('total_pcc, status').neq('status', 'cart');
    if (orders) {
      totalTransactions = orders.length;
      totalVolumePCC = orders.reduce((s, o) => s + Number(o.total_pcc || 0), 0);
    }

    const [treasury, pendingWithdrawals, pendingApps, fraudFlags] = await Promise.all([
      safe(() => treasuryService.getTreasurySummary(), null),
      safe(() => sharedDb.getAllWithdrawals({ status: 'pending' }), []),
      safe(() => sharedDb.getClubApplications({ status: 'submitted' }), []),
      safe(() => sharedDb.getFraudFlags({ status: 'open' }), []),
    ]);

    return ok(res, {
      totalUsers, activeClubs, totalClubs, totalFederations, totalProducts,
      totalTransactions, totalVolumePCC,
      treasury,
      pendingWithdrawals: pendingWithdrawals.length,
      pendingClubApplications: pendingApps.length,
      openFraudFlags: fraudFlags.length,
    });
  } catch (err) {
    return fail(res, 'Overview failed: ' + err.message, 500);
  }
});

// GET /api/v2/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return ok(res, { users });
  } catch (err) {
    return fail(res, 'Users fetch failed', 500);
  }
});

// GET /api/v2/admin/wallets
router.get('/wallets', async (req, res) => {
  try {
    const wallets = await db.getAllWallets();
    return ok(res, { wallets });
  } catch (err) {
    return fail(res, 'Wallets fetch failed', 500);
  }
});

// GET /api/v2/admin/transactions
router.get('/transactions', async (req, res) => {
  try {
    const txs = await db.getAllTransactions();
    return ok(res, { transactions: txs });
  } catch (err) {
    return fail(res, 'Transactions fetch failed', 500);
  }
});

// ─── Club Management ────────────────────────────────────────

// GET /api/v2/admin/clubs
router.get('/clubs', async (req, res) => {
  try {
    const supabase = require('../../../db/supabase');
    const { search = '', status = '', country = '' } = req.query;
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const from  = (page - 1) * limit;

    let query = supabase
      .from('tenants')
      .select('id, slug, name, short_code, country, city, logo_url, status, is_federation_hub, created_at', { count: 'exact' })
      .not('is_federation_hub', 'is', true); // les hubs de fédération sont gérés ailleurs

    if (status && status !== 'all') query = query.eq('status', status);
    if (country) query = query.eq('country', country);

    const q = String(search).trim().replace(/[,()]/g, ' ').trim();
    if (q) {
      const like = `%${q}%`;
      query = query.or(`name.ilike.${like},slug.ilike.${like},short_code.ilike.${like},city.ilike.${like},country.ilike.${like}`);
    }

    query = query.order('name', { ascending: true }).range(from, from + limit - 1);

    const { data: clubs, count, error } = await query;
    if (error) throw error;

    return ok(res, { clubs: clubs || [], total: count ?? 0, page, limit });
  } catch (err) {
    return fail(res, 'Clubs fetch failed: ' + err.message, 500);
  }
});

// POST /api/v2/admin/clubs/:id/approve
router.post('/clubs/:id/approve', async (req, res) => {
  try {
    const { adminId } = req.body;
    const club = await db.approveTenant(req.params.id, adminId);
    await sharedDb.createApprovalLog({
      admin_id: adminId, action: 'approve_club',
      entity_type: 'tenant', entity_id: club.id,
      new_state: { status: 'active' }
    });
    return ok(res, club);
  } catch (err) {
    return fail(res, 'Approval failed: ' + err.message, 500);
  }
});

// POST /api/v2/admin/clubs/:id/reject
router.post('/clubs/:id/reject', async (req, res) => {
  try {
    const { adminId, reason } = req.body;
    const club = await db.rejectTenant(req.params.id, reason);
    await sharedDb.createApprovalLog({
      admin_id: adminId, action: 'reject_club',
      entity_type: 'tenant', entity_id: club.id,
      new_state: { status: 'rejected', reason }
    });
    return ok(res, club);
  } catch (err) {
    return fail(res, 'Rejection failed: ' + err.message, 500);
  }
});

// ─── Withdrawals ────────────────────────────────────────────

// GET /api/v2/admin/withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const withdrawals = await sharedDb.getAllWithdrawals(req.query);
    return ok(res, { withdrawals });
  } catch (err) {
    return fail(res, 'Withdrawals fetch failed', 500);
  }
});

// POST /api/v2/admin/withdrawals/:id/approve
router.post('/withdrawals/:id/approve', async (req, res) => {
  try {
    const { adminId, notes } = req.body;
    const wr = await sharedDb.updateWithdrawalStatus(req.params.id, 'approved', {
      reviewed_by: adminId, admin_notes: notes
    });
    return ok(res, wr);
  } catch (err) {
    return fail(res, 'Approval failed', 500);
  }
});

// ─── Fraud ──────────────────────────────────────────────────

// GET /api/v2/admin/fraud
router.get('/fraud', async (req, res) => {
  try {
    const flags = await sharedDb.getFraudFlags(req.query);
    return ok(res, { flags });
  } catch (err) {
    return fail(res, 'Fraud flags fetch failed', 500);
  }
});

// ─── Treasury ───────────────────────────────────────────────

// GET /api/v2/admin/treasury
router.get('/treasury', async (req, res) => {
  try {
    const summary = await treasuryService.getTreasurySummary();
    const logs = await treasuryService.getTreasuryLogs(50);
    return ok(res, { ...summary, logs });
  } catch (err) {
    return fail(res, 'Treasury fetch failed', 500);
  }
});

// ─── Settings ───────────────────────────────────────────────

// GET /api/v2/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await sharedDb.getAllSettings();
    return ok(res, { settings });
  } catch (err) {
    return fail(res, 'Settings fetch failed', 500);
  }
});

// PUT /api/v2/admin/settings/:key
router.put('/settings/:key', async (req, res) => {
  try {
    const { value, adminId } = req.body;
    const setting = await sharedDb.updateSetting(req.params.key, value, adminId);
    return ok(res, setting);
  } catch (err) {
    return fail(res, 'Setting update failed', 500);
  }
});

// ─── Audit Logs ─────────────────────────────────────────────

// GET /api/v2/admin/audit
router.get('/audit', async (req, res) => {
  try {
    const logs = await sharedDb.getApprovalLogs(req.query);
    return ok(res, { logs });
  } catch (err) {
    return fail(res, 'Audit log fetch failed', 500);
  }
});

module.exports = router;
