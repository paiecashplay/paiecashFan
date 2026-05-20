// ═══════════════════════════════════════════════════════════════
// db/bettingMarkets.js - DB operations for betting_markets
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createMarket(marketData) {
  const { data, error } = await supabase
    .from('betting_markets')
    .insert(marketData)
    .select()
    .single();

  if (error) throw new Error(`createMarket: ${error.message}`);
  return data;
}

async function getMarketsByGame(gameId) {
  const { data, error } = await supabase
    .from('betting_markets')
    .select('*')
    .eq('game_id', gameId)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getMarketsByGame: ${error.message}`);
  return data;
}

async function getMarketById(marketId) {
  const { data, error } = await supabase
    .from('betting_markets')
    .select('*')
    .eq('id', marketId)
    .single();

  if (error) return null;
  return data;
}

async function updateMarket(marketId, updates) {
  const { data, error } = await supabase
    .from('betting_markets')
    .update(updates)
    .eq('id', marketId)
    .select()
    .single();

  if (error) throw new Error(`updateMarket: ${error.message}`);
  return data;
}

async function getPendingSettlementMarkets() {
  // Markets that belong to finished games but are not yet settled
  const { data, error } = await supabase
    .from('betting_markets')
    .select(`
      *,
      betting_games!inner(id, status, home_team, away_team, kickoff_at)
    `)
    .eq('status', 'locked')
    .in('betting_games.status', ['finished']);

  if (error) throw new Error(`getPendingSettlementMarkets: ${error.message}`);
  return data;
}

module.exports = {
  createMarket,
  getMarketsByGame,
  getMarketById,
  updateMarket,
  getPendingSettlementMarkets
};
