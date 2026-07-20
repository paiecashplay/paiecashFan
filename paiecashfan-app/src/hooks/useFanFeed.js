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

// Callbacks de refus (le serveur a dit non, ce n'est pas une panne) :
//  · onModerationBlock(moderation, draft) → contenu refusé par l'IA (422)
//  · onAccessDenied(data)                 → charte manquante ou sanction (403)
// On remonte le contexte à l'appelant au lieu d'afficher une erreur brute.
export function useFanFeed(clubId, mode = 'club', { onModerationBlock, onAccessDenied } = {}) {
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

  // Échec d'écriture. Un refus de modération (422) n'est PAS une panne : on le
  // remonte tel quel pour l'expliquer. Dans les deux cas on recharge le feed,
  // ce qui retire l'affichage optimiste du contenu non publié.
  const handleWriteError = useCallback((e, draft) => {
    if (e?.status === 422 && e.data?.moderation) onModerationBlock?.(e.data.moderation, draft);
    // 403 = charte manquante ou sanction. On laisse l'appelant rouvrir la
    // charte / rafraîchir l'accès, plutôt que d'afficher une erreur brute.
    else if (e?.status === 403) onAccessDenied?.(e.data || {});
    else setError(e.message);
    loadFeed(true);
  }, [onModerationBlock, onAccessDenied, loadFeed]);

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
        .catch((e) => handleWriteError(e, c));
    } else {
      setFriendsPosts((p) => [optimistic, ...p]);
    }
    return true;
  }, [clubId, mode, me.id, ensureMeInFans, loadFeed, handleWriteError]);

  const updatePost = useCallback((postId, content) => {
    if (!user) return false;

    const cleanContent = content?.trim();

    if (!postId || !cleanContent) {
      return false;
    }

    if (mode === 'friends') {
      setFriendsPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                content: cleanContent,
                edited: true,
              }
            : post
        )
      );

      return true;
    }

    let previousPost = null;

    // Modification immédiate dans l’interface.
    setClubPosts((posts) =>
      posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        previousPost = post;

        return {
          ...post,
          content: cleanContent,
          edited: true,
        };
      })
    );

    // Requête backend sans bloquer l’interface.
    apiFetch(
      `${FEED_PATH(clubId)}/posts/${encodeURIComponent(postId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          content: cleanContent,
        }),
      }
    ).then((response) => {
        const updatedPost =
          response?.data?.post ??
          response?.post ??
          null;

        if (!updatedPost) return;

        setClubPosts((posts) =>
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  ...updatedPost,
                  content:
                    updatedPost.content ??
                    cleanContent,
                  createdAt: post.createdAt,
                  edited: true,
                }
              : post
          )
        );
      })
      .catch((error) => {
        if (previousPost) {
          setClubPosts((posts) =>
            posts.map((post) =>
              post.id === postId
                ? previousPost
                : post
            )
          );
        } else {
          loadFeed(true);
        }

        handleWriteError(error, cleanContent);
      });

    return true;
  }, [user, mode, clubId, loadFeed, handleWriteError]);

  const deletePost = useCallback((postId) => {
    if (!user || !postId) {
      return false;
    }

    if (mode === 'friends') {
      setFriendsPosts((posts) =>
        posts.filter((post) => post.id !== postId)
      );

      setComments((comments) =>
        comments.filter(
          (comment) => comment.postId !== postId
        )
      );

      return true;
    }

    let previousPost = null;
    let previousPostComments = [];

    setClubPosts((posts) => {
      previousPost =
        posts.find((post) => post.id === postId) ??
        null;

      return posts.filter(
        (post) => post.id !== postId
      );
    });

    setComments((currentComments) => {
      previousPostComments = currentComments.filter(
        (comment) => comment.postId === postId
      );

      return currentComments.filter(
        (comment) => comment.postId !== postId
      );
    });

    apiFetch(
      `${FEED_PATH(clubId)}/posts/${encodeURIComponent(postId)}`,
      {
        method: 'DELETE',
      }
    ).catch((error) => {
      // Restauration de la publication.
      if (previousPost) {
        setClubPosts((posts) => {
          const alreadyExists = posts.some(
            (post) => post.id === postId
          );

          if (alreadyExists) {
            return posts;
          }

          return [previousPost, ...posts];
        });
      }

      // Restauration de ses commentaires.
      if (previousPostComments.length > 0) {
        setComments((currentComments) => {
          const existingIds = new Set(
            currentComments.map((comment) => comment.id)
          );

          const missingComments =
            previousPostComments.filter(
              (comment) => !existingIds.has(comment.id)
            );

          return [
            ...currentComments,
            ...missingComments,
          ];
        });
      }

      if (error?.status === 403) {
        onAccessDenied?.(error.data || {});
      } else {
        setError(
          error?.message ||
            'Impossible de supprimer la publication.'
        );
      }
    });

  return true;
  }, [user, mode, clubId, onAccessDenied]);

  const updateComment = useCallback((commentId, content) => {
    if (!user) return false;

    const cleanContent = content?.trim();

    if (!commentId || !cleanContent) {
      return false;
    }

    let previousComment = null;

    setComments((currentComments) =>
      currentComments.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }

        previousComment = comment;

        return {
          ...comment,
          content: cleanContent,
          edited: true,
        };
      })
    );

    if (mode === 'friends') {
      return true;
    }

    apiFetch(
      `${FEED_PATH(clubId)}/comments/${encodeURIComponent(commentId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          content: cleanContent,
        }),
      }
    ).then((response) => {
        const updatedComment =
          response?.data?.comment ??
          response?.comment ??
          null;

        if (!updatedComment) return;

        setComments((currentComments) =>
          currentComments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  ...updatedComment,
                  content:
                    updatedComment.content ??
                    cleanContent,
                  createdAt: comment.createdAt,
                  edited: true,
                }
              : comment
          )
        );
      }).catch((error) => {
        if (previousComment) {
          setComments((currentComments) =>
            currentComments.map((comment) =>
              comment.id === commentId
                ? previousComment
                : comment
            )
          );
        } else {
          loadFeed(true);
        }

        handleWriteError(error, cleanContent);
      });

    return true;
  },[user, mode, clubId, loadFeed, handleWriteError]);

  const deleteComment = useCallback((commentId) => {
    if (!user || !commentId) {
      return false;
    }

    let previousComment = null;

    setComments((currentComments) => {
      previousComment =
        currentComments.find(
          (comment) => comment.id === commentId
        ) ?? null;

      return currentComments.filter(
        (comment) => comment.id !== commentId
      );
    });

    // Diminue immédiatement le compteur du post.
    const decreaseCommentCount = (posts) =>
      posts.map((post) =>
        post.id === previousComment?.postId
          ? {
              ...post,
              comments: Math.max(
                0,
                Number(post.comments || 0) - 1
              ),
            }
          : post
      );

    if (mode === 'friends') {
      setFriendsPosts(decreaseCommentCount);
      return true;
    }

    setClubPosts(decreaseCommentCount);

    apiFetch(
      `${FEED_PATH(clubId)}/comments/${encodeURIComponent(commentId)}`,
      {
        method: 'DELETE',
      }
    ).catch((error) => {
      if (previousComment) {
        setComments((currentComments) => {
          const alreadyExists =
            currentComments.some(
              (comment) =>
                comment.id === commentId
            );

          if (alreadyExists) {
            return currentComments;
          }

          return [
            ...currentComments,
            previousComment,
          ];
        });

        // Remet le compteur en cas d’échec.
        setClubPosts((posts) =>
          posts.map((post) =>
            post.id === previousComment.postId
              ? {
                  ...post,
                  comments:
                    Number(post.comments || 0) + 1,
                }
              : post
          )
        );
      }

      if (error?.status === 403) {
        onAccessDenied?.(error.data || {});
      } else {
        setError(
          error?.message ||
            'Impossible de supprimer le commentaire.'
        );
      }
    });

    return true;
  },[user, mode, clubId, onAccessDenied]);

  const likePost = useCallback((postId) => {
    if (!user) return;
    const toggle = (list) => list.map((p) => p.id === postId
      ? { ...p, likedByMe: !p.likedByMe, likes: Number(p.likes || 0) + (p.likedByMe ? -1 : 1) }
      : p);
    if (mode === 'club') {
      setClubPosts(toggle);
      apiFetch(`${FEED_PATH(clubId)}/posts/${postId}/like`, { method: 'POST' })
        .then(() => loadFeed(true))
        .catch((e) => handleWriteError(e, null));   // un like n'a pas de brouillon
    } else {
      setFriendsPosts(toggle);
    }
  }, [clubId, mode, loadFeed, handleWriteError]);

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
        .catch((e) => handleWriteError(e, c));
    } else {
      setFriendsPosts(bump);
    }
    return true;
  }, [clubId, mode, me.id, ensureMeInFans, loadFeed, handleWriteError]);

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
        .catch((e) => handleWriteError(e, c));
    } else {
      setFriendsMessages((m) => [...m, optimistic]);
    }
    return true;
  }, [clubId, mode, me.id, me.name, ensureMeInFans, loadFeed, handleWriteError]);

  const updateMessage = useCallback((messageId, content) => {
    if (!user) return false;

    const cleanContent = content?.trim();

    if (!messageId || !cleanContent) {
      return false;
    }

    if (mode === 'friends') {
      setFriendsMessages((messages) =>
        messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                content: cleanContent,
                edited: true,
              }
            : message
        )
      );

      return true;
    }

    let previousMessage = null;

    // Modification immédiate dans l’interface.
    setClubMessages((messages) =>
      messages.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        previousMessage = message;

        return {
          ...message,
          content: cleanContent,
          edited: true,
        };
      })
    );

    // La requête continue en arrière-plan, sans bloquer l’interface.
    apiFetch(
      `${FEED_PATH(clubId)}/messages/${encodeURIComponent(messageId)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          content: cleanContent,
        }),
      }
    )
      .then((response) => {
        const updatedMessage =
          response?.data?.message ??
          response?.message ??
          null;

        if (!updatedMessage) return;

        setClubMessages((messages) =>
          messages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  ...updatedMessage,
                  content:
                    updatedMessage.content ??
                    cleanContent,
                  createdAt:
                    message.createdAt,
                  edited: true,
                }
              : message
          )
        );
      })
      .catch((error) => {
        // Le serveur a refusé : restauration de l’ancien texte.
        if (previousMessage) {
          setClubMessages((messages) =>
            messages.map((message) =>
              message.id === messageId
                ? previousMessage
                : message
            )
          );
        } else {
          loadFeed(true);
        }

        handleWriteError(error, cleanContent);
      });

    // Retour immédiat : LiveChat ferme directement l’éditeur.
    return true;
  },[user, mode, clubId, loadFeed, handleWriteError]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!user || !messageId) return false;

    if (mode === 'friends') {
      setFriendsMessages((messages) =>
        messages.filter((message) => message.id !== messageId)
      );

      return true;
    }

    // Sauvegarde de l'état actuel en cas d'échec.
    const previousMessages = clubMessages;

    // Retire immédiatement le message de l'interface.
    setClubMessages((messages) =>
      messages.filter((message) => message.id !== messageId)
    );

    try {
      await apiFetch(
        `${FEED_PATH(clubId)}/messages/${encodeURIComponent(messageId)}`,
        {
          method: 'DELETE',
        }
      );

      await loadFeed(true);

      return true;
    } catch (error) {
      // Remet le message si la suppression backend échoue.
      setClubMessages(previousMessages);

      if (error?.status === 403) {
        onAccessDenied?.(error.data || {});
      } else {
        setError(error?.message || 'Impossible de supprimer le message.');
      }

      return false;
    }
  }, [user, mode, clubId, clubMessages, loadFeed, onAccessDenied]);

  const isEmpty     = useMemo(() => !loading && !error && posts.length === 0, [loading, error, posts.length]);
  const isChatEmpty = useMemo(() => !loading && !error && messages.length === 0, [loading, error, messages.length]);

  return {
    fans, posts, comments, messages,
    loading, error, isEmpty, isChatEmpty,
    reload: loadFeed,
    publishPost, updatePost, deletePost, likePost, addComment, updateComment, deleteComment,
    sendMessage, updateMessage, deleteMessage,
    match,
  };
}
