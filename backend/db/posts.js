// ═══════════════════════════════════════════════════════════════
// db/posts.js - Social Posts DB queries (Supabase)
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createPost(userId, content, imageUrl = null) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({ user_id: userId, content, image_url: imageUrl })
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function updatePost(postId, userId, content, imageUrl) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('posts').select('user_id').eq('id', postId).single();
    if (fetchError) throw fetchError;
    if (!existing) return { data: null, error: 'Post not found' };
    if (existing.user_id !== userId) return { data: null, error: 'Unauthorized' };

    const updates = { content };
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const { data, error } = await supabase
      .from('posts').update(updates).eq('id', postId).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function deletePost(postId, userId) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('posts').select('user_id, image_url').eq('id', postId).single();
    if (fetchError) throw fetchError;
    if (!existing) return { data: null, error: 'Post not found' };
    if (existing.user_id !== userId) return { data: null, error: 'Unauthorized' };

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;

    if (existing.image_url) {
      try {
        const urlParts = existing.image_url.split('/post-images/');
        if (urlParts[1]) await supabase.storage.from('post-images').remove([urlParts[1]]);
      } catch (e) { /* non-critical */ }
    }
    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function _enrichPosts(posts, currentUserId) {
  if (!posts || posts.length === 0) return [];

  const userIds = [...new Set(posts.map(p => p.user_id))];
  const postIds = posts.map(p => p.id);

  const { data: users } = await supabase.from('chat_profiles').select('user_id, username, avatar_url').in('user_id', userIds);
  const userMap = {};
  (users || []).forEach(u => { userMap[u.user_id] = { id: u.user_id, name: u.username, avatar: u.avatar_url, email: '' }; });

  const { data: likes } = await supabase.from('post_likes').select('post_id').in('post_id', postIds);
  const likeMap = {};
  (likes || []).forEach(l => { likeMap[l.post_id] = (likeMap[l.post_id] || 0) + 1; });

  const { data: comments } = await supabase.from('post_comments').select('post_id').in('post_id', postIds);
  const commentMap = {};
  (comments || []).forEach(c => { commentMap[c.post_id] = (commentMap[c.post_id] || 0) + 1; });

  let userLikes = {};
  if (currentUserId) {
    const { data: liked } = await supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds);
    if (liked) liked.forEach(l => { userLikes[l.post_id] = true; });
  }

  return posts.map(post => ({
    ...post,
    user: userMap[post.user_id] || { id: post.user_id, name: 'Unknown', email: '' },
    likes_count: likeMap[post.id] || 0,
    comments_count: commentMap[post.id] || 0,
    is_liked: !!userLikes[post.id],
  }));
}

async function getFeedPosts(limit = 20, offset = 0, currentUserId = null) {
  try {
    const { data: posts, error, count } = await supabase
      .from('posts').select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    if (!posts || posts.length === 0) return { data: { posts: [], total: 0, hasMore: false }, error: null };

    const enriched = await _enrichPosts(posts, currentUserId);
    return { data: { posts: enriched, total: count, hasMore: offset + posts.length < count }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getPostById(postId, currentUserId = null) {
  try {
    const { data: post, error } = await supabase.from('posts').select('*').eq('id', postId).single();
    if (error) throw error;
    if (!post) return { data: null, error: 'Post not found' };

    const enriched = await _enrichPosts([post], currentUserId);
    return { data: enriched[0], error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getUserPosts(userId, limit = 20, offset = 0, currentUserId = null) {
  try {
    const { data: posts, error, count } = await supabase
      .from('posts').select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    if (!posts || posts.length === 0) return { data: { posts: [], total: 0, hasMore: false }, error: null };

    const enriched = await _enrichPosts(posts, currentUserId);
    return { data: { posts: enriched, total: count, hasMore: offset + posts.length < count }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function toggleLike(postId, userId) {
  try {
    const { data: existing } = await supabase
      .from('post_likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle();

    if (existing) {
      const { error } = await supabase.from('post_likes').delete().eq('id', existing.id);
      if (error) throw error;
      return { data: { liked: false }, error: null };
    } else {
      const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
      if (error) throw error;
      return { data: { liked: true }, error: null };
    }
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getPostLikes(postId) {
  try {
    const { data: likes, error } = await supabase
      .from('post_likes').select('user_id, created_at').eq('post_id', postId).order('created_at', { ascending: false });
    if (error) throw error;
    if (!likes || likes.length === 0) return { data: [], error: null };

    const userIds = likes.map(l => l.user_id);
    const { data: users } = await supabase.from('chat_profiles').select('user_id, username, avatar_url').in('user_id', userIds);
    const userMap = {};
    (users || []).forEach(u => { userMap[u.user_id] = { id: u.user_id, name: u.username, avatar: u.avatar_url }; });

    return { data: likes.map(l => ({ ...l, user: userMap[l.user_id] || { id: l.user_id, name: 'Unknown' } })), error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function addComment(postId, userId, content) {
  try {
    const { data, error } = await supabase
      .from('post_comments').insert({ post_id: postId, user_id: userId, content }).select().single();
    if (error) throw error;

    const { data: userData } = await supabase.from('chat_profiles').select('user_id, username, avatar_url').eq('user_id', userId).single();
    return { data: { ...data, user: userData ? { id: userData.user_id, name: userData.username, avatar: userData.avatar_url, email: '' } : { id: userId, name: 'Unknown', email: '' } }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function updateComment(commentId, userId, content) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('post_comments').select('user_id').eq('id', commentId).single();
    if (fetchError) throw fetchError;
    if (!existing) return { data: null, error: 'Comment not found' };
    if (existing.user_id !== userId) return { data: null, error: 'Unauthorized' };

    const { data, error } = await supabase
      .from('post_comments').update({ content }).eq('id', commentId).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function deleteComment(commentId, userId) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('post_comments').select('user_id').eq('id', commentId).single();
    if (fetchError) throw fetchError;
    if (!existing) return { data: null, error: 'Comment not found' };
    if (existing.user_id !== userId) return { data: null, error: 'Unauthorized' };

    const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function getComments(postId, limit = 50, offset = 0) {
  try {
    const { data: comments, error, count } = await supabase
      .from('post_comments').select('*', { count: 'exact' })
      .eq('post_id', postId).order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    if (!comments || comments.length === 0) return { data: { comments: [], total: 0, hasMore: false }, error: null };

    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: users } = await supabase.from('chat_profiles').select('user_id, username, avatar_url').in('user_id', userIds);
    const userMap = {};
    (users || []).forEach(u => { userMap[u.user_id] = { id: u.user_id, name: u.username, avatar: u.avatar_url, email: '' }; });

    const enriched = comments.map(c => ({
      ...c,
      user: userMap[c.user_id] || { id: c.user_id, name: 'Unknown', email: '' },
    }));

    return { data: { comments: enriched, total: count, hasMore: offset + comments.length < count }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

module.exports = {
  createPost, updatePost, deletePost,
  getFeedPosts, getPostById, getUserPosts,
  toggleLike, getPostLikes,
  addComment, updateComment, deleteComment, getComments,
};
