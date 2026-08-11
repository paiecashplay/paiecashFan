// ═══════════════════════════════════════════════════════════════
// routes/v2/shop-live.js
// Live shopping des boutiques de clubs avec BytePlus Live SaaS.
// ═══════════════════════════════════════════════════════════════

const express = require('express');

const {
  requireAuth,
  optionalAuth,
} = require('../../middleware/auth');

// Filtre IA anti-abus du chat (même moteur que le Fan Club).
const prepublish = require('../../services/moderation/prepublish');

const tenants = require('../../db/tenants');
const products = require('../../db/products');
const shopLive = require('../../db/shopLive');
// Streaming vidéo : MediaLive (RTMP→HLS, mêmes accès OBS auto que le Fan Club).
const byteplus = require('../../services/byteplus');

const {
  isConfigured,
  createActivity,
  getWebPushClientUrl,
  buildViewerUrl,
} = require(
  '../../services/byteplusLiveShopping'
);

const {
  notifyShopLiveScheduled,
  notifyFeaturedProduct,
} = require(
  '../../services/shopLiveNotifications'
);

const router = express.Router();

const ok = (res, data, status = 200) =>
  res.status(status).json({
    success: true,
    data,
    error: '',
  });

const fail = (
  res,
  message,
  status = 400
) =>
  res.status(status).json({
    success: false,
    data: null,
    error: message,
  });

function canManage(authUser, tenant) {
  const { role, club_id } =
    authUser || {};

  return (
    role === 'super_admin' ||
    (
      role === 'club_admin' &&
      club_id === tenant.id
    )
  );
}

function normalizeClub(tenant) {
  return {
    ...tenant,
    name:
      tenant.name ||
      tenant.club_name ||
      'Club',
  };
}

// Nom de flux MediaLive stable par room (persisté dans metadata.streamName).
// Généré une seule fois : slug du club + id room → flux unique et lisible.
async function getOrCreateRoomStreamName(room) {
  if (room.metadata?.streamName) return room.metadata.streamName;
  const tenant = await tenants.getTenantById(room.tenant_id).catch(() => null);
  const base = `${tenant?.slug || 'club'}-shop`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const streamName = `${base}-${String(room.id).replace(/-/g, '').slice(0, 8)}`;
  await shopLive.updateRoom(room.id, { metadata: { ...(room.metadata || {}), streamName } });
  return streamName;
}

function publicRoom(room) {
  if (!room) {
    return null;
  }

  return {
    id: room.id,
    title: room.title,
    description: room.description,
    coverUrl: room.cover_url,
    status: room.status,

    // URL de visionnage hébergée BytePlus, construite depuis le viewUrlPath.
    viewerUrl:
      buildViewerUrl(room.view_url_path) ||
      room.viewer_url ||
      null,

    // Flux HLS public (MediaLive) — lu par notre lecteur natif (sans iframe).
    streamUrl:
      room.metadata?.streamName
        ? byteplus.playUrl(room.metadata.streamName)
        : null,

    replayUrl:
      room.replay_url,

    scheduledAt:
      room.scheduled_at,

    scheduledEndAt:
      room.scheduled_end_at,

    startedAt:
      room.started_at,

    endedAt:
      room.ended_at,

    featuredProductId:
      room.featured_product_id,
  };
}

// GET /api/v2/shop-live/health
router.get('/health', (req, res) => {
  return ok(res, {
    available: true,
    service: 'shop-live',
    provider: 'byteplus-live',
    configured: isConfigured(),
  });
});

// GET /api/v2/shop-live/club/:slug/current
// Route publique : live boutique actuel du club.
router.get(
  '/club/:slug/current',
  async (req, res) => {
    try {
      const tenant =
        await tenants
          .getTenantBySlugFlexible(
            req.params.slug
          );

      if (!tenant) {
        return fail(
          res,
          'Club introuvable.',
          404
        );
      }

      const room =
        await shopLive
          .getCurrentRoomByTenant(
            tenant.id
          );

      if (!room) {
        return ok(res, {
          available: false,
          room: null,
          products: [],
        });
      }

      const roomProducts =
        await shopLive
          .listRoomProducts(
            room.id
          );

      return ok(res, {
        available:
          room.status === 'live' ||
          room.status === 'ready',

        room:
          publicRoom(room),

        products:
          roomProducts,
      });
    } catch (error) {
      console.warn(
        '[SHOP LIVE] current:',
        error.message
      );

      // Route publique fail-open :
      // l’interface se masque sans erreur brute.
      return ok(res, {
        available: false,
        room: null,
        products: [],
      });
    }
  }
);

// GET /api/v2/shop-live/club/:slug/admin
// Live actuel avec informations d’administration.
router.get(
  '/club/:slug/admin',
  requireAuth,
  async (req, res) => {
    try {
      const tenant =
        await tenants
          .getTenantBySlugFlexible(
            req.params.slug
          );

      if (!tenant) {
        return fail(
          res,
          'Club introuvable.',
          404
        );
      }

      if (
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      const room =
        await shopLive
          .getCurrentRoomByTenant(
            tenant.id
          );

      const roomProducts =
        room
          ? await shopLive
              .listRoomProducts(
                room.id
              )
          : [];

      return ok(res, {
        room,
        products:
          roomProducts,
        byteplusConfigured:
          isConfigured(),
      });
    } catch (error) {
      return fail(
        res,
        `Chargement impossible : ${error.message}`,
        500
      );
    }
  }
);

// POST /api/v2/shop-live/club/:slug/create
// Crée la ligne locale puis la Live Room BytePlus.
router.post(
  '/club/:slug/create',
  requireAuth,
  async (req, res) => {
    let localRoom = null;

    try {
      const tenant =
        await tenants
          .getTenantBySlugFlexible(
            req.params.slug
          );

      if (!tenant) {
        return fail(
          res,
          'Club introuvable.',
          404
        );
      }

      if (
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      if (!isConfigured()) {
        return fail(
          res,
          'BytePlus Live SaaS n’est pas configuré côté serveur.',
          503
        );
      }

      const title =
        String(
          req.body?.title || ''
        ).trim();

      if (!title) {
        return fail(
          res,
          'Le titre du live est obligatoire.'
        );
      }

      const existing =
        await shopLive
          .getCurrentRoomByTenant(
            tenant.id
          );

      if (existing) {
        return fail(
          res,
          'Ce club possède déjà un live boutique ouvert.',
          409
        );
      }

      const scheduledAt =
        req.body?.scheduledAt ||
        null;

      const scheduledEndAt =
        req.body
          ?.scheduledEndAt ||
        null;

      localRoom =
        await shopLive.createRoom({
          tenant_id:
            tenant.id,

          title,

          description:
            req.body
              ?.description ||
            null,

          cover_url:
            req.body?.coverUrl ||
            tenant.logo_url ||
            null,

          status:
            'creating',

          latency_mode:
            req.body
              ?.latencyMode ||
            'normal',

          release_playback:
            req.body
              ?.releasePlayback !==
            false,

          scheduled_at:
            scheduledAt,

          scheduled_end_at:
            scheduledEndAt,

          created_by:
            req.authUser.id,

          metadata: {
            source:
              'paiecashfan',
          },
        });

      // Mode natif MediaLive (RTMP→HLS, comme le Fan Club) : pas d'activité
      // livesaas. On génère le streamName du live et on passe la room en "ready".
      const streamName = await getOrCreateRoomStreamName(localRoom);
      const room = await shopLive.updateRoom(localRoom.id, { status: 'ready' });

      await shopLive.addEvent({
        liveRoomId: room.id,
        eventType: 'room_created',
        payload: { title, streamName },
      });

      if (scheduledAt) {
        notifyShopLiveScheduled({
          club:
            normalizeClub(
              tenant
            ),

          live:
            room,
        }).catch(() => {});
      }

      return ok(res, { room }, 201);
    } catch (error) {
      console.error(
        '[SHOP LIVE] create:',
        error
      );

      if (localRoom?.id) {
        await shopLive
          .markRoomFailed(
            localRoom.id,
            error.message
          )
          .catch(() => {});
      }

      const validationCodes = [
        'BYTEPLUS_LIVE_NAME_REQUIRED',
        'BYTEPLUS_INVALID_DATE',
        'BYTEPLUS_INVALID_LIVE_DURATION',
        'BYTEPLUS_LIVE_DURATION_TOO_LONG',
        'BYTEPLUS_INVALID_LIVE_MODE',
        'BYTEPLUS_INVALID_URL',
        'BYTEPLUS_INVALID_VIEW_URL_PATH',
      ];

      const status =
        validationCodes.includes(
          error.code
        )
          ? 400
          : error.code ===
              'BYTEPLUS_LIVE_NOT_CONFIGURED'
            ? 503
            : 500;

      return fail(
        res,
        `Création impossible : ${error.message}`,
        status
      );
    }
  }
);

// GET /api/v2/shop-live/:liveId/broadcast — accès OBS AUTO (MediaLive) du live.
// BO-only (canManage). Serveur + clé de stream SIGNÉE (générés côté serveur,
// jamais exposés aux supporters). Même mécanisme que le Fan Club.
router.get('/:liveId/broadcast', requireAuth, async (req, res) => {
  try {
    const room = await shopLive.getRoomById(req.params.liveId);
    if (!room) return fail(res, 'Live introuvable.', 404);
    const tenant = await tenants.getTenantById(room.tenant_id);
    if (!tenant || !canManage(req.authUser, tenant)) return fail(res, 'Accès refusé.', 403);
    if (!byteplus.isConfigured()) return fail(res, 'Streaming natif non configuré côté serveur.', 503);
    const streamName = await getOrCreateRoomStreamName(room);
    const push = byteplus.pushInfo(streamName);
    return ok(res, {
      streamName,
      server: push.server,
      streamKey: push.streamKey,
      expire: push.expire,
      playUrl: byteplus.playUrl(streamName),
      isLive: room.status === 'live',
    });
  } catch (err) { return fail(res, 'Accès diffusion indisponible : ' + err.message, 500); }
});

// PUT /api/v2/shop-live/:liveId/products
// Remplace/complète la sélection des produits du live.
router.put(
  '/:liveId/products',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive
          .getRoomById(
            req.params.liveId
          );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants
          .getTenantById(
            room.tenant_id
          );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      const productIds =
        Array.isArray(
          req.body?.productIds
        )
          ? req.body.productIds
          : [];

      if (
        productIds.length === 0
      ) {
        return fail(
          res,
          'Sélectionne au moins un produit.'
        );
      }

      const selected = [];

      for (
        let index = 0;
        index <
        productIds.length;
        index += 1
      ) {
        const product =
          await products
            .getProductById(
              productIds[index]
            );

        if (!product) {
          return fail(
            res,
            `Produit introuvable : ${productIds[index]}`,
            404
          );
        }

        if (
          product.tenant_id !==
          tenant.id
        ) {
          return fail(
            res,
            'Un produit sélectionné n’appartient pas à ce club.',
            403
          );
        }

        const liveProduct =
          await shopLive
            .addRoomProduct({
              liveRoomId:
                room.id,

              productId:
                product.id,

              displayOrder:
                index,
            });

        selected.push(
          liveProduct
        );
      }

      return ok(res, {
        products:
          selected,
      });
    } catch (error) {
      return fail(
        res,
        `Association impossible : ${error.message}`,
        500
      );
    }
  }
);

// PATCH /api/v2/shop-live/:liveId
// Modifie les informations locales d’un live boutique.
router.patch(
  '/:liveId',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive
          .getRoomById(
            req.params.liveId
          );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants
          .getTenantById(
            room.tenant_id
          );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      if (
        room.status === 'ended' ||
        room.status === 'cancelled'
      ) {
        return fail(
          res,
          'Un live terminé ou annulé ne peut plus être modifié.',
          409
        );
      }

      const updates = {};

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'title'
          )
      ) {
        const title =
          String(
            req.body.title || ''
          ).trim();

        if (!title) {
          return fail(
            res,
            'Le titre du live ne peut pas être vide.'
          );
        }

        updates.title = title;
      }

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'description'
          )
      ) {
        updates.description =
          req.body.description
            ? String(
                req.body.description
              ).trim()
            : null;
      }

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'coverUrl'
          )
      ) {
        updates.cover_url =
          req.body.coverUrl || null;
      }

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'scheduledAt'
          )
      ) {
        updates.scheduled_at =
          req.body.scheduledAt || null;
      }

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'scheduledEndAt'
          )
      ) {
        updates.scheduled_end_at =
          req.body.scheduledEndAt ||
          null;
      }

      if (
        Object.prototype
          .hasOwnProperty.call(
            req.body || {},
            'releasePlayback'
          )
      ) {
        updates.release_playback =
          req.body.releasePlayback !==
          false;
      }

      if (
        Object.keys(updates)
          .length === 0
      ) {
        return fail(
          res,
          'Aucune information valide à modifier.'
        );
      }

      const scheduledAt =
        updates.scheduled_at !==
        undefined
          ? updates.scheduled_at
          : room.scheduled_at;

      const scheduledEndAt =
        updates.scheduled_end_at !==
        undefined
          ? updates.scheduled_end_at
          : room.scheduled_end_at;

      if (
        scheduledAt &&
        Number.isNaN(
          Date.parse(scheduledAt)
        )
      ) {
        return fail(
          res,
          'La date de programmation est invalide.'
        );
      }

      if (
        scheduledEndAt &&
        Number.isNaN(
          Date.parse(scheduledEndAt)
        )
      ) {
        return fail(
          res,
          'La date de fin est invalide.'
        );
      }

      if (
        scheduledAt &&
        scheduledEndAt &&
        new Date(scheduledEndAt) <=
          new Date(scheduledAt)
      ) {
        return fail(
          res,
          'La date de fin doit être postérieure à la date de début.'
        );
      }

      const updatedRoom =
        await shopLive
          .updateRoom(
            room.id,
            updates
          );

      await shopLive
        .addEvent({
          liveRoomId:
            room.id,

          activityId:
            room.byteplus_activity_id,

          eventType:
            'room_updated',

          payload: {
            updatedFields:
              Object.keys(updates),

            updatedBy:
              req.authUser.id,
          },
        })
        .catch(() => {});

      return ok(res, {
        room:
          updatedRoom,
      });
    } catch (error) {
      return fail(
        res,
        `Modification impossible : ${error.message}`,
        500
      );
    }
  }
);

// POST /api/v2/shop-live/:liveId/start
// Démarre officiellement un live boutique prêt.
router.post(
  '/:liveId/start',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive.getRoomById(
          req.params.liveId
        );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants.getTenantById(
          room.tenant_id
        );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      if (room.status === 'live') {
        return fail(
          res,
          'Ce live est déjà en cours.',
          409
        );
      }

      if (
        room.status === 'ended' ||
        room.status === 'cancelled'
      ) {
        return fail(
          res,
          'Un live terminé ou annulé ne peut pas être redémarré.',
          409
        );
      }

      if (room.status !== 'ready') {
        return fail(
          res,
          `Le live ne peut pas démarrer avec le statut "${room.status}".`,
          409
        );
      }

      // MediaLive : on garantit le streamName (flux HLS + accès OBS) avant le direct.
      await getOrCreateRoomStreamName(room);

      const updatedRoom =
        await shopLive.markRoomLive(room.id);

      await shopLive
        .addEvent({
          liveRoomId: room.id,
          eventType: 'room_started',
          payload: { startedBy: req.authUser.id, startedAt: updatedRoom.started_at },
        })
        .catch((eventError) => {
          console.error('[shop-live] Impossible d’enregistrer room_started :', eventError.message);
        });

      return ok(res, { room: updatedRoom });
    } catch (error) {
      return fail(
        res,
        `Démarrage impossible : ${error.message}`,
        500
      );
    }
  }
);

// POST /api/v2/shop-live/:liveId/broadcast-url
// Régénère un lien FRAIS du studio de diffusion navigateur. Le lien BytePlus
// n'est valable qu'environ 300 s : le club l'appelle juste avant d'ouvrir le
// studio (ou s'il a expiré) pour repartir d'un lien valide.
router.post(
  '/:liveId/broadcast-url',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive.getRoomById(
          req.params.liveId
        );

      if (!room) {
        return fail(res, 'Live introuvable.', 404);
      }

      const tenant =
        await tenants.getTenantById(
          room.tenant_id
        );

      if (
        !tenant ||
        !canManage(req.authUser, tenant)
      ) {
        return fail(res, 'Accès refusé.', 403);
      }

      if (room.status !== 'live') {
        return fail(
          res,
          'Le studio n’est disponible que pendant un live en cours.',
          409
        );
      }

      if (!room.byteplus_activity_id) {
        return fail(
          res,
          'Le live BytePlus n’est pas encore prêt.',
          409
        );
      }

      const push =
        await getWebPushClientUrl(
          room.byteplus_activity_id,
          300
        );

      const updatedRoom =
        await shopLive.setBroadcastUrls(
          room.id,
          { hostUrl: push.url }
        );

      return ok(res, {
        broadcastUrl:
          updatedRoom.host_url || push.url,
        broadcastExpireAt: push.expireAt,
      });
    } catch (error) {
      return fail(
        res,
        `Lien de diffusion indisponible : ${error.message}`,
        500
      );
    }
  }
);

// POST /api/v2/shop-live/:liveId/end
// Termine officiellement un live boutique.
router.post(
  '/:liveId/end',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive.getRoomById(
          req.params.liveId
        );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants.getTenantById(
          room.tenant_id
        );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      if (room.status !== 'live') {
        return fail(
          res,
          'Seul un live en cours peut être terminé.',
          409
        );
      }

      const replayUrl =
        req.body?.replayUrl || null;

      const updatedRoom =
        await shopLive.markRoomEnded(
          room.id,
          replayUrl
        );

      await shopLive
        .addEvent({
          liveRoomId: room.id,

          activityId:
            room.byteplus_activity_id,

          eventType: 'room_ended',

          payload: {
            endedBy:
              req.authUser.id,

            endedAt:
              updatedRoom.ended_at,

            replayUrl,
          },
        })
        .catch((eventError) => {
          console.error(
            '[shop-live] Impossible d’enregistrer room_ended :',
            eventError.message
          );
        });

      return ok(res, {
        room: updatedRoom,
      });
    } catch (error) {
      return fail(
        res,
        `Fin du live impossible : ${error.message}`,
        500
      );
    }
  }
);

// DELETE /api/v2/shop-live/:liveId
// Annule logiquement un live boutique sans supprimer son historique.
router.delete(
  '/:liveId',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive.getRoomById(
          req.params.liveId
        );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants.getTenantById(
          room.tenant_id
        );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      if (room.status === 'cancelled') {
        return fail(
          res,
          'Ce live est déjà annulé.',
          409
        );
      }

      if (room.status === 'ended') {
        return fail(
          res,
          'Un live terminé ne peut pas être annulé.',
          409
        );
      }

      if (room.status === 'live') {
        return fail(
          res,
          'Un live en cours doit d’abord être terminé.',
          409
        );
      }

      const cancelledRoom =
        await shopLive.cancelRoom(
          room.id
        );

      await shopLive
        .addEvent({
          liveRoomId: room.id,

          activityId:
            room.byteplus_activity_id,

          eventType:
            'room_cancelled',

          payload: {
            cancelledBy:
              req.authUser.id,

            cancelledAt:
              cancelledRoom.ended_at,

            previousStatus:
              room.status,
          },
        })
        .catch((eventError) => {
          console.error(
            '[shop-live] Impossible d’enregistrer room_cancelled :',
            eventError.message
          );
        });

      return ok(res, {
        room: cancelledRoom,
      });
    } catch (error) {
      return fail(
        res,
        `Annulation impossible : ${error.message}`,
        500
      );
    }
  }
);

// DELETE /api/v2/shop-live/:liveId/products/:productId
router.delete(
  '/:liveId/products/:productId',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive
          .getRoomById(
            req.params.liveId
          );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants
          .getTenantById(
            room.tenant_id
          );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      const removed =
        await shopLive
          .removeRoomProduct(
            room.id,
            req.params.productId
          );

      return ok(res, {
        removed:
          Boolean(removed),
      });
    } catch (error) {
      return fail(
        res,
        `Suppression impossible : ${error.message}`,
        500
      );
    }
  }
);

// PATCH /api/v2/shop-live/:liveId/featured-product
router.patch(
  '/:liveId/featured-product',
  requireAuth,
  async (req, res) => {
    try {
      const room =
        await shopLive
          .getRoomById(
            req.params.liveId
          );

      if (!room) {
        return fail(
          res,
          'Live introuvable.',
          404
        );
      }

      const tenant =
        await tenants
          .getTenantById(
            room.tenant_id
          );

      if (
        !tenant ||
        !canManage(
          req.authUser,
          tenant
        )
      ) {
        return fail(
          res,
          'Accès refusé.',
          403
        );
      }

      const productId =
        req.body?.productId;

      if (!productId) {
        return fail(
          res,
          'productId est obligatoire.'
        );
      }

      const product =
        await products
          .getProductById(
            productId
          );

      if (!product) {
        return fail(
          res,
          'Produit introuvable.',
          404
        );
      }

      if (
        product.tenant_id !==
        tenant.id
      ) {
        return fail(
          res,
          'Ce produit n’appartient pas à ce club.',
          403
        );
      }

      const featured =
        await shopLive
          .featureProduct(
            room.id,
            product.id
          );

      // Notification produit best-effort.
      if (
        room.status === 'live'
      ) {
        notifyFeaturedProduct({
          club:
            normalizeClub(
              tenant
            ),

          live:
            room,

          product,
        }).catch(() => {});
      }

      return ok(res, {
        featuredProduct:
          featured,
      });
    } catch (error) {
      return fail(
        res,
        `Mise en avant impossible : ${error.message}`,
        500
      );
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// Chat en direct du Live Boutique (façon Whatnot).
// Lecture publique (optionalAuth) ; écriture réservée aux connectés,
// filtrée par l'IA anti-abus (pas de charte — accès simplifié boutique).
// ═══════════════════════════════════════════════════════════════

// Filtre IA avant publication d'un message. Renvoie la réponse 422 (et true)
// si le message est bloqué ; null si autorisé. Fail-open si le service est
// indisponible (ne bloque jamais une vente pour une panne de modération).
async function chatPublishGate(res, { tenantId, authorId, content }) {
  const v = await prepublish
    .screenBeforePublish({ contentType: 'message', tenantId, authorId, content })
    .catch(() => ({ allowed: true, degraded: true }));
  if (v.allowed) return null;
  res.status(422).json({
    success: false,
    data: { moderation: { status: 'blocked', reason: v.reason, categories: v.ai?.categories || [] } },
    error: v.reason || 'Message refusé par la modération.',
  });
  return true;
}

// GET /api/v2/shop-live/:liveId/chat — messages + likeCount (public).
router.get('/:liveId/chat', optionalAuth, async (req, res) => {
  try {
    const room = await shopLive.getRoomById(req.params.liveId);
    if (!room) return fail(res, 'Live introuvable.', 404);
    const data = await shopLive.getChat(room.id, req.authUser?.id || null);
    return ok(res, data);
  } catch (err) {
    // Fail-open : le chat ne doit jamais casser l'affichage du live.
    return ok(res, { messages: [], likeCount: 0 });
  }
});

// POST /api/v2/shop-live/:liveId/chat/messages — poster une question (connecté).
router.post('/:liveId/chat/messages', requireAuth, async (req, res) => {
  try {
    const room = await shopLive.getRoomById(req.params.liveId);
    if (!room) return fail(res, 'Live introuvable.', 404);

    const content = String(req.body?.content || '').trim();
    if (!content) return fail(res, 'Message vide.', 400);
    if (content.length > 2000) return fail(res, 'Message trop long (2000 max).', 400);

    const blocked = await chatPublishGate(res, {
      tenantId: room.tenant_id, authorId: req.authUser.id, content,
    });
    if (blocked) return; // 422 déjà renvoyé

    const message = await shopLive.createChatMessage(room.id, req.authUser.id, content);
    return ok(res, { message }, 201);
  } catch (err) {
    return fail(res, 'Envoi impossible : ' + err.message, 500);
  }
});

// DELETE /api/v2/shop-live/:liveId/chat/messages/:messageId — auteur, ou club (modération).
router.delete('/:liveId/chat/messages/:messageId', requireAuth, async (req, res) => {
  try {
    const room = await shopLive.getRoomById(req.params.liveId);
    if (!room) return fail(res, 'Live introuvable.', 404);
    const tenant = await tenants.getTenantById(room.tenant_id).catch(() => null);
    const force = tenant ? canManage(req.authUser, tenant) : false;

    const result = await shopLive.deleteChatMessage(room.id, req.params.messageId, req.authUser.id, { force });
    return ok(res, result);
  } catch (err) {
    if (err.code === 'MSG_NOT_FOUND') return fail(res, err.message, 404);
    if (err.code === 'MSG_FORBIDDEN') return fail(res, err.message, 403);
    return fail(res, 'Suppression impossible : ' + err.message, 500);
  }
});

// POST /api/v2/shop-live/:liveId/chat/messages/:messageId/reactions — bascule un emoji.
router.post('/:liveId/chat/messages/:messageId/reactions', requireAuth, async (req, res) => {
  try {
    const emoji = String(req.body?.emoji || '');
    const result = await shopLive.toggleChatReaction(req.params.messageId, req.authUser.id, emoji);
    return ok(res, result);
  } catch (err) {
    if (err.code === 'BAD_EMOJI') return fail(res, err.message, 400);
    return fail(res, 'Réaction impossible : ' + err.message, 500);
  }
});

// POST /api/v2/shop-live/:liveId/like — un « like » (cœur flottant). Renvoie le total.
router.post('/:liveId/like', requireAuth, async (req, res) => {
  try {
    const room = await shopLive.getRoomById(req.params.liveId);
    if (!room) return fail(res, 'Live introuvable.', 404);
    const by = Number(req.body?.count) || 1;
    const likeCount = await shopLive.incrementLike(room.id, by);
    return ok(res, { likeCount });
  } catch (err) {
    return fail(res, 'Like impossible : ' + err.message, 500);
  }
});

module.exports = router;