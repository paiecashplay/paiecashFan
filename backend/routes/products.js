const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

const router = express.Router();

function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data, error: '' });
}

function error(res, message, status = 400) {
  return res.status(status).json({ success: false, data: null, error: message });
}

// GET /api/products?tenantId=...
router.get('/', async (req, res) => {
  try {
    const { tenantId } = req.query;
    if (!tenantId) return error(res, 'Missing tenantId parameter');
    
    const products = await db.getProductsByTenant(tenantId);
    return success(res, { products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return error(res, 'Failed to fetch products', 500);
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { tenantId, name, pricePcc, imageUrl, description } = req.body;
    if (!tenantId || !name || !pricePcc) {
      return error(res, 'Missing required fields: tenantId, name, pricePcc');
    }

    const product = await db.createProduct({
      tenant_id: tenantId,
      name,
      description: description || null,
      pcc_price: pricePcc,
      price_fiat: 0,
      image_url: imageUrl || 'https://via.placeholder.com/150',
      is_active: true
    });

    return success(res, { product }, 201);
  } catch (err) {
    console.error('Error creating product:', err);
    return error(res, 'Failed to create product', 500);
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For simplicity, we just delete or mark inactive. We will use updateProduct to mark inactive or hard delete if possible.
    // db/products.js has deleteProduct if implemented, otherwise we will add it.
    await db.deleteProduct(id);
    return success(res, { message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    return error(res, 'Failed to delete product', 500);
  }
});

module.exports = router;
