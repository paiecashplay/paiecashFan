// ═══════════════════════════════════════════════════════════════
// db/loto.js - Supabase data access layer for LOTO game
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// ─── ROOMS ───────────────────────────────────────────────────

async function createRoom({ roomCode, hostUserId, gameMode, winPattern, maxPlayers, drawIntervalSeconds, drawPool }) {
  const { data, error } = await supabase
    .from('loto_rooms')
    .insert({
      room_code: roomCode,
      host_user_id: hostUserId,
      game_mode: gameMode || 'multiplayer',
      win_pattern: winPattern || 'line',
      max_players: maxPlayers || 8,
      draw_interval_seconds: drawIntervalSeconds || 5,
      draw_pool: drawPool || [],
      status: 'waiting'
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getRoomByCode(code) {
  const { data, error } = await supabase
    .from('loto_rooms')
    .select('*')
    .eq('room_code', code.toUpperCase())
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

async function getRoomById(id) {
  const { data, error } = await supabase
    .from('loto_rooms')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

async function updateRoom(id, updates) {
  const { data, error } = await supabase
    .from('loto_rooms')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── PLAYERS ─────────────────────────────────────────────────

async function addPlayer({ roomId, userId, username, cardNumbers }) {
  const { data, error } = await supabase
    .from('loto_players')
    .insert({
      room_id: roomId,
      user_id: userId,
      username: username || 'Player',
      card_numbers: cardNumbers,
      marked_numbers: [0] // FREE space is pre-marked (represented as 0)
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getPlayersByRoom(roomId) {
  const { data, error } = await supabase
    .from('loto_players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

async function getPlayerInRoom(roomId, userId) {
  const { data, error } = await supabase
    .from('loto_players')
    .select('*')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data || null;
}

async function updatePlayer(id, updates) {
  const { data, error } = await supabase
    .from('loto_players')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function removePlayer(roomId, userId) {
  const { error } = await supabase
    .from('loto_players')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

// ─── DRAWS ───────────────────────────────────────────────────

async function recordDraw({ roomId, numberDrawn, drawOrder }) {
  const { data, error } = await supabase
    .from('loto_draws')
    .insert({
      room_id: roomId,
      number_drawn: numberDrawn,
      draw_order: drawOrder
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getDrawsByRoom(roomId) {
  const { data, error } = await supabase
    .from('loto_draws')
    .select('*')
    .eq('room_id', roomId)
    .order('draw_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

// ─── LEADERBOARD ─────────────────────────────────────────────

async function getOrCreateLeaderboardEntry(userId, username) {
  let { data, error } = await supabase
    .from('loto_leaderboard')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create new entry
    const result = await supabase
      .from('loto_leaderboard')
      .insert({ user_id: userId, username: username || 'Player' })
      .select()
      .single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  }
  if (error) throw new Error(error.message);
  return data;
}

async function updateLeaderboard(userId, { totalGames, totalWins, totalScore, bestWinSpeedDraws, username }) {
  const updates = {
    total_games: totalGames,
    total_wins: totalWins,
    total_score: totalScore,
    updated_at: new Date().toISOString()
  };
  if (bestWinSpeedDraws !== undefined) updates.best_win_speed_draws = bestWinSpeedDraws;
  if (username) updates.username = username;

  const { data, error } = await supabase
    .from('loto_leaderboard')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getTopLeaderboard(limit = 20) {
  const { data, error } = await supabase
    .from('loto_leaderboard')
    .select('*')
    .order('total_wins', { ascending: false })
    .order('total_score', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

// ─── GAME HISTORY ────────────────────────────────────────────

async function recordGameHistory({ userId, roomId, roomCode, gameMode, winPattern, isWinner, totalDraws, score }) {
  const { data, error } = await supabase
    .from('loto_game_history')
    .insert({
      user_id: userId,
      room_id: roomId,
      room_code: roomCode,
      game_mode: gameMode,
      win_pattern: winPattern,
      is_winner: isWinner,
      total_draws: totalDraws,
      score: score
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function getUserGameHistory(userId, limit = 20, offset = 0) {
  const { data, error, count } = await supabase
    .from('loto_game_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { history: data || [], total: count || 0 };
}

module.exports = {
  createRoom,
  getRoomByCode,
  getRoomById,
  updateRoom,
  addPlayer,
  getPlayersByRoom,
  getPlayerInRoom,
  updatePlayer,
  removePlayer,
  recordDraw,
  getDrawsByRoom,
  getOrCreateLeaderboardEntry,
  updateLeaderboard,
  getTopLeaderboard,
  recordGameHistory,
  getUserGameHistory
};
