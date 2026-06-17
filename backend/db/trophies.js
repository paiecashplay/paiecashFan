// ═══════════════════════════════════════════════════════════════
// db/trophies.js - Trophy queries via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function getTrophiesByTenant(tenantId) {
  const { data, error } = await supabase
    .from('trophies')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('count', { ascending: false });

  if (error) throw new Error(`getTrophiesByTenant: ${error.message}`);
  return data || [];
}

async function getTrophiesByFederation(federationId) {
  const { data, error } = await supabase
    .from('trophies')
    .select('*')
    .eq('federation_id', federationId)
    .order('count', { ascending: false });

  if (error) throw new Error(`getTrophiesByFederation: ${error.message}`);
  return data || [];
}

module.exports = { getTrophiesByTenant, getTrophiesByFederation };
