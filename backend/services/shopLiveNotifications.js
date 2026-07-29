// ═══════════════════════════════════════════════════════════════
// services/shopLiveNotifications.js
// Notifications envoyées aux fans pendant le cycle d'un live
// shopping.
//
// Ce service réutilise db/notifications.js et cible uniquement
// les utilisateurs qui suivent le club concerné.
// ═══════════════════════════════════════════════════════════════

const notifications = require('../db/notifications');

const SHOP_LIVE_NOTIFICATION_TYPES = Object.freeze({
  SCHEDULED: 'shop_live_scheduled',
  REMINDER: 'shop_live_reminder',
  STARTED: 'shop_live_started',
  ENDED: 'shop_live_ended',
  REPLAY_AVAILABLE: 'shop_live_replay_available',
  PRODUCT_FEATURED: 'shop_live_product_featured',
});

function assertClub(club) {
  if (!club?.id) {
    const error = new Error(
      "Le club est obligatoire pour envoyer une notification de live shopping."
    );

    error.code = 'SHOP_LIVE_CLUB_REQUIRED';
    throw error;
  }

  if (!club?.slug) {
    const error = new Error(
      "Le slug du club est obligatoire pour générer le lien du live."
    );

    error.code = 'SHOP_LIVE_CLUB_SLUG_REQUIRED';
    throw error;
  }
}

function getClubName(club) {
  return (
    club?.name ||
    club?.club_name ||
    'Le club'
  );
}

function buildShopLiveUrl(clubSlug) {
  return `/clubs/${encodeURIComponent(
    clubSlug
  )}#merchandise`;
}

function buildBaseMetadata({
  club,
  live,
  extra = {},
}) {
  return {
    tenantId: club.id,
    clubSlug: club.slug,
    liveId: live?.id || null,
    byteplusActivityId:
      live?.byteplusActivityId ||
      live?.byteplus_activity_id ||
      null,
    link: buildShopLiveUrl(club.slug),
    ...extra,
  };
}

async function notifyShopLiveScheduled({
  club,
  live,
}) {
  assertClub(club);

  const scheduledAt =
    live?.scheduledAt ||
    live?.scheduled_at ||
    null;

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .SCHEDULED,

      title:
        `📅 Live boutique programmé — ${getClubName(club)}`,

      message:
        scheduledAt
          ? `${getClubName(club)} a programmé un live boutique.`
          : `${getClubName(club)} prépare un nouveau live boutique.`,

      metadata: buildBaseMetadata({
        club,
        live,
        extra: {
          scheduledAt,
        },
      }),
    }
  );
}

async function notifyShopLiveReminder({
  club,
  live,
  minutesBefore = 15,
}) {
  assertClub(club);

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .REMINDER,

      title:
        `⏰ Le live de ${getClubName(club)} commence bientôt`,

      message:
        `Le live boutique commence dans ${minutesBefore} minutes.`,

      metadata: buildBaseMetadata({
        club,
        live,
        extra: {
          minutesBefore,
        },
      }),
    }
  );
}

async function notifyShopLiveStarted({
  club,
  live,
}) {
  assertClub(club);

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .STARTED,

      title:
        `🔴 ${getClubName(club)} est en direct !`,

      message:
        live?.title
          ? `${live.title} — découvre les produits présentés en direct.`
          : `La boutique de ${getClubName(club)} est maintenant en direct.`,

      metadata: buildBaseMetadata({
        club,
        live,
      }),
    }
  );
}

async function notifyShopLiveEnded({
  club,
  live,
}) {
  assertClub(club);

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .ENDED,

      title:
        `Le live boutique de ${getClubName(club)} est terminé`,

      message:
        `Merci d’avoir suivi le live boutique de ${getClubName(club)}.`,

      metadata: buildBaseMetadata({
        club,
        live,
      }),
    }
  );
}

async function notifyShopLiveReplayAvailable({
  club,
  live,
}) {
  assertClub(club);

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .REPLAY_AVAILABLE,

      title:
        `▶️ Le replay de ${getClubName(club)} est disponible`,

      message:
        `Retrouve le replay du live boutique et les produits présentés.`,

      metadata: buildBaseMetadata({
        club,
        live,
        extra: {
          replayUrl:
            live?.replayUrl ||
            live?.replay_url ||
            null,
        },
      }),
    }
  );
}

async function notifyFeaturedProduct({
  club,
  live,
  product,
}) {
  assertClub(club);

  if (!product?.id) {
    const error = new Error(
      "Le produit est obligatoire pour envoyer une notification de mise en avant."
    );

    error.code =
      'SHOP_LIVE_PRODUCT_REQUIRED';

    throw error;
  }

  return notifications.notifyFollowers(
    club.id,
    {
      type:
        SHOP_LIVE_NOTIFICATION_TYPES
          .PRODUCT_FEATURED,

      title:
        `🛍️ Produit présenté en direct`,

      message:
        `${product.name || 'Un produit'} est maintenant mis en avant dans le live de ${getClubName(club)}.`,

      metadata: buildBaseMetadata({
        club,
        live,
        extra: {
          productId: product.id,
          productName:
            product.name || null,
        },
      }),
    }
  );
}

module.exports = {
  SHOP_LIVE_NOTIFICATION_TYPES,
  getClubName,
  buildShopLiveUrl,
  notifyShopLiveScheduled,
  notifyShopLiveReminder,
  notifyShopLiveStarted,
  notifyShopLiveEnded,
  notifyShopLiveReplayAvailable,
  notifyFeaturedProduct,
};