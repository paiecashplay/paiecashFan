// ═══════════════════════════════════════════════════════════════
// db/bettingGames.js - DB operations for betting_games
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createBettingGame(gameData) {
  const { data, error } = await supabase
    .from('betting_games')
    .insert(gameData)
    .select()
    .single();

  if (error) throw new Error(`createBettingGame: ${error.message}`);
  return data;
}

async function getGamesByStatus(statuses) {
  const { data, error } = await supabase
    .from('betting_games')
    .select('*')
    .in('status', statuses)
    .order('kickoff_at', { ascending: true });

  if (error) throw new Error(`getGamesByStatus: ${error.message}`);
  return data;
}

async function getGamesByLeague(leagueId, statusOptions = []) {
  let query = supabase.from('betting_games').select('*').eq('league_id', leagueId);

  if (statusOptions.length > 0) {
    query = query.in('status', statusOptions);
  }

  const { data, error } = await query.order('kickoff_at', { ascending: true });
  if (error) throw new Error(`getGamesByLeague: ${error.message}`);
  return data;
}

async function getActiveGames(leagueId = null) {
  let query = supabase.from('betting_games').select('*').eq('is_active', true);
  if (leagueId) query = query.eq('league_id', leagueId);

  const { data, error } = await query.order('kickoff_at', { ascending: true });
  if (error) throw new Error(`getActiveGames: ${error.message}`);
  return data;
}

async function getGameById(id) {
  const { data, error } = await supabase
    .from('betting_games')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

async function updateGame(id, updates) {
  const { data, error } = await supabase
    .from('betting_games')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateGame: ${error.message}`);
  return data;
}

async function deleteGame(id) {
  const { error } = await supabase
    .from('betting_games')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`deleteGame: ${error.message}`);
  return true;
}

module.exports = {
  createBettingGame,
  getGamesByStatus,
  getGamesByLeague,
  getActiveGames,
  getGameById,
  updateGame,
  deleteGame
};
