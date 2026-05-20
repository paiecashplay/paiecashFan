// ═══════════════════════════════════════════════════════════════
// context/ChallengeSessionContext.jsx
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../api';

function getApiBase() {
  const IS_LOCAL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
}

const getAuthHeaders = () => {
  const token = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}').token; } catch { return null; }
  })();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const initialState = {
  activeSession: null,
  opponentScore: 0,
  myScore: 0,
  sessionStatus: null,
  result: null,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { 
        ...state, 
        activeSession: action.payload,
        sessionStatus: action.payload?.status || null
      };
    case 'SET_MY_SCORE':
      return { ...state, myScore: action.payload };
    case 'SET_OPPONENT_SCORE':
      return { ...state, opponentScore: action.payload };
    case 'SET_STATUS':
      return { ...state, sessionStatus: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const ChallengeSessionContext = createContext(null);

export function useChallengeSession() {
  const ctx = useContext(ChallengeSessionContext);
  if (!ctx) throw new Error('useChallengeSession must be used inside ChallengeSessionProvider');
  return ctx;
}

export function ChallengeSessionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sessionChannelRef = useRef(null);
  const scoreChannelRef = useRef(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
  })();

  const joinSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // 1. Fetch initial state
      const res = await fetch(`${API_BASE}/match-rooms/challenge-sessions/${sessionId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch session');
      
      dispatch({ type: 'SET_SESSION', payload: data.data.session });
      
      // Determine initial scores
      const session = data.data.session;
      if (session.challenger_id === currentUser.id) {
        dispatch({ type: 'SET_MY_SCORE', payload: session.challenger_score });
        dispatch({ type: 'SET_OPPONENT_SCORE', payload: session.challenged_score });
      } else {
        dispatch({ type: 'SET_MY_SCORE', payload: session.challenged_score });
        dispatch({ type: 'SET_OPPONENT_SCORE', payload: session.challenger_score });
      }

      // Cleanup existing subscriptions
      if (sessionChannelRef.current) supabase.removeChannel(sessionChannelRef.current);
      if (scoreChannelRef.current) supabase.removeChannel(scoreChannelRef.current);

      // 2. Subscribe to session changes
      const sessionChannel = supabase
        .channel(`challenge_sessions_${sessionId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'challenge_sessions', filter: `id=eq.${sessionId}` },
          payload => {
            dispatch({ type: 'SET_SESSION', payload: payload.new });
            if (payload.new.status === 'completed' && payload.new.winner_id) {
              // Extract final result
              const myScore = payload.new.challenger_id === currentUser.id ? payload.new.challenger_score : payload.new.challenged_score;
              const opScore = payload.new.challenger_id === currentUser.id ? payload.new.challenged_score : payload.new.challenger_score;
              dispatch({ 
                type: 'SET_RESULT', 
                payload: { winnerId: payload.new.winner_id, myScore, opponentScore: opScore } 
              });
            }
          }
        )
        .subscribe();
      sessionChannelRef.current = sessionChannel;

      // 3. Subscribe to live score updates
      const scoreChannel = supabase
        .channel(`challenge_scores_${sessionId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'challenge_score_updates', filter: `session_id=eq.${sessionId}` },
          payload => {
            if (payload.new.user_id !== currentUser.id) {
              dispatch({ type: 'SET_OPPONENT_SCORE', payload: payload.new.score });
            }
          }
        )
        .subscribe();
      scoreChannelRef.current = scoreChannel;

    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [currentUser.id]);

  const markReady = useCallback(async (sessionId) => {
    try {
      await fetch(`${API_BASE}/match-rooms/challenge-sessions/${sessionId}/ready`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error('Failed to mark ready', err);
    }
  }, []);

  const reportScore = useCallback(async (sessionId, score) => {
    dispatch({ type: 'SET_MY_SCORE', payload: score });
    try {
      await fetch(`${API_BASE}/match-rooms/challenge-sessions/${sessionId}/score`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ score })
      });
    } catch (err) {
      console.error('Failed to report score', err);
    }
  }, []);

  const finishSession = useCallback(async (sessionId, winnerId) => {
    try {
      await fetch(`${API_BASE}/match-rooms/challenge-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ winner_id: winnerId })
      });
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (sessionChannelRef.current) supabase.removeChannel(sessionChannelRef.current);
      if (scoreChannelRef.current) supabase.removeChannel(scoreChannelRef.current);
    };
  }, []);

  const value = {
    ...state,
    joinSession,
    markReady,
    reportScore,
    finishSession
  };

  return (
    <ChallengeSessionContext.Provider value={value}>
      {children}
    </ChallengeSessionContext.Provider>
  );
}
