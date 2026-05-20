import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, getConversationId } from '../lib/chatHelpers';
import { supabase } from '../api';
import { useChatContext } from '../context/ChatContext';
import { useToast } from '../context/ToastContext';

/**
 * Get the current user ID from localStorage.
 * Extracted as a module-level helper so it's stable (no React dependency).
 */
function getStoredUserId() {
  try {
    const userObj = JSON.parse(localStorage.getItem('pcc_user'));
    return userObj?.id || userObj?._id || userObj?.userId || null;
  } catch {
    return null;
  }
}

export function useMessages(friendId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const channelStatusRef = useRef('CLOSED');
  const pollIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const { decrementUnread, updateFriendLastMsg } = useChatContext();
  const { showToast } = useToast();

  const currentUserId = getStoredUserId();
  const conversationId = currentUserId && friendId ? getConversationId(currentUserId, friendId) : null;

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      const parent = messagesEndRef.current.parentElement;
      if (parent) {
        parent.scrollTo({
          top: parent.scrollHeight,
          behavior
        });
      }
    }
  }, []);

  // ─── Poll for new messages (fallback for when Realtime doesn't work) ───
  const pollNewMessages = useCallback(async () => {
    if (!friendId || !currentUserId || !isMountedRef.current) return;

    try {
      const { data } = await apiFetch(`/api/chat/messages/${friendId}?limit=50&offset=0`);
      if (!isMountedRef.current) return;

      const newMessages = data.messages || [];

      setMessages(prev => {
        const pendingMsgs = prev.filter(m => m.pending);
        const prevReal = prev.filter(m => !m.pending);

        // Resolve pending messages that now exist in the real newMessages
        const resolvedIds = new Set();
        pendingMsgs.forEach(pm => {
          const match = newMessages.find(nm => nm.sender_id === pm.sender_id && nm.content === pm.content);
          if (match) resolvedIds.add(pm.id);
        });

        const unresolvedPending = pendingMsgs.filter(pm => !resolvedIds.has(pm.id));

        const prevIds = new Set(prevReal.map(m => m.id));
        const trulyNew = newMessages.filter(nm => !prevIds.has(nm.id));

        let hasChanges = trulyNew.length > 0 || unresolvedPending.length !== pendingMsgs.length;

        // Check if any existing messages changed read status
        const updatedPrevReal = prevReal.map(m => {
          const nm = newMessages.find(x => x.id === m.id);
          if (nm && nm.is_read !== m.is_read) {
            hasChanges = true;
            return { ...m, is_read: nm.is_read };
          }
          return m;
        });

        if (!hasChanges) {
          return prev;
        }

        const merged = [...updatedPrevReal, ...trulyNew, ...unresolvedPending];

        if (trulyNew.some(nm => nm.sender_id === friendId)) {
          setTimeout(() => scrollToBottom('smooth'), 100);
        }

        return merged;
      });

      // Mark as read if there are unread messages from the friend
      const hasUnread = newMessages.some(m => m.sender_id === friendId && !m.is_read);
      if (hasUnread) {
        try {
          await apiFetch(`/api/chat/messages/read/${friendId}`, { method: 'PATCH' });
          decrementUnread(999, friendId);
        } catch { }
      }
    } catch (err) {
      // Silent fail
    }
  }, [friendId, currentUserId, scrollToBottom, decrementUnread]);

  // ─── Start/stop polling ─────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(pollNewMessages, 3000);
  }, [pollNewMessages]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ─── Load messages & subscribe to realtime ─────────────
  useEffect(() => {
    if (!friendId || !currentUserId || !conversationId) return;

    isMountedRef.current = true;

    const initMessages = async () => {
      setLoading(true);
      setError(null);
      setMessages([]);
      setOffset(0);

      try {
        const { data } = await apiFetch(`/api/chat/messages/${friendId}?limit=50&offset=0`);
        if (isMountedRef.current) {
          setMessages(data.messages || []);
          setHasMore(data.hasMore);
          setOffset(50);
          setTimeout(() => scrollToBottom('auto'), 100);
        }

        // Mark as read if there are unread messages
        try {
          await apiFetch(`/api/chat/messages/read/${friendId}`, { method: 'PATCH' });
          // We don't know the exact count here, so just refresh - 
          // the context will reconcile
          decrementUnread(999, friendId); // reset to 0 for this friend
        } catch { }

      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load messages');
          showToast(err.message || 'Failed to load messages', 'error');
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    initMessages();

    // ─── Realtime subscription for this conversation ──────
    // Clean up old channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(`chat-conv-${conversationId}`, {
      config: {
        broadcast: { ack: true },
      },
    });
    channelRef.current = channel;

    let realtimeWorking = false;

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        const newMsg = payload.new;
        realtimeWorking = true;

        if (pollIntervalRef.current) {
          stopPolling();
        }

        if (isMountedRef.current) {
          // Clear typing indicator when receiving a message from them
          if (newMsg.sender_id === friendId) {
            setIsTyping(false);
          }

          // Add to local state unless it's an optimistic message we already added
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            // Also remove any optimistic message that matches this one
            const filtered = prev.filter(m => {
              if (!m.pending) return true;
              // If the pending message content and sender match, remove it (it's the real version)
              return !(m.sender_id === newMsg.sender_id && m.content === newMsg.content);
            });
            return [...filtered, newMsg];
          });

          // If from friend, mark as read
          if (newMsg.sender_id === friendId) {
            try {
              await apiFetch(`/api/chat/messages/read/${friendId}`, { method: 'PATCH' });
              decrementUnread(1, friendId);
            } catch { }
          }
          setTimeout(() => scrollToBottom('smooth'), 100);
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === friendId) {
          setIsTyping(payload.payload.isTyping);
          // Auto clear after 3 seconds of no typing events
          if (payload.payload.isTyping) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current) setIsTyping(false);
            }, 3000);
          }
        }
      })
      .subscribe((status) => {
        channelStatusRef.current = status;
        console.log(`[Chat Channel] ${conversationId} → ${status}`);

        if (status === 'SUBSCRIBED') {
          setTimeout(() => {
            if (!realtimeWorking && isMountedRef.current) {
              console.log('[Chat] Realtime not delivering events - starting poll fallback');
              startPolling();
            }
          }, 4000);
        }
      });

    startPolling();

    return () => {
      isMountedRef.current = false;
      channelStatusRef.current = 'CLOSED';
      stopPolling();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // NOTE: Only depend on friendId - the other values are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId]);

  // ─── Send a message ────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !friendId || !currentUserId) return;

    setSending(true);

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUserId,
      receiver_id: friendId,
      content: content.trim(),
      is_read: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      pending: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Update friend's last message in sidebar
    updateFriendLastMsg(friendId, optimisticMessage);

    try {
      const { data } = await apiFetch('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: friendId, content: content.trim() })
      });

      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, pending: false } : m));
      updateFriendLastMsg(friendId, data);
    } catch (err) {
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  }, [friendId, currentUserId, conversationId, scrollToBottom, updateFriendLastMsg, showToast]);

  // ─── Load older messages ───────────────────────────────
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !friendId) return;

    setLoading(true);
    try {
      const { data } = await apiFetch(`/api/chat/messages/${friendId}?limit=50&offset=${offset}`);

      setMessages(prev => [...(data.messages || []), ...prev]);
      setHasMore(data.hasMore);
      setOffset(prev => prev + 50);
    } catch (err) {
      showToast(err.message || 'Failed to load more messages', 'error');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, friendId, offset, showToast]);

  // ─── Typing Status ─────────────────────────────────────
  const sendTypingStatus = useCallback((typing) => {
    if (channelRef.current && currentUserId && channelStatusRef.current === 'SUBSCRIBED') {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping: typing }
      }).catch(() => { });
    }
  }, [currentUserId]);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    isTyping,
    sendMessage,
    loadMore,
    sendTypingStatus,
    messagesEndRef
  };
}
