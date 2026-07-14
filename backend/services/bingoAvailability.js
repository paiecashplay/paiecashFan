// ═══════════════════════════════════════════════════════════════
// services/bingoAvailability.js — Source unique de vérité pour l'état
// « réel » d'une édition Sport Bingo. Le STATUT stocké et les DATES SERVEUR
// décident ensemble : les dates protègent même si un job de sync a échoué.
//
// Mapping schéma : starts_at = ouverture des inscriptions (registration_open_at)
//                  locks_at  = clôture des inscriptions   (registration_close_at)
//
// Utilisé côté backend (routes, participation) ET renvoyé au front (affichage).
// ═══════════════════════════════════════════════════════════════

const AVAILABILITIES = ['draft', 'upcoming', 'playable', 'locked', 'live', 'calculating', 'completed', 'cancelled'];

// État réel d'une édition à l'instant `now` (heure SERVEUR par défaut).
function getEditionAvailability(edition, now = new Date()) {
  if (!edition) return 'cancelled';
  const t = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const s = edition.status;

  // États terminaux / explicites : le statut prime.
  if (s === 'cancelled') return 'cancelled';
  if (s === 'completed') return 'completed';
  if (s === 'calculating') return 'calculating';
  if (s === 'live') return 'live';
  if (s === 'draft') return 'draft';
  if (s === 'locked') return 'locked';

  const openAt = edition.starts_at ? new Date(edition.starts_at).getTime() : null;
  const closeAt = edition.locks_at ? new Date(edition.locks_at).getTime() : null;

  // open : ce sont les DATES qui protègent (guardrail anti-participation tardive).
  if (s === 'open') {
    if (openAt != null && t < openAt) return 'upcoming';   // publiée en avance
    if (closeAt != null && t >= closeAt) return 'locked';  // clôture atteinte → plus de participation
    return 'playable';
  }

  // scheduled : publiée mais pas encore ouverte (un job la passera en `open`).
  if (s === 'scheduled') return 'upcoming';

  return 'upcoming';
}

// L'édition est-elle visible sur la PAGE PRINCIPALE (hors « Mes grilles ») ?
// draft / completed / cancelled n'y apparaissent jamais.
function isVisibleOnMain(availability) {
  return ['upcoming', 'playable', 'locked', 'live', 'calculating'].includes(availability);
}

// Peut-on CRÉER / MODIFIER une carte ? Uniquement si `playable`.
function isPlayable(availability) {
  return availability === 'playable';
}

module.exports = { AVAILABILITIES, getEditionAvailability, isVisibleOnMain, isPlayable };
