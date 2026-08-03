import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmShopLiveModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'danger',
  loading = false,
}) {
  if (!open) {
    return null;
  }

  const confirmButtonClass =
    confirmVariant === 'primary'
      ? 'bg-gradient-hero hover:opacity-90'
      : confirmVariant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-500'
      : 'bg-red-600 hover:bg-red-500';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle
              size={22}
              className="text-red-400"
            />
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-bone-50">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs leading-5 text-bone-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-xl border border-white/10 px-5 py-2.5 text-sm text-bone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${confirmButtonClass}`}
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Traitement...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}