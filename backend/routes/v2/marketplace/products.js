// ═══════════════════════════════════════════════════════════════
// routes/v2/marketplace/products.js - Product listing & shop
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../../../database');
const sharedDb = require('../../../services/shared-db');
const router = express.Router();

const ok = (res, data) => res.status(200).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// GET /api/v2/marketplace/products - All products (with filters)
router.get('/', async (req, res) => {
  try {
    const { tenantId, category, search, limit } = req.query;
    // Use existing product DB function
    let products;
    if (tenantId) {
      products = await db.getProductsByTenant(tenantId);
    } else {
      // Get all active products across clubs
      const allTenants = await db.getAllTenants({ status: 'active' });
      products = [];
      for (const t of allTenants.slice(0, 20)) {
        const tp = await db.getProductsByTenant(t.id);
        products.push(...tp.map(p => ({ ...p, clubName: t.club_name, clubSlug: t.slug })));
      }
    }
    if (category) products = products.filter(p => p.category === category);
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return ok(res, { products: products.slice(0, parseInt(limit) || 50) });
  } catch (err) {
    return fail(res, 'Products fetch failed', 500);
  }
});

// GET /api/v2/marketplace/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) return fail(res, 'Product not found', 404);
    const club = await db.getTenantById(product.tenant_id);
    return ok(res, { product, club });
  } catch (err) {
    return fail(res, 'Product fetch failed', 500);
  }
});

// GET /api/v2/marketplace/products/categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await sharedDb.getProductCategories();
    return ok(res, { categories });
  } catch (err) {
    return fail(res, 'Categories fetch failed', 500);
  }
});

module.exports = router;
