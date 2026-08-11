// ═══════════════════════════════════════════════════════════════
// db/shopLive.js
// Accès Supabase pour le module de live shopping.
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function createRoom(data) {
  const row = {
    tenant_id: data.tenant_id,
    title: data.title,
    description: data.description || null,
    cover_url: data.cover_url || null,

    status: data.status || 'draft',
    latency_mode: data.latency_mode || 'normal',
    release_playback:
      data.release_playback !== false,

    scheduled_at: data.scheduled_at || null,
    scheduled_end_at:
      data.scheduled_end_at || null,

    created_by: data.created_by || null,
    metadata: data.metadata || {},
  };

  const { data: room, error } = await supabase
    .from('shop_live_rooms')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(
      `createShopLiveRoom: ${error.message}`
    );
  }

  return room;
}

async function getRoomById(id) {
  const { data: room, error } = await supabase
    .from('shop_live_rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `getShopLiveRoomById: ${error.message}`
    );
  }

  return room || null;
}

async function getCurrentRoomByTenant(
  tenantId
) {
  const { data: room, error } = await supabase
    .from('shop_live_rooms')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', [
      'creating',
      'ready',
      'live',
      'ending',
    ])
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `getCurrentShopLiveRoom: ${error.message}`
    );
  }

  return room || null;
}

async function updateRoom(
  id,
  updates
) {
  const { data: room, error } = await supabase
    .from('shop_live_rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(
      `updateShopLiveRoom: ${error.message}`
    );
  }

  return room;
}

// Enregistre les identifiants OBS (push stream) du live dans metadata.obs.
// ⚠️ La clé de stream est secrète : ne jamais l'exposer via publicRoom / aux fans.
async function saveObsCredentials(id, { server, streamKey } = {}) {
  const room = await getRoomById(id);
  return updateRoom(id, {
    metadata: {
      ...(room?.metadata || {}),
      obs: {
        server: server || null,
        streamKey: streamKey || null,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

async function saveBytePlusActivity(
  id,
  {
    activityId,
    viewUrlPath,
    viewerUrl = null,
    hostUrl = null,
  }
) {
  return updateRoom(id, {
    byteplus_activity_id:
      String(activityId),

    view_url_path:
      viewUrlPath || null,

    viewer_url:
      viewerUrl,

    host_url:
      hostUrl,

    status: 'ready',
  });
}

async function markRoomFailed(
  id,
  errorMessage
) {
  const room =
    await getRoomById(id);

  return updateRoom(id, {
    status: 'failed',

    metadata: {
      ...(room?.metadata || {}),
      lastError:
        errorMessage || null,
      failedAt:
        new Date().toISOString(),
    },
  });
}

async function markRoomLive(id) {
  return updateRoom(id, {
    status: 'live',
    started_at:
      new Date().toISOString(),
    ended_at: null,
  });
}

// Stocke les URLs vidéo d'un live : host_url (lien de diffusion navigateur du
// club) et/ou viewer_url (lecture HLS pour les fans). Ne touche que les champs fournis.
async function setBroadcastUrls(
  id,
  { hostUrl, viewerUrl } = {}
) {
  const updates = {};
  if (hostUrl !== undefined) updates.host_url = hostUrl;
  if (viewerUrl !== undefined) updates.viewer_url = viewerUrl;
  return updateRoom(id, updates);
}

async function markRoomEnded(
  id,
  replayUrl = null
) {
  return updateRoom(id, {
    status: 'ended',
    ended_at:
      new Date().toISOString(),
    replay_url:
      replayUrl || null,
  });
}

async function cancelRoom(id) {
  return updateRoom(id, {
    status: 'cancelled',
    ended_at: new Date().toISOString(),
  });
}

async function listRoomProducts(
  liveRoomId
) {
  const { data, error } = await supabase
    .from('shop_live_products')
    .select(`
      *,
      product:products(*)
    `)
    .eq(
      'live_room_id',
      liveRoomId
    )
    .neq(
      'sync_status',
      'removed'
    )
    .order(
      'display_order',
      { ascending: true }
    );

  if (error) {
    throw new Error(
      `listShopLiveProducts: ${error.message}`
    );
  }

  return data || [];
}

async function addRoomProduct({
  liveRoomId,
  productId,
  displayOrder = 0,
}) {
  const { data, error } = await supabase
    .from('shop_live_products')
    .upsert(
      {
        live_room_id:
          liveRoomId,

        product_id:
          productId,

        display_order:
          displayOrder,

        sync_status:
          'pending',
      },
      {
        onConflict:
          'live_room_id,product_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `addShopLiveProduct: ${error.message}`
    );
  }

  return data;
}

async function removeRoomProduct(
  liveRoomId,
  productId
) {
  const { data, error } = await supabase
    .from('shop_live_products')
    .update({
      sync_status: 'removed',
      is_featured: false,
    })
    .eq(
      'live_room_id',
      liveRoomId
    )
    .eq(
      'product_id',
      productId
    )
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(
      `removeShopLiveProduct: ${error.message}`
    );
  }

  return data || null;
}

async function featureProduct(
  liveRoomId,
  productId
) {
  const { error: resetError } =
    await supabase
      .from(
        'shop_live_products'
      )
      .update({
        is_featured: false,
      })
      .eq(
        'live_room_id',
        liveRoomId
      );

  if (resetError) {
    throw new Error(
      `resetFeaturedProduct: ${resetError.message}`
    );
  }

  const { data, error } = await supabase
  .from('shop_live_products')
  .update({
    is_featured: true,
    featured_at:
      new Date().toISOString(),
  })
  .eq(
    'live_room_id',
    liveRoomId
  )
  .eq(
    'product_id',
    productId
  )
  .neq(
    'sync_status',
    'removed'
  )
  .select()
  .single();

  if (error) {
    throw new Error(
      `featureShopLiveProduct: ${error.message}`
    );
  }

  await updateRoom(
    liveRoomId,
    {
      featured_product_id:
        productId,
    }
  );

  return data;
}

async function addEvent({
  liveRoomId = null,
  activityId = null,
  eventType,
  externalEventId = null,
  payload = {},
}) {
  const { data, error } = await supabase
    .from('shop_live_events')
    .insert({
      live_room_id:
        liveRoomId,

      byteplus_activity_id:
        activityId
          ? String(activityId)
          : null,

      event_type:
        eventType,

      external_event_id:
        externalEventId,

      payload,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `addShopLiveEvent: ${error.message}`
    );
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
// Chat en direct du Live Boutique (façon Whatnot) — messages, réactions,
// et compteur de « likes » (cœurs flottants). Miroir du chat Fan Club,
// mais scopé à une salle de live (live_room_id).
// ═══════════════════════════════════════════════════════════════

const CHAT_REACTIONS = ['👍', '👎', '❤️', '😂', '😮', '🔥'];

// Récupère les profils (auteurs) pour un ensemble d'ids.
async function fetchChatProfiles(ids) {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', uniq);
  const map = {};
  (data || []).forEach((p) => {
    const name = p.display_name || 'Supporter';
    map[p.id] = { id: p.id, name, avatar: p.avatar_url || null };
  });
  return map;
}

// Agrège les réactions des messages affichés : { [messageId]: [{emoji,count,mine}] }
async function chatReactionsFor(messageIds, currentUserId) {
  if (!messageIds.length) return {};
  const { data } = await supabase
    .from('shop_live_message_reactions')
    .select('message_id, user_id, emoji')
    .in('message_id', messageIds);

  const byMessage = {};
  for (const r of data || []) {
    const bucket = (byMessage[r.message_id] ||= {});
    const entry = (bucket[r.emoji] ||= { emoji: r.emoji, count: 0, mine: false });
    entry.count += 1;
    if (currentUserId && r.user_id === currentUserId) entry.mine = true;
  }
  // Ordre stable = celui de la palette (évite que les puces sautent au re-render).
  return Object.fromEntries(
    Object.entries(byMessage).map(([id, m]) => [id, CHAT_REACTIONS.filter((e) => m[e]).map((e) => m[e])])
  );
}

// Les messages publiés d'une salle (chrono), enrichis auteur + réactions + likeCount.
async function getChat(liveRoomId, currentUserId) {
  const [{ data: room }, { data: messages, error }] = await Promise.all([
    supabase.from('shop_live_rooms').select('like_count').eq('id', liveRoomId).maybeSingle(),
    supabase
      .from('shop_live_messages')
      .select('id, author_id, content, created_at')
      .eq('live_room_id', liveRoomId)
      .eq('moderation_status', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200),
  ]);

  if (error) throw new Error(`getShopLiveChat: ${error.message}`);

  const rows = messages || [];
  const profiles = await fetchChatProfiles(rows.map((m) => m.author_id));
  const reactions = await chatReactionsFor(rows.map((m) => m.id), currentUserId);

  return {
    likeCount: Number(room?.like_count || 0),
    messages: rows.map((m) => ({
      id: m.id,
      authorId: m.author_id,
      author: profiles[m.author_id]?.name || 'Supporter',
      avatar: profiles[m.author_id]?.avatar || null,
      content: m.content,
      createdAt: m.created_at,
      reactions: reactions[m.id] || [],
    })),
  };
}

async function createChatMessage(liveRoomId, authorId, content) {
  const { data, error } = await supabase
    .from('shop_live_messages')
    .insert({ live_room_id: liveRoomId, author_id: authorId, content })
    .select('id, author_id, content, created_at')
    .single();
  if (error) throw new Error(`createShopLiveMessage: ${error.message}`);

  const profiles = await fetchChatProfiles([authorId]);
  return {
    id: data.id,
    authorId: data.author_id,
    author: profiles[authorId]?.name || 'Supporter',
    avatar: profiles[authorId]?.avatar || null,
    content: data.content,
    createdAt: data.created_at,
    reactions: [],
  };
}

// Suppression douce d'un message (auteur uniquement, ou modération BO).
async function deleteChatMessage(liveRoomId, messageId, authorId, { force = false } = {}) {
  const { data: existing, error: findError } = await supabase
    .from('shop_live_messages')
    .select('id, author_id')
    .eq('id', messageId)
    .eq('live_room_id', liveRoomId)
    .is('deleted_at', null)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (!existing) { const e = new Error('Message introuvable.'); e.code = 'MSG_NOT_FOUND'; throw e; }
  if (!force && existing.author_id !== authorId) {
    const e = new Error('Tu ne peux supprimer que tes propres messages.'); e.code = 'MSG_FORBIDDEN'; throw e;
  }

  const { error } = await supabase
    .from('shop_live_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('live_room_id', liveRoomId);
  if (error) throw new Error(error.message);
  return { id: messageId, deleted: true };
}

// Bascule une réaction emoji (poser / retirer). Renvoie l'état après action.
async function toggleChatReaction(messageId, userId, emoji) {
  if (!CHAT_REACTIONS.includes(emoji)) {
    const e = new Error('Réaction non autorisée.'); e.code = 'BAD_EMOJI'; throw e;
  }
  const { data: existing } = await supabase
    .from('shop_live_message_reactions')
    .select('message_id').eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji).maybeSingle();

  if (existing) {
    await supabase.from('shop_live_message_reactions')
      .delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji);
    return { emoji, reacted: false };
  }
  const { error } = await supabase
    .from('shop_live_message_reactions')
    .insert({ message_id: messageId, user_id: userId, emoji });
  if (error) throw new Error(error.message);
  return { emoji, reacted: true };
}

// Incrémente le compteur de « likes » (cœurs flottants). Renvoie le nouveau total.
async function incrementLike(liveRoomId, by = 1) {
  const { data, error } = await supabase.rpc('shop_live_increment_like', {
    p_room_id: liveRoomId,
    p_by: Math.max(1, Math.min(20, Number(by) || 1)),
  });
  if (error) throw new Error(`incrementShopLiveLike: ${error.message}`);
  return Number(data || 0);
}

module.exports = {
  createRoom,
  getRoomById,
  getCurrentRoomByTenant,
  updateRoom,
  saveObsCredentials,
  saveBytePlusActivity,
  markRoomFailed,
  markRoomLive,
  markRoomEnded,
  setBroadcastUrls,
  cancelRoom,

  listRoomProducts,
  addRoomProduct,
  removeRoomProduct,
  featureProduct,

  addEvent,

  // Chat en direct (façon Whatnot)
  getChat,
  createChatMessage,
  deleteChatMessage,
  toggleChatReaction,
  incrementLike,
};