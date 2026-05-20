// ═══════════════════════════════════════════════════════════════
// context/MatchDiscussionContext.jsx
// Follows the exact same pattern as ChatContext.jsx
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../api';
import {
  getMatchRooms,
  getMatchMessages,
  postMatchMessage,
  sendChallenge as apiSendChallenge,
  respondToChallenge,
} from '../data/matchRoomsData';

// ─── State Shape ────────────────────────────────────────────────
const initialState = {
  rooms:       [],
  activeRooms: [], // array of room objects
  messages:    {}, // { roomId: [msg1, msg2] }
  onlineCount: {}, // { roomId: count }
  loading:     {}, // { roomId: boolean }
  error:       null,
};

// ─── Reducer ────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'ADD_ACTIVE_ROOM':
      if (state.activeRooms.some(r => r.id === action.payload.id)) return state;
      return { 
        ...state, 
        activeRooms: [...state.activeRooms, action.payload],
        messages: { ...state.messages, [action.payload.id]: [] },
        onlineCount: { ...state.onlineCount, [action.payload.id]: 0 }
      };
    case 'REMOVE_ACTIVE_ROOM':
      return {
        ...state,
        activeRooms: state.activeRooms.filter(r => r.id !== action.payload)
      };
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: { ...state.messages, [action.payload.roomId]: action.payload.messages } 
      };
    case 'APPEND_MESSAGE': {
      const msg = action.payload;
      const roomMsgs = state.messages[msg.room_id] || [];
      // If a message with the same real UUID already exists, ignore
      if (roomMsgs.some(m => m.id === msg.id)) return state;
      // Remove any optimistic placeholder that matches content + sender
      const filtered = roomMsgs.filter(
        m => !(m._optimistic && m.message === msg.message && m.user_id === msg.user_id)
      );
      return { 
        ...state, 
        messages: { ...state.messages, [msg.room_id]: [...filtered, msg] } 
      };
    }
    case 'SET_ONLINE_COUNT':
      return { 
        ...state, 
        onlineCount: { ...state.onlineCount, [action.payload.roomId]: action.payload.count } 
      };
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: { ...state.loading, [action.payload.roomId]: action.payload.loading } 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────
const MatchDiscussionContext = createContext(null);

export function useMatchDiscussion() {
  const ctx = useContext(MatchDiscussionContext);
  if (!ctx) throw new Error('useMatchDiscussion must be used inside MatchDiscussionProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────
export function MatchDiscussionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const realtimeChannelsRef = useRef({});
  const presenceChannelsRef = useRef({});

  // ── Load all live rooms on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function loadRooms() {
      try {
        const rooms = await getMatchRooms('live');
        if (!cancelled) dispatch({ type: 'SET_ROOMS', payload: rooms });
      } catch (err) {
        if (!cancelled) dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }
    loadRooms();
    return () => { cancelled = true; };
  }, []);

  // ── Also subscribe to match_rooms table for live status updates ─
  useEffect(() => {
    const ch = supabase
      .channel('match-rooms-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_rooms' },
        payload => {
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'SET_ROOMS', payload: [] }); // trigger re-fetch
          }
          if (payload.eventType === 'UPDATE') {
            dispatch({
              type: 'SET_ROOMS',
              payload: state.rooms.map(r =>
                r.id === payload.new.id ? { ...r, ...payload.new } : r
              ),
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [state.rooms]);

  // ── Toggle room: open or close a chat window ─────
  const toggleRoom = useCallback(async (roomId) => {
    if (!roomId) return;

    // If room is already open, close it
    if (state.activeRooms.some(r => r.id === roomId)) {
      dispatch({ type: 'REMOVE_ACTIVE_ROOM', payload: roomId });
      
      if (realtimeChannelsRef.current[roomId]) {
        supabase.removeChannel(realtimeChannelsRef.current[roomId]);
        delete realtimeChannelsRef.current[roomId];
      }
      if (presenceChannelsRef.current[roomId]) {
        supabase.removeChannel(presenceChannelsRef.current[roomId]);
        delete presenceChannelsRef.current[roomId];
      }
      return;
    }

    // Open room
    const room = state.rooms.find(r => r.id === roomId) || { id: roomId };
    dispatch({ type: 'ADD_ACTIVE_ROOM', payload: room });
    dispatch({ type: 'SET_LOADING', payload: { roomId, loading: true } });

    try {
      // 1. Fetch existing messages
      const messages = await getMatchMessages(roomId);
      dispatch({ type: 'SET_MESSAGES', payload: { roomId, messages } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { roomId, loading: false } });
    }

    // 2. Subscribe to new messages for this room
    const msgChannel = supabase
      .channel(`match-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_messages',
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          dispatch({ type: 'APPEND_MESSAGE', payload: payload.new });
        }
      )
      .subscribe();
    realtimeChannelsRef.current[roomId] = msgChannel;

    // 3. Presence channel to track online count
    const userId = (() => {
      try {
        const raw = localStorage.getItem('pcc_user');
        return raw ? JSON.parse(raw).id : 'anon';
      } catch { return 'anon'; }
    })();

    const presenceChannel = supabase
      .channel(`presence-match-${roomId}`, { config: { presence: { key: userId } } })
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        dispatch({ type: 'SET_ONLINE_COUNT', payload: { roomId, count: Object.keys(presenceState).length } });
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ userId, room: roomId, joinedAt: new Date().toISOString() });
        }
      });
    presenceChannelsRef.current[roomId] = presenceChannel;
  }, [state.rooms, state.activeRooms]);

  // ── Send a text/reaction message (optimistic) ──────────────────
  const sendMessage = useCallback(async (roomId, message, messageType = 'text', metadata = null) => {
    if (!roomId) return;

    // Optimistic: derive user info from localStorage
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); } catch { return {}; }
    })();
    const userId = stored.id || 'anon';
    const username = stored.name || stored.email?.split('@')[0] || 'Fan';
    const colors = ['#00ff88', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const avatarColor = colors[parseInt(userId.replace(/\D/g, '').slice(0, 4) || '0') % colors.length];

    const optimistic = {
      id:           `_opt_${Date.now()}`,
      room_id:      roomId,
      user_id:      userId,
      username,
      avatar_color: avatarColor,
      message,
      message_type: messageType,
      metadata,
      created_at:   new Date().toISOString(),
      _optimistic:  true,
    };
    dispatch({ type: 'APPEND_MESSAGE', payload: optimistic });

    try {
      const saved = await postMatchMessage(roomId, { message, message_type: messageType, metadata });
      if (saved) dispatch({ type: 'APPEND_MESSAGE', payload: saved });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  }, []);

  // ── Send a game challenge ──────────────────────────────────────
  const sendChallenge = useCallback(async (roomId, challengedId, gameId, gameName) => {
    if (!roomId) return;
    try {
      await apiSendChallenge(roomId, {
        challenged_id: challengedId,
        game_id: gameId,
        game_name: gameName,
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send challenge' });
    }
  }, []);

  // ── Respond to a challenge ─────────────────────────────────────
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
      Object.values(realtimeChannelsRef.current).forEach(ch => supabase.removeChannel(ch));
      Object.values(presenceChannelsRef.current).forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  const value = {
    rooms:           state.rooms,
    activeRooms:     state.activeRooms,
    messages:        state.messages,
    onlineCount:     state.onlineCount,
    loading:         state.loading,
    error:           state.error,
    toggleRoom,
    sendMessage,
    sendChallenge,
    respondChallenge,
  };

  return (
    <MatchDiscussionContext.Provider value={value}>
      {children}
    </MatchDiscussionContext.Provider>
  );
}
