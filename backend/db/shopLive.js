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
};