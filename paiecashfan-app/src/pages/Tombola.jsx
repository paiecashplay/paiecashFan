// ============================================================
// PAGE TOMBOLA — Tâche de prise en main (stagiaire front)
// ------------------------------------------------------------
// Objectif : transformer ce SCAFFOLD en une vraie page Tombola
// en utilisant le design system du projet (Container, Badge,
// GlassCard, Button) + Tailwind + framer-motion.
//
// Ce fichier est volontairement un POINT DE DÉPART : la structure
// et le style de base sont posés, à toi de compléter les `TODO`.
//
// 👉 Voir la fiche de tâche complète plus bas dans ce commentaire.
//
// ── FICHE DE TÂCHE ──────────────────────────────────────────
// [G0] Page Tombola — prise en main
//
//  Objectif : une page /tombola présentable avec :
//    1. Un hero (titre + sous-titre + badge "Tirage du jour")
//    2. Une card "Tirage en cours" : lot, compte à rebours, nb de
//       tickets, bouton "Acheter un ticket"
//    3. Une section "Comment ça marche" (3 étapes)
//    4. Une grille "Tirages passés" (gagnant, date, lot)
//
//  Contraintes :
//    - Utiliser UNIQUEMENT le design system (pas de couleurs en dur
//      hors palette : bone / ink / emerald / gold / cyan).
//    - Responsive (mobile-first), tester à 375px et 1280px.
//    - Animations d'apparition avec framer-motion (whileInView).
//
//  Critères de validation :
//    - [ ] Le compte à rebours décrémente réellement (setInterval)
//    - [ ] La grille des tirages passés map sur PAST_DRAWS
//    - [ ] Le bouton "Acheter un ticket" ouvre une modale (ou toast)
//    - [ ] Aucune erreur console, build OK (npm run build)
//    - [ ] Rendu correct mobile + desktop
//
//  Pour aller plus loin (optionnel) :
//    - Brancher sur l'API quand l'endpoint sera prêt (ne pas faire
//      maintenant — garder les données mock ci-dessous).
// ============================================================

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

// ─── Données mock (à remplacer par l'API plus tard) ─────────
// TODO(stagiaire): ces données sont temporaires. Garde-les pour
// l'instant, on branchera l'API dans une tâche ultérieure.
const CURRENT_DRAW = {
  prizeLabel: 'Maillot signé + 500 PCC',
  endsAt: '2026-06-30T20:00:00', // TODO: calculer le compte à rebours à partir de cette date
  ticketPricePcc: 50,
  ticketsSold: 128,
  ticketsTotal: 500,
};

const STEPS = [
  { n: 1, title: 'Achète un ticket', text: 'Avec tes PCC, en un clic.' },
  { n: 2, title: 'Attends le tirage', text: 'Chaque jour à 20h00.' },
  { n: 3, title: 'Gagne des lots', text: 'Maillots, PCC, expériences VIP.' },
];

const PAST_DRAWS = [
  { id: 1, date: '21 juin 2026', winner: 'Awa K.',   prize: 'Maillot domicile OM' },
  { id: 2, date: '20 juin 2026', winner: 'Yanis B.', prize: '1 000 PCC' },
  { id: 3, date: '19 juin 2026', winner: 'Lina T.',  prize: 'Écharpe collector' },
];

export function Tombola() {
  return (
    <div className="relative">
      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24">
        <Container className="text-center">
          <Badge variant="gold">🎟️ Tirage du jour</Badge>
          <h1 className="mt-6 font-display text-display-xl font-bold tracking-tight">
            <span className="text-gradient-hero">Tombola</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-bone-300">
            Tente ta chance chaque jour : maillots signés, PCC et expériences VIP.
          </p>
        </Container>
      </section>

      {/* ═══ TIRAGE EN COURS ════════════════════════════════════ */}
      <Container className="pb-12">
        <GlassCard variant="strong" className="p-6 md:p-8 max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">Lot à gagner</p>
              <h2 className="mt-1 font-display text-2xl md:text-3xl font-black text-bone-50">
                {CURRENT_DRAW.prizeLabel}
              </h2>

              {/* TODO(stagiaire): remplacer ce compte à rebours STATIQUE par un
                  vrai timer qui décrémente jusqu'à CURRENT_DRAW.endsAt.
                  Indice : useState + useEffect + setInterval(1000). */}
              <div className="mt-4 inline-flex items-center gap-2 font-mono text-xl text-gold-400">
                <span>00</span>:<span>00</span>:<span>00</span>
                <span className="text-[10px] text-bone-500 ml-1">avant le tirage</span>
              </div>

              {/* TODO(stagiaire): barre de progression tickets vendus / total
                  (ticketsSold / ticketsTotal). */}
              <p className="mt-3 text-xs text-bone-400">
                {CURRENT_DRAW.ticketsSold} / {CURRENT_DRAW.ticketsTotal} tickets vendus
              </p>
            </div>

            <div className="shrink-0 text-center">
              <p className="font-display text-3xl font-black text-emerald-400">
                {CURRENT_DRAW.ticketPricePcc} <span className="text-sm">PCC</span>
              </p>
              <p className="text-[10px] text-bone-500 mb-3">le ticket</p>
              {/* TODO(stagiaire): au clic, ouvrir une modale d'achat (ou un toast
                  "bientôt disponible"). S'inspirer de la modale produit de la boutique. */}
              <Button variant="gold" size="md">Acheter un ticket</Button>
            </div>
          </div>
        </GlassCard>
      </Container>

      {/* ═══ COMMENT ÇA MARCHE ══════════════════════════════════ */}
      <Container className="pb-12">
        <h2 className="font-display text-xl font-black text-bone-50 mb-6 text-center">Comment ça marche</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <GlassCard key={s.n} className="p-5 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center font-black text-emerald-400">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-bone-100">{s.title}</h3>
              <p className="mt-1 text-xs text-bone-400">{s.text}</p>
            </GlassCard>
          ))}
        </div>
      </Container>

      {/* ═══ TIRAGES PASSÉS ═════════════════════════════════════ */}
      <Container className="pb-24">
        <h2 className="font-display text-xl font-black text-bone-50 mb-6">Tirages passés</h2>
        {/* TODO(stagiaire): transformer en grille de cards plus riches
            (avatar gagnant, mise en avant du lot, animation d'apparition). */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAST_DRAWS.map((d) => (
            <GlassCard key={d.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-bone-100">{d.winner}</p>
                <p className="text-[10px] text-bone-500">{d.date}</p>
              </div>
              <span className="text-xs text-gold-400 font-semibold">{d.prize}</span>
            </GlassCard>
          ))}
        </div>
      </Container>
    </div>
  );
}
