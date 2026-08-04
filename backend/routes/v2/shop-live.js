// ═══════════════════════════════════════════════════════════════
// routes/v2/shop-live.js
// Live shopping des boutiques de clubs avec BytePlus Live SaaS.
// ═══════════════════════════════════════════════════════════════

const express = require('express');

const {
  requireAuth,
} = require('../../middleware/auth');

const tenants = require('../../db/tenants');
const products = require('../../db/products');
const shopLive = require('../../db/shopLive');

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

      const activity =
        await createActivity({
          name: title,

          clubSlug:
            tenant.slug,

          scheduledAt,

          scheduledEndAt,

          enforceStartTime:
            Boolean(
              scheduledAt
            ),

          autoEnd:
            Boolean(
              scheduledEndAt
            ),

          latencyMode:
            req.body
              ?.latencyMode ||
            'normal',

          coverImage:
            req.body?.coverUrl ||
            tenant.logo_url ||
            null,

          verticalCoverImage:
            req.body
              ?.verticalCoverUrl ||
            null,

          templateId:
            req.body
              ?.templateId ||
            null,
        });

      const room =
        await shopLive
          .saveBytePlusActivity(
            localRoom.id,
            {
              activityId:
                activity.activityId,

              viewUrlPath:
                activity.viewUrlPath,
            }
          );

      await shopLive.addEvent({
        liveRoomId:
          room.id,

        activityId:
          activity.activityId,

        eventType:
          'room_created',

        payload: {
          requestId:
            activity.requestId,

          title,
        },
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

      return ok(
        res,
        {
          room,
          activity: {
            activityId:
              activity.activityId,

            viewUrlPath:
              activity.viewUrlPath,

            requestId:
              activity.requestId,
          },
        },
        201
      );
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

      if (
        !room.byteplus_activity_id
      ) {
        return fail(
          res,
          'Le live BytePlus n’est pas encore prêt.',
          409
        );
      }

      let updatedRoom =
        await shopLive.markRoomLive(
          room.id
        );

      // Lien de diffusion NAVIGATEUR (le club passe en direct depuis sa webcam,
      // sans login BytePlus). Best-effort : si BytePlus échoue, le live reste
      // "live" et on renvoie broadcastError pour info.
      let broadcastError = null;
      let broadcastExpireAt = null;
      try {
        // Lien web-push valable ~300 s côté BytePlus : on demande 300 s pour que
        // le compte à rebours affiché au club soit exact. Le club peut régénérer
        // un lien frais à tout moment via POST /:liveId/broadcast-url.
        const push =
          await getWebPushClientUrl(
            room.byteplus_activity_id,
            300
          );
        broadcastExpireAt = push.expireAt;
        updatedRoom =
          await shopLive.setBroadcastUrls(
            room.id,
            { hostUrl: push.url }
          );
      } catch (webpushError) {
        broadcastError =
          webpushError.message;
        console.error(
          '[shop-live] URL de diffusion indisponible :',
          webpushError.message
        );
      }

      await shopLive
        .addEvent({
          liveRoomId: room.id,

          activityId:
            room.byteplus_activity_id,

          eventType:
            'room_started',

          payload: {
            startedBy:
              req.authUser.id,

            startedAt:
              updatedRoom.started_at,
          },
        })
        .catch((eventError) => {
          console.error(
            '[shop-live] Impossible d’enregistrer room_started :',
            eventError.message
          );
        });

      return ok(res, {
        room: updatedRoom,
        broadcastUrl:
          updatedRoom.host_url || null,
        broadcastExpireAt,
        broadcastError,
      });
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

module.exports = router;