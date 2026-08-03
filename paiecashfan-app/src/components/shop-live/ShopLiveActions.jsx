import {
  Ban,
  Loader2,
  Pencil,
  Play,
  RefreshCw,
  Square,
} from 'lucide-react';

export default function ShopLiveActions({
  room,
  actionLoading = false,
  loadingAction = '',
  onEdit,
  onStart,
  onCancel,
  onEnd,
  onRefresh,
}) {
  if (!room) {
    return null;
  }

  const status = room.status || 'draft';

  const canEdit = !['ended', 'cancelled'].includes(status);

  const canStart = ['draft', 'scheduled', 'ready'].includes(
    status
  );

  const canCancel = ['draft', 'scheduled', 'ready'].includes(
    status
  );

  const canEnd = status === 'live';

  function isCurrentAction(actionName) {
    return actionLoading && loadingAction === actionName;
  }

  return (
    <section
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
      aria-labelledby="shop-live-actions-title"
    >
      <div className="flex flex-col gap-1">
        <h2
          id="shop-live-actions-title"
          className="font-display text-base font-bold text-bone-50"
        >
          Actions du live
        </h2>

        <p className="text-xs leading-5 text-bone-500">
          Gérez la programmation et la diffusion de votre live
          boutique.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {canEdit && (
          <button
            type="button"
            onClick={onEdit}
            disabled={actionLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-bone-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={16} />
            Modifier
          </button>
        )}

        {canStart && (
          <button
            type="button"
            onClick={onStart}
            disabled={actionLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCurrentAction('start') ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}

            {isCurrentAction('start')
              ? 'Démarrage...'
              : 'Démarrer le live'}
          </button>
        )}

        {canEnd && (
          <button
            type="button"
            onClick={onEnd}
            disabled={actionLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCurrentAction('end') ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Square size={16} />
            )}

            {isCurrentAction('end')
              ? 'Arrêt...'
              : 'Terminer le live'}
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={actionLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCurrentAction('cancel') ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Ban size={16} />
            )}

            {isCurrentAction('cancel')
              ? 'Annulation...'
              : 'Annuler le live'}
          </button>
        )}

        <button
          type="button"
          onClick={onRefresh}
          disabled={actionLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-bone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCurrentAction('refresh') ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}

          {isCurrentAction('refresh')
            ? 'Actualisation...'
            : 'Actualiser'}
        </button>
      </div>

      {status === 'ended' && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <p className="text-xs leading-5 text-emerald-300">
            Ce live est terminé. Les actions de programmation et
            de diffusion sont désactivées.
          </p>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <p className="text-xs leading-5 text-red-300">
            Ce live a été annulé et ne peut plus être démarré.
          </p>
        </div>
      )}
    </section>
  );
}