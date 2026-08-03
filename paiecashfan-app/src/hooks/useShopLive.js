import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Gestion du live boutique administrable d'un club.
 *
 * Pour le moment :
 * - le chargement initial tente d'utiliser le backend existant ;
 * - les actions restent simulées localement ;
 * - les blocs TODO BACKEND indiquent précisément où brancher l'API.
 *
 * Important :
 * - liveProducts = produits associés au live ;
 * - le catalogue complet du club est chargé par useClubProducts.
 */
export function useShopLive(slug) {
  const [room, setRoom] = useState(null);

  const [liveProducts, setLiveProductsState] = useState([]);

  const [byteplusConfigured, setByteplusConfigured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  /**
   * Charge le live courant ainsi que les produits qui lui sont associés.
   */
  const load = useCallback(async () => {
    if (!slug) {
      setRoom(null);
      setLiveProductsState([]);
      setByteplusConfigured(false);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(
        `/api/v2/shop-live/club/${encodeURIComponent(
          slug
        )}/admin`
      );

      setRoom(response?.data?.room || null);

      setLiveProductsState(
        Array.isArray(response?.data?.products)
          ? response.data.products
          : []
      );

      setByteplusConfigured(
        Boolean(response?.data?.byteplusConfigured)
      );
    } catch (loadError) {
      setRoom(null);
      setLiveProductsState([]);
      setByteplusConfigured(false);

      const message = loadError?.message || '';

      if (
        loadError?.status === 404 ||
        message.includes('shop_live_rooms') ||
        message.includes('schema cache')
      ) {
        // Le module reste utilisable pendant que la migration
        // Supabase ou la connexion backend ne sont pas prêtes.
        setError('');
      } else {
        setError(
          message ||
            'Impossible de charger le live boutique.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

    /**
   * Crée localement un live boutique.
   *
   * TODO BACKEND :
   * POST /api/v2/shop-live/club/:slug/create
   */
  const createLive = useCallback(
    async (payload) => {
      setActionLoading(true);
      setActionError('');

      try {
        const title = String(
          payload?.title || ''
        ).trim();

        if (!title) {
          throw new Error(
            'Le titre du live est obligatoire.'
          );
        }

        const scheduledAt =
          payload?.scheduledAt || null;

        const scheduledEndAt =
          payload?.scheduledEndAt || null;

        if (
          scheduledAt &&
          Number.isNaN(
            Date.parse(scheduledAt)
          )
        ) {
          throw new Error(
            'La date de programmation est invalide.'
          );
        }

        if (
          scheduledAt &&
          new Date(scheduledAt) <=
            new Date()
        ) {
          throw new Error(
            'La date de programmation doit être dans le futur.'
          );
        }

        if (
          scheduledEndAt &&
          Number.isNaN(
            Date.parse(scheduledEndAt)
          )
        ) {
          throw new Error(
            'La date de fin est invalide.'
          );
        }

        if (
          scheduledAt &&
          scheduledEndAt &&
          new Date(scheduledEndAt) <=
            new Date(scheduledAt)
        ) {
          throw new Error(
            'La date de fin doit être postérieure à la date de début.'
          );
        }

        /*
         * TODO BACKEND
         *
         * const response = await apiFetch(
         *   `/api/v2/shop-live/club/${encodeURIComponent(
         *     slug
         *   )}/create`,
         *   {
         *     method: 'POST',
         *     body: JSON.stringify({
         *       title,
         *       description:
         *         payload?.description || null,
         *       scheduledAt,
         *       scheduledEndAt,
         *       coverUrl:
         *         payload?.coverUrl || null,
         *       verticalCoverUrl:
         *         payload?.verticalCoverUrl || null,
         *       latencyMode:
         *         payload?.latencyMode || 'normal',
         *       releasePlayback:
         *         payload?.releasePlayback !== false,
         *     }),
         *   }
         * );
         *
         * const createdRoom =
         *   response?.data?.room || null;
         *
         * setRoom(createdRoom);
         * setLiveProductsState([]);
         *
         * return createdRoom;
         */

        const now =
          new Date().toISOString();

        const simulatedRoom = {
          id:
            globalThis.crypto?.randomUUID?.() ||
            `shop-live-${Date.now()}`,

          title,

          description:
            String(
              payload?.description || ''
            ).trim() || null,

          cover_url:
            payload?.coverUrl || null,

          status: 'ready',

          scheduled_at:
            scheduledAt,

          scheduled_end_at:
            scheduledEndAt,

          started_at: null,
          ended_at: null,

          replay_url: null,
          viewer_url: null,

          viewer_count: 0,

          featured_product_id: null,

          latency_mode:
            payload?.latencyMode ||
            'normal',

          release_playback:
            payload?.releasePlayback !== false,

          created_at: now,
          updated_at: now,

          isSimulated: true,
        };

        setRoom(simulatedRoom);
        setLiveProductsState([]);

        return simulatedRoom;
      } catch (createError) {
        const message =
          createError?.message ||
          'Impossible de créer le live boutique.';

        setActionError(message);
        throw createError;
      } finally {
        setActionLoading(false);
      }
    },
    [slug]
  );

    /**
   * Modifie localement les informations du live.
   *
   * TODO BACKEND :
   * PATCH /api/v2/shop-live/:liveId
   */
  const updateLive = useCallback(
    async (updates) => {
      if (!room?.id) {
        throw new Error(
          'Aucun live boutique à modifier.'
        );
      }

      setActionLoading(true);
      setActionError('');

      try {
        const normalizedUpdates = {};

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'title'
          )
        ) {
          const title = String(
            updates?.title || ''
          ).trim();

          if (!title) {
            throw new Error(
              'Le titre du live ne peut pas être vide.'
            );
          }

          normalizedUpdates.title = title;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'description'
          )
        ) {
          normalizedUpdates.description =
            String(
              updates?.description || ''
            ).trim() || null;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'scheduledAt'
          )
        ) {
          const scheduledAt =
            updates?.scheduledAt || null;

          if (
            scheduledAt &&
            Number.isNaN(
              Date.parse(scheduledAt)
            )
          ) {
            throw new Error(
              'La date de programmation est invalide.'
            );
          }

          if (
            scheduledAt &&
            room.status !== 'live' &&
            room.status !== 'ended' &&
            new Date(scheduledAt) <=
              new Date()
          ) {
            throw new Error(
              'La date de programmation doit être dans le futur.'
            );
          }

          normalizedUpdates.scheduled_at =
            scheduledAt;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'scheduledEndAt'
          )
        ) {
          const scheduledEndAt =
            updates?.scheduledEndAt || null;

          if (
            scheduledEndAt &&
            Number.isNaN(
              Date.parse(scheduledEndAt)
            )
          ) {
            throw new Error(
              'La date de fin est invalide.'
            );
          }

          normalizedUpdates.scheduled_end_at =
            scheduledEndAt;
        }

        const nextScheduledAt =
          normalizedUpdates.scheduled_at !==
          undefined
            ? normalizedUpdates.scheduled_at
            : room.scheduled_at ||
              room.scheduledAt ||
              null;

        const nextScheduledEndAt =
          normalizedUpdates.scheduled_end_at !==
          undefined
            ? normalizedUpdates.scheduled_end_at
            : room.scheduled_end_at ||
              room.scheduledEndAt ||
              null;

        if (
          nextScheduledAt &&
          nextScheduledEndAt &&
          new Date(nextScheduledEndAt) <=
            new Date(nextScheduledAt)
        ) {
          throw new Error(
            'La date de fin doit être postérieure à la date de début.'
          );
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'coverUrl'
          )
        ) {
          normalizedUpdates.cover_url =
            updates?.coverUrl || null;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'verticalCoverUrl'
          )
        ) {
          normalizedUpdates.vertical_cover_url =
            updates?.verticalCoverUrl || null;
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'latencyMode'
          )
        ) {
          normalizedUpdates.latency_mode =
            updates?.latencyMode ||
            'normal';
        }

        if (
          Object.prototype.hasOwnProperty.call(
            updates || {},
            'releasePlayback'
          )
        ) {
          normalizedUpdates.release_playback =
            updates?.releasePlayback !==
            false;
        }

        /*
         * TODO BACKEND
         *
         * const response = await apiFetch(
         *   `/api/v2/shop-live/${encodeURIComponent(
         *     room.id
         *   )}`,
         *   {
         *     method: 'PATCH',
         *     body: JSON.stringify(updates),
         *   }
         * );
         *
         * const updatedRoom =
         *   response?.data?.room || null;
         *
         * setRoom(updatedRoom);
         *
         * return updatedRoom;
         */

        const updatedRoom = {
          ...room,
          ...normalizedUpdates,
          updated_at:
            new Date().toISOString(),
        };

        setRoom(updatedRoom);

        return updatedRoom;
      } catch (updateError) {
        const message =
          updateError?.message ||
          'Impossible de modifier le live boutique.';

        setActionError(message);
        throw updateError;
      } finally {
        setActionLoading(false);
      }
    },
    [room]
  );

    /**
   * Annule localement le live.
   *
   * TODO BACKEND :
   * DELETE /api/v2/shop-live/:liveId
   */
  const cancelLive = useCallback(async () => {
    if (!room?.id) {
      throw new Error(
        'Aucun live boutique à annuler.'
      );
    }

    if (room.status === 'live') {
      throw new Error(
        'Un live en cours doit être terminé avant d’être annulé.'
      );
    }

    if (room.status === 'ended') {
      throw new Error(
        'Un live terminé ne peut pas être annulé.'
      );
    }

    setActionLoading(true);
    setActionError('');

    try {
      /*
       * TODO BACKEND
       *
       * await apiFetch(
       *   `/api/v2/shop-live/${encodeURIComponent(
       *     room.id
       *   )}`,
       *   {
       *     method: 'DELETE',
       *   }
       * );
       */

      const cancelledRoom = {
        ...room,
        status: 'cancelled',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // On libère l’interface pour permettre
      // la création immédiate d’un nouveau live.
      setRoom(null);
      setLiveProductsState([]);

      return cancelledRoom;
    } catch (cancelError) {
      const message =
        cancelError?.message ||
        'Impossible d’annuler le live boutique.';

      setActionError(message);
      throw cancelError;
    } finally {
      setActionLoading(false);
    }
  }, [room]);

  /**
   * Démarre localement le live.
   *
   * TODO BACKEND :
   * POST /api/v2/shop-live/:liveId/start
   */
  const startLive = useCallback(async () => {
    if (!room?.id) {
      throw new Error(
        'Aucun live boutique à démarrer.'
      );
    }

    if (room.status === 'live') {
      throw new Error(
        'Ce live est déjà en cours.'
      );
    }

    if (
      room.status === 'ended' ||
      room.status === 'cancelled'
    ) {
      throw new Error(
        'Un live terminé ou annulé ne peut pas être démarré.'
      );
    }

    setActionLoading(true);
    setActionError('');

    try {
      /*
       * TODO BACKEND
       *
       * const response = await apiFetch(
       *   `/api/v2/shop-live/${encodeURIComponent(
       *     room.id
       *   )}/start`,
       *   {
       *     method: 'POST',
       *   }
       * );
       *
       * const startedRoom =
       *   response?.data?.room || null;
       *
       * setRoom(startedRoom);
       * return startedRoom;
       */

      const now =
        new Date().toISOString();

      const startedRoom = {
        ...room,
        status: 'live',
        started_at:
          room.started_at ||
          room.startedAt ||
          now,
        ended_at: null,
        updated_at: now,
      };

      setRoom(startedRoom);

      return startedRoom;
    } catch (startError) {
      const message =
        startError?.message ||
        'Impossible de démarrer le live boutique.';

      setActionError(message);
      throw startError;
    } finally {
      setActionLoading(false);
    }
  }, [room]);

  /**
   * Termine localement le live.
   *
   * TODO BACKEND :
   * POST /api/v2/shop-live/:liveId/end
   */
  const endLive = useCallback(
    async ({ replayUrl = null } = {}) => {
      if (!room?.id) {
        throw new Error(
          'Aucun live boutique à terminer.'
        );
      }

      if (room.status !== 'live') {
        throw new Error(
          'Seul un live en cours peut être terminé.'
        );
      }

      setActionLoading(true);
      setActionError('');

      try {
        /*
         * TODO BACKEND
         *
         * const response = await apiFetch(
         *   `/api/v2/shop-live/${encodeURIComponent(
         *     room.id
         *   )}/end`,
         *   {
         *     method: 'POST',
         *     body: JSON.stringify({
         *       replayUrl,
         *     }),
         *   }
         * );
         *
         * const endedRoom =
         *   response?.data?.room || null;
         *
         * setRoom(null);
         * setLiveProductsState([]);
         * return endedRoom;
         */

        const endedRoom = {
          ...room,
          status: 'ended',
          replay_url: replayUrl,
          ended_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        };

        setRoom(null);
        setLiveProductsState([]);

        return endedRoom;
      } catch (endError) {
        const message =
          endError?.message ||
          'Impossible de terminer le live boutique.';

        setActionError(message);
        throw endError;
      } finally {
        setActionLoading(false);
      }
    },
    [room]
  );

    /**
   * Remplace les produits associés au live.
   *
   * TODO BACKEND :
   * PUT /api/v2/shop-live/:liveId/products
   */
  const setLiveProducts = useCallback(
    async (selectedProducts) => {
      if (!room?.id) {
        throw new Error(
          'Crée le live avant de sélectionner des produits.'
        );
      }

      const normalizedProducts = Array.isArray(
        selectedProducts
      )
        ? selectedProducts.filter(Boolean)
        : [];

      setActionLoading(true);
      setActionError('');

      try {
        /*
         * TODO BACKEND
         *
         * const productIds = normalizedProducts
         *   .map(
         *     (product) =>
         *       product?.id ||
         *       product?.product_id
         *   )
         *   .filter(Boolean);
         *
         * const response = await apiFetch(
         *   `/api/v2/shop-live/${encodeURIComponent(
         *     room.id
         *   )}/products`,
         *   {
         *     method: 'PUT',
         *     body: JSON.stringify({
         *       productIds,
         *     }),
         *   }
         * );
         *
         * const savedProducts = Array.isArray(
         *   response?.data?.products
         * )
         *   ? response.data.products
         *   : [];
         *
         * setLiveProductsState(savedProducts);
         *
         * return savedProducts;
         */

        setLiveProductsState(normalizedProducts);

        return normalizedProducts;
      } catch (productsError) {
        const message =
          productsError?.message ||
          'Impossible d’associer les produits au live.';

        setActionError(message);
        throw productsError;
      } finally {
        setActionLoading(false);
      }
    },
    [room]
  );

  /**
   * Retire un produit du live.
   *
   * TODO BACKEND :
   * DELETE /api/v2/shop-live/:liveId/products/:productId
   */
  const removeLiveProduct = useCallback(
    async (productId) => {
      if (!room?.id) {
        throw new Error(
          'Aucun live boutique actif.'
        );
      }

      if (!productId) {
        throw new Error(
          'Le produit est invalide.'
        );
      }

      setActionLoading(true);
      setActionError('');

      try {
        /*
         * TODO BACKEND
         *
         * await apiFetch(
         *   `/api/v2/shop-live/${encodeURIComponent(
         *     room.id
         *   )}/products/${encodeURIComponent(
         *     productId
         *   )}`,
         *   {
         *     method: 'DELETE',
         *   }
         * );
         */

        setLiveProductsState((currentProducts) =>
          currentProducts.filter(
            (product) =>
              String(
                product?.id ||
                  product?.product_id
              ) !== String(productId)
          )
        );

        setRoom((currentRoom) => {
          if (!currentRoom) {
            return currentRoom;
          }

          const featuredProductId =
            currentRoom.featured_product_id ||
            currentRoom.featuredProductId ||
            null;

          if (
            String(featuredProductId) !==
            String(productId)
          ) {
            return currentRoom;
          }

          return {
            ...currentRoom,
            featured_product_id: null,
            featuredProductId: null,
            updated_at:
              new Date().toISOString(),
          };
        });

        return true;
      } catch (removeError) {
        const message =
          removeError?.message ||
          'Impossible de retirer ce produit du live.';

        setActionError(message);
        throw removeError;
      } finally {
        setActionLoading(false);
      }
    },
    [room]
  );

  /**
   * Met un produit en avant pendant le live.
   *
   * TODO BACKEND :
   * PATCH /api/v2/shop-live/:liveId/featured-product
   */
  const featureProduct = useCallback(
    async (productId) => {
      if (!room?.id) {
        throw new Error(
          'Aucun live boutique actif.'
        );
      }

      if (!productId) {
        throw new Error(
          'Le produit est invalide.'
        );
      }

      const selectedProduct =
        liveProducts.find(
          (product) =>
            String(
              product?.id ||
                product?.product_id
            ) === String(productId)
        );

      if (!selectedProduct) {
        throw new Error(
          'Ce produit n’est pas associé au live boutique.'
        );
      }

      setActionLoading(true);
      setActionError('');

      try {
        /*
         * TODO BACKEND
         *
         * const response = await apiFetch(
         *   `/api/v2/shop-live/${encodeURIComponent(
         *     room.id
         *   )}/featured-product`,
         *   {
         *     method: 'PATCH',
         *     body: JSON.stringify({
         *       productId,
         *     }),
         *   }
         * );
         *
         * setRoom((currentRoom) =>
         *   currentRoom
         *     ? {
         *         ...currentRoom,
         *         featured_product_id:
         *           productId,
         *         featuredProductId:
         *           productId,
         *         updated_at:
         *           new Date().toISOString(),
         *       }
         *     : currentRoom
         * );
         *
         * return (
         *   response?.data
         *     ?.featuredProduct ||
         *   selectedProduct
         * );
         */

        setRoom((currentRoom) =>
          currentRoom
            ? {
                ...currentRoom,
                featured_product_id:
                  productId,
                featuredProductId:
                  productId,
                updated_at:
                  new Date().toISOString(),
              }
            : currentRoom
        );

        return selectedProduct;
      } catch (featureError) {
        const message =
          featureError?.message ||
          'Impossible de mettre ce produit en avant.';

        setActionError(message);
        throw featureError;
      } finally {
        setActionLoading(false);
      }
    },
    [liveProducts, room]
  );

    /**
   * Efface l’erreur liée à une action.
   */
  const clearActionError = useCallback(() => {
    setActionError('');
  }, []);

  return {
    room,
    liveProducts,
    byteplusConfigured,

    loading,
    actionLoading,

    error,
    actionError,

    reload: load,

    createLive,
    updateLive,
    cancelLive,
    startLive,
    endLive,

    setLiveProducts,
    removeLiveProduct,
    featureProduct,

    clearActionError,
  };
}