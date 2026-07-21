import { useEffect, useRef, useState } from 'react';
import { Radio } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Bandeau « Matchs en direct » (API-Football) — grandes compétitions, y compris
// des clubs NON inscrits sur la plateforme. Se masque s'il n'y a aucun live.
export function LiveMatchesStrip() {
  const [matches, setMatches] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const j = await apiFetch('/api/v2/live/matches');
        if (alive) setMatches(j?.data?.available ? (j.data.matches || []) : []);
      } catch { if (alive) setMatches([]); }
      if (alive) timer.current = window.setTimeout(load, 60_000);
    };
    load();
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  if (!matches || matches.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Radio size={16} className="text-red-400" />
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-bone-100">Matchs en direct</h2>
        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-black text-red-400">{matches.length}</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {matches.slice(0, 16).map((m) => (
          <div key={m.fixtureId} className="min-w-[230px] shrink-0 rounded-2xl border border-white/10 bg-ink-900/60 p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-bone-500">{m.competition}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />{m.minute != null ? `${m.minute}'` : 'LIVE'}
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              <TeamRow name={m.homeTeam} logo={m.homeLogo} score={m.homeScore} />
              <TeamRow name={m.awayTeam} logo={m.awayLogo} score={m.awayScore} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamRow({ name, logo, score }) {
  return (
    <div className="flex items-center gap-2">
      {logo
        ? <img src={logo} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        : <span className="h-5 w-5 shrink-0" />}
      <span className="min-w-0 flex-1 truncate text-sm font-bold text-bone-100">{name}</span>
      <span className="font-display text-base font-black tabular-nums text-bone-50">{score ?? 0}</span>
    </div>
  );
}
