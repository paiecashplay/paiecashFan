import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from './ui/Container';
import { Skeleton } from './ui/Skeleton';
import { LeagueSection } from './LeagueSection';
import { FederationCard } from './FederationCard';
import { EventCard } from './EventCard';
import { DataSourceBadge } from './DataSourceBadge';
import { ligue1, championsEurope, otherSports, events } from '@/data/leagues';
import { federations as fallbackFederations, normalizeFederation } from '@/data/federations';
import { useApi } from '@/hooks/useApi';
import { apiFetch } from '@/lib/api';

// Renderer du contenu selon la catégorie active.
// Onglet "federations" → fetch /api/federations (live, fallback mock).
// Autres onglets → encore en mock, en attendant des endpoints dédiés.
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
          {active === 'fr'          && <Ligue1Live />}
          {active === 'eu'          && (
            <div className="space-y-16">
              {championsEurope.map((l) => <LeagueSection key={l.id} league={l} />)}
            </div>
          )}
          {active === 'others'      && (
            <div className="space-y-16">
              {otherSports.map((l) => <LeagueSection key={l.id} league={l} />)}
            </div>
          )}
          {active === 'federations' && <FederationsGridLive />}
          {active === 'events'      && <EventsGrid items={events} />}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}

// Section Ligue 1 connectée à la base : les clubs sont tagués league_name =
// 'Ligue 1' via la synchro API-Football du BO (montées/descentes gérées là).
// Repli sur les données statiques si l'API ne répond pas ou ne renvoie rien
// (évite une section vide / page blanche).
function Ligue1Live() {
  const [clubs, setClubs] = useState(null); // null = en cours, [] = vide
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/v2/marketplace/clubs?league=' + encodeURIComponent('Ligue 1') + '&limit=40')
      .then((json) => {
        if (cancelled) return;
        const list = (json?.data?.clubs || []).map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          city: c.city || '',
          logo: c.logo_url || '',
          primaryColor: c.primary_color || '#10b981',
        }));
        setClubs(list);
        setIsLive(list.length > 0);
      })
      .catch(() => { if (!cancelled) { setClubs([]); setIsLive(false); } });
    return () => { cancelled = true; };
  }, []);

  if (clubs === null) return <Ligue1Skeleton />;

  // Repli statique si la base ne renvoie aucun club tagué Ligue 1.
  const league = clubs.length > 0
    ? { id: 'ligue-1', name: 'Ligue 1', country: 'France', flag: '🇫🇷', clubs }
    : ligue1;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DataSourceBadge isLive={isLive} />
      </div>
      <LeagueSection league={league} />
    </div>
  );
}

function Ligue1Skeleton() {
  return (
    <section className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

// Section Fédérations connectée à l'API Worker Hono.
// /api/federations renvoie { success, federations: [{ id, name, fullName, flag, region, clubsCount }] }
function FederationsGridLive() {
  const { data, loading, isLive } = useApi('/api/federations', {
    fallback: { success: true, federations: fallbackFederations }
  });

  // Quelle que soit la source (live ou mock), on normalise dans le même shape
  // que FederationCard attend, en mergeant avec les couleurs du map local.
  const rawList = data?.federations || [];
  const items = isLive
    ? rawList.map(normalizeFederation)
    : rawList;

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌐</span>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-bone-50">
              5 fédérations FIFA
            </h2>
            <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold mt-0.5">
              212 sélections nationales · Couverture mondiale
            </div>
          </div>
        </div>
        <DataSourceBadge isLive={isLive} />
      </header>

      {loading ? (
        <FederationsSkeleton />
      ) : (
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => <FederationCard key={f.id} federation={f} index={i} />)}
        </div>
      )}
    </section>
  );
}

function FederationsSkeleton() {
  return (
    <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full max-w-[180px]" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
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
