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
  const [
    { data: posts, error: postsError }, 
    { data: messages, error: messagesError }, 
    { count: messagesCount, error: messagesCountError },
    { count: supportersCount, error: supportersCountError }] = await Promise.all([
    supabase.from('fan_posts').select('id, author_id, content, created_at')
      .eq('tenant_id', tenantId).eq('moderation_status', 'published').is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(100),
    supabase.from('fan_messages').select('id, author_id, content, created_at')
      .eq('tenant_id', tenantId).eq('moderation_status', 'published').is('deleted_at', null)
      .order('created_at', { ascending: true }).limit(100),
    supabase.from('fan_messages').select('id', {count: 'exact', head: true})
      .eq('tenant_id', tenantId)
      .eq('moderation_status', 'published')
      .is('deleted_at', null),
    supabase.from('fan_favorite_clubs').select('id', {count: 'exact',head: true})
      .eq('tenant_id', tenantId)
  ]);

  if (postsError) {
    throw new Error(
      `Chargement des publications impossible : ${postsError.message}`
    );
  }

  if (messagesError) {
    throw new Error(
      `Chargement des messages impossible : ${messagesError.message}`
    );
  }

  if (messagesCountError) {
    throw new Error(
      `Comptage des messages impossible : ${messagesCountError.message}`
    );
  }

  if (supportersCountError) {
    throw new Error(
      `Comptage des supporters impossible : ${supportersCountError.message}`
    );
  }

  const postIds = (posts || []).map((p) => p.id);

  // Récupération des posts publiés pour le comptage des réactions (likes).
  const { data: publishedPostIds, error: publishedPostIdsError } =
    await supabase.from('fan_posts').select('id').eq('tenant_id', tenantId)
      .eq('moderation_status', 'published')
      .is('deleted_at', null);

    const allPublishedPostIds = (publishedPostIds || []).map((post) => post.id
  );

  if (publishedPostIdsError) {
    throw new Error(
      `Récupération des posts publiés impossible : ${publishedPostIdsError.message}`
    );
  }

  // Comptage de toutes les réactions (likes) sur les posts publiés du club.
  const {count: reactionsCount, error: reactionsCountError} = allPublishedPostIds.length
    ? await supabase
        .from('fan_post_likes')
        .select('post_id', {
          count: 'exact',
          head: true
        })
        .in('post_id', allPublishedPostIds)
    : { count: 0, error: null };

  if (reactionsCountError) {
    throw new Error(
      `Comptage des réactions impossible : ${reactionsCountError.message}`
    );
  }
  
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

  // Réactions emoji des messages affichés.
  const msgReactions = await reactionsForMessages((messages || []).map((m) => m.id), currentUserId)
    .catch(() => ({}));

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
    // Participants triés (en ligne d'abord) + présence réelle — chantier 2.
    fans,
    onlineCount: onlineIds.size,
    // Compteurs réels du salon — chantier 1.
    counters: {
      messagesCount: Number(messagesCount || 0),
      supportersCount: Number(supportersCount || 0),
      reactionsCount: Number(reactionsCount || 0),
    },
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
      reactions: msgReactions[m.id] || [],
    })),
  };
}

// ── Réactions emoji sur les messages du chat ─────────────────
// Jeu fermé : on refuse tout emoji hors liste (la base a la même contrainte).
const MESSAGE_REACTIONS = ['👍', '👎', '❤️', '😂', '😮', '🔥'];

// Bascule une réaction (poser / retirer). Renvoie l'état après action.
async function toggleMessageReaction(messageId, userId, emoji) {
  if (!MESSAGE_REACTIONS.includes(emoji)) {
    const e = new Error('Réaction non autorisée.'); e.code = 'BAD_EMOJI'; throw e;
  }
  const { data: existing } = await supabase.from('fan_message_reactions')
    .select('message_id').eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji).maybeSingle();

  if (existing) {
    await supabase.from('fan_message_reactions')
      .delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji);
    return { emoji, reacted: false };
  }
  const { error } = await supabase.from('fan_message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji });
  if (error) throw new Error(error.message);
  return { emoji, reacted: true };
}

// Agrège les réactions des messages affichés :
//   { [messageId]: [{ emoji, count, mine }] }
async function reactionsForMessages(messageIds, currentUserId) {
  if (!messageIds.length) return {};
  const { data } = await supabase.from('fan_message_reactions')
    .select('message_id, user_id, emoji').in('message_id', messageIds);

  const byMessage = {};
  for (const r of data || []) {
    const bucket = (byMessage[r.message_id] ||= {});
    const entry = (bucket[r.emoji] ||= { emoji: r.emoji, count: 0, mine: false });
    entry.count += 1;
    if (currentUserId && r.user_id === currentUserId) entry.mine = true;
  }
  // Ordre stable = celui de la palette (évite que les puces sautent au re-render).
  return Object.fromEntries(Object.entries(byMessage).map(([id, m]) =>
    [id, MESSAGE_REACTIONS.filter((e) => m[e]).map((e) => m[e])]));
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

module.exports = {
  resolveTenantId, getFeed, createPost, addComment, toggleLike, createMessage,
  toggleMessageReaction, reactionsForMessages, MESSAGE_REACTIONS,
};
