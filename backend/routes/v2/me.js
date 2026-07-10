// ═══════════════════════════════════════════════════════════════
// routes/v2/me.js — Espace du fan connecté (BO fan)
// Toutes les routes exigent une session (requireAuth) et sont scopées
// à req.authUser (jamais un id fourni par le client).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const supabase = require('../../db/supabase');
const pcc = require('../../services/paiecashcoin');

const router = express.Router();
router.use(requireAuth);

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/me/orders — commandes du fan (hors panier), enrichies club.
router.get('/orders', async (req, res) => {
  try {
    const userId = req.authUser.id;
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, tenant_id, total_pcc, status, created_at, metadata')
      .eq('user_id', userId)
      .neq('status', 'cart')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const tenantIds = [...new Set((orders || []).map((o) => o.tenant_id).filter(Boolean))];
    const { data: tenants } = tenantIds.length
      ? await supabase.from('tenants').select('id, name, slug, logo_url').in('id', tenantIds)
      : { data: [] };
    const tMap = Object.fromEntries((tenants || []).map((t) => [t.id, t]));

    const safeParse = (s) => { try { return typeof s === 'string' ? JSON.parse(s) : (s || null); } catch { return null; } };

    const rows = (orders || []).map((o) => {
      const notes = safeParse(o.metadata?.notes);
      const items = o.metadata?.items || [];
      return {
        id: o.id,
        createdAt: o.created_at,
        status: o.status,
        clubName: tMap[o.tenant_id]?.name || '—',
        clubSlug: tMap[o.tenant_id]?.slug || null,
        clubLogo: tMap[o.tenant_id]?.logo_url || null,
        items,
        totalPcc: Number(o.total_pcc || 0),
        totalEur: Number(o.metadata?.total_eur || 0),
        kind: notes?.kind || (items.some((i) => i.offerId) ? 'ticketing' : 'product'),
        reference: notes?.pccReference || null,
      };
    });

    return ok(res, { orders: rows });
  } catch (err) {
    return fail(res, 'Orders fetch failed: ' + err.message, 500);
  }
});

// GET /api/v2/me/pcc — état du wallet PaieCashCoin du fan (solde, lié ?).
// Sans effet de bord (resolve + quote à 1€ pour lire le solde).
router.get('/pcc', async (req, res) => {
  if (!pcc.isConfigured()) return ok(res, { configured: false, walletReady: false, balance: null });
  try {
    const email = req.authUser.email;
    const resolved = await pcc.resolveUser(email).catch(() => null);
    let balance = null;
    if (resolved?.walletReady) {
      const q = await pcc.quote({ userEmail: email, amountEur: 1, preferredMode: 'pcc_full' }).catch(() => null);
      balance = q ? Number(q.currentPccBalance) || 0 : null;
    }
    return ok(res, { configured: true, walletReady: !!resolved?.walletReady, balance });
  } catch {
    return ok(res, { configured: true, walletReady: false, balance: null });
  }
});

// GET /api/v2/me/pcc-history — historique des paiements PCC du fan
// (via PaieCashCoin : resolve email → userId, puis /pay/history).
router.get('/pcc-history', async (req, res) => {
  if (!pcc.isConfigured()) return ok(res, { configured: false, transactions: [] });
  try {
    const email = req.authUser.email;
    const resolved = await pcc.resolveUser(email).catch(() => null);
    if (!resolved?.found || resolved.userId == null) {
      return ok(res, { configured: true, walletReady: false, transactions: [] });
    }
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const raw = await pcc.history({ userId: resolved.userId, limit }).catch(() => []);
    const transactions = (Array.isArray(raw) ? raw : []).map((t) => ({
      id: t.id,
      reference: t.reference,
      description: t.description,
      mode: t.mode,
      amountEur: Number(t.total_amount_eur || 0),
      pccUsed: Number(t.pcc_used || 0),
      status: t.status,
      merchantRef: t.merchant_ref || null,
      createdAt: t.created_at,
    }));
    return ok(res, { configured: true, walletReady: !!resolved.walletReady, transactions });
  } catch (err) {
    return fail(res, 'PCC history failed: ' + err.message, 500);
  }
});

module.exports = router;
