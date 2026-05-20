// ═══════════════════════════════════════════════════════════════
// db/users.js - User CRUD operations via Supabase
// ═══════════════════════════════════════════════════════════════

const { v4: uuidv4 } = require('uuid');
const supabase = require('./supabase');

async function createUser(data) {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: data.id || uuidv4(),
      full_name: data.full_name || data.name,
      email: data.email,
      country: data.country || 'GLOBAL',
      role: data.role || 'fan',
      tenant_id: data.tenant_id || null,
      is_active: true
    })
    .select()
    .single();

  if (error) throw new Error(`createUser: ${error.message}`);
  // Backward compat: add 'name' alias
  user.name = user.full_name;
  return user;
}

async function getUserById(id) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  user.name = user.full_name;
  return user;
}

async function getUserByEmail(email) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  user.name = user.full_name;
  return user;
}

async function getAllUsers() {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getAllUsers: ${error.message}`);
  return users.map(u => ({ ...u, name: u.full_name }));
}

async function updateUser(id, updates) {
  const { data: user, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateUser: ${error.message}`);
  user.name = user.full_name;
  return user;
}

async function updateLastLogin(id) {
  return updateUser(id, { last_login_at: new Date().toISOString() });
}

async function getUsersByTenant(tenantId) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getUsersByTenant: ${error.message}`);
  return users.map(u => ({ ...u, name: u.full_name }));
}

async function getUserCount(filters = {}) {
  let query = supabase.from('users').select('*', { count: 'exact', head: true });
  if (filters.role) query = query.eq('role', filters.role);
  if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id);
  if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
  if (filters.since) query = query.gte('created_at', filters.since);

  const { count, error } = await query;
  if (error) throw new Error(`getUserCount: ${error.message}`);
  return count || 0;
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  updateLastLogin,
  getUsersByTenant,
  getUserCount
};
