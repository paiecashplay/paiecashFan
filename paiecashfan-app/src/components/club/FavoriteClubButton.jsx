import { Star, Loader2 } from 'lucide-react';
import { useFavoriteClub } from '@/hooks/useFavoriteClub';

export function FavoriteClubButton({
  tenantId,
  className = '',
}) {
  const {
    favorite,
    busy,
    toggleFavorite,
  } = useFavoriteClub(tenantId);

  if (!tenantId) return null;

  const active = favorite === true;

  return (
    <button
      onClick={toggleFavorite}
      disabled={busy}
      aria-pressed={active}
      title={
        active
          ? 'Retirer de mes clubs'
          : 'Suivre ce club pour recevoir ses actus'
      }
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all disabled:opacity-60 ${
        active
          ? 'border-gold-400/50 bg-gold-400/15 text-gold-400 shadow-[0_0_24px_-8px_rgba(251,191,36,0.7)]'
          : 'border-white/15 bg-ink-900/60 text-bone-200 hover:border-gold-400/40 hover:text-gold-400'
      } ${className}`}
    >
      {busy ? (
        <Loader2
          size={14}
          className="animate-spin"
        />
      ) : (
        <Star
          size={14}
          className={
            active
              ? 'fill-gold-400'
              : ''
          }
        />
      )}

      <span className="hidden sm:inline">
        {active
          ? 'Club suivi'
          : 'Suivre ce club'}
      </span>
    </button>
  );
}