// ═══════════════════════════════════════════════════════════════
// lotoSocket.js - Socket.IO client for LOTO game
// ═══════════════════════════════════════════════════════════════

import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or create the LOTO socket connection.
 */
export function getLotoSocket() {
  if (socket && socket.connected) return socket;

  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
  const token = getToken();

  socket = io(`${API_BASE}/loto`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('🎰 LOTO socket connected');
  });

  socket.on('connect_error', (err) => {
    console.error('🎰 LOTO socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('🎰 LOTO socket disconnected:', reason);
  });

  return socket;
}

/**
 * Disconnect the LOTO socket.
 */
export function disconnectLotoSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get auth token from localStorage.
 */
function getToken() {
  try {
    const raw = localStorage.getItem('pcc_user');
    if (!raw) return null;
    return JSON.parse(raw).token;
  } catch {
    return null;
  }
}

// ─── EVENT EMITTERS ──────────────────────────────────────────

export function joinRoom(roomCode) {
  const s = getLotoSocket();
  s.emit('loto:join_room', { roomCode });
}

export function startGame(roomId) {
  const s = getLotoSocket();
  s.emit('loto:start_game', { roomId });
}

export function requestDraw(roomId) {
  const s = getLotoSocket();
  s.emit('loto:request_draw', { roomId });
}

export function markNumber(roomId, number) {
  const s = getLotoSocket();
  s.emit('loto:mark_number', { roomId, number });
}

export function callLoto(roomId) {
  const s = getLotoSocket();
  s.emit('loto:call_loto', { roomId });
}

// ─── EVENT LISTENERS ─────────────────────────────────────────

export function onPlayerJoined(callback) {
  const s = getLotoSocket();
  s.off('loto:player_joined');
  s.on('loto:player_joined', callback);
}

export function onPlayerLeft(callback) {
  const s = getLotoSocket();
  s.off('loto:player_left');
  s.on('loto:player_left', callback);
}

export function onGameStarted(callback) {
  const s = getLotoSocket();
  s.off('loto:game_started');
  s.on('loto:game_started', callback);
}

export function onNumberDrawn(callback) {
  const s = getLotoSocket();
  s.off('loto:number_drawn');
  s.on('loto:number_drawn', callback);
}

export function onNumberMarked(callback) {
  const s = getLotoSocket();
  s.off('loto:number_marked');
  s.on('loto:number_marked', callback);
}

export function onLotoCalled(callback) {
  const s = getLotoSocket();
  s.off('loto:loto_called');
  s.on('loto:loto_called', callback);
}

export function onGameWon(callback) {
  const s = getLotoSocket();
  s.off('loto:game_won');
  s.on('loto:game_won', callback);
}

export function onGameEnded(callback) {
  const s = getLotoSocket();
  s.off('loto:game_ended');
  s.on('loto:game_ended', callback);
}

export function onGamePaused(callback) {
  const s = getLotoSocket();
  s.off('loto:game_paused');
  s.on('loto:game_paused', callback);
}

export function onHostChanged(callback) {
  const s = getLotoSocket();
  s.off('loto:host_changed');
  s.on('loto:host_changed', callback);
}

export function onError(callback) {
  const s = getLotoSocket();
  s.off('loto:error');
  s.on('loto:error', callback);
}
