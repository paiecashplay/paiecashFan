// ═══════════════════════════════════════════════════════════════
// db/leagueConfigs.js - DB operations for league_configs
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function getAllLeagueConfigs() {
  const { data, error } = await supabase
    .from('league_configs')
    .select('*')
    .order('league_name', { ascending: true });

  if (error) throw new Error(`getAllLeagueConfigs: ${error.message}`);
  return data;
}

async function getActiveLeagueConfigs() {
  const { data, error } = await supabase
    .from('league_configs')
    .select('*')
    .eq('is_active', true)
    .order('league_name', { ascending: true });

  if (error) throw new Error(`getActiveLeagueConfigs: ${error.message}`);
  return data;
}

async function getLeagueConfig(leagueId) {
  const { data, error } = await supabase
    .from('league_configs')
    .select('*')
    .eq('league_id', leagueId)
    .single();

  if (error) return null;
  return data;
}

async function updateLeagueConfig(leagueId, updates) {
  const { data, error } = await supabase
    .from('league_configs')
    .update(updates)
    .eq('league_id', leagueId)
    .select()
    .single();

  if (error) throw new Error(`updateLeagueConfig: ${error.message}`);
  return data;
}

module.exports = {
  getAllLeagueConfigs,
  getActiveLeagueConfigs,
  getLeagueConfig,
  updateLeagueConfig
};
