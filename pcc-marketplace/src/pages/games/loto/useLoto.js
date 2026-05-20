// ═══════════════════════════════════════════════════════════════
// useLoto.js - Custom React hook for LOTO game state management
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from 'react';
import api from '../../../api';
import * as lotoSocket from './lotoSocket';
import { checkWin } from './lotoUtils';

const API_BASE_URL = '/api/loto';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('pcc_user') || '{}');
  } catch { return {}; }
}

export default function useLoto() {
  // ─── State ─────────────────────────────────────────────
  const [screen, setScreen] = useState('lobby'); // lobby | waiting | playing | results
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [myCard, setMyCard] = useState(null);
  const [markedNumbers, setMarkedNumbers] = useState([0]); // FREE space pre-marked
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [drawCount, setDrawCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [winResult, setWinResult] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canCallLoto, setCanCallLoto] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [isHost, setIsHost] = useState(false);

  const user = getUser();
  const userId = user.id;
  const socketInitialized = useRef(false);

  // ─── Socket Event Setup ────────────────────────────────
  const setupSocketListeners = useCallback(() => {
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    lotoSocket.onPlayerJoined(({ player, room: r, players: p }) => {
      setRoom(r);
      setPlayers(p);
      setIsHost(r.hostUserId === userId);
    });

    lotoSocket.onPlayerLeft(({ userId: leftId, room: r, players: p }) => {
      setRoom(r);
      setPlayers(p);
      setIsHost(r.hostUserId === userId);
    });

    lotoSocket.onGameStarted(({ room: r, players: p }) => {
      setRoom(r);
      setScreen('playing');
      setDrawnNumbers([]);
      setLastDrawn(null);
      setDrawCount(0);

      // Find my card from the players list
      const me = p.find(pl => pl.userId === userId);
      if (me && me.card) {
        setMyCard(me.card);
        setMarkedNumbers([0]); // Reset marks, FREE space
      }
      setPlayers(p);
    });

    lotoSocket.onNumberDrawn(({ number, drawnNumbers: dn, drawOrder, letter }) => {
      setDrawnNumbers(dn);
      setLastDrawn({ number, letter });
      setDrawCount(drawOrder);

      // Auto-mark if number is on my card
      setMyCard(prevCard => {
        if (!prevCard) return prevCard;
        const onCard = prevCard.some(row => row.includes(number));
        if (onCard) {
          setMarkedNumbers(prev => {
            const newMarked = [...new Set([...prev, number])];
            return newMarked;
          });
        }
        return prevCard;
      });
    });

    lotoSocket.onNumberMarked(({ number, markedNumbers: mn }) => {
      setMarkedNumbers(mn);
    });

    lotoSocket.onLotoCalled(({ userId: callerId, username, isValid }) => {
      if (!isValid) {
        // Invalid call notification
        setError(`${username} called BINGO but had no valid pattern!`);
        setTimeout(() => setError(null), 3000);
      }
    });

    lotoSocket.onGameWon(({ winner: w, pattern, winningCells, card, drawCount: dc, score }) => {
      setWinner(w);
      setWinResult({ pattern, winningCells, card, drawCount: dc, score });
      setScreen('results');
    });

    lotoSocket.onGameEnded(({ results, drawCount: dc, roomCode }) => {
      setGameResults({ results, drawCount: dc, roomCode });
      if (!winner) setScreen('results');
    });

    lotoSocket.onGamePaused(({ reason }) => {
      setError(`Game paused: ${reason}`);
    });

    lotoSocket.onHostChanged(({ newHostId, newHostName }) => {
      setIsHost(newHostId === userId);
      setError(`${newHostName} is now the host`);
      setTimeout(() => setError(null), 3000);
    });

    lotoSocket.onError(({ code, message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });
  }, [userId]);

  // ─── Check if player can call LOTO ─────────────────────
  useEffect(() => {
    if (!myCard || !room) return;
    const result = checkWin(myCard, markedNumbers, room.winPattern);
    setCanCallLoto(result.won);
  }, [myCard, markedNumbers, room]);

  // ─── API Functions ─────────────────────────────────────

  const apiRequest = useCallback(async (url, options = {}) => {
    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
    const token = user.token;
    const res = await fetch(API_URL + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Request failed');
    return data.data;
  }, [user.token]);

  const createRoom = useCallback(async ({ gameMode, winPattern, maxPlayers, drawIntervalSeconds }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        body: JSON.stringify({ gameMode, winPattern, maxPlayers, drawIntervalSeconds })
      });
      setRoom(data.room);
      setIsHost(true);
      setScreen('waiting');

      // Connect via socket
      setupSocketListeners();
      lotoSocket.joinRoom(data.room.roomCode);

      return data.room;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiRequest, setupSocketListeners]);

  const joinRoom = useCallback(async (roomCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`${API_BASE_URL}/rooms/${roomCode.toUpperCase()}/join`, {
        method: 'POST'
      });
      setRoom(data.room);
      if (data.player?.card) {
        setMyCard(data.player.card);
      }
      setScreen('waiting');

      // Connect via socket
      setupSocketListeners();
      lotoSocket.joinRoom(roomCode);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiRequest, setupSocketListeners]);

  const startGame = useCallback(() => {
    if (!room) return;
    lotoSocket.startGame(room.id);
  }, [room]);

  const requestDraw = useCallback(() => {
    if (!room) return;
    lotoSocket.requestDraw(room.id);
  }, [room]);

  const markNumber = useCallback((number) => {
    if (!room) return;
    // Optimistic update
    setMarkedNumbers(prev => {
      const newMarked = [...new Set([...prev, number])];
      return newMarked;
    });
    lotoSocket.markNumber(room.id, number);
  }, [room]);

  const callLotoFn = useCallback(() => {
    if (!room) return;
    lotoSocket.callLoto(room.id);
  }, [room]);

  const leaveRoom = useCallback(async () => {
    if (!room) return;
    try {
      await apiRequest(`${API_BASE_URL}/rooms/${room.id}/leave`, { method: 'DELETE' });
    } catch (err) {
      console.error('Leave room error:', err);
    }
    lotoSocket.disconnectLotoSocket();
    socketInitialized.current = false;
    resetState();
  }, [room, apiRequest]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/leaderboard`);
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
    }
  }, [apiRequest]);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/history?page=${page}&limit=20`);
      setGameHistory(data.history || []);
      return data;
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  }, [apiRequest]);

  const getRoomByCode = useCallback(async (code) => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/rooms/${code.toUpperCase()}`);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiRequest]);

  const resetState = useCallback(() => {
    setScreen('lobby');
    setRoom(null);
    setPlayers([]);
    setMyCard(null);
    setMarkedNumbers([0]);
    setDrawnNumbers([]);
    setLastDrawn(null);
    setDrawCount(0);
    setWinner(null);
    setWinResult(null);
    setGameResults(null);
    setError(null);
    setCanCallLoto(false);
    setIsHost(false);
  }, []);

  const playAgain = useCallback(() => {
    resetState();
  }, [resetState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      lotoSocket.disconnectLotoSocket();
      socketInitialized.current = false;
    };
  }, []);

  return {
    // State
    screen, room, players, myCard, markedNumbers,
    drawnNumbers, lastDrawn, drawCount,
    winner, winResult, gameResults,
    error, loading, canCallLoto,
    leaderboard, gameHistory, isHost, userId,

    // Actions
    createRoom, joinRoom, startGame,
    requestDraw, markNumber, callLoto: callLotoFn,
    leaveRoom, fetchLeaderboard, fetchHistory,
    getRoomByCode, resetState, playAgain,
    setScreen, setError
  };
}
