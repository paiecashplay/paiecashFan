// ═══════════════════════════════════════════════════════════════
// db/fanFeed.js — Fan Club : feed communautaire par club (Supabase)
// Tables : fan_posts, fan_comments, fan_post_likes, fan_messages.
// author_id / user_id = profiles.id (= id de session Supabase Auth).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const { getTenantBySlugFlexible } = require('./tenants');
const presence = require('./presence');

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

  // Présence en ligne (chantier 2) : qui est actuellement dans CE salon.
  const onlineIds = await presence.onlineInTenant(tenantId).catch(() => new Set());

  // Participants : auteurs (posts/commentaires/messages) + présents non-auteurs
  // (un supporter qui regarde sans avoir posté doit apparaître « en ligne »).
  const authorIds = [
    ...(posts || []).map((p) => p.author_id),
    ...(comments || []).map((c) => c.author_id),
    ...(messages || []).map((m) => m.author_id),
  ];
  const profiles = await fetchProfiles([...authorIds, ...onlineIds]);
  // Annotation réelle de la présence (fetchProfiles pose online:false par défaut).
  Object.values(profiles).forEach((p) => { p.online = onlineIds.has(p.id); });

  // Les en-ligne d'abord, puis alphabétique.
  const fans = Object.values(profiles).sort((a, b) => (b.online - a.online) || a.name.localeCompare(b.name));

  return {
    fans,
    onlineCount: onlineIds.size,
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

async function updatePost(tenantId, postId, authorId, content) {
  const { data: existing, error: findError } = await supabase
    .from('fan_posts')
    .select('id, tenant_id, author_id')
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    throw contentError(
      'Publication introuvable.',
      'POST_NOT_FOUND'
    );
  }

  if (existing.author_id !== authorId) {
    throw contentError(
      'Tu ne peux modifier que tes propres publications.',
      'POST_FORBIDDEN'
    );
  }

  const { data, error } = await supabase
    .from('fan_posts')
    .update({
      content,
    })
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .select('id, author_id, content, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    authorId: data.author_id,
    content: data.content,
    createdAt: data.created_at,
  };
}

async function deletePost(tenantId, postId, authorId) {
  const { data: existing, error: findError } = await supabase
    .from('fan_posts')
    .select('id, tenant_id, author_id')
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    throw contentError(
      'Publication introuvable.',
      'POST_NOT_FOUND'
    );
  }

  if (existing.author_id !== authorId) {
    throw contentError(
      'Tu ne peux supprimer que tes propres publications.',
      'POST_FORBIDDEN'
    );
  }

  const deletedAt = new Date().toISOString();

  const { error } = await supabase
    .from('fan_posts')
    .update({
      deleted_at: deletedAt,
    })
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .eq('author_id', authorId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }

  // Les commentaires sont également masqués.
  const { error: commentsError } = await supabase
    .from('fan_comments')
    .update({
      deleted_at: deletedAt,
    })
    .eq('post_id', postId)
    .is('deleted_at', null);

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  return {
    id: postId,
    deleted: true,
  };
}

async function addComment(postId, authorId, content) {
  const { data, error } = await supabase.from('fan_comments')
    .insert({ post_id: postId, author_id: authorId, content }).select('id, post_id, author_id, content, created_at').single();
  if (error) throw new Error(error.message);
  return { id: data.id, postId: data.post_id, authorId: data.author_id, content: data.content, createdAt: data.created_at };
}

async function updateComment(tenantId, commentId, authorId, content) {
  const { data: existing, error: findError } = await supabase
    .from('fan_comments')
    .select(`
      id,
      author_id,
      post_id,
      fan_posts!inner (
        tenant_id
      )
    `)
    .eq('id', commentId)
    .eq('fan_posts.tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    throw contentError(
      'Commentaire introuvable.',
      'COMMENT_NOT_FOUND'
    );
  }

  if (existing.author_id !== authorId) {
    throw contentError(
      'Tu ne peux modifier que tes propres commentaires.',
      'COMMENT_FORBIDDEN'
    );
  }

  const { data, error } = await supabase
    .from('fan_comments')
    .update({
      content,
    })
    .eq('id', commentId)
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .select('id, post_id, author_id, content, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    postId: data.post_id,
    authorId: data.author_id,
    content: data.content,
    createdAt: data.created_at,
  };
}

async function deleteComment(tenantId, commentId, authorId) {
  const { data: existing, error: findError } = await supabase
    .from('fan_comments')
    .select(`
      id,
      author_id,
      post_id,
      fan_posts!inner (
        tenant_id
      )
    `)
    .eq('id', commentId)
    .eq('fan_posts.tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    throw contentError(
      'Commentaire introuvable.',
      'COMMENT_NOT_FOUND'
    );
  }

  if (existing.author_id !== authorId) {
    throw contentError(
      'Tu ne peux supprimer que tes propres commentaires.',
      'COMMENT_FORBIDDEN'
    );
  }

  const { error } = await supabase
    .from('fan_comments')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('author_id', authorId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: commentId,
    postId: existing.post_id,
    deleted: true,
  };
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

function contentError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Modifie un message du chat.
// La vérification de l'auteur est faite côté serveur : un utilisateur ne peut
// modifier que son propre message dans le salon concerné.
async function updateMessage(tenantId, messageId, authorId, content) {
  const { data: existing, error: findError } = await supabase
    .from('fan_messages')
    .select('id, tenant_id, author_id, content, created_at')
    .eq('id', messageId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    const error = new Error('Message introuvable.');
    error.code = 'MESSAGE_NOT_FOUND';
    throw error;
  }

  if (existing.author_id !== authorId) {
    const error = new Error('Tu ne peux modifier que tes propres messages.');
    error.code = 'MESSAGE_FORBIDDEN';
    throw error;
  }

  const { data, error } = await supabase
    .from('fan_messages')
    .update({ content })
    .eq('id', messageId)
    .eq('tenant_id', tenantId)
    .eq('author_id', authorId)
    .is('deleted_at', null)
    .select('id, author_id, content, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    authorId: data.author_id,
    content: data.content,
    createdAt: data.created_at,
  };
}

// Suppression logique d'un message.
// Le message reste conservé en base pour l'audit et la modération,
// mais il n'est plus renvoyé dans le fan feed.
async function deleteMessage(tenantId, messageId, authorId) {
  const { data: existing, error: findError } = await supabase
    .from('fan_messages')
    .select('id, tenant_id, author_id')
    .eq('id', messageId)
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (!existing) {
    const error = new Error('Message introuvable.');
    error.code = 'MESSAGE_NOT_FOUND';
    throw error;
  }

  if (existing.author_id !== authorId) {
    const error = new Error('Tu ne peux supprimer que tes propres messages.');
    error.code = 'MESSAGE_FORBIDDEN';
    throw error;
  }

  const { error } = await supabase
    .from('fan_messages')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .eq('tenant_id', tenantId)
    .eq('author_id', authorId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: messageId,
    deleted: true,
  };
}

module.exports = { resolveTenantId, getFeed, createPost, updatePost, deletePost, addComment, updateComment,
  deleteComment, toggleLike, createMessage, updateMessage, deleteMessage };
