import { useEffect, useState } from 'react';
import ShopLiveObs from './ShopLiveObs';
import { ShopLiveChat } from './ShopLiveChat';
import { useShopLiveChat } from '@/hooks/useShopLiveChat';

import {
  AlertCircle,
  CalendarDays,
  Clock,
  Info,
  Loader2,
  Plus,
  Radio,
  ShoppingBag,
  Users,
} from 'lucide-react';

import { useShopLive } from '@/hooks/useShopLive';
import { useClubProducts } from '@/hooks/useClubProducts';

import CreateShopLiveModal from './CreateShopLiveModal';
import EditShopLiveModal from './EditShopLiveModal';
import ConfirmShopLiveModal from './ConfirmShopLiveModal';
import AddShopLiveProductsModal from './AddShopLiveProductsModal';
import ShopLiveActions from './ShopLiveActions';
import ShopLiveProducts from './ShopLiveProducts';

const STATUS_CONFIG = {
  draft: {
    label: 'Brouillon',
    className: 'bg-white/5 text-bone-400',
  },

  creating: {
    label: 'Création en cours',
    className: 'bg-amber-500/10 text-amber-400',
  },

  ready: {
    label: 'Prêt',
    className: 'bg-cyan-500/10 text-cyan-400',
  },

  scheduled: {
    label: 'Programmé',
    className: 'bg-cyan-500/10 text-cyan-400',
  },

  live: {
    label: 'En direct',
    className: 'bg-red-500/10 text-red-400',
  },

  ended: {
    label: 'Terminé',
    className: 'bg-emerald-500/10 text-emerald-400',
  },

  cancelled: {
    label: 'Annulé',
    className: 'bg-white/5 text-bone-500',
  },

  failed: {
    label: 'Échec',
    className: 'bg-red-500/10 text-red-400',
  },
};

function formatDate(value) {
  if (!value) {
    return 'Non programmée';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Non programmée';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export default function ShopLiveTab({ club }) {
  const clubSlug =
    club?.slug ||
    club?.clubSlug ||
    '';

  const tenantId =
    club?.id ||
    club?.tenant_id ||
    club?.tenantId ||
    '';

  const {
    room,

    liveProducts,

    loading,
    actionLoading,

    error,
    actionError,

    reload,

    createLive,
    updateLive,
    cancelLive,
    startLive,
    refreshBroadcastUrl,
    endLive,

    setLiveProducts,
    removeLiveProduct,
    featureProduct,

    clearActionError,
  } = useShopLive(clubSlug);

  const {
    products: availableProducts,

    loading: productsLoading,

    error: productsError,
  } = useClubProducts(tenantId);

  // Chat en direct pour la modération (le club répond aux questions depuis le BO).
  const liveChat = useShopLiveChat(room?.id || null, {
    enabled: ['ready', 'live'].includes(room?.status),
  });
    const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [productsModalOpen,
    setProductsModalOpen] =
    useState(false);

  const [confirmAction,
    setConfirmAction] =
    useState(null);

  const [loadingAction,
    setLoadingAction] =
    useState('');

  // Compte à rebours de validité du lien studio (BytePlus : ~300 s).
  const [studioExpireAt, setStudioExpireAt] =
    useState(null); // timestamp Unix (s)

  const [nowTs, setNowTs] = useState(() =>
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    if (!studioExpireAt) return undefined;
    const t = setInterval(
      () => setNowTs(Math.floor(Date.now() / 1000)),
      1000
    );
    return () => clearInterval(t);
  }, [studioExpireAt]);

  const studioSecondsLeft = studioExpireAt
    ? Math.max(0, studioExpireAt - nowTs)
    : null;

  const status =
    STATUS_CONFIG[room?.status] || {
      label: 'Hors ligne',
      className:
        'bg-white/5 text-bone-500',
    };

    const featuredProductId =
    room?.featured_product_id ||
    room?.featuredProductId ||
    null;

  const isBusy =
    actionLoading ||
    Boolean(loadingAction);

  function openCreateModal() {
    clearActionError();
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (isBusy) {
      return;
    }

    clearActionError();
    setCreateOpen(false);
  }

  function openEditModal() {
    clearActionError();
    setEditOpen(true);
  }

  function closeEditModal() {
    if (isBusy) {
      return;
    }

    clearActionError();
    setEditOpen(false);
  }

  function openProductsModal() {
    clearActionError();
    setProductsModalOpen(true);
  }

  function closeProductsModal() {
    if (
      actionLoading ||
      loadingAction === 'save-products'
    ) {
      return;
    }

    clearActionError();
    setProductsModalOpen(false);
  }

  function openCancelConfirmation() {
    clearActionError();

    setConfirmAction({
      type: 'cancel',
      title: 'Annuler le live',
      description:
        'Le live sera annulé et ne pourra plus être démarré.',
      confirmLabel: 'Annuler le live',
      confirmVariant: 'danger',
    });
  }

  function openEndConfirmation() {
    clearActionError();

    setConfirmAction({
      type: 'end',
      title: 'Terminer le live',
      description:
        'La diffusion sera arrêtée immédiatement et le live passera au statut terminé.',
      confirmLabel: 'Terminer le live',
      confirmVariant: 'warning',
    });
  }

  function closeConfirmation() {
    if (
      loadingAction === 'cancel' ||
      loadingAction === 'end'
    ) {
      return;
    }

    clearActionError();
    setConfirmAction(null);
  }

  async function handleStartLive() {
    try {
      clearActionError();
      setLoadingAction('start');

      const result = await startLive();
      // Ouvre le studio de diffusion navigateur (le club passe en direct sans login).
      if (result?.broadcastExpireAt) {
        setStudioExpireAt(result.broadcastExpireAt);
      }
      if (result?.broadcastUrl) {
        window.open(result.broadcastUrl, '_blank', 'noopener');
      }
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

  // Régénère un lien FRAIS puis ouvre le studio (le lien BytePlus expire vite).
  async function handleOpenStudio() {
    try {
      clearActionError();
      setLoadingAction('studio');

      const res = await refreshBroadcastUrl();
      if (res?.broadcastExpireAt) {
        setStudioExpireAt(res.broadcastExpireAt);
      }
      if (res?.broadcastUrl) {
        window.open(res.broadcastUrl, '_blank', 'noopener');
      }
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

  async function handleRefresh() {
    try {
      clearActionError();
      setLoadingAction('refresh');

      await reload();
    } catch {
      // L’erreur de chargement est déjà gérée par le hook.
    } finally {
      setLoadingAction('');
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction?.type) {
      return;
    }

    const actionType = confirmAction.type;

    try {
      clearActionError();
      setLoadingAction(actionType);

      if (actionType === 'cancel') {
        await cancelLive();
      }

      if (actionType === 'end') {
        await endLive();
      }

      setConfirmAction(null);
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

  async function handleSaveProducts(
    selectedProducts
  ) {
    try {
      clearActionError();
      setLoadingAction('save-products');

      await setLiveProducts(
        selectedProducts
      );

      setProductsModalOpen(false);
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

  async function handleFeatureProduct(
    productId
  ) {
    try {
      clearActionError();

      setLoadingAction(
        `feature-${productId}`
      );

      await featureProduct(productId);
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

  async function handleRemoveProduct(
    productId
  ) {
    const confirmed =
      window.confirm(
        'Retirer ce produit du live boutique ?'
      );

    if (!confirmed) {
      return;
    }

    try {
      clearActionError();

      setLoadingAction(
        `remove-${productId}`
      );

      await removeLiveProduct(
        productId
      );
    } catch {
      // useShopLive renseigne déjà actionError.
    } finally {
      setLoadingAction('');
    }
  }

    if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-emerald-400"
          />

          <p className="mt-4 text-sm text-bone-400">
            Chargement du live boutique...
          </p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle
            size={22}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <h2 className="font-display text-base font-bold text-red-200">
              Impossible de charger le live boutique
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isBusy}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingAction === 'refresh' && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-bone-50">
                Live Boutique
              </h2>

              <p className="mt-1 text-xs text-bone-500">
                Gérez les sessions de vente en direct du club.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              disabled={isBusy}
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 text-xs font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Plus size={14} />
              Nouveau live
            </button>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Radio
                size={24}
                className="text-bone-500"
              />
            </div>

            <h3 className="mt-5 text-base font-bold text-bone-100">
              Aucun live boutique
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-bone-500">
              Aucun live n’est actuellement programmé pour ce
              club. Créez une session pour présenter les produits
              de la boutique aux supporters.
            </p>
          </section>
        </div>

        <CreateShopLiveModal
          open={createOpen}
          onClose={closeCreateModal}
          createLive={createLive}
          actionLoading={actionLoading}
          actionError={actionError}
          clearActionError={clearActionError}
        />
      </>
    );
  }

  const scheduledAt =
    room?.scheduled_at ||
    room?.scheduledAt ||
    null;

  const viewerCount =
    room?.viewer_count ??
    room?.viewerCount ??
    room?.current_viewers ??
    0;

    return (
    <>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-bone-50">
              Live Boutique
            </h2>

            <p className="mt-1 text-xs text-bone-500">
              Gérez les sessions de vente en direct du club.
            </p>
          </div>
        </div>

        {/* Résumé du live */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="break-words font-display text-xl font-bold text-bone-50">
                    {room.title || 'Live boutique'}
                  </h3>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}
                  >
                    {room.status === 'live' && (
                      <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                    )}

                    {status.label}
                  </span>
                </div>

                {room.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-bone-400">
                    {room.description}
                  </p>
                )}
              </div>

              {room.status === 'live' && (
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300">
                    <Radio size={16} className="animate-pulse" />
                    Diffusion en cours
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-ink-900/80 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <CalendarDays
                    size={18}
                    className="text-bone-400"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-bone-600">
                    Programmation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-bone-200">
                    {formatDate(scheduledAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ink-900/80 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Users
                    size={18}
                    className="text-bone-400"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-bone-600">
                    Spectateurs
                  </p>

                  <p className="mt-1 text-sm font-semibold text-bone-200">
                    {Number(viewerCount).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ink-900/80 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <ShoppingBag
                    size={18}
                    className="text-bone-400"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-bone-600">
                    Produits
                  </p>

                  <p className="mt-1 text-sm font-semibold text-bone-200">
                    {liveProducts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diffusion OBS (MediaLive) — accès générés automatiquement */}
        {['ready', 'live'].includes(room.status) && (
          <ShopLiveObs liveId={room.id} />
        )}

        {/* Modération du chat : le club répond aux questions des supporters */}
        {['ready', 'live'].includes(room.status) && (
          <section className="space-y-2">
            <div>
              <h3 className="font-display text-base font-bold text-bone-50">Modération du chat</h3>
              <p className="text-xs text-bone-500">
                Réponds aux questions des supporters (ton message porte le badge « Club »). Utilise
                « Répondre » pour citer une question précise.
              </p>
            </div>
            <ShopLiveChat chat={liveChat} className="h-[480px]" />
          </section>
        )}

        {/* Erreur d’action */}
        {actionError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <p className="text-sm leading-6 text-red-300">
              {actionError}
            </p>
          </div>
        )}

        {/* Actions */}
        <ShopLiveActions
          room={room}
          actionLoading={isBusy}
          loadingAction={loadingAction}
          onEdit={openEditModal}
          onStart={handleStartLive}
          onCancel={openCancelConfirmation}
          onEnd={openEndConfirmation}
          onRefresh={handleRefresh}
        />

        {/* Produits du live */}
        <ShopLiveProducts
          products={liveProducts}
          featuredProductId={featuredProductId}
          actionLoading={isBusy}
          onFeatureProduct={handleFeatureProduct}
          onRemoveProduct={handleRemoveProduct}
          onAddProducts={openProductsModal}
        />
      </div>

        <CreateShopLiveModal
        open={createOpen}
        onClose={closeCreateModal}
        club={club}
        reload={reload}
        createLive={createLive}
        actionLoading={actionLoading}
        actionError={actionError}
        clearActionError={clearActionError}
      />

      <EditShopLiveModal
        open={editOpen}
        onClose={closeEditModal}
        room={room}
        updateLive={updateLive}
        actionLoading={actionLoading}
        actionError={actionError}
        clearActionError={clearActionError}
      />

      <ConfirmShopLiveModal
        open={Boolean(confirmAction)}
        onClose={closeConfirmation}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel={confirmAction?.confirmLabel}
        confirmVariant={confirmAction?.confirmVariant}
        loading={
          loadingAction === 'cancel' ||
          loadingAction === 'end'
        }
        onConfirm={handleConfirmAction}
      />

      <AddShopLiveProductsModal
        open={productsModalOpen}
        onClose={closeProductsModal}
        availableProducts={availableProducts}
        selectedProducts={liveProducts}
        onSave={handleSaveProducts}
        loading={
          actionLoading ||
          productsLoading ||
          loadingAction === 'save-products'
        }
        error={productsError || actionError}
        clearError={clearActionError}
      />
    </>
  );
}
