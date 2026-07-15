// ═══════════════════════════════════════════════════════════════
// db/fanFeed.js — Fan Club : feed communautaire par club (Supabase)
// Tables : fan_posts, fan_comments, fan_post_likes, fan_messages.
// author_id / user_id = profiles.id (= id de session Supabase Auth).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const { getTenantBySlugFlexible } = require('./tenants');

async function resolveTenantId(slug) {
  const t = await getTenantBySlugFlexible(slug);
  return t ? { id: t.id, name: t.name } : null;
}

// Récupère les profils (auteurs) pour un ensemble d'ids.
async function fetchProfiles(ids) {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', uniq);
  const map = {};
  (data || []).forEach((p) => {
    const name = p.display_name || 'Supporter';
    map[p.id] = {
      id: p.id,
      name,
      avatar: p.avatar_url || null,
      initials: name.trim().slice(0, 2).toUpperCase(),
      online: false,
    };
  });
  return map;
}

// Feed complet d'un club : posts (+ compteurs + likedByMe), commentaires,
// messages du chat, et la liste des participants (fans).
async function getFeed(tenantId, currentUserId) {
  // Modération : on ne sert QUE le contenu publié et non supprimé — posts,
  // messages ET commentaires. Le filtrage est fait ici (serveur), jamais côté
  // client : masquer en CSS laisserait le contenu dans la réponse API.
  const [{ data: posts }, { data: messages }] = await Promise.all([
    supabase.from('fan_posts').select('id, author_id, content, created_at')
      .eq('tenant_id', tenantId).eq('moderation_status', 'published').is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('fan_messages').select('id, author_id, content, created_at')
      .eq('tenant_id', tenantId).eq('moderation_status', 'published').is('deleted_at', null)
      .order('created_at', { ascending: true }).limit(100),
  ]);

  const postIds = (posts || []).map((p) => p.id);

  // Commentaires + likes des posts du club (comptés en JS).
  const [{ data: comments }, { data: likes }] = await Promise.all([
    postIds.length
      ? supabase.from('fan_comments').select('id, post_id, author_id, content, created_at')
        .in('post_id', postIds).eq('moderation_status', 'published').is('deleted_at', null)
        .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
    postIds.length
      ? supabase.from('fan_post_likes').select('post_id, user_id').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ]);

  const likeCount = {}, commentCount = {}, likedByMe = {};
  (likes || []).forEach((l) => {
    likeCount[l.post_id] = (likeCount[l.post_id] || 0) + 1;
    if (currentUserId && l.user_id === currentUserId) likedByMe[l.post_id] = true;
  });
  (comments || []).forEach((c) => { commentCount[c.post_id] = (commentCount[c.post_id] || 0) + 1; });

  // Participants (auteurs de posts / commentaires / messages).
  const authorIds = [
    ...(posts || []).map((p) => p.author_id),
    ...(comments || []).map((c) => c.author_id),
    ...(messages || []).map((m) => m.author_id),
  ];
  const profiles = await fetchProfiles(authorIds);

  return {
    fans: Object.values(profiles),
    posts: (posts || []).map((p) => ({
      id: p.id,
      authorId: p.author_id,
      content: p.content,
      createdAt: p.created_at,
      likes: likeCount[p.id] || 0,
      comments: commentCount[p.id] || 0,
      likedByMe: !!likedByMe[p.id],
    })),
    comments: (comments || []).map((c) => ({
      id: c.id, postId: c.post_id, authorId: c.author_id, content: c.content, createdAt: c.created_at,
    })),
    messages: (messages || []).map((m) => ({
      id: m.id,
      authorId: m.author_id,
      author: profiles[m.author_id]?.name || 'Supporter',
      content: m.content,
      createdAt: m.created_at,
    })),
  };
}

async function createPost(tenantId, authorId, content) {
  const { data, error } = await supabase.from('fan_posts')
    .insert({ tenant_id: tenantId, author_id: authorId, content }).select('id, author_id, content, created_at').single();
  if (error) throw new Error(error.message);
  return { id: data.id, authorId: data.author_id, content: data.content, createdAt: data.created_at, likes: 0, comments: 0, likedByMe: false };
}

async function addComment(postId, authorId, content) {
  const { data, error } = await supabase.from('fan_comments')
    .insert({ post_id: postId, author_id: authorId, content }).select('id, post_id, author_id, content, created_at').single();
  if (error) throw new Error(error.message);
  return { id: data.id, postId: data.post_id, authorId: data.author_id, content: data.content, createdAt: data.created_at };
}

// Toggle like (insert / delete). Renvoie { liked }.
async function toggleLike(postId, userId) {
  const { data: existing } = await supabase.from('fan_post_likes')
    .select('post_id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  if (existing) {
    await supabase.from('fan_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    return { liked: false };
  }
  const { error } = await supabase.from('fan_post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw new Error(error.message);
  return { liked: true };
}

async function createMessage(tenantId, authorId, content) {
  const { data, error } = await supabase.from('fan_messages')
    .insert({ tenant_id: tenantId, author_id: authorId, content }).select('id, author_id, content, created_at').single();
  if (error) throw new Error(error.message);
  return { id: data.id, authorId: data.author_id, content: data.content, createdAt: data.created_at };
}

module.exports = { resolveTenantId, getFeed, createPost, addComment, toggleLike, createMessage };
