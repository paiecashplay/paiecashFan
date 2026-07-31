import { useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  scheduledAt: '',
};

function toDateTimeLocal(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

export default function EditShopLiveModal({
  open,
  onClose,
  room,
  updateLive,
  actionLoading = false,
  actionError = '',
  clearActionError,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [localError, setLocalError] = useState('');

  const minimumDateTime = useMemo(() => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;

    return new Date(now.getTime() - timezoneOffset)
      .toISOString()
      .slice(0, 16);
  }, []);

  useEffect(() => {
    if (!open || !room) {
      return;
    }

    setForm({
      title: room.title || '',
      description: room.description || '',
      scheduledAt: toDateTimeLocal(
        room.scheduled_at || room.scheduledAt
      ),
    });

    setLocalError('');
    clearActionError?.();
  }, [open, room, clearActionError]);

  function updateField(name, value) {
    setLocalError('');
    clearActionError?.();

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function handleClose() {
    if (actionLoading) {
      return;
    }

    setLocalError('');
    clearActionError?.();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError('');
    clearActionError?.();

    const title = form.title.trim();
    const description = form.description.trim();
    const scheduledAt = form.scheduledAt || null;

    if (!title) {
      setLocalError('Le titre du live est obligatoire.');
      return;
    }

    if (scheduledAt) {
      const selectedDate = new Date(scheduledAt);

      if (Number.isNaN(selectedDate.getTime())) {
        setLocalError(
          'La date et l’heure sélectionnées sont invalides.'
        );
        return;
      }

      if (
        room?.status !== 'live' &&
        room?.status !== 'ended' &&
        selectedDate <= new Date()
      ) {
        setLocalError(
          'La date de programmation doit être dans le futur.'
        );
        return;
      }
    }

    try {
      await updateLive({
        title,
        description: description || null,
        scheduledAt,
      });

      onClose();
    } catch {
      // L’erreur est déjà gérée dans useShopLive.
    }
  }

  if (!open || !room) {
    return null;
  }

  const displayedError = localError || actionError;
  const isDateLocked =
    room.status === 'live' || room.status === 'ended';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-shop-live-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl"
      >
        {/* Header fixe */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="pr-4">
            <h2
              id="edit-shop-live-title"
              className="font-display text-base font-bold text-bone-50 sm:text-lg"
            >
              Modifier le live boutique
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-bone-500 sm:text-xs">
              Modifiez les informations de la session.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={actionLoading}
            aria-label="Fermer la fenêtre"
            className="shrink-0 rounded-lg p-2 text-bone-400 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:space-y-5 sm:p-6">
          {/* Titre */}
          <div>
            <label
              htmlFor="edit-shop-live-name"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Titre du live
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              id="edit-shop-live-name"
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField('title', event.target.value)
              }
              placeholder="Ex : Nouvelle collection 2026/27"
              maxLength={120}
              disabled={actionLoading}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none transition placeholder:text-bone-600 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-[11px] text-bone-600">
                {form.title.length}/120
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-shop-live-description"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Description
            </label>

            <textarea
              id="edit-shop-live-description"
              rows={5}
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Décrivez votre session Live Shopping..."
              maxLength={500}
              disabled={actionLoading}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none transition placeholder:text-bone-600 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="mt-2 flex justify-end">
              <span className="text-[11px] text-bone-600">
                {form.description.length}/500
              </span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="edit-shop-live-scheduled-at"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Date et heure
            </label>

            <input
              id="edit-shop-live-scheduled-at"
              type="datetime-local"
              min={minimumDateTime}
              value={form.scheduledAt}
              onChange={(event) =>
                updateField('scheduledAt', event.target.value)
              }
              disabled={actionLoading || isDateLocked}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            {isDateLocked ? (
              <p className="mt-2 text-[11px] leading-5 text-bone-500">
                La date ne peut plus être modifiée après le
                démarrage du live.
              </p>
            ) : (
              <p className="mt-2 text-[11px] leading-5 text-bone-500">
                La date doit être située dans le futur.
              </p>
            )}
          </div>

          {/* Informations sur le statut */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold text-bone-300">
              Statut actuel
            </p>

            <p className="mt-2 text-[11px] leading-5 text-bone-500">
              {room.status === 'live' &&
                'Le live est actuellement en cours.'}

              {room.status === 'ended' &&
                'Le live est terminé.'}

              {room.status === 'cancelled' &&
                'Le live a été annulé.'}

              {room.status === 'scheduled' &&
                'Le live est programmé.'}

              {![
                'live',
                'ended',
                'cancelled',
                'scheduled',
              ].includes(room.status) &&
                'Le live est enregistré comme brouillon.'}
            </p>
          </div>

          {/* Erreur */}
          {displayedError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {displayedError}
            </div>
          )}
        </div>

        {/* Footer fixe */}
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={actionLoading}
            className="min-h-10 w-full rounded-xl border border-white/10 px-5 py-2.5 text-sm text-bone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={actionLoading || !form.title.trim()}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[150px]"
          >
            {actionLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check size={16} />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}