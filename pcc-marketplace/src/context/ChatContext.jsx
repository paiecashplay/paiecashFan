import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import { apiFetch } from '../lib/chatHelpers';
import { supabase } from '../api';
import { useToast } from './ToastContext';

const ChatContext = createContext(null);

export const useChatContext = () => useContext(ChatContext);

const initialState = {
  friends: [],
  pendingRequests: [],
  totalUnread: 0,
  loading: false,
  initialized: false,
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_FRIENDS':
      return { ...state, friends: action.payload };
    case 'SET_REQUESTS':
      return { ...state, pendingRequests: action.payload };
    case 'SET_UNREAD':
      return { ...state, totalUnread: action.payload };
    case 'ADD_REQUEST':
      // Avoid duplicates
      if (state.pendingRequests.some(r => r.requestId === action.payload.requestId)) return state;
      return { ...state, pendingRequests: [action.payload, ...state.pendingRequests] };
    case 'REMOVE_REQUEST':
      return {
        ...state,
        pendingRequests: state.pendingRequests.filter(r => r.requestId !== action.payload)
      };
    case 'UPDATE_FRIEND_LAST_MSG':
      return {
        ...state,
        friends: state.friends.map(f => {
          if (f.profile.user_id === action.payload.friendId) {
            return {
              ...f,
              lastMessage: action.payload.message,
              unreadCount: f.unreadCount + (action.payload.incrementUnread ? 1 : 0)
            };
          }
          return f;
        }).sort((a, b) => {
          const aTime = a.lastMessage?.created_at || a.profile.created_at;
          const bTime = b.lastMessage?.created_at || b.profile.created_at;
          return new Date(bTime) - new Date(aTime);
        })
      };
    case 'INCREMENT_UNREAD':
      return { ...state, totalUnread: state.totalUnread + 1 };
    case 'DECREMENT_UNREAD':
      return { ...state, totalUnread: Math.max(0, state.totalUnread - action.payload) };
    case 'UPDATE_FRIEND_UNREAD':
      return {
        ...state,
        friends: state.friends.map(f =>
          f.profile.user_id === action.payload.friendId
            ? { ...f, unreadCount: Math.max(0, f.unreadCount - action.payload.count) }
            : f
        )
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    default:
      return state;
  }
}

// Helper to get userId from localStorage - used throughout
function getStoredUserId() {
  try {
    const userObj = JSON.parse(localStorage.getItem('pcc_user'));
    return userObj?.id || userObj?._id || userObj?.userId || null;
  } catch {
    return null;
  }
}

function getStoredUserProfile() {
  try {
    return JSON.parse(localStorage.getItem('pcc_user'));
  } catch {
    return null;
  }
}

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { showToast } = useToast();
  const initChatRef = useRef(false);
  const channelRef = useRef(null);

  const userId = getStoredUserId();

  // ─── Data fetchers ─────────────────────────────────────
  const refreshFriends = useCallback(async () => {
    try {
      const { data } = await apiFetch('/api/chat/friends');
      dispatch({ type: 'SET_FRIENDS', payload: data || [] });
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    try {
      const { data } = await apiFetch('/api/chat/requests/pending');
      dispatch({ type: 'SET_REQUESTS', payload: data || [] });
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await apiFetch('/api/chat/unread-count');
      dispatch({ type: 'SET_UNREAD', payload: data?.count || 0 });
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // ─── Init once on mount ────────────────────────────────
  useEffect(() => {
    if (!userId || initChatRef.current) return;
    initChatRef.current = true;

    const userProfile = getStoredUserProfile();
    if (!userProfile) return;

    const init = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // 1. Register/sync chat profile
        await apiFetch('/api/chat/profile', {
          method: 'POST',
          body: JSON.stringify({
            username: userProfile.username || userProfile.name || `user_${userId.substring(0, 6)}`
          })
        });

        // 2. Fetch initial data
        await Promise.all([refreshFriends(), refreshRequests(), refreshUnread()]);

        // 3. Set online status
        await apiFetch('/api/chat/online-status', {
          method: 'PATCH',
          body: JSON.stringify({ isOnline: true })
        });

        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } catch (err) {
        console.error('Chat initialization failed:', err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    init();
  }, [userId, refreshFriends, refreshRequests, refreshUnread]);

  // ─── Realtime subscriptions ────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Clean up old channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`chat-global-${userId}`);
    channelRef.current = channel;

    channel
      // New friend request received
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'friend_requests',
        filter: `receiver_id=eq.${userId}`
      }, async (payload) => {
        try {
          const { data } = await apiFetch('/api/chat/requests/pending');
          const newReq = data?.find(r => r.requestId === payload.new.id);
          if (newReq) {
            dispatch({ type: 'ADD_REQUEST', payload: newReq });
            showToast(`New friend request from ${newReq.sender.username}`, 'success');
          } else {
            refreshRequests();
          }
        } catch {
          refreshRequests();
        }
      })
      // Friend request status updated (accepted/declined)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'friend_requests',
      }, (payload) => {
        const req = payload.new;
        if (req.sender_id === userId || req.receiver_id === userId) {
          if (req.status === 'accepted') {
            refreshFriends();
            if (req.sender_id === userId) {
              showToast('Your friend request was accepted!', 'success');
            }
          }
          // Remove from pending if we were the receiver
          if (req.receiver_id === userId) {
            dispatch({ type: 'REMOVE_REQUEST', payload: req.id });
          }
        }
      })
      // New message received (for sidebar badge updates)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${userId}`
      }, (payload) => {
        const msg = payload.new;
        dispatch({ type: 'INCREMENT_UNREAD' });
        dispatch({
          type: 'UPDATE_FRIEND_LAST_MSG',
          payload: { friendId: msg.sender_id, message: msg, incrementUnread: true }
        });
      })
      .subscribe();

    // On window close, try to set offline
    const handleBeforeUnload = () => {
      const raw = localStorage.getItem('pcc_user');
      let token = null;
      try { token = JSON.parse(raw)?.token; } catch { }
      if (token) {
        const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const baseUrl = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
        // sendBeacon can't set custom headers, so pass token in body
        navigator.sendBeacon(
          `${baseUrl}/api/chat/online-status-beacon`,
          new Blob([JSON.stringify({ isOnline: false, token })], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      window.removeEventListener('beforeunload', handleBeforeUnload);

      apiFetch('/api/chat/online-status', {
        method: 'PATCH',
        body: JSON.stringify({ isOnline: false })
      }).catch(() => { });
    };
  }, [userId, refreshFriends, refreshRequests, showToast]);

  // ─── Request notification permission ───────────────────
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ─── Actions ───────────────────────────────────────────
  const sendFriendRequest = useCallback(async (receiverId) => {
    try {
      const { data } = await apiFetch('/api/chat/requests', {
        method: 'POST',
        body: JSON.stringify({ receiverId })
      });
      showToast('Friend request sent!', 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Failed to send request', 'error');
      throw err;
    }
  }, [showToast]);

  const acceptRequest = useCallback(async (requestId) => {
    try {
      await apiFetch(`/api/chat/requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'accepted' })
      });
      dispatch({ type: 'REMOVE_REQUEST', payload: requestId });
      showToast('Friend request accepted!', 'success');
      await refreshFriends();
    } catch (err) {
      showToast(err.message || 'Failed to accept request', 'error');
      throw err;
    }
  }, [showToast, refreshFriends]);

  const declineRequest = useCallback(async (requestId) => {
    try {
      await apiFetch(`/api/chat/requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'declined' })
      });
      dispatch({ type: 'REMOVE_REQUEST', payload: requestId });
      showToast('Friend request declined', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to decline request', 'error');
      throw err;
    }
  }, [showToast]);

  const decrementUnread = useCallback((count, friendId) => {
    if (count > 0) {
      dispatch({ type: 'DECREMENT_UNREAD', payload: count });
      if (friendId) {
        dispatch({ type: 'UPDATE_FRIEND_UNREAD', payload: { friendId, count } });
      }
    }
  }, []);

  const updateFriendLastMsg = useCallback((friendId, message) => {
    dispatch({ type: 'UPDATE_FRIEND_LAST_MSG', payload: { friendId, message, incrementUnread: false } });
  }, []);

  const value = {
    ...state,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    refreshFriends,
    refreshRequests,
    decrementUnread,
    updateFriendLastMsg
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
