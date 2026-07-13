import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid3x3, Trophy, HelpCircle, Coins, Plus, Users, Star, BarChart3, Clock,
  Pencil, Lock, Timer, Gift, ArrowRight, CheckCircle2, HeartHandshake, Crown, Medal,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const FMT = { express: '3×3', standard: '5×5', expert: '6×6' };
const MATCHES = { express: 9, standard: 24, expert: 36 };
const FIGURE_LABELS = {
  LINE_HORIZONTAL: 'Ligne', LINE_VERTICAL: 'Colonne', DIAGONAL: 'Diagonale', FOUR_CORNERS: '4 coins',
  DOUBLE_LINE: 'Double ligne', TRIPLE_LINE: 'Triple ligne', SQUARE_2X2: 'Carré', CROSS: 'Croix', X_SHAPE: 'X', FULL_CARD: 'BINGO 🎉',
};

// Statut → présentation (badge, accent, dégradé de secours).
const STATUS_META = {
  live:      { label: 'EN DIRECT', badge: 'bg-red-500 text-white', ring: 'border-red-500/50 hover:border-red-500/80', accent: 'text-red-400', bar: 'bg-red-500', glow: 'shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)]', fallback: 'from-red-950 via-ink-950 to-ink-950' },
  open:      { label: 'OUVERTE',  badge: 'bg-emerald-500 text-ink-900', ring: 'border-emerald-500/40 hover:border-emerald-400/70', accent: 'text-emerald-400', bar: 'bg-emerald-400', glow: 'shadow-[0_0_50px_-14px_rgba(16,185,129,0.5)]', fallback: 'from-emerald-950 via-ink-950 to-ink-950' },
  scheduled: { label: 'À VENIR',  badge: 'bg-gold-400 text-ink-900', ring: 'border-gold-400/40 hover:border-gold-400/70', accent: 'text-gold-400', bar: 'bg-gold-400', glow: '', fallback: 'from-amber-950 via-ink-950 to-ink-950' },
};
const metaOf = (s) => STATUS_META[s] || STATUS_META.open;

const pad = (n) => String(n).padStart(2, '0');
function fmtCountdown(target, now) {
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
  if (d > 0) return `${d}j ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
function progressPct(startAt, target, now) {
  const end = new Date(target).getTime();
  const start = startAt ? new Date(startAt).getTime() : end - 7 * 86400000;
  if (!(end > start)) return 100;
  return Math.max(2, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
}

const HOW = [
  { icon: Grid3x3, title: 'Choisis une édition', text: 'Sélectionne ton thème favori.' },
  { icon: Pencil, title: 'Complète ta grille', text: 'Pronostique 1 (dom.), N (nul) ou 2 (ext.).' },
  { icon: Lock, title: 'Confirme avant clôture', text: 'Ta grille est verrouillée au coup d\'envoi.' },
  { icon: Timer, title: 'Suis les matchs en direct', text: 'Tes cases se valident automatiquement.' },
  { icon: Trophy, title: 'Aligne & gagne', text: 'Complète des figures et gagne des points !' },
];

export function SportBingo() {
  const { user } = useAuth();
  const [editions, setEditions] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [credits, setCredits] = useState(null);
  const [now, setNow] = useState(() => Date.parse(new Date().toISOString()));

  useEffect(() => {
    apiFetch('/api/v2/bingo').then((j) => setEditions(j.data?.editions || [])).catch(() => setEditions([]));
    apiFetch('/api/v2/bingo/leaderboard').then((j) => setLeaderboard(j.data?.entries || [])).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) { setMyCards([]); setCredits(null); return; }
    apiFetch('/api/v2/bingo/me/cards').then((j) => setMyCards(j.data?.cards || [])).catch(() => {});
    apiFetch('/api/v2/bingo/me/credits').then((j) => setCredits(j.data?.balance ?? null)).catch(() => {});
  }, [user]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const playable = useMemo(() => (editions || []).filter((e) => ['open', 'scheduled', 'live'].includes(e.status)), [editions]);
  const draftByEdition = useMemo(() => {
    const m = {};
    myCards.forEach((c) => { if (c.edition_id && (c.status === 'draft' || c.status === 'submitted')) m[c.edition_id] = c.status; });
    return m;
  }, [myCards]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-5%,rgba(16,185,129,0.15),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.1),transparent_40%)]" />

      <Container className="relative py-10 md:py-14">
        {/* ── En-tête ─────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"><Grid3x3 size={24} /></div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-bone-50 leading-none">Sport <span className="text-emerald-400">Bingo</span></h1>
              <p className="mt-1 text-sm text-bone-400">Pronostique, aligne, gagne des points !</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-bone-500 font-bold">Mes crédits</p>
                  <p className="font-display text-lg font-black text-emerald-400 inline-flex items-center gap-1 leading-none"><Coins size={15} /> {credits ?? '—'}</p>
                </div>
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"><Plus size={14} /></span>
              </div>
            )}
            <a href="#comment-jouer" className="grid place-items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-center hover:border-white/20">
              <HelpCircle size={18} className="text-bone-300 mx-auto" /><span className="mt-0.5 text-[10px] uppercase tracking-widest text-bone-400 font-bold">Règles</span>
            </a>
            <a href="#classement" className="grid place-items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-center hover:border-white/20">
              <Trophy size={18} className="text-gold-400 mx-auto" /><span className="mt-0.5 text-[10px] uppercase tracking-widest text-bone-400 font-bold">Classement</span>
            </a>
          </div>
        </div>

        {/* ── Éditions en cours ───────────────────────────── */}
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Star size={18} className="text-emerald-400" /> Éditions en cours</h2>
            <p className="mt-1 text-sm text-bone-400">Choisis une édition et complète ta grille avant la clôture.</p>
          </div>
          <a href="#classement" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300">Voir toutes <ArrowRight size={15} /></a>
        </div>

        {editions === null ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[380px] rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : playable.length === 0 ? (
          <GlassCard className="mt-6 p-12 text-center">
            <Grid3x3 className="mx-auto text-bone-600" size={44} />
            <p className="mt-4 text-sm text-bone-400">Aucune édition ouverte pour le moment. Reviens bientôt !</p>
          </GlassCard>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playable.map((ed) => <EditionCard key={ed.id} ed={ed} now={now} draft={draftByEdition[ed.id]} />)}
          </div>
        )}

        {/* ── Mes cartes ──────────────────────────────────── */}
        {user && myCards.length > 0 && (
          <div className="mt-16">
            <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Coins size={18} className="text-emerald-400" /> Mes cartes</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myCards.map((c) => <MyCard key={c.id} card={c} />)}
            </div>
          </div>
        )}

        {/* ── Comment jouer ───────────────────────────────── */}
        <div id="comment-jouer" className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-8 scroll-mt-24">
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-emerald-400">Comment jouer ?</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] items-center">
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {HOW.map((s, i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="relative inline-grid h-14 w-14 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400">
                    <s.icon size={22} />
                    <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-[11px] font-black text-ink-900">{i + 1}</span>
                  </div>
                  <h3 className="mt-3 font-display text-sm font-black text-bone-50">{s.title}</h3>
                  <p className="mt-1 text-xs text-bone-500">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/[0.06] p-5 text-center lg:text-left">
              <Gift size={26} className="text-fuchsia-400 mx-auto lg:mx-0" />
              <p className="mt-3 text-sm font-bold text-bone-100">Plus tu gagnes,<br />plus tu montes dans le classement !</p>
              <a href="#classement" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-bone-100 hover:bg-white/15 transition">
                Voir le classement <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Classement ──────────────────────────────────── */}
        <div id="classement" className="mt-16 scroll-mt-24">
          <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Trophy size={18} className="text-gold-400" /> Classement</h2>
          {leaderboard.length === 0 ? (
            <GlassCard className="mt-6 p-8 text-center text-sm text-bone-400">Le classement s'affichera dès la première édition clôturée.</GlassCard>
          ) : (
            <GlassCard className="mt-6 p-2 sm:p-4">
              <div className="divide-y divide-white/5">
                {leaderboard.map((e) => <LeaderRow key={e.userId} e={e} me={e.userId === user?.id} />)}
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── Jeu responsable ─────────────────────────────── */}
        <GlassCard className="mt-16 p-6 md:p-8 border border-emerald-400/15">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><HeartHandshake size={20} /></div>
            <div>
              <h3 className="font-display text-lg font-black uppercase text-bone-50">Jeu responsable</h3>
              <p className="mt-2 text-sm text-bone-400 max-w-2xl">Le Sport Bingo se joue avec des <b className="text-bone-200">crédits virtuels</b>, sans argent réel : un jeu gratuit et convivial entre supporters. Réservé aux 18 ans et plus.</p>
            </div>
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}

// ── Carte d'édition (maquette) ───────────────────────────────
function EditionCard({ ed, now, draft }) {
  const meta = metaOf(ed.status);
  const isUpcoming = ed.status === 'scheduled';
  const target = isUpcoming ? (ed.starts_at || ed.locks_at) : (ed.locks_at || ed.ends_at);
  const cd = target ? fmtCountdown(target, now) : null;
  const pct = target ? progressPct(ed.starts_at, target, now) : 100;
  const subtitle = ed.theme?.subtitle || ed.badge || null;
  const cta = draft ? 'Continuer ma grille' : (isUpcoming ? 'Voir détails' : 'Jouer');
  const ctaCls = draft ? (ed.status === 'live' ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-emerald-500 text-ink-900 hover:bg-emerald-400')
    : isUpcoming ? 'border border-gold-400/50 text-gold-300 hover:bg-gold-400/10'
    : 'bg-emerald-500 text-ink-900 hover:bg-emerald-400';

  return (
    <Link to={`/bingo/${ed.slug}`} className={`group relative flex flex-col rounded-2xl border overflow-hidden bg-ink-950 transition-all ${meta.ring} ${meta.glow}`} style={{ minHeight: 380 }}>
      {/* Fond */}
      <div className="absolute inset-0">
        {ed.cover_url
          ? <img src={ed.cover_url} alt="" className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
          : <div className={`h-full w-full bg-gradient-to-b ${meta.fallback}`} />}
        {/* Dégradé bas (lisibilité du texte) + léger voile haut (badges) */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/5" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950/70 to-transparent" />
      </div>

      {/* Contenu */}
      <div className="relative flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between">
          <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${meta.badge}`}>{meta.label}</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-bone-200"><span className="tabular-nums">{ed.players ?? 0}</span> <Users size={13} className="text-bone-400" /></span>
        </div>

        <div className="mt-auto pt-6 text-center">
          <h3 className="font-display text-2xl font-black uppercase leading-[0.95] text-bone-50 drop-shadow">{ed.title}</h3>
          {subtitle && <p className="mt-1.5 text-xs text-bone-300">{subtitle}</p>}
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-bold text-bone-300">
          <span className="inline-flex items-center gap-1"><Grid3x3 size={12} /> {FMT[ed.format] || '5×5'}</span>
          <span className="text-bone-600">·</span>
          <span>{MATCHES[ed.format] || 24} matchs</span>
          <span className="text-bone-600">·</span>
          <span className="inline-flex items-center gap-1"><BarChart3 size={12} /> {(ed.difficulty || 'standard').replace(/^./, (c) => c.toUpperCase())}</span>
        </div>

        {/* Compte à rebours */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-bone-400">{isUpcoming ? 'Débute dans' : 'Clôture dans'}</span>
            <span className={`inline-flex items-center gap-1 font-black tabular-nums ${meta.accent}`}><Clock size={11} /> {cd || '—'}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Gain max */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-bone-400">Gain max</span>
          <span className="inline-flex items-center gap-1 font-black text-bone-100"><Star size={12} className="text-gold-400" /> {ed.reward_points || 0} pts</span>
        </div>

        <div className={`mt-4 w-full rounded-xl py-2.5 text-center text-sm font-black uppercase tracking-wide transition ${ctaCls}`}>{cta}</div>
      </div>
    </Link>
  );
}

// ── Mes cartes ───────────────────────────────────────────────
function MyCard({ card }) {
  const ed = card.edition;
  const st = { draft: { l: 'À compléter', c: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10' }, submitted: { l: 'En attente', c: 'text-gold-400 border-gold-400/30 bg-gold-400/10' }, scored: { l: 'Notée', c: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' } }[card.status] || {};
  return (
    <Link to={ed ? `/bingo/${ed.slug}` : '#'}>
      <GlassCard className="p-5 h-full hover:border-white/20 transition-all border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-black text-bone-50 line-clamp-1">{ed?.title || 'Édition'}</h3>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${st.c}`}>{st.l}</span>
        </div>
        <p className="mt-1 text-xs text-bone-500">Grille {FMT[card.format] || '5×5'}</p>
        {card.status === 'scored' ? (
          <div className="mt-4">
            <p className="font-display text-2xl font-black text-gold-400">{card.points_total} pts</p>
            {Array.isArray(card.figures_won) && card.figures_won.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {card.figures_won.slice(0, 4).map((f) => <span key={f} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-bone-300">{FIGURE_LABELS[f] || f}</span>)}
                {card.figures_won.length > 4 && <span className="text-[10px] text-bone-500 font-bold">+{card.figures_won.length - 4}</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-bone-300">
            {card.status === 'draft' ? <><Pencil size={13} className="text-cyan-300" /> Reprendre ma grille</> : <><CheckCircle2 size={13} className="text-gold-400" /> En attente des résultats</>}
          </div>
        )}
      </GlassCard>
    </Link>
  );
}

// ── Ligne de classement ──────────────────────────────────────
function LeaderRow({ e, me }) {
  const podium = e.rank <= 3;
  const RankIcon = e.rank === 1 ? Crown : Medal;
  const rankColor = e.rank === 1 ? 'text-gold-400' : e.rank === 2 ? 'text-bone-300' : e.rank === 3 ? 'text-amber-600' : 'text-bone-500';
  return (
    <div className={`flex items-center gap-3 px-3 py-3 ${me ? 'bg-emerald-400/[0.06] rounded-xl' : ''}`}>
      <div className="w-8 shrink-0 text-center">{podium ? <RankIcon size={20} className={`mx-auto ${rankColor}`} /> : <span className="font-display font-black text-bone-500">{e.rank}</span>}</div>
      <div className="h-9 w-9 shrink-0 rounded-full bg-white/10 border border-white/10 overflow-hidden grid place-items-center">
        {e.avatar ? <img src={e.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-black text-bone-400">{(e.name || '?').charAt(0).toUpperCase()}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-bone-100 truncate">{e.name}{me && <span className="ml-2 text-[10px] uppercase tracking-widest text-emerald-400 font-black">Toi</span>}</p>
        {e.bingos > 0 && <p className="text-[11px] text-bone-500">{e.bingos} BINGO{e.bingos > 1 ? 's' : ''}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="font-display text-lg font-black text-emerald-400 tabular-nums">{e.points}</p>
        <p className="text-[9px] uppercase tracking-widest text-bone-500 font-bold">points</p>
      </div>
    </div>
  );
}
