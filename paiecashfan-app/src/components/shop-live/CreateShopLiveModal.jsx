import { useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';

const INITIAL_FORM = {
  title: '',
  description: '',
  scheduledAt: '',
};

export default function CreateShopLiveModal({
  open,
  onClose,
  createLive,
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

  function updateField(name, value) {
    setLocalError('');
    clearActionError?.();

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setLocalError('');
    clearActionError?.();
  }

  function handleClose() {
    if (actionLoading) {
      return;
    }

    resetForm();
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

      if (selectedDate <= new Date()) {
        setLocalError(
          'Le live doit être programmé dans le futur.'
        );
        return;
      }
    }

    try {
      await createLive({
        title,
        description: description || null,
        scheduledAt,
        scheduledEndAt: null,
        latencyMode: 'normal',
        releasePlayback: true,
      });

      resetForm();
      onClose();
    } catch {
      // L'erreur est déjà gérée dans useShopLive.
    }
  }

  if (!open) {
    return null;
  }

  const displayedError = localError || actionError;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-shop-live-title"
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
              id="create-shop-live-title"
              className="font-display text-base font-bold text-bone-50 sm:text-lg"
            >
              Nouveau live boutique
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-bone-500 sm:text-xs">
              Planifiez une nouvelle session de vente en direct.
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
              htmlFor="shop-live-title"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Titre du live
              <span className="ml-1 text-red-400">*</span>
            </label>

            <input
              id="shop-live-title"
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
              htmlFor="shop-live-description"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Description
            </label>

            <textarea
              id="shop-live-description"
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
              htmlFor="shop-live-scheduled-at"
              className="mb-2 block text-xs font-semibold text-bone-300"
            >
              Date et heure
            </label>

            <input
              id="shop-live-scheduled-at"
              type="datetime-local"
              min={minimumDateTime}
              value={form.scheduledAt}
              onChange={(event) =>
                updateField('scheduledAt', event.target.value)
              }
              disabled={actionLoading}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none transition focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-2 text-[11px] leading-5 text-bone-500">
              Laissez ce champ vide pour créer le live sans
              programmation précise.
            </p>
          </div>

          {/* Informations techniques */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold text-bone-300">
              Configuration de diffusion
            </p>

            <div className="mt-3 space-y-2 text-[11px] leading-5 text-bone-500">
              <p>
                Mode de latence : ultra-faible
              </p>

              <p>
                Replay : activé automatiquement après la fin du
                live.
              </p>
            </div>
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
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[150px] sm:w-auto"
          >
            {actionLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Création...
              </>
            ) : (
              'Créer le live'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}