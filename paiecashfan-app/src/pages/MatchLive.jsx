import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Loader2, BarChart3, ListOrdered } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { apiFetch } from '@/lib/api';

const LIVE = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];

// Statistiques mises en avant (libellé FR + clé API-Football).
const STAT_ROWS = [
  ['Possession', 'Ball Possession'],
  ['Tirs', 'Total Shots'],
  ['Tirs cadrés', 'Shots on Goal'],
  ['Corners', 'Corner Kicks'],
  ['Fautes', 'Fouls'],
  ['Cartons jaunes', 'Yellow Cards'],
];

// « Match center » : score / statut / événements / stats en direct (API-Football).
// Aucune vidéo (droits de diffusion) — données + lien vers les salons des clubs inscrits.
export function MatchLive() {
  const { fixtureId } = useParams();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | empty
  const timer = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const j = await apiFetch(`/api/v2/live/match/${encodeURIComponent(fixtureId)}`);
        if (!alive) return;
        if (j?.data?.available && j.data.match) {
          setData(j.data);
          setState('ok');
          if (LIVE.includes(j.data.match.statusShort)) timer.current = window.setTimeout(load, 45_000);
        } else setState('empty');
      } catch { if (alive) setState('empty'); }
    };
    load();
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, [fixtureId]);

  return (
    <div className="min-h-[calc(100vh-80px)] py-8 sm:py-10">
      <Container className="max-w-3xl px-4 sm:px-6">
        <Link to="/fan-club" className="mb-6 inline-flex items-center gap-2 text-xs text-bone-400 transition-colors hover:text-bone-100">
          <ArrowLeft size={14} /> Retour aux matchs
        </Link>

        {state === 'loading' && (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
        )}

        {state === 'empty' && (
          <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-10 text-center text-sm text-bone-400">
            Match indisponible pour le moment.
          </div>
        )}

        {state === 'ok' && data?.match && <MatchView match={data.match} events={data.events || []} statistics={data.statistics || []} />}
      </Container>
    </div>
  );
}

function MatchView({ match, events, statistics }) {
  const live = LIVE.includes(match.statusShort);
  const statusLabel = live
    ? `${match.minute != null ? `${match.minute}'` : 'EN DIRECT'}`
    : match.statusShort === 'FT' ? 'Terminé'
    : match.statusShort === 'NS' || match.statusShort === 'TBD' ? (match.kickoff ? new Date(match.kickoff).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'À venir')
    : (match.statusLong || match.statusShort);

  return (
    <div className="space-y-6">
      {/* En-tête compétition + statut */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-bone-500">{match.competition}</p>
          {match.round && <p className="truncate text-[11px] text-bone-600">{match.round}</p>}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${live ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-bone-400'}`}>
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}{statusLabel}
        </span>
      </div>

      {/* Scoreboard */}
      <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <TeamBlock name={match.homeTeam} logo={match.homeLogo} slug={match.homeSlug} />
          <div className="text-center">
            <div className="font-display text-4xl font-black tabular-nums text-bone-50">
              {match.homeScore ?? 0}<span className="mx-2 text-bone-600">-</span>{match.awayScore ?? 0}
            </div>
          </div>
          <TeamBlock name={match.awayTeam} logo={match.awayLogo} slug={match.awaySlug} align="right" />
        </div>
      </div>

      {/* CTA salons des clubs inscrits */}
      {(match.homeSlug || match.awaySlug) ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {match.homeSlug && <SalonCTA slug={match.homeSlug} team={match.homeTeam} />}
          {match.awaySlug && <SalonCTA slug={match.awaySlug} team={match.awayTeam} />}
        </div>
      ) : (
        <p className="text-center text-xs text-bone-600">Les clubs de ce match ne sont pas encore sur PaieCashFan.</p>
      )}

      {/* Événements */}
      {events.length > 0 && (
        <Section icon={ListOrdered} title="Fil du match">
          <ul className="space-y-2">
            {events.slice().reverse().map((e, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-9 shrink-0 text-right font-black tabular-nums text-bone-400">
                  {e.minute != null ? `${e.minute}${e.extra ? `+${e.extra}` : ''}'` : ''}
                </span>
                <span className="shrink-0">{eventIcon(e)}</span>
                <span className="min-w-0">
                  <span className="font-bold text-bone-100">{e.player || e.team}</span>
                  {e.type === 'Goal' && e.assist && <span className="text-bone-500"> (passe : {e.assist})</span>}
                  {e.type === 'subst' && e.assist && <span className="text-bone-500"> ↩ {e.assist}</span>}
                  {e.detail && e.type !== 'Goal' && <span className="text-bone-500"> — {e.detail}</span>}
                  <span className="ml-1 text-[11px] text-bone-600">· {e.team}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Statistiques */}
      {statistics.length >= 2 && (
        <Section icon={BarChart3} title="Statistiques">
          <div className="space-y-3">
            {STAT_ROWS.map(([label, key]) => {
              const h = statValue(statistics, match.homeTeamId, key);
              const a = statValue(statistics, match.awayTeamId, key);
              if (h == null && a == null) return null;
              return <StatRow key={key} label={label} home={h} away={a} />;
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function TeamBlock({ name, logo, slug, align = 'left' }) {
  const content = (
    <div className={`flex items-center gap-2.5 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {logo ? <img src={logo} alt="" className="h-10 w-10 shrink-0 object-contain" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
        : <span className="h-10 w-10 shrink-0" />}
      <span className={`min-w-0 font-display text-sm font-black ${slug ? 'text-emerald-300' : 'text-bone-50'}`}>{name}</span>
    </div>
  );
  return slug ? <Link to={`/clubs/${slug}/fan-club`} className="transition-opacity hover:opacity-80">{content}</Link> : content;
}

function SalonCTA({ slug, team }) {
  return (
    <Link to={`/clubs/${slug}/fan-club`}
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-300 transition-colors hover:bg-emerald-500/15">
      <MessageCircle size={14} /> Discuter — {team}
    </Link>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-emerald-400" />
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-bone-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, home, away }) {
  const hn = pctNum(home), an = pctNum(away);
  const total = hn + an;
  const hPct = total > 0 ? Math.round((hn / total) * 100) : 50;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-black tabular-nums text-bone-100">{home ?? 0}</span>
        <span className="text-[11px] uppercase tracking-wider text-bone-500">{label}</span>
        <span className="font-black tabular-nums text-bone-100">{away ?? 0}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="bg-emerald-400/70" style={{ width: `${hPct}%` }} />
        <div className="bg-sky-400/60" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

// ── helpers ──
function eventIcon(e) {
  if (e.type === 'Goal') return e.detail === 'Own Goal' ? '⚽️' : '⚽';
  if (e.type === 'Card') return e.detail === 'Red Card' ? '🟥' : '🟨';
  if (e.type === 'subst') return '🔄';
  if (e.type === 'Var') return '📺';
  return '•';
}
function statValue(statistics, teamId, key) {
  const t = statistics.find((s) => s.teamId === teamId);
  if (!t) return null;
  const s = (t.stats || []).find((x) => x.type === key);
  return s ? s.value : null;
}
function pctNum(v) {
  if (v == null) return 0;
  const n = parseInt(String(v).replace('%', ''), 10);
  return Number.isFinite(n) ? n : 0;
}
