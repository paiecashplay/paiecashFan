import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ClubCard } from './ClubCard';

// Une "section ligue" = un titre (avec flag + nom) suivi de la grille de clubs.
// Utilisé dans tous les onglets Football France / Européen / Autres sports
// (chaque onglet peut afficher 1 ou plusieurs ligues).
export function LeagueSection({ league }) {
  return (
    <section className="space-y-6">
      <motion.header
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>{league.flag}</span>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-bone-50">
              {league.name}
            </h2>
            <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold mt-0.5">
              {league.country} · {league.clubs.length} clubs
            </div>
          </div>
        </div>
        <a
          href={`#${league.id}`}
          className="hidden md:inline-flex items-center gap-1 text-xs text-bone-300 hover:text-cyan-400 font-semibold uppercase tracking-[0.14em] transition-colors"
        >
          Voir tout
          <ChevronRight size={14} />
        </a>
      </motion.header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {league.clubs.map((club, idx) => (
          <ClubCard key={club.id} club={club} index={idx} />
        ))}
      </div>
    </section>
  );
}
