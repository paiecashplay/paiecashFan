// ═══════════════════════════════════════════════════════════════
// routes/matchDiscussion.js - Live Match Discussion API
// All routes protected by authMiddleware (see server.js registration)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const db = require('../db/matchDiscussion');
const router = express.Router();

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// ─── GET /api/match-rooms - get all rooms (filter by ?status=live) ──
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const rooms = await db.getAllRooms(status ? { status } : {});
    return ok(res, { rooms });
  } catch (err) {
    console.error('[matchDiscussion] GET / error:', err.message);
    return fail(res, 'Failed to fetch rooms', 500);
  }
});

// ─── GET /api/match-rooms/:roomId - single room details ─────────
router.get('/:roomId', async (req, res) => {
  try {
    const room = await db.getRoomById(req.params.roomId);
    if (!room) return fail(res, 'Room not found', 404);
    return ok(res, { room });
  } catch (err) {
    console.error('[matchDiscussion] GET /:roomId error:', err.message);
    return fail(res, 'Failed to fetch room', 500);
  }
});

// ─── GET /api/match-rooms/:roomId/messages - last 100 messages ──
router.get('/:roomId/messages', async (req, res) => {
  try {
    const messages = await db.getMessages(req.params.roomId, 100);
    return ok(res, { messages });
  } catch (err) {
    console.error('[matchDiscussion] GET /:roomId/messages error:', err.message);
    return fail(res, 'Failed to fetch messages', 500);
  }
});

// ─── POST /api/match-rooms/:roomId/messages - post a message ────
router.post('/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, message_type, metadata } = req.body;

    if (!message || !message.trim()) return fail(res, 'Message cannot be empty');

    // Get username from auth token payload (set by authMiddleware)
    const userId = req.user.userId || req.user.id || req.user.sub;
    const username = req.user.name || req.user.email?.split('@')[0] || 'Fan';

    // Derive a stable avatar colour from the userId
    const colors = ['#00ff88', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const avatarColor = colors[parseInt(userId.replace(/\D/g, '').slice(0, 4) || '0') % colors.length];

    const msg = await db.postMessage({
      room_id: roomId,
      user_id: userId,
      username,
      avatar_color: avatarColor,
      message: message.trim(),
      message_type: message_type || 'text',
      metadata: metadata || null,
    });

    return ok(res, { message: msg }, 201);
  } catch (err) {
    console.error('[matchDiscussion] POST /:roomId/messages error:', err.message);
    return fail(res, 'Failed to post message', 500);
  }
});

// ─── POST /api/match-rooms/:roomId/challenge - send a game challenge ─
router.post('/:roomId/challenge', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { challenged_id, game_id, game_name } = req.body;

    if (!challenged_id || !game_id || !game_name) {
      return fail(res, 'Missing challenged_id, game_id, or game_name');
    }

    const challengerId = req.user.userId || req.user.id || req.user.sub;
    if (challengerId === challenged_id) return fail(res, 'You cannot challenge yourself');

    const challenge = await db.createChallenge({
      room_id: roomId,
      challenger_id: challengerId,
      challenged_id,
      game_id,
      game_name,
    });

    return ok(res, { challenge }, 201);
  } catch (err) {
    console.error('[matchDiscussion] POST /:roomId/challenge error:', err.message);
    return fail(res, 'Failed to send challenge', 500);
  }
});

// ─── PATCH /api/challenges/:challengeId - update challenge status ─
router.patch('/challenges/:challengeId', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return fail(res, 'Status must be "accepted" or "declined"');
    }
    const updated = await db.updateChallengeStatus(req.params.challengeId, status);
    return ok(res, { challenge: updated });
  } catch (err) {
    console.error('[matchDiscussion] PATCH /challenges/:id error:', err.message);
    return fail(res, 'Failed to update challenge', 500);
  }
});

const sessionDb = require('../db/challengeSessions');
const notificationsDb = require('../db/notifications');

// ─── POST /api/match-rooms/challenges/:challengeId/accept ─────────
router.post('/challenges/:challengeId/accept', async (req, res) => {
  try {
    const { challengeId } = req.params;

    // 1. Update challenge status to accepted
    const challenge = await db.updateChallengeStatus(challengeId, 'accepted');
    if (!challenge) return fail(res, 'Challenge not found');

    // 2. Create the shared session
    const session = await sessionDb.createChallengeSession({
      challenge_id: challenge.id,
      challenger_id: challenge.challenger_id,
      challenged_id: challenge.challenged_id,
      game_id: challenge.game_id,
      game_name: challenge.game_name,
    });

    // 3. Create notification for the challenger
    await notificationsDb.createNotification({
      user_id: challenge.challenger_id,
      type: 'challenge_accepted',
      title: 'Challenge Accepted!',
      message: 'Your challenge was accepted! Get ready to play.',
      metadata: { session_id: session.id, challenge_id: challenge.id }
    });

    return ok(res, { challenge, session });
  } catch (err) {
    console.error('[matchDiscussion] POST /challenges/:id/accept error:', err.message);
    return fail(res, 'Failed to accept challenge', 500);
  }
});

// ─── GET /api/match-rooms/challenge-sessions/:sessionId ─────────
router.get('/challenge-sessions/:sessionId', async (req, res) => {
  try {
    const session = await sessionDb.getChallengeSession(req.params.sessionId);
    if (!session) return fail(res, 'Session not found', 404);
    return ok(res, { session });
  } catch (err) {
    console.error('[matchDiscussion] GET /challenge-sessions/:id error:', err.message);
    return fail(res, 'Failed to fetch session', 500);
  }
});

// ─── POST /api/match-rooms/challenge-sessions/:sessionId/ready ─────────
router.post('/challenge-sessions/:sessionId/ready', async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const session = await sessionDb.setPlayerReady(req.params.sessionId, userId);
    return ok(res, { session });
  } catch (err) {
    console.error('[matchDiscussion] POST /challenge-sessions/:id/ready error:', err.message);
    return fail(res, 'Failed to set ready status', 500);
  }
});

// ─── POST /api/match-rooms/challenge-sessions/:sessionId/score ─────────
router.post('/challenge-sessions/:sessionId/score', async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user.userId || req.user.id || req.user.sub;
    await sessionDb.updatePlayerScore(req.params.sessionId, userId, score);
    return ok(res, { success: true });
  } catch (err) {
    console.error('[matchDiscussion] POST /challenge-sessions/:id/score error:', err.message);
    return fail(res, 'Failed to update score', 500);
  }
});

// ─── POST /api/match-rooms/challenge-sessions/:sessionId/complete ─────────
router.post('/challenge-sessions/:sessionId/complete', async (req, res) => {
  try {
    const { winner_id } = req.body;
    const session = await sessionDb.completeSession(req.params.sessionId, winner_id);

    // Identify the loser
    const loserId = session.challenger_id === winner_id ? session.challenged_id : session.challenger_id;

    // Send notifications
    if (winner_id) {
      await notificationsDb.createNotification({
        user_id: winner_id,
        type: 'challenge_result',
        title: 'Victory! 🏆',
        message: `You won the challenge against your opponent in ${session.game_name}!`,
        metadata: { session_id: session.id, result: 'win' }
      });
    }

    if (loserId) {
      await notificationsDb.createNotification({
        user_id: loserId,
        type: 'challenge_result',
        title: 'Defeat',
        message: `Better luck next time! Your opponent beat you in ${session.game_name}.`,
        metadata: { session_id: session.id, result: 'loss' }
      });
    }

    return ok(res, { session });
  } catch (err) {
    console.error('[matchDiscussion] POST /challenge-sessions/:id/complete error:', err.message);
    return fail(res, 'Failed to complete session', 500);
  }
});

module.exports = router;
