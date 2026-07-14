// ═══════════════════════════════════════════════════════════════
// lib/bingoAvailability.js — Source unique côté front pour le badge et le CTA
// d'une édition selon son `availability` (calculée par le SERVEUR) et la carte
// éventuelle du joueur. Ne recalcule PAS l'availability côté navigateur :
// on fait confiance à l'heure serveur (edition.availability). Aucune logique
// dupliquée dans les composants.
// ═══════════════════════════════════════════════════════════════

// Badge par état.
export const AVAIL_BADGE = {
  playable:    { label: 'OUVERTE',              cls: 'bg-emerald-500 text-ink-900', pulse: false },
  upcoming:    { label: 'À VENIR',              cls: 'bg-gold-400 text-ink-900',    pulse: false },
  locked:      { label: 'CLÔTURÉE',             cls: 'bg-white/20 text-bone-100',   pulse: false },
  live:        { label: 'EN DIRECT',            cls: 'bg-red-500 text-white',       pulse: true  },
  calculating: { label: 'CALCUL EN COURS',      cls: 'bg-cyan-500 text-ink-900',    pulse: false },
  completed:   { label: 'TERMINÉ',              cls: 'bg-white/15 text-bone-300',   pulse: false },
  cancelled:   { label: 'ANNULÉE',              cls: 'bg-white/10 text-bone-400',   pulse: false },
};

// Libellé du compte à rebours + champ date cible, selon l'état.
export function countdownFor(availability) {
  if (availability === 'upcoming') return { label: 'Ouverture dans', field: 'starts_at' };
  if (availability === 'playable') return { label: 'Clôture dans', field: 'locks_at' };
  return null; // locked / live / calculating / completed : pas de rebours
}

// CTA contextuel. Renvoie { label, to, kind } ou null (aucune action → carte
// non affichée sur la page principale pour cet utilisateur).
// kind: 'primary' | 'outline' | 'ghost' | 'disabled'
export function editionCta(availability, cardStatus, slug) {
  const play = `/bingo/${slug}`;
  const hasCard = !!cardStatus;
  switch (availability) {
    case 'playable':
      if (!hasCard) return { label: 'Jouer', to: play, kind: 'primary' };
      if (cardStatus === 'draft') return { label: 'Continuer ma grille', to: play, kind: 'primary' };
      return { label: 'Voir ma grille', to: play, kind: 'ghost' };
    case 'upcoming':
      return { label: 'Voir les détails', to: play, kind: 'outline' };
    case 'locked':
      return hasCard ? { label: 'Voir ma grille', to: play, kind: 'ghost' } : null;
    case 'live':
      return hasCard ? { label: 'Suivre ma grille', to: play, kind: 'primary' } : null;
    case 'calculating':
      return hasCard ? { label: 'Résultats en cours', to: play, kind: 'disabled' } : null;
    case 'completed':
      return { label: 'Voir les résultats', to: '/tombola/resultats', kind: 'ghost' };
    default:
      return null;
  }
}
