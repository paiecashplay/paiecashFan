import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// Chat en direct du Live Boutique (façon Whatnot) : polling REST toutes les 5 s
// (même stratégie que le Fan Club), écritures optimistes, réactions emoji et
// « likes » (cœurs flottants). Le total de likes est cumulé côté serveur ;
// on expose `likeCount` pour que le consommateur fasse monter des cœurs à
// chaque incrément (qu'il vienne de soi ou des autres viewers).
const POLL_MS = 5000;

export function useShopLiveChat(liveId, { enabled = true } = {}) {
  const { user, profile } = useAuth();
  const currentUserId = user?.id || null;

  const [messages, setMessages] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timer = useRef(null);
  const aliveRef = useRef(true);
  const pendingRef = useRef(0); // écritures en cours → on ne les écrase pas au refresh

  const me = {
    id: currentUserId,
    name: profile?.display_name || profile?.username || 'Moi',
    avatar: profile?.avatar_url || null,
  };

  const load = useCallback(
    async (silent = false) => {
      if (!liveId) return;
      if (!silent) setLoading(true);
      try {
        const j = await apiFetch(`/api/v2/shop-live/${liveId}/chat`);
        if (!aliveRef.current) return;
        const d = j?.data || {};
        // On n'écrase pas la liste si une écriture optimiste est en vol.
        if (pendingRef.current === 0) setMessages(Array.isArray(d.messages) ? d.messages : []);
        setLikeCount((prev) => Math.max(prev, Number(d.likeCount || 0)));
        setError('');
      } catch (e) {
        if (aliveRef.current && !silent) setError(e.message || 'Chat indisponible.');
      } finally {
        if (aliveRef.current && !silent) setLoading(false);
      }
    },
    [liveId]
  );

  // Boucle de polling.
  useEffect(() => {
    aliveRef.current = true;
    if (!liveId || !enabled) return undefined;
    const tick = async () => {
      await load(true);
      if (aliveRef.current) timer.current = window.setTimeout(tick, POLL_MS);
    };
    load(false);
    timer.current = window.setTimeout(tick, POLL_MS);
    return () => {
      aliveRef.current = false;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [liveId, enabled, load]);

  const sendMessage = useCallback(
    async (raw) => {
      const content = String(raw || '').trim();
      if (!content || !currentUserId) return false;

      const tempId = `tmp-${currentUserId}-${content.length}-${messages.length}`;
      const optimistic = {
        id: tempId, authorId: currentUserId, author: me.name, avatar: me.avatar,
        content, createdAt: new Date().toISOString(), reactions: [], pending: true,
      };
      pendingRef.current += 1;
      setMessages((prev) => [...prev, optimistic]);

      try {
        const j = await apiFetch(`/api/v2/shop-live/${liveId}/chat/messages`, {
          method: 'POST', body: JSON.stringify({ content }),
        });
        const saved = j?.data?.message;
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...saved } : m)));
        return true;
      } catch (e) {
        // Retire l'optimiste et remonte l'erreur (ex. modération 422).
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError(e.message || 'Message refusé.');
        return false;
      } finally {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
      }
    },
    [liveId, currentUserId, me.name, me.avatar, messages.length]
  );

  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      if (!currentUserId) return;
      // Bascule optimiste de la puce.
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const list = [...(m.reactions || [])];
          const idx = list.findIndex((r) => r.emoji === emoji);
          if (idx === -1) return { ...m, reactions: [...list, { emoji, count: 1, mine: true }] };
          const r = list[idx];
          const next = { ...r, count: r.count + (r.mine ? -1 : 1), mine: !r.mine };
          if (next.count <= 0) list.splice(idx, 1);
          else list[idx] = next;
          return { ...m, reactions: list };
        })
      );
      try {
        await apiFetch(`/api/v2/shop-live/${liveId}/chat/messages/${messageId}/reactions`, {
          method: 'POST', body: JSON.stringify({ emoji }),
        });
      } catch { load(true); }
    },
    [liveId, currentUserId, load]
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!currentUserId) return;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      try {
        await apiFetch(`/api/v2/shop-live/${liveId}/chat/messages/${messageId}`, { method: 'DELETE' });
      } catch { load(true); }
    },
    [liveId, currentUserId, load]
  );

  const sendLike = useCallback(async () => {
    if (!currentUserId) return;
    setLikeCount((n) => n + 1); // optimiste → fait monter un cœur tout de suite
    try {
      const j = await apiFetch(`/api/v2/shop-live/${liveId}/like`, {
        method: 'POST', body: JSON.stringify({ count: 1 }),
      });
      const total = Number(j?.data?.likeCount);
      if (Number.isFinite(total)) setLikeCount((prev) => Math.max(prev, total));
    } catch { /* silencieux : un like raté n'est pas grave */ }
  }, [liveId, currentUserId]);

  return {
    messages, likeCount, loading, error,
    isLoggedIn: !!currentUserId, currentUserId,
    sendMessage, toggleReaction, deleteMessage, sendLike,
    clearError: () => setError(''),
  };
}
