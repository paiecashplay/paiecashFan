import { AnimatePresence, motion } from 'framer-motion';
import { Container } from './ui/Container';
import { LeagueSection } from './LeagueSection';
import { FederationCard } from './FederationCard';
import { EventCard } from './EventCard';
import { ligue1, championsEurope, otherSports, events } from '@/data/leagues';
import { federations } from '@/data/federations';

// Renderer du contenu selon la catégorie active.
// La grille (1, 2 ou plusieurs ligues) dépend de l'onglet.
export function CategoryContent({ active }) {
  return (
    <Container className="pt-12 md:pt-16 pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {active === 'fr'         && <LeagueSection league={ligue1} />}
          {active === 'eu'         && (
            <div className="space-y-16">
              {championsEurope.map((l) => <LeagueSection key={l.id} league={l} />)}
            </div>
          )}
          {active === 'others'     && (
            <div className="space-y-16">
              {otherSports.map((l) => <LeagueSection key={l.id} league={l} />)}
            </div>
          )}
          {active === 'federations' && (
            <FederationsGrid items={federations} />
          )}
          {active === 'events' && (
            <EventsGrid items={events} />
          )}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}

function FederationsGrid({ items }) {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="text-3xl">🌐</span>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-bone-50">
            6 fédérations FIFA
          </h2>
          <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold mt-0.5">
            212 sélections nationales · Couverture mondiale
          </div>
        </div>
      </header>
      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => <FederationCard key={f.id} federation={f} index={i} />)}
      </div>
    </section>
  );
}

function EventsGrid({ items }) {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="text-3xl">⭐</span>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-bone-50">
            Évènements à venir
          </h2>
          <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold mt-0.5">
            Les rendez-vous du foot mondial
          </div>
        </div>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
      </div>
    </section>
  );
}
