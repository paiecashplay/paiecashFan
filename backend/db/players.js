// ═══════════════════════════════════════════════════════════════
// db/players.js - Player queries via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function getPlayersByTenant(tenantId, filters = {}) {
  let query = supabase
    .from('players')
    .select('*')
    .eq('tenant_id', tenantId);

  if (filters.position) query = query.eq('position', filters.position);
  if (filters.starOnly)  query = query.eq('is_star_player', true);
  query = query.order('shirt_number', { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`getPlayersByTenant: ${error.message}`);
  return data || [];
}

async function getPlayersByFederation(federationId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('federation_id', federationId)
    .order('shirt_number', { ascending: true });

  if (error) throw new Error(`getPlayersByFederation: ${error.message}`);
  return data || [];
}

async function getStarPlayer(tenantId) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_star_player', true)
    .maybeSingle();

  if (error) throw new Error(`getStarPlayer: ${error.message}`);
  return data || null;
}

module.exports = { getPlayersByTenant, getPlayersByFederation, getStarPlayer };
