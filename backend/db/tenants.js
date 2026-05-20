// ═══════════════════════════════════════════════════════════════
// db/tenants.js - Tenant (Club) CRUD operations via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createTenant(data) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({
      club_name: data.club_name,
      slug: data.slug,
      description: data.description || null,
      brand_color: data.brand_color || '#1B7E7E',
      logo_url: data.logo_url || null,
      country: data.country,
      sport: data.sport || 'football',
      website: data.website || null,
      admin_user_id: data.admin_user_id || null,
      treasury_wallet_id: data.treasury_wallet_id || null,
      treasury_address: data.treasury_address || null,
      exchange_rate: data.exchange_rate || 100,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw new Error(`createTenant: ${error.message}`);
  return tenant;
}

async function getTenantById(id) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return tenant;
}

async function getTenantBySlug(slug) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return tenant;
}

async function getAllTenants(filters = {}) {
  let query = supabase.from('tenants').select('*');

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.country) query = query.eq('country', filters.country);
  if (filters.sport) query = query.eq('sport', filters.sport);
  if (filters.search) {
    query = query.or(`club_name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);
  query = query.order('created_at', { ascending: false });

  const { data: tenants, error } = await query;
  if (error) throw new Error(`getAllTenants: ${error.message}`);
  return tenants;
}

async function updateTenant(id, updates) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateTenant: ${error.message}`);
  return tenant;
}

async function approveTenant(id, approvedBy) {
  return updateTenant(id, {
    status: 'active',
    approved_at: new Date().toISOString(),
    approved_by: approvedBy
  });
}

async function rejectTenant(id, reason) {
  return updateTenant(id, {
    status: 'rejected',
    rejection_reason: reason
  });
}

async function suspendTenant(id, reason) {
  return updateTenant(id, {
    status: 'suspended',
    rejection_reason: reason
  });
}

async function getTenantCount(filters = {}) {
  let query = supabase.from('tenants').select('*', { count: 'exact', head: true });
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.since) query = query.gte('created_at', filters.since);

  const { count, error } = await query;
  if (error) throw new Error(`getTenantCount: ${error.message}`);
  return count || 0;
}

module.exports = {
  createTenant,
  getTenantById,
  getTenantBySlug,
  getAllTenants,
  updateTenant,
  approveTenant,
  rejectTenant,
  suspendTenant,
  getTenantCount
};
