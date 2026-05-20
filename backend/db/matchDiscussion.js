// ═══════════════════════════════════════════════════════════════
// db/matchDiscussion.js - Supabase queries for match discussion rooms
// Follows the same pattern as db/chat.js
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

// ─── Match Rooms ────────────────────────────────────────────────

async function getAllRooms(filters = {}) {
  let query = supabase
    .from('match_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function getRoomById(roomId) {
  const { data, error } = await supabase
    .from('match_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Match Messages ─────────────────────────────────────────────

async function getMessages(roomId, limit = 100) {
  const { data, error } = await supabase
    .from('match_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

async function postMessage({ room_id, user_id, username, avatar_color, message, message_type, metadata }) {
  const { data, error } = await supabase
    .from('match_messages')
    .insert({
      room_id,
      user_id,
      username,
      avatar_color: avatar_color || '#00ff88',
      message,
      message_type: message_type || 'text',
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Game Challenges ────────────────────────────────────────────

async function createChallenge({ room_id, challenger_id, challenged_id, game_id, game_name }) {
  // Insert challenge record
  const { data: challenge, error: cErr } = await supabase
    .from('game_challenges')
    .insert({ room_id, challenger_id, challenged_id, game_id, game_name, status: 'pending' })
    .select()
    .single();

  if (cErr) throw new Error(cErr.message);

  // Also post a challenge-type message into the room
  const { error: mErr } = await supabase
    .from('match_messages')
    .insert({
      room_id,
      user_id: challenger_id,
      username: 'System',
      message: `⚔️ Challenge sent!`,
      message_type: 'challenge',
      metadata: {
        challenge_id: challenge.id,
        challenger_id,
        challenged_id,
        game_id,
        game_name,
        status: 'pending',
      },
    });

  if (mErr) console.warn('[matchDiscussion] Challenge message insert failed:', mErr.message);

  return challenge;
}

async function updateChallengeStatus(challengeId, status) {
  const { data, error } = await supabase
    .from('game_challenges')
    .update({ status })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  getAllRooms,
  getRoomById,
  getMessages,
  postMessage,
  createChallenge,
  updateChallengeStatus,
};
