// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/platform.js — Produits « plateforme » (super_admin)
// Produits globaux (ex. lunettes Aivora) affichés dans toutes les boutiques,
// possédés par le tenant caché « PaieCash Store », + vue des reversements
// (commissions 10% reversées aux clubs à chaque vente).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const commissionsDb = require('../../../db/commissions');
const { requireAuth, requireRole } = require('../../../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('super_admin'));

const ok   = (res, data, s = 200) => res.status(s).json({ success: true,  data,  error: '' });
const fail = (res, msg,  s = 400) => res.status(s).json({ success: false, data: null, error: msg });

const STORE_SLUG = 'paiecash-store';

// Le tenant marchand « PaieCash Store » (créé par la migration platform-products.sql).
async function getStore() {
  const { data } = await supabase
    .from('tenants').select('id, slug, name, logo_url').eq('slug', STORE_SLUG).maybeSingle();
  return data || null;
}

// GET /api/v2/admin/platform/store → le compte marchand plateforme.
router.get('/store', async (req, res) => {
  try {
    const store = await getStore();
    if (!store) return fail(res, 'Compte « PaieCash Store » introuvable. Applique la migration platform-products.sql.', 404);
    return ok(res, { store });
  } catch (err) { return fail(res, err.message, 500); }
});

// GET /api/v2/admin/platform/products → produits globaux.
router.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products').select('*').eq('is_global', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return ok(res, { products: data || [] });
  } catch (err) { return fail(res, err.message, 500); }
});

// POST /api/v2/admin/platform/products → créer un produit plateforme.
router.post('/products', async (req, res) => {
  try {
    const store = await getStore();
    if (!store) return fail(res, 'Compte « PaieCash Store » introuvable (migration manquante).', 404);

    const { name, description, eur_price, pcc_price, images, sizes, display_order, status = 'active', stock, commissionPct } = req.body;
    if (!name) return fail(res, 'Le nom est requis.');
    const pcc = Number(pcc_price);
    if (!pcc || pcc <= 0) return fail(res, 'Le prix PCC est requis et doit être supérieur à 0.');

    const imagesArr = Array.isArray(images) ? images.filter(Boolean) : [];
    const pct = commissionPct != null ? Math.min(100, Math.max(0, Number(commissionPct))) : 10;

    const { data, error } = await supabase.from('products').insert({
      tenant_id:     store.id,
      name,
      description:   description || null,
      eur_price:     eur_price != null ? Number(eur_price) : null,
      pcc_price:     pcc,
      image_url:     imagesArr[0] || null,
      images:        imagesArr.length ? imagesArr : null,
      sizes:         sizes || null,
      category_slug: 'partenaire',
      display_order: display_order != null ? Number(display_order) : 0,
      stock:         stock != null ? Number(stock) : -1,
      status,
      is_global:     true,
      metadata:      { commissionPct: pct, platformOwned: true },
    }).select().single();
    if (error) throw error;
    return ok(res, { product: data }, 201);
  } catch (err) { return fail(res, err.message, 500); }
});

// PUT /api/v2/admin/platform/products/:id → éditer un produit plateforme.
router.put('/products/:id', async (req, res) => {
  try {
    const allowed = ['name', 'description', 'eur_price', 'pcc_price', 'images', 'sizes', 'display_order', 'status', 'stock', 'is_global'];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    if (updates.images) {
      const arr = Array.isArray(updates.images) ? updates.images.filter(Boolean) : [];
      updates.images = arr.length ? arr : null;
      updates.image_url = arr[0] || null;
    }
    // Taux de commission → metadata (fusion pour ne pas écraser le reste).
    if (req.body.commissionPct !== undefined) {
      const { data: cur } = await supabase.from('products').select('metadata').eq('id', req.params.id).maybeSingle();
      const pct = Math.min(100, Math.max(0, Number(req.body.commissionPct) || 0));
      updates.metadata = { ...(cur?.metadata || {}), commissionPct: pct, platformOwned: true };
    }
    const { data, error } = await supabase
      .from('products').update(updates).eq('id', req.params.id).eq('is_global', true).select().single();
    if (error) throw error;
    return ok(res, { product: data });
  } catch (err) { return fail(res, err.message, 500); }
});

// DELETE /api/v2/admin/platform/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id).eq('is_global', true);
    if (error) throw error;
    return ok(res, { deleted: true });
  } catch (err) { return fail(res, err.message, 500); }
});

// GET /api/v2/admin/platform/commissions → vue « Reversements » (à qui / combien).
router.get('/commissions', async (req, res) => {
  try {
    const [summary, recent, totals] = await Promise.all([
      commissionsDb.summaryByClub(),
      commissionsDb.listCommissions({ limit: 200 }),
      commissionsDb.totals(),
    ]);
    return ok(res, { summary, recent, totals });
  } catch (err) { return fail(res, err.message, 500); }
});

module.exports = router;
