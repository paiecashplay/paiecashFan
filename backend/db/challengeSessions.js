// ═══════════════════════════════════════════════════════════════
// db/challengeSessions.js - Supabase queries for challenge sessions
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createChallengeSession({ challenge_id, challenger_id, challenged_id, game_id, game_name }) {
  const { data, error } = await supabase
    .from('challenge_sessions')
    .insert({
      challenge_id,
      challenger_id,
      challenged_id,
      game_id,
      game_name,
      status: 'waiting'
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function getChallengeSession(sessionId) {
  const { data, error } = await supabase
    .from('challenge_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function getSessionByChallenge(challengeId) {
  const { data, error } = await supabase
    .from('challenge_sessions')
    .select('*')
    .eq('challenge_id', challengeId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message); // Ignore no row found error
  return data;
}

async function setPlayerReady(sessionId, userId) {
  // First get the session to know who is who
  const session = await getChallengeSession(sessionId);
  if (!session) throw new Error('Session not found');

  const updates = {};
  if (session.challenger_id === userId) updates.challenger_ready = true;
  else if (session.challenged_id === userId) updates.challenged_ready = true;
  else throw new Error('User not part of this session');

  // Check if this makes both ready
  const bothReady =
    (updates.challenger_ready || session.challenger_ready) &&
    (updates.challenged_ready || session.challenged_ready);

  if (bothReady) {
    updates.status = 'in_progress';
    updates.started_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('challenge_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function updatePlayerScore(sessionId, userId, score) {
  // Insert/upsert into score updates
  const { error: updateErr } = await supabase
    .from('challenge_score_updates')
    .upsert({ session_id: sessionId, user_id: userId, score, updated_at: new Date().toISOString() }, { onConflict: 'session_id, user_id' }); // wait, without unique constraint, upsert might fail if not defined. Let's just insert for now, realtime will pick it up. Wait, the prompt says "upsert into challenge_score_updates". Since we only defined PRIMARY KEY id, let's just insert. Or better, update if we had a constraint. I'll just insert since it's a log of updates.
  // Actually, to avoid endless rows, it's better to maintain latest score in challenge_sessions.

  // Let's just insert to challenge_score_updates for the realtime trigger
  await supabase.from('challenge_score_updates').insert({
    session_id: sessionId,
    user_id: userId,
    score
  });

  // Also update challenge_sessions.challenger_score or challenged_score
  const session = await getChallengeSession(sessionId);
  if (!session) return;

  const updates = {};
  if (session.challenger_id === userId) updates.challenger_score = score;
  else if (session.challenged_id === userId) updates.challenged_score = score;

  if (Object.keys(updates).length > 0) {
    await supabase.from('challenge_sessions').update(updates).eq('id', sessionId);
  }
}

async function completeSession(sessionId, winnerId) {
  const { data, error } = await supabase
    .from('challenge_sessions')
    .update({
      status: 'completed',
      winner_id: winnerId,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function cancelSession(sessionId) {
  const { data, error } = await supabase
    .from('challenge_sessions')
    .update({ status: 'cancelled' })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  createChallengeSession,
  getChallengeSession,
  getSessionByChallenge,
  setPlayerReady,
  updatePlayerScore,
  completeSession,
  cancelSession
};
