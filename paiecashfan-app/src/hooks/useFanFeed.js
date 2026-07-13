import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

/**
 * Point d'entrée unique des données du Fan Club.
 *
 * Mode "club"    → persisté en base via /api/v2/clubs/:slug/fan-feed
 *                  (posts, commentaires, likes, chat).
 * Mode "friends" → salon privé, local/éphémère pour l'instant (pas encore
 *                  de système d'amis côté backend).
 *
 * La forme de sortie est identique à l'ancienne version (mocks) → les
 * composants d'affichage n'ont pas à changer.
 */

const FEED_PATH = (clubId) => `/api/v2/clubs/${encodeURIComponent(clubId)}/fan-feed`;

// Bandeau match (statique pour l'instant, non lié au feed).
const match = {
  homeTeam: 'Paris Saint-Germain', awayTeam: 'Marseille',
  homeScore: 2, awayScore: 1, competition: 'Ligue 1', minute: 85,
  supporters: '12 541', messages: '2 154', reactions: '18 521',
};

// ISO → libellé relatif FR ("à l'instant", "il y a 5 min", "il y a 2 h", date).
function formatRelative(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

const withRelative = (o) => ({ ...o, createdAt: formatRelative(o.createdAt) });

export function useFanFeed(clubId, mode = 'club') {
  const { user, profile } = useAuth();

  const [fans, setFans] = useState([]);
  const [clubPosts, setClubPosts] = useState([]);
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [clubMessages, setClubMessages] = useState([]);
  const [friendsMessages, setFriendsMessages] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const posts    = useMemo(() => (mode === 'club' ? clubPosts : friendsPosts), [mode, clubPosts, friendsPosts]);
  const messages = useMemo(() => (mode === 'club' ? clubMessages : friendsMessages), [mode, clubMessages, friendsMessages]);

  // Auteur courant (pour l'affichage optimiste) + injection dans `fans`.
  const me = useMemo(() => ({
    id: user?.id || 'me',
    name: profile?.display_name || 'Moi',
    avatar: profile?.avatar_url || null,
    initials: (profile?.display_name || 'Moi').trim().slice(0, 2).toUpperCase(),
    online: true,
  }), [user?.id, profile?.display_name, profile?.avatar_url]);

  const ensureMeInFans = useCallback(() => {
    setFans((prev) => (prev.some((f) => f.id === me.id) ? prev : [me, ...prev]));
  }, [me]);

  // Chargement du feed club depuis l'API. `silent` = pas de spinner (réconciliation).
  const loadFeed = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(FEED_PATH(clubId));
      const d = res?.data || {};
      setFans(d.fans || []);
      setClubPosts((d.posts || []).map(withRelative));
      setComments((d.comments || []).map(withRelative));
      setClubMessages((d.messages || []).map(withRelative));
    } catch (err) {
      setError(err?.message || 'Impossible de charger le Fan Club.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [clubId]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // ─── Actions ────────────────────────────────────────────────
  // Mode club → optimiste + POST API + réconciliation silencieuse.
  // Mode friends → local uniquement.

  const publishPost = useCallback((content) => {
    if (!user) return false;
    const c = content?.trim();
    if (!c) return false;

    const optimistic = { id: crypto.randomUUID(), authorId: me.id, content: c, createdAt: "à l'instant", likes: 0, comments: 0, likedByMe: false };
    if (mode === 'club') {
      ensureMeInFans();
      setClubPosts((p) => [optimistic, ...p]);
      apiFetch(`${FEED_PATH(clubId)}/posts`, { method: 'POST', body: JSON.stringify({ content: c }) })
        .then(() => loadFeed(true))
        .catch((e) => { setError(e.message); loadFeed(true); });
    } else {
      setFriendsPosts((p) => [optimistic, ...p]);
    }
    return true;
  }, [clubId, mode, me.id, ensureMeInFans, loadFeed]);

  const likePost = useCallback((postId) => {
    if (!user) return;
    const toggle = (list) => list.map((p) => p.id === postId
      ? { ...p, likedByMe: !p.likedByMe, likes: Number(p.likes || 0) + (p.likedByMe ? -1 : 1) }
      : p);
    if (mode === 'club') {
      setClubPosts(toggle);
      apiFetch(`${FEED_PATH(clubId)}/posts/${postId}/like`, { method: 'POST' })
        .then(() => loadFeed(true))
        .catch((e) => { setError(e.message); loadFeed(true); });
    } else {
      setFriendsPosts(toggle);
    }
  }, [clubId, mode, loadFeed]);

  const addComment = useCallback((postId, content) => {
    if (!user) return false;
    const c = content?.trim();
    if (!c) return false;

    const optimistic = { id: crypto.randomUUID(), postId, authorId: me.id, content: c, createdAt: "à l'instant" };
    const bump = (list) => list.map((p) => p.id === postId ? { ...p, comments: Number(p.comments || 0) + 1 } : p);

    ensureMeInFans();
    setComments((prev) => [...prev, optimistic]);
    if (mode === 'club') {
      setClubPosts(bump);
      apiFetch(`${FEED_PATH(clubId)}/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content: c }) })
        .then(() => loadFeed(true))
        .catch((e) => { setError(e.message); loadFeed(true); });
    } else {
      setFriendsPosts(bump);
    }
    return true;
  }, [clubId, mode, me.id, ensureMeInFans, loadFeed]);

  const sendMessage = useCallback((content) => {
    if (!user) return false;
    const c = content?.trim();
    if (!c) return false;

    const optimistic = { id: crypto.randomUUID(), authorId: me.id, author: me.name, content: c, createdAt: "à l'instant" };
    if (mode === 'club') {
      ensureMeInFans();
      setClubMessages((m) => [...m, optimistic]);
      apiFetch(`${FEED_PATH(clubId)}/messages`, { method: 'POST', body: JSON.stringify({ content: c }) })
        .then(() => loadFeed(true))
        .catch((e) => { setError(e.message); loadFeed(true); });
    } else {
      setFriendsMessages((m) => [...m, optimistic]);
    }
    return true;
  }, [clubId, mode, me.id, me.name, ensureMeInFans, loadFeed]);

  const isEmpty     = useMemo(() => !loading && !error && posts.length === 0, [loading, error, posts.length]);
  const isChatEmpty = useMemo(() => !loading && !error && messages.length === 0, [loading, error, messages.length]);

  return {
    fans, posts, comments, messages,
    loading, error, isEmpty, isChatEmpty,
    reload: loadFeed,
    publishPost, likePost, addComment, sendMessage,
    match,
  };
}
