// ═══════════════════════════════════════════════════════════════
// routes/loto.js - REST API routes for LOTO game
// All routes under /api/loto, JWT-authenticated
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const lotoDb = require('../db/loto');
const lotoService = require('../services/loto.service');
const { validate, createRoomSchema, joinRoomSchema, paginationSchema } = require('../services/loto.validation');

const ok = (res, data, s = 200) => res.status(s).json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) => res.status(s).json({ success: false, data: null, error: msg });

// ─── CREATE ROOM ─────────────────────────────────────────────
// POST /api/loto/rooms
router.post('/rooms', authMiddleware, async (req, res) => {
  try {
    const input = validate(createRoomSchema, req.body);
    const userId = req.user.userId || req.user.id || req.user.sub;

    // Generate unique room code (retry if collision)
    let roomCode, existing;
    let attempts = 0;
    do {
      roomCode = lotoService.generateRoomCode();
      existing = await lotoDb.getRoomByCode(roomCode);
      attempts++;
    } while (existing && attempts < 10);

    if (existing) return fail(res, 'Failed to generate unique room code, please try again');

    // Generate draw pool
    const drawPool = lotoService.generateDrawPool();

    const room = await lotoDb.createRoom({
      roomCode,
      hostUserId: userId,
      gameMode: input.gameMode,
      winPattern: input.winPattern,
      maxPlayers: input.maxPlayers,
      drawIntervalSeconds: input.drawIntervalSeconds,
      drawPool
    });

    // Auto-join host as first player
    const card = lotoService.generateCard();
    const username = req.user.name || req.user.email || 'Host';
    await lotoDb.addPlayer({
      roomId: room.id,
      userId,
      username,
      cardNumbers: card
    });

    return ok(res, {
      room: {
        id: room.id,
        roomCode: room.room_code,
        hostUserId: room.host_user_id,
        status: room.status,
        gameMode: room.game_mode,
        winPattern: room.win_pattern,
        maxPlayers: room.max_players,
        drawIntervalSeconds: room.draw_interval_seconds
      }
    }, 201);
  } catch (err) {
    console.error('Create LOTO room error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── GET ROOM BY CODE ────────────────────────────────────────
// GET /api/loto/rooms/:code
router.get('/rooms/:code', authMiddleware, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const room = await lotoDb.getRoomByCode(code);
    if (!room) return fail(res, 'Room not found', 404);

    const players = await lotoDb.getPlayersByRoom(room.id);

    return ok(res, {
      room: {
        id: room.id,
        roomCode: room.room_code,
        hostUserId: room.host_user_id,
        status: room.status,
        gameMode: room.game_mode,
        winPattern: room.win_pattern,
        maxPlayers: room.max_players,
        drawIntervalSeconds: room.draw_interval_seconds,
        drawnNumbers: room.current_drawn_numbers || [],
        startedAt: room.started_at,
        finishedAt: room.finished_at
      },
      players: players.map(p => ({
        id: p.id,
        userId: p.user_id,
        username: p.username,
        isWinner: p.is_winner,
        score: p.score,
        joinedAt: p.joined_at
      })),
      playerCount: players.length
    });
  } catch (err) {
    console.error('Get LOTO room error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── JOIN ROOM ───────────────────────────────────────────────
// POST /api/loto/rooms/:code/join
router.post('/rooms/:code/join', authMiddleware, async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const userId = req.user.userId || req.user.id || req.user.sub;

    const room = await lotoDb.getRoomByCode(code);
    if (!room) return fail(res, 'Room not found', 404);
    if (room.status !== 'waiting') return fail(res, 'Cannot join: game already started or finished');

    const players = await lotoDb.getPlayersByRoom(room.id);

    // Check if already joined
    const existing = players.find(p => p.user_id === userId);
    if (existing) {
      return ok(res, {
        message: 'Already in room',
        player: {
          id: existing.id,
          userId: existing.user_id,
          card: existing.card_numbers
        },
        room: { id: room.id, roomCode: room.room_code }
      });
    }

    if (players.length >= room.max_players) {
      return fail(res, 'Room is full');
    }

    // Generate unique card
    const existingCards = players.map(p => p.card_numbers);
    const card = lotoService.generateUniqueCard(existingCards);
    const username = req.user.name || req.user.email || 'Player';

    const player = await lotoDb.addPlayer({
      roomId: room.id,
      userId,
      username,
      cardNumbers: card
    });

    return ok(res, {
      player: {
        id: player.id,
        userId: player.user_id,
        card: player.card_numbers
      },
      room: { id: room.id, roomCode: room.room_code }
    });
  } catch (err) {
    console.error('Join LOTO room error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── START GAME (Host Only) ──────────────────────────────────
// POST /api/loto/rooms/:id/start
router.post('/rooms/:id/start', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.userId || req.user.id || req.user.sub;

    const room = await lotoDb.getRoomById(roomId);
    if (!room) return fail(res, 'Room not found', 404);
    if (room.host_user_id !== userId) return fail(res, 'Only the host can start the game', 403);
    if (room.status !== 'waiting') return fail(res, 'Game already started');

    const players = await lotoDb.getPlayersByRoom(roomId);
    if (players.length < 1) return fail(res, 'Need at least 1 player');

    const drawPool = lotoService.generateDrawPool();
    const updatedRoom = await lotoDb.updateRoom(roomId, {
      status: 'in_progress',
      started_at: new Date().toISOString(),
      draw_pool: drawPool,
      current_drawn_numbers: []
    });

    return ok(res, {
      room: {
        id: updatedRoom.id,
        status: updatedRoom.status,
        startedAt: updatedRoom.started_at
      }
    });
  } catch (err) {
    console.error('Start LOTO game error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── MANUAL DRAW (Host Only) ─────────────────────────────────
// POST /api/loto/rooms/:id/draw
router.post('/rooms/:id/draw', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.userId || req.user.id || req.user.sub;

    const room = await lotoDb.getRoomById(roomId);
    if (!room) return fail(res, 'Room not found', 404);
    if (room.host_user_id !== userId) return fail(res, 'Only the host can draw', 403);
    if (room.status !== 'in_progress') return fail(res, 'Game is not in progress');

    const drawnNumbers = room.current_drawn_numbers || [];
    const drawPool = room.draw_pool || [];

    const result = lotoService.drawNextNumber(drawPool, drawnNumbers);
    if (!result) return fail(res, 'All numbers have been drawn');

    const newDrawnNumbers = [...drawnNumbers, result.number];

    await lotoDb.recordDraw({
      roomId,
      numberDrawn: result.number,
      drawOrder: result.drawOrder
    });

    await lotoDb.updateRoom(roomId, {
      current_drawn_numbers: newDrawnNumbers
    });

    return ok(res, {
      number: result.number,
      drawOrder: result.drawOrder,
      letter: lotoService.getColumnLetter(result.number),
      drawnNumbers: newDrawnNumbers
    });
  } catch (err) {
    console.error('Draw LOTO number error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── CALL LOTO ───────────────────────────────────────────────
// POST /api/loto/rooms/:id/loto
router.post('/rooms/:id/loto', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.userId || req.user.id || req.user.sub;

    const room = await lotoDb.getRoomById(roomId);
    if (!room) return fail(res, 'Room not found', 404);
    if (room.status !== 'in_progress') return fail(res, 'Game is not in progress');

    const player = await lotoDb.getPlayerInRoom(roomId, userId);
    if (!player) return fail(res, 'You are not in this room');

    // Server-side validation
    const winResult = lotoService.checkWin(
      player.card_numbers,
      player.marked_numbers,
      room.win_pattern
    );

    await lotoDb.updatePlayer(player.id, { called_loto: true });

    if (!winResult.won) {
      return ok(res, { valid: false, message: 'Invalid LOTO call - no winning pattern detected' });
    }

    const drawCount = room.current_drawn_numbers.length;
    const score = lotoService.calculateScore(drawCount, room.win_pattern);

    await lotoDb.updatePlayer(player.id, { is_winner: true, score });
    await lotoDb.updateRoom(roomId, {
      status: 'finished',
      winner_user_id: userId,
      finished_at: new Date().toISOString()
    });

    return ok(res, {
      valid: true,
      pattern: winResult.pattern,
      winningCells: winResult.winningCells,
      drawCount,
      score
    });
  } catch (err) {
    console.error('LOTO call error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── LEAVE ROOM ──────────────────────────────────────────────
// DELETE /api/loto/rooms/:id/leave
router.delete('/rooms/:id/leave', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user.userId || req.user.id || req.user.sub;

    const room = await lotoDb.getRoomById(roomId);
    if (!room) return fail(res, 'Room not found', 404);

    await lotoDb.removePlayer(roomId, userId);

    // If host left, promote next player
    if (room.host_user_id === userId) {
      const players = await lotoDb.getPlayersByRoom(roomId);
      if (players.length > 0) {
        await lotoDb.updateRoom(roomId, { host_user_id: players[0].user_id });
      } else {
        await lotoDb.updateRoom(roomId, { status: 'finished', finished_at: new Date().toISOString() });
      }
    }

    return ok(res, { message: 'Left room successfully' });
  } catch (err) {
    console.error('Leave LOTO room error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── LEADERBOARD ─────────────────────────────────────────────
// GET /api/loto/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaders = await lotoDb.getTopLeaderboard(20);
    return ok(res, {
      leaderboard: leaders.map((l, idx) => ({
        rank: idx + 1,
        userId: l.user_id,
        username: l.username,
        totalGames: l.total_games,
        totalWins: l.total_wins,
        totalScore: l.total_score,
        winRate: parseFloat(l.win_rate || 0),
        bestWinSpeed: l.best_win_speed_draws
      }))
    });
  } catch (err) {
    console.error('Get LOTO leaderboard error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── GAME HISTORY ────────────────────────────────────────────
// GET /api/loto/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user.sub;
    const { page, limit } = validate(paginationSchema, req.query);
    const offset = (page - 1) * limit;

    const { history, total } = await lotoDb.getUserGameHistory(userId, limit, offset);

    return ok(res, {
      history: history.map(h => ({
        id: h.id,
        roomCode: h.room_code,
        gameMode: h.game_mode,
        winPattern: h.win_pattern,
        isWinner: h.is_winner,
        totalDraws: h.total_draws,
        score: h.score,
        playedAt: h.played_at
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Get LOTO history error:', err);
    return fail(res, err.message, 500);
  }
});

// ─── GAME RESULTS ────────────────────────────────────────────
// GET /api/loto/rooms/:id/results
router.get('/rooms/:id/results', authMiddleware, async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await lotoDb.getRoomById(roomId);
    if (!room) return fail(res, 'Room not found', 404);

    const players = await lotoDb.getPlayersByRoom(roomId);
    const draws = await lotoDb.getDrawsByRoom(roomId);

    return ok(res, {
      room: {
        id: room.id,
        roomCode: room.room_code,
        status: room.status,
        winPattern: room.win_pattern,
        gameMode: room.game_mode,
        startedAt: room.started_at,
        finishedAt: room.finished_at,
        totalDraws: draws.length,
        winnerId: room.winner_user_id
      },
      players: players.map(p => ({
        userId: p.user_id,
        username: p.username,
        isWinner: p.is_winner,
        score: p.score,
        markedCount: p.marked_numbers?.length || 0,
        card: p.card_numbers
      })),
      draws: draws.map(d => ({
        number: d.number_drawn,
        order: d.draw_order,
        drawnAt: d.drawn_at
      }))
    });
  } catch (err) {
    console.error('Get LOTO results error:', err);
    return fail(res, err.message, 500);
  }
});

module.exports = router;
