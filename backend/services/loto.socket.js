// ═══════════════════════════════════════════════════════════════
// services/loto.socket.js - Socket.IO event handlers for LOTO
// Manages rooms, real-time draws, and game state broadcasting
// ═══════════════════════════════════════════════════════════════

const lotoDb = require('../db/loto');
const lotoService = require('./loto.service');
const jwt = require('jsonwebtoken');

// Active auto-draw intervals: roomId -> intervalId
const autoDrawIntervals = new Map();

// Active room data cache for fast access
const roomCache = new Map();

function setupLotoSocket(io) {
  const lotoNs = io.of('/loto');

  // ─── Auth middleware for socket connections ────────────────
  lotoNs.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId || decoded.id || decoded.sub;
      socket.username = decoded.name || decoded.email || 'Player';
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  lotoNs.on('connection', (socket) => {
    console.log(`  🎰 LOTO socket connected: ${socket.userId}`);

    // ─── JOIN ROOM ────────────────────────────────────────
    socket.on('loto:join_room', async ({ roomCode }) => {
      try {
        if (!roomCode) {
          return socket.emit('loto:error', { code: 'INVALID_INPUT', message: 'Room code is required' });
        }

        const room = await lotoDb.getRoomByCode(roomCode.toUpperCase());
        if (!room) {
          return socket.emit('loto:error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
        }

        if (room.status === 'in_progress') {
          // Check if user is already in the room (reconnection)
          const existingPlayer = await lotoDb.getPlayerInRoom(room.id, socket.userId);
          if (!existingPlayer) {
            return socket.emit('loto:error', { code: 'GAME_IN_PROGRESS', message: 'Game already in progress' });
          }
        }

        if (room.status === 'finished') {
          return socket.emit('loto:error', { code: 'GAME_FINISHED', message: 'Game has already finished' });
        }

        // Check if room is full
        const players = await lotoDb.getPlayersByRoom(room.id);
        const existingPlayer = players.find(p => p.user_id === socket.userId);

        if (!existingPlayer && players.length >= room.max_players) {
          return socket.emit('loto:error', { code: 'ROOM_FULL', message: 'Room is full' });
        }

        // Join the socket room
        socket.join(`loto:${room.id}`);
        socket.lotoRoomId = room.id;

        let player = existingPlayer;
        if (!existingPlayer && room.status === 'waiting') {
          // Generate unique card
          const existingCards = players.map(p => p.card_numbers);
          const card = lotoService.generateUniqueCard(existingCards);

          player = await lotoDb.addPlayer({
            roomId: room.id,
            userId: socket.userId,
            username: socket.username,
            cardNumbers: card
          });
        }

        // Refresh players list
        const updatedPlayers = await lotoDb.getPlayersByRoom(room.id);

        // Broadcast to room
        lotoNs.to(`loto:${room.id}`).emit('loto:player_joined', {
          player: {
            userId: socket.userId,
            username: socket.username,
            id: player?.id
          },
          room: sanitizeRoom(room),
          players: updatedPlayers.map(sanitizePlayer)
        });

      } catch (err) {
        console.error('loto:join_room error:', err);
        socket.emit('loto:error', { code: 'JOIN_FAILED', message: err.message });
      }
    });

    // ─── START GAME (Host Only) ──────────────────────────
    socket.on('loto:start_game', async ({ roomId }) => {
      try {
        const room = await lotoDb.getRoomById(roomId);
        if (!room) return socket.emit('loto:error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
        if (room.host_user_id !== socket.userId) {
          return socket.emit('loto:error', { code: 'NOT_HOST', message: 'Only the host can start the game' });
        }
        if (room.status !== 'waiting') {
          return socket.emit('loto:error', { code: 'INVALID_STATE', message: 'Game already started' });
        }

        const players = await lotoDb.getPlayersByRoom(roomId);
        if (players.length < 1) {
          return socket.emit('loto:error', { code: 'NOT_ENOUGH_PLAYERS', message: 'Need at least 1 player' });
        }

        // Generate draw pool and start game
        const drawPool = lotoService.generateDrawPool();
        const updatedRoom = await lotoDb.updateRoom(roomId, {
          status: 'in_progress',
          started_at: new Date().toISOString(),
          draw_pool: drawPool,
          current_drawn_numbers: []
        });

        // Cache room data
        roomCache.set(roomId, {
          ...updatedRoom,
          drawPool,
          drawnNumbers: [],
          drawOrder: 0
        });

        // Broadcast game started
        lotoNs.to(`loto:${roomId}`).emit('loto:game_started', {
          room: sanitizeRoom(updatedRoom),
          players: players.map(p => ({
            ...sanitizePlayer(p),
            card: p.card_numbers // Send each player their own card
          }))
        });

        // Start auto-draw if interval > 0
        if (updatedRoom.draw_interval_seconds > 0) {
          startAutoDraw(roomId, updatedRoom.draw_interval_seconds, lotoNs);
        }

      } catch (err) {
        console.error('loto:start_game error:', err);
        socket.emit('loto:error', { code: 'START_FAILED', message: err.message });
      }
    });

    // ─── REQUEST DRAW (Host or Auto) ─────────────────────
    socket.on('loto:request_draw', async ({ roomId }) => {
      try {
        const room = await lotoDb.getRoomById(roomId);
        if (!room) return socket.emit('loto:error', { code: 'ROOM_NOT_FOUND', message: 'Room not found' });
        if (room.host_user_id !== socket.userId) {
          return socket.emit('loto:error', { code: 'NOT_HOST', message: 'Only the host can draw numbers' });
        }
        if (room.status !== 'in_progress') {
          return socket.emit('loto:error', { code: 'INVALID_STATE', message: 'Game is not in progress' });
        }

        await performDraw(roomId, lotoNs);
      } catch (err) {
        console.error('loto:request_draw error:', err);
        socket.emit('loto:error', { code: 'DRAW_FAILED', message: err.message });
      }
    });

    // ─── MARK NUMBER ─────────────────────────────────────
    socket.on('loto:mark_number', async ({ roomId, number }) => {
      try {
        const player = await lotoDb.getPlayerInRoom(roomId, socket.userId);
        if (!player) return socket.emit('loto:error', { code: 'NOT_IN_ROOM', message: 'You are not in this room' });

        const room = await lotoDb.getRoomById(roomId);
        if (!room || room.status !== 'in_progress') {
          return socket.emit('loto:error', { code: 'INVALID_STATE', message: 'Game is not in progress' });
        }

        // Verify the number has been drawn
        if (!room.current_drawn_numbers.includes(number) && number !== 0) {
          return socket.emit('loto:error', { code: 'NOT_DRAWN', message: 'This number has not been drawn yet' });
        }

        // Verify the number is on the player's card
        const onCard = player.card_numbers.some(row => row.includes(number));
        if (!onCard && number !== 0) {
          return socket.emit('loto:error', { code: 'NOT_ON_CARD', message: 'This number is not on your card' });
        }

        // Mark it
        const newMarked = [...new Set([...player.marked_numbers, number])];
        await lotoDb.updatePlayer(player.id, { marked_numbers: newMarked });

        socket.emit('loto:number_marked', { number, markedNumbers: newMarked });
      } catch (err) {
        console.error('loto:mark_number error:', err);
        socket.emit('loto:error', { code: 'MARK_FAILED', message: err.message });
      }
    });

    // ─── CALL LOTO ───────────────────────────────────────
    socket.on('loto:call_loto', async ({ roomId }) => {
      try {
        const room = await lotoDb.getRoomById(roomId);
        if (!room || room.status !== 'in_progress') {
          return socket.emit('loto:error', { code: 'INVALID_STATE', message: 'Game is not in progress' });
        }

        const player = await lotoDb.getPlayerInRoom(roomId, socket.userId);
        if (!player) {
          return socket.emit('loto:error', { code: 'NOT_IN_ROOM', message: 'You are not in this room' });
        }

        // SERVER-SIDE WIN VALIDATION - never trust client
        const winResult = lotoService.checkWin(
          player.card_numbers,
          player.marked_numbers,
          room.win_pattern
        );

        await lotoDb.updatePlayer(player.id, { called_loto: true });

        if (!winResult.won) {
          // Invalid LOTO call
          lotoNs.to(`loto:${roomId}`).emit('loto:loto_called', {
            userId: socket.userId,
            username: socket.username,
            isValid: false
          });
          return;
        }

        // Valid win!
        const drawCount = room.current_drawn_numbers.length;
        const score = lotoService.calculateScore(drawCount, room.win_pattern);

        // Update player
        await lotoDb.updatePlayer(player.id, {
          is_winner: true,
          score: score
        });

        // Stop auto-draw
        stopAutoDraw(roomId);

        // Update room
        await lotoDb.updateRoom(roomId, {
          status: 'finished',
          winner_user_id: socket.userId,
          finished_at: new Date().toISOString()
        });

        // Broadcast win
        lotoNs.to(`loto:${roomId}`).emit('loto:loto_called', {
          userId: socket.userId,
          username: socket.username,
          isValid: true
        });

        lotoNs.to(`loto:${roomId}`).emit('loto:game_won', {
          winner: {
            userId: socket.userId,
            username: socket.username
          },
          pattern: winResult.pattern,
          winningCells: winResult.winningCells,
          card: player.card_numbers,
          drawCount,
          score
        });

        // Update leaderboard and history for all players
        const allPlayers = await lotoDb.getPlayersByRoom(roomId);
        for (const p of allPlayers) {
          const isWinner = p.user_id === socket.userId;
          const playerScore = isWinner ? score : 0;

          // Update leaderboard
          const lb = await lotoDb.getOrCreateLeaderboardEntry(p.user_id, p.username);
          const lbUpdate = {
            totalGames: lb.total_games + 1,
            totalWins: lb.total_wins + (isWinner ? 1 : 0),
            totalScore: lb.total_score + playerScore,
            username: p.username
          };
          if (isWinner && (!lb.best_win_speed_draws || drawCount < lb.best_win_speed_draws)) {
            lbUpdate.bestWinSpeedDraws = drawCount;
          }
          await lotoDb.updateLeaderboard(p.user_id, lbUpdate);

          // Record game history
          await lotoDb.recordGameHistory({
            userId: p.user_id,
            roomId: room.id,
            roomCode: room.room_code,
            gameMode: room.game_mode,
            winPattern: room.win_pattern,
            isWinner,
            totalDraws: drawCount,
            score: playerScore
          });
        }

        // Send final results
        const finalPlayers = await lotoDb.getPlayersByRoom(roomId);
        lotoNs.to(`loto:${roomId}`).emit('loto:game_ended', {
          results: finalPlayers.map(p => ({
            userId: p.user_id,
            username: p.username,
            isWinner: p.is_winner,
            score: p.score,
            markedCount: p.marked_numbers.length,
            card: p.card_numbers
          })),
          drawCount,
          roomCode: room.room_code
        });

        // Clean up cache
        roomCache.delete(roomId);

      } catch (err) {
        console.error('loto:call_loto error:', err);
        socket.emit('loto:error', { code: 'LOTO_FAILED', message: err.message });
      }
    });

    // ─── DISCONNECT ──────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`  🎰 LOTO socket disconnected: ${socket.userId}`);
      if (!socket.lotoRoomId) return;

      try {
        const roomId = socket.lotoRoomId;
        const room = await lotoDb.getRoomById(roomId);
        if (!room) return;

        if (room.status === 'waiting') {
          // Remove player from waiting room
          await lotoDb.removePlayer(roomId, socket.userId);
          const players = await lotoDb.getPlayersByRoom(roomId);

          lotoNs.to(`loto:${roomId}`).emit('loto:player_left', {
            userId: socket.userId,
            room: sanitizeRoom(room),
            players: players.map(sanitizePlayer)
          });

          // If host left, promote next player
          if (room.host_user_id === socket.userId && players.length > 0) {
            const newHost = players[0];
            await lotoDb.updateRoom(roomId, { host_user_id: newHost.user_id });
            lotoNs.to(`loto:${roomId}`).emit('loto:host_changed', {
              newHostId: newHost.user_id,
              newHostName: newHost.username
            });
          }

          // If no players left, clean up
          if (players.length === 0) {
            await lotoDb.updateRoom(roomId, { status: 'finished', finished_at: new Date().toISOString() });
            stopAutoDraw(roomId);
            roomCache.delete(roomId);
          }
        }

        if (room.status === 'in_progress') {
          const players = await lotoDb.getPlayersByRoom(roomId);
          const connectedSockets = await lotoNs.in(`loto:${roomId}`).fetchSockets();
          const connectedUserIds = connectedSockets.map(s => s.userId).filter(Boolean);

          lotoNs.to(`loto:${roomId}`).emit('loto:player_left', {
            userId: socket.userId,
            room: sanitizeRoom(room),
            players: players.map(sanitizePlayer)
          });

          // If host disconnected, promote next connected player
          if (room.host_user_id === socket.userId) {
            const nextHost = players.find(p => p.user_id !== socket.userId && connectedUserIds.includes(p.user_id));
            if (nextHost) {
              await lotoDb.updateRoom(roomId, { host_user_id: nextHost.user_id });
              lotoNs.to(`loto:${roomId}`).emit('loto:host_changed', {
                newHostId: nextHost.user_id,
                newHostName: nextHost.username
              });
            }
          }

          // If only 1 or 0 connected players, pause game
          if (connectedUserIds.filter(id => id !== socket.userId).length <= 0) {
            stopAutoDraw(roomId);
            lotoNs.to(`loto:${roomId}`).emit('loto:game_paused', {
              reason: 'All other players disconnected'
            });
          }
        }
      } catch (err) {
        console.error('LOTO disconnect handler error:', err);
      }
    });
  });

  return lotoNs;
}

// ─── AUTO-DRAW ───────────────────────────────────────────────

function startAutoDraw(roomId, intervalSeconds, lotoNs) {
  stopAutoDraw(roomId); // Clear any existing interval

  const intervalId = setInterval(async () => {
    try {
      await performDraw(roomId, lotoNs);
    } catch (err) {
      console.error(`Auto-draw error for room ${roomId}:`, err);
      stopAutoDraw(roomId);
    }
  }, intervalSeconds * 1000);

  autoDrawIntervals.set(roomId, intervalId);
}

function stopAutoDraw(roomId) {
  const intervalId = autoDrawIntervals.get(roomId);
  if (intervalId) {
    clearInterval(intervalId);
    autoDrawIntervals.delete(roomId);
  }
}

async function performDraw(roomId, lotoNs) {
  const room = await lotoDb.getRoomById(roomId);
  if (!room || room.status !== 'in_progress') {
    stopAutoDraw(roomId);
    return;
  }

  const drawnNumbers = room.current_drawn_numbers || [];
  const drawPool = room.draw_pool || [];

  const result = lotoService.drawNextNumber(drawPool, drawnNumbers);
  if (!result) {
    // All numbers drawn, end game
    stopAutoDraw(roomId);
    await lotoDb.updateRoom(roomId, {
      status: 'finished',
      finished_at: new Date().toISOString()
    });
    lotoNs.to(`loto:${roomId}`).emit('loto:game_ended', {
      results: [],
      drawCount: 75,
      reason: 'All numbers drawn, no winner'
    });
    return;
  }

  const newDrawnNumbers = [...drawnNumbers, result.number];

  // Record draw
  await lotoDb.recordDraw({
    roomId,
    numberDrawn: result.number,
    drawOrder: result.drawOrder
  });

  // Update room
  await lotoDb.updateRoom(roomId, {
    current_drawn_numbers: newDrawnNumbers
  });

  // Broadcast drawn number
  lotoNs.to(`loto:${roomId}`).emit('loto:number_drawn', {
    number: result.number,
    drawnNumbers: newDrawnNumbers,
    drawOrder: result.drawOrder,
    letter: lotoService.getColumnLetter(result.number)
  });

  // Auto-mark for all players who have this number on their card
  const players = await lotoDb.getPlayersByRoom(roomId);
  for (const player of players) {
    const onCard = player.card_numbers.some(row => row.includes(result.number));
    if (onCard) {
      const newMarked = [...new Set([...player.marked_numbers, result.number])];
      await lotoDb.updatePlayer(player.id, { marked_numbers: newMarked });
    }
  }
}

// ─── HELPERS ─────────────────────────────────────────────────

function sanitizeRoom(room) {
  return {
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
  };
}

function sanitizePlayer(player) {
  return {
    id: player.id,
    userId: player.user_id,
    username: player.username,
    isWinner: player.is_winner,
    calledLoto: player.called_loto,
    score: player.score,
    joinedAt: player.joined_at
  };
}

module.exports = { setupLotoSocket };
