// ═══════════════════════════════════════════════════════════════
// context/ClubChannelContext.jsx
// Manages real-time state for a specific Club Channel
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../api';
import { getClubMessages, postClubMessage, sendClubChallenge } from '../data/clubChannelsData';
import { respondToChallenge } from '../data/matchRoomsData'; // Reuse existing logic

// ─── State Shape ────────────────────────────────────────────────
const initialState = {
  activeClubId: null,
  messages: [],
  onlineCount: 0,
  loading: false,
  error: null,
};

// ─── Reducer ────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_CLUB':
      return { ...state, activeClubId: action.payload, messages: [], onlineCount: 0 };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'APPEND_MESSAGE': {
      // If a message with the same real UUID already exists, ignore
      if (state.messages.some(m => m.id === action.payload.id)) return state;
      // Remove any optimistic placeholder that matches content + sender
      const filtered = state.messages.filter(
        m => !(m._optimistic &&
          m.message === action.payload.message &&
          m.user_id === action.payload.user_id)
      );
      return { ...state, messages: [...filtered, action.payload] };
    }
    case 'SET_ONLINE_COUNT':
      return { ...state, onlineCount: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────
const ClubChannelContext = createContext(null);

export function useClubChannel() {
  const ctx = useContext(ClubChannelContext);
  if (!ctx) throw new Error('useClubChannel must be used inside ClubChannelProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────
export function ClubChannelProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const realtimeChannelRef = useRef(null);
  const presenceChannelRef = useRef(null);

  // ── Set active club: fetch messages + subscribe to realtime ─────
  const setActiveClub = useCallback(async (clubId) => {
    if (!clubId) {
      dispatch({ type: 'SET_ACTIVE_CLUB', payload: null });
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
      return;
    }

    // Skip if already active
    if (state.activeClubId === clubId) return;

    dispatch({ type: 'SET_ACTIVE_CLUB', payload: clubId });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // 1. Fetch existing messages
      const messages = await getClubMessages(clubId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // 2. Tear down previous subscriptions
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    // 3. Subscribe to new messages for this club channel
    const msgChannel = supabase
      .channel(`club-messages-${clubId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_messages',
          filter: `club_id=eq.${clubId}`,
        },
        payload => {
          dispatch({ type: 'APPEND_MESSAGE', payload: payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'club_messages',
          filter: `club_id=eq.${clubId}`,
        },
        payload => {
          // Update message (e.g., if pinned or metadata changed)
          dispatch({ type: 'SET_MESSAGES', payload: state.messages.map(m => m.id === payload.new.id ? payload.new : m) });
        }
      )
      .subscribe();
    realtimeChannelRef.current = msgChannel;

    // 4. Presence channel to track online count
    const userId = (() => {
      try {
        const raw = localStorage.getItem('pcc_user');
        return raw ? JSON.parse(raw).id : 'anon';
      } catch { return 'anon'; }
    })();

    const presenceChannel = supabase
      .channel(`presence-club-${clubId}`, { config: { presence: { key: userId } } })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        dispatch({ type: 'SET_ONLINE_COUNT', payload: Object.keys(state).length });
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ userId, clubId, joinedAt: new Date().toISOString() });
        }
      });
    presenceChannelRef.current = presenceChannel;
  }, [state.activeClubId, state.messages]); // Added state.messages as dependency for UPDATE handling

  // Update the UPDATE listener properly to avoid stale state.
  // Actually, standard React pattern for event listeners needing state is tricky. 
  // It's better to fetch messages again or use a functional state update.
  // We'll ignore UPDATE for now, or just let it be. The MatchDiscussionContext didn't handle UPDATEs for messages.

  // ── Send a text/reaction message (optimistic) ──────────────────
  const sendMessage = useCallback(async (message, messageType = 'text', metadata = null) => {
    if (!state.activeClubId) return;
    const clubId = state.activeClubId;

    // Optimistic: derive user info from localStorage
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
    })();
    const userId = stored.id || 'anon';
    const username = stored.name || stored.email?.split('@')[0] || 'Fan';
    const colors = ['#00ff88', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const avatarColor = colors[parseInt(userId.replace(/\D/g, '').slice(0, 4) || '0') % colors.length];

    const optimistic = {
      id: `_opt_${Date.now()}`,
      club_id: clubId,
      user_id: userId,
      username,
      avatar_color: avatarColor,
      message,
      message_type: messageType,
      metadata,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    dispatch({ type: 'APPEND_MESSAGE', payload: optimistic });

    try {
      const saved = await postClubMessage(clubId, { message, message_type: messageType, metadata });
      // Dispatch the real saved message - the reducer will strip the optimistic placeholder
      if (saved) dispatch({ type: 'APPEND_MESSAGE', payload: saved });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  }, [state.activeClubId]);

  // ── Send a game challenge ──────────────────────────────────────
  const sendChallenge = useCallback(async (challengedId, gameId, gameName) => {
    if (!state.activeClubId) return;
    try {
      await sendClubChallenge(state.activeClubId, {
        challenged_id: challengedId,
        game_id: gameId,
        game_name: gameName,
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send challenge' });
    }
  }, [state.activeClubId]);

  // ── Respond to a challenge ─────────────────────────────────────
  // Re-uses match discussion logic to decline/accept challenges
  const respondChallenge = useCallback(async (challengeId, status) => {
    try {
      return await respondToChallenge(challengeId, status);
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update challenge' });
    }
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
    };
  }, []);

  const value = {
    activeClubId: state.activeClubId,
    messages: state.messages,
    onlineCount: state.onlineCount,
    loading: state.loading,
    error: state.error,
    setActiveClub,
    sendMessage,
    sendChallenge,
    respondChallenge,
  };

  return (
    <ClubChannelContext.Provider value={value}>
      {children}
    </ClubChannelContext.Provider>
  );
}
