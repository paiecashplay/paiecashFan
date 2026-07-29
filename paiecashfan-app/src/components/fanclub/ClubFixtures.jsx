import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const LIVE = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];

// « Matchs du club » : résultats récents + prochains matchs (API-Football),
// cliquables vers la page match center (/match/:fixtureId). Masqué si le club
// n'a pas d'`api_football_id` ou aucun match. Sert à retrouver un match passé.
export function ClubFixtures({ slug }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!slug) return undefined;
    let alive = true;
    apiFetch(`/api/v2/live/club/${encodeURIComponent(slug)}/fixtures`)
      .then((j) => { if (alive) setData(j?.data?.available ? j.data : null); })
      .catch(() => {});
    return () => { alive = false; };
  }, [slug]);

  const recent = data?.recent || [];
  const upcoming = data?.upcoming || [];
  if (!recent.length && !upcoming.length) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={16} className="text-emerald-400" />
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-bone-100">Matchs du club</h2>
      </div>
      {upcoming.length > 0 && <Group label="À venir" items={upcoming} kind="upcoming" />}
      {recent.length > 0 && <Group label="Résultats récents" items={recent} kind="recent" />}
    </section>
  );
}

function Group({ label, items, kind }) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-bone-500">{label}</p>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {items.map((m) => <FixtureCard key={m.fixtureId} m={m} kind={kind} />)}
      </div>
    </div>
  );
}

function FixtureCard({ m, kind }) {
  const live = LIVE.includes(m.statusShort);
  const dateStr = m.kickoff ? new Date(m.kickoff).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
  return (
    <Link to={`/match/${m.fixtureId}`}
      className="min-w-[210px] shrink-0 rounded-xl border border-white/10 bg-ink-900/60 p-3 transition-colors hover:border-emerald-400/50">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-bone-500">
        <span className="truncate">{m.competition}</span>
        <span className={live ? 'shrink-0 text-red-400' : 'shrink-0'}>{live ? `${m.minute ?? ''}' LIVE` : dateStr}</span>
      </div>
      <div className="mt-2 space-y-1">
        <TeamLine name={m.homeTeam} logo={m.homeLogo} score={m.homeScore} kind={kind} highlight={!!m.homeSlug} />
        <TeamLine name={m.awayTeam} logo={m.awayLogo} score={m.awayScore} kind={kind} highlight={!!m.awaySlug} />
      </div>
    </Link>
  );
}

function TeamLine({ name, logo, score, kind, highlight }) {
  return (
    <div className="flex items-center gap-2">
      {logo
        ? <img src={logo} alt="" className="h-4 w-4 shrink-0 object-contain" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        : <span className="h-4 w-4 shrink-0" />}
      <span className={`min-w-0 flex-1 truncate text-xs font-bold ${highlight ? 'text-emerald-300' : 'text-bone-100'}`}>{name}</span>
      {kind === 'recent' && <span className="shrink-0 text-xs font-black tabular-nums text-bone-50">{score ?? 0}</span>}
    </div>
  );
}
