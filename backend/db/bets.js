// ═══════════════════════════════════════════════════════════════
// db/bets.js - DB operations for bets
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createBet(betData) {
  const { data, error } = await supabase
    .from('bets')
    .insert(betData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique violation
      if (error.message.includes('idx_bets_unique_market')) {
        throw new Error('ERR_ALREADY_BET');
      }
    }
    throw new Error(`createBet: ${error.message}`);
  }
  return data;
}

async function getBetById(betId) {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('id', betId)
    .single();

  if (error) return null;
  return data;
}

async function getBetsByUser(userId, status = null) {
  let query = supabase
    .from('bets')
    .select(`
      *,
      betting_games(home_team, away_team, kickoff_at, status),
      betting_markets(market_type, question)
    `)
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('placed_at', { ascending: false });
  if (error) throw new Error(`getBetsByUser: ${error.message}`);
  return data;
}

async function getPendingBetsByMarket(marketId) {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('market_id', marketId)
    .eq('status', 'pending');

  if (error) throw new Error(`getPendingBetsByMarket: ${error.message}`);
  return data;
}

async function updateBet(betId, updates) {
  const { data, error } = await supabase
    .from('bets')
    .update(updates)
    .eq('id', betId)
    .select()
    .single();

  if (error) throw new Error(`updateBet: ${error.message}`);
  return data;
}

async function getBetByUserAndMarket(userId, marketId) {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .eq('market_id', marketId)
    .in('status', ['pending', 'won', 'lost'])
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means zero rows returned, which is fine
    throw new Error(`getBetByUserAndMarket: ${error.message}`);
  }
  return data || null;
}

module.exports = {
  createBet,
  getBetById,
  getBetsByUser,
  getPendingBetsByMarket,
  updateBet,
  getBetByUserAndMarket
};
