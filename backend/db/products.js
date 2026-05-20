// ═══════════════════════════════════════════════════════════════
// db/products.js - Product CRUD operations via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createProduct(data) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      tenant_id: data.tenant_id,
      name: data.name,
      description: data.description || null,
      pcc_price: data.pcc_price,
      eur_price: data.eur_price || null,
      image_url: data.image_url || null,
      category: data.category || 'merchandise',
      stock: data.stock !== undefined ? data.stock : -1,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw new Error(`createProduct: ${error.message}`);
  return product;
}

async function getProductById(id) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return product;
}

async function getProductsByTenant(tenantId, filters = {}) {
  let query = supabase.from('products').select('*').eq('tenant_id', tenantId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  query = query.order('created_at', { ascending: false });

  const { data: products, error } = await query;
  if (error) throw new Error(`getProductsByTenant: ${error.message}`);
  // Add price_pcc alias for frontend compatibility
  return (products || []).map(p => ({ ...p, price_pcc: p.pcc_price }));
}

async function updateProduct(id, updates) {
  const { data: product, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateProduct: ${error.message}`);
  return product;
}

async function incrementProductSold(id) {
  const product = await getProductById(id);
  if (!product) throw new Error('Product not found');

  const updates = { total_sold: product.total_sold + 1 };
  if (product.stock > 0 && product.stock <= product.total_sold + 1) {
    updates.status = 'sold_out';
  }

  return updateProduct(id, updates);
}

async function deleteProduct(id) {
  const { data: product, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`deleteProduct: ${error.message}`);
  return product;
}

module.exports = {
  createProduct,
  getProductById,
  getProductsByTenant,
  updateProduct,
  incrementProductSold,
  deleteProduct
};
