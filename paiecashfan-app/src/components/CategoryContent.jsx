import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from './ui/Container';
import { Skeleton } from './ui/Skeleton';
import { LeagueSection } from './LeagueSection';
import { FederationCard } from './FederationCard';
import { EventCard } from './EventCard';
import { DataSourceBadge } from './DataSourceBadge';
import { ligue1, otherSports, events } from '@/data/leagues';
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
          {active === 'fr'          && <LeaguesLive leagues={FR_LEAGUES} fallback={ligue1} />}
          {active === 'eu'          && <LeaguesLive leagues={EU_LEAGUES} />}
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

// ─── Ligues affichées (clubs tagués league_name via la synchro BO) ──────────
// `fed` = slug du hub de fédération du pays → bouton « Voir tout ».
const FR_LEAGUES = [
  { league: 'Ligue 1',  country: 'France', flag: '🇫🇷', fed: 'federation-francaise-de-football' },
  { league: 'Ligue 2',  country: 'France', flag: '🇫🇷', fed: 'federation-francaise-de-football' },
  { league: 'National', country: 'France', flag: '🇫🇷', fed: 'federation-francaise-de-football' },
];
const EU_LEAGUES = [
  { league: 'Premier League', country: 'Angleterre', flag: '🏴', fed: 'federation-anglaise-de-football' },
  { league: 'La Liga',        country: 'Espagne',    flag: '🇪🇸', fed: 'federation-royale-espagnole-de-football' },
  { league: 'Serie A',        country: 'Italie',     flag: '🇮🇹', fed: null },
  { league: 'Bundesliga',     country: 'Allemagne',  flag: '🇩🇪', fed: 'federation-allemande-de-football' },
  { league: 'Primeira Liga',  country: 'Portugal',   flag: '🇵🇹', fed: null },
  { league: 'Eredivisie',     country: 'Pays-Bas',   flag: '🇳🇱', fed: 'federation-royale-neerlandaise-de-football' },
];

// Charge en parallèle les clubs de chaque ligue (tagués en base) et rend une
// section par ligue non vide. Repli statique optionnel si rien ne remonte.
function LeaguesLive({ leagues, fallback }) {
  const [sections, setSections] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      leagues.map(async (cfg) => {
        try {
          const json = await apiFetch(`/api/v2/marketplace/clubs?league=${encodeURIComponent(cfg.league)}&limit=24`);
          const clubs = (json?.data?.clubs || []).map((c) => ({
            id: c.id, slug: c.slug, name: c.name,
            city: c.city || '', logo: c.logo_url || '', primaryColor: c.primary_color || '#10b981',
          }));
          return { cfg, clubs };
        } catch { return { cfg, clubs: [] }; }
      })
    ).then((res) => { if (!cancelled) setSections(res); });
    return () => { cancelled = true; };
  }, [leagues]);

  if (sections === null) return <LeaguesSkeleton />;

  const nonEmpty = sections.filter((s) => s.clubs.length > 0);
  if (!nonEmpty.length) {
    if (fallback) return <LeagueSection league={fallback} />;
    return <p className="text-center text-sm text-bone-400 py-16">Championnats bientôt disponibles.</p>;
  }

  return (
    <div className="space-y-16">
      {nonEmpty.map(({ cfg, clubs }) => (
        <LeagueSection
          key={cfg.league}
          league={{
            id: cfg.league,
            name: cfg.league,
            country: cfg.country,
            flag: cfg.flag,
            clubs,
            to: cfg.fed ? `/federations/${cfg.fed}` : null,
          }}
        />
      ))}
    </div>
  );
}

function LeaguesSkeleton() {
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
