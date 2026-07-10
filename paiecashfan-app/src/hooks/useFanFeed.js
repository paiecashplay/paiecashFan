import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  mockFans,
  mockFanPosts,
  mockComments
} from '@/data/clubMocks';

/**
 * Point d'entrée unique des données du Fan Club.
 *
 * Pour l'instant, le hook utilise les mocks.
 * Plus tard, ils seront remplacés par des appels API sans modifier
 * les composants d'affichage.
 */

const mockClubMessages = [
  {
    id: 'm1',
    author: 'Ahmed',
    content: 'Allez le club 🔥',
    createdAt: 'Maintenant'
  },
  {
    id: 'm2',
    author: 'Sophie',
    content: 'Quelqu’un regarde le match ?',
    createdAt: 'Il y a 1 min'
  }
];

const mockFriendsMessages = [
  {
    id: 'fm1',
    author: 'Moi',
    content: 'Bienvenue dans mon salon privé 👥',
    createdAt: 'Maintenant'
  }
];

const match = {
  homeTeam: 'Paris Saint-Germain',
  awayTeam: 'Marseille',
  homeScore: 2,
  awayScore: 1,
  competition: 'Ligue 1',
  minute: 85,
  supporters: '12 541',
  messages: '2 154',
  reactions: '18 521'
};

export function useFanFeed(clubId, mode = 'club') {
  const [fans, setFans] = useState([]);

  const [clubPosts, setClubPosts] = useState([]);
  const [friendsPosts, setFriendsPosts] = useState([]);

  const [clubMessages, setClubMessages] = useState([]);
  const [friendsMessages, setFriendsMessages] = useState([]);

  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const posts = useMemo(
    () => (mode === 'club' ? clubPosts : friendsPosts),
    [mode, clubPosts, friendsPosts]
  );

  const messages = useMemo(
    () => (mode === 'club' ? clubMessages : friendsMessages),
    [mode, clubMessages, friendsMessages]
  );

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      /*
       * Futur branchement backend :
       *
       * const response = await apiFetch(
       *   `/api/v2/clubs/${clubId}/fan-feed`
       * );
       */

      await Promise.resolve();

      const clubFeed = mockFanPosts.filter(
        (post) => !post.clubSlug || post.clubSlug === clubId
      );

      setFans(mockFans);
      setClubPosts(clubFeed);
      setFriendsPosts([]);

      setClubMessages(mockClubMessages);
      setFriendsMessages(mockFriendsMessages);

      setComments(mockComments);
    } catch (err) {
      console.error(
        'Erreur lors du chargement du Fan Club :',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de charger les données du Fan Club.'
      );
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const publishPost = useCallback(
    (content) => {
      const cleanContent = content?.trim();

      if (!cleanContent) return false;

      const newPost = {
        id: crypto.randomUUID(),
        clubSlug: clubId,
        authorId: 'current-user',
        content: cleanContent,
        createdAt: 'Maintenant',
        likes: 0,
        comments: 0
      };

      if (mode === 'club') {
        setClubPosts((previousPosts) => [
          newPost,
          ...previousPosts
        ]);
      } else {
        setFriendsPosts((previousPosts) => [
          newPost,
          ...previousPosts
        ]);
      }

      return true;
    },
    [clubId, mode]
  );

  const likePost = useCallback(
    (postId) => {
      const updatePosts = (previousPosts) =>
        previousPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: Number(post.likes || 0) + 1
              }
            : post
        );

      if (mode === 'club') {
        setClubPosts(updatePosts);
      } else {
        setFriendsPosts(updatePosts);
      }
    },
    [mode]
  );

  const addComment = useCallback((postId, content) => {
    const cleanContent = content?.trim();

    if (!cleanContent) return false;

    const newComment = {
      id: crypto.randomUUID(),
      postId,
      authorId: 'current-user',
      content: cleanContent,
      createdAt: 'Maintenant'
    };

    setComments((previousComments) => [
      ...previousComments,
      newComment
    ]);

    const updateCommentCount = (previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: Number(post.comments || 0) + 1
            }
        : post
    );

    setClubPosts(updateCommentCount);
    setFriendsPosts(updateCommentCount);

    return true;
  }, []);

  const sendMessage = useCallback(
    (content) => {
      const cleanContent = content?.trim();

      if (!cleanContent) return false;

      const newMessage = {
        id: crypto.randomUUID(),
        author: mode === 'club' ? 'Supporter' : 'Moi',
        content: cleanContent,
        createdAt: 'Maintenant'
      };

      if (mode === 'club') {
        setClubMessages((previousMessages) => [
          ...previousMessages,
          newMessage
        ]);
      } else {
        setFriendsMessages((previousMessages) => [
          ...previousMessages,
          newMessage
        ]);
      }

      return true;
    },
    [mode]
  );

  const isEmpty = useMemo(
    () => !loading && !error && posts.length === 0,
    [loading, error, posts.length]
  );

  const isChatEmpty = useMemo(
    () => !loading && !error && messages.length === 0,
    [loading, error, messages.length]
  );

  return {
    fans,
    posts,
    comments,
    messages,

    loading,
    error,
    isEmpty,
    isChatEmpty,

    reload: loadFeed,
    publishPost,
    likePost,
    addComment,
    sendMessage,
    match
  };
}