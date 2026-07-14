import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid3x3, Trophy, HelpCircle, Coins, Plus, Star, Clock,
  Pencil, Lock, Timer, Sparkles, ArrowRight, CheckCircle2, HeartHandshake, Crown, Medal,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { EditionCard, FMT } from '@/components/bingo/EditionCard';

const FIGURE_LABELS = {
  LINE_HORIZONTAL: 'Ligne', LINE_VERTICAL: 'Colonne', DIAGONAL: 'Diagonale', FOUR_CORNERS: '4 coins',
  DOUBLE_LINE: 'Double ligne', TRIPLE_LINE: 'Triple ligne', SQUARE_2X2: 'Carré', CROSS: 'Croix', X_SHAPE: 'X', FULL_CARD: 'BINGO 🎉',
};

const HOW = [
  { icon: Grid3x3, color: 'violet',  title: 'Choisis une édition', text: 'Sélectionne ton thème favori.' },
  { icon: Pencil,  color: 'emerald', title: 'Complète ta grille', text: 'Pronostique 1 (dom.), N (nul) ou 2 (ext.).' },
  { icon: Lock,    color: 'gold',    title: 'Confirme avant clôture', text: 'Ta grille est verrouillée au coup d\'envoi.' },
  { icon: Timer,   color: 'emerald', title: 'Suis les matchs en direct', text: 'Tes cases se valident automatiquement.' },
  { icon: Trophy,  color: 'gold',    title: 'Aligne & gagne', text: 'Complète des figures et gagne des points !' },
];
const STEP_COLORS = {
  violet:  { ring: 'border-violet-500/40 bg-violet-500/10 text-violet-300', num: 'bg-violet-500' },
  emerald: { ring: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', num: 'bg-emerald-500' },
  gold:    { ring: 'border-gold-400/40 bg-gold-400/10 text-gold-400', num: 'bg-gold-400' },
};

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

  // La carte du joueur par édition (pour le CTA contextuel).
  const cardByEd = useMemo(() => Object.fromEntries(myCards.map((c) => [c.edition_id, c])), [myCards]);
  // Groupes basés sur l'availability calculée par le SERVEUR.
  const playable = useMemo(() => (editions || []).filter((e) => e.availability === 'playable'), [editions]);
  const upcoming = useMemo(() => (editions || []).filter((e) => e.availability === 'upcoming'), [editions]);
  const myActive = useMemo(() => (editions || []).filter((e) => ['locked', 'live', 'calculating'].includes(e.availability) && cardByEd[e.id]), [editions, cardByEd]);

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

        {/* ── SECTION 1 — Jouer maintenant (playable) ─────── */}
        <div id="jouer" className="mt-12 flex items-end justify-between gap-4 scroll-mt-24">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Star size={18} className="text-emerald-400" /> Jouer maintenant</h2>
            <p className="mt-1 text-sm text-bone-400">Complète ta grille avant la clôture.</p>
          </div>
          <Link to="/tombola/resultats" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-bone-400 hover:text-emerald-400"><Trophy size={14} /> Résultats</Link>
        </div>

        {editions === null ? (
          <div className="mt-6 grid gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[520px] w-[320px] max-w-full rounded-[22px] bg-white/5 animate-pulse" />)}
          </div>
        ) : playable.length === 0 ? (
          <EmptyPlayable hasUpcoming={upcoming.length > 0} loggedIn={!!user} />
        ) : (
          <div className="mt-6 grid gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
            {playable.map((ed) => <EditionCard key={ed.id} ed={ed} now={now} card={cardByEd[ed.id]} />)}
          </div>
        )}

        {/* ── SECTION 3 — Mes grilles en cours (locked/live/calculating avec carte) ── */}
        {user && myActive.length > 0 && (
          <div className="mt-16">
            <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Coins size={18} className="text-emerald-400" /> Mes grilles en cours</h2>
            <p className="mt-1 text-sm text-bone-400">Éditions clôturées ou en direct sur lesquelles tu as une grille.</p>
            <div className="mt-6 grid gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
              {myActive.map((ed) => <EditionCard key={ed.id} ed={ed} now={now} card={cardByEd[ed.id]} />)}
            </div>
          </div>
        )}

        {/* ── SECTION 2 — À venir (upcoming) ──────────────── */}
        {upcoming.length > 0 && (
          <div id="a-venir" className="mt-16 scroll-mt-24">
            <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Clock size={18} className="text-gold-400" /> À venir</h2>
            <p className="mt-1 text-sm text-bone-400">Prépare-toi : ces éditions ouvriront bientôt.</p>
            <div className="mt-6 grid gap-6 justify-items-center sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((ed) => <EditionCard key={ed.id} ed={ed} now={now} card={cardByEd[ed.id]} />)}
            </div>
          </div>
        )}

        {/* Lien vers l'historique complet des grilles */}
        {user && myCards.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/mon-compte" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300">Voir toutes mes grilles <ArrowRight size={15} /></Link>
          </div>
        )}

        {/* ── Comment jouer ───────────────────────────────── */}
        <div id="comment-jouer" className="mt-16 scroll-mt-24">
          <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Sparkles size={18} className="text-emerald-400" /> Comment jouer</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px] items-center">
            {/* Process en étapes */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
              {HOW.map((s, i) => {
                const c = STEP_COLORS[s.color] || STEP_COLORS.emerald;
                return (
                  <div key={i} className="contents">
                    <div className="flex-1 min-w-0 text-center px-1">
                      <div className={`relative mx-auto grid h-16 w-16 place-items-center rounded-full border ${c.ring}`}>
                        <s.icon size={26} />
                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 grid h-5 w-5 place-items-center rounded-full text-[11px] font-black text-ink-900 ${c.num}`}>{i + 1}</span>
                      </div>
                      <h3 className="mt-4 font-display text-sm font-black text-bone-50">{s.title}</h3>
                      <p className="mt-1 text-xs text-bone-500 max-w-[16rem] mx-auto">{s.text}</p>
                    </div>
                    {i < HOW.length - 1 && <ArrowRight size={20} className="hidden sm:block self-center mt-4 shrink-0 text-bone-600" />}
                  </div>
                );
              })}
            </div>

            {/* Card promo */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/[0.12] via-ink-900 to-ink-900 p-5 flex flex-col sm:flex-row lg:flex-col items-center text-center sm:text-left lg:text-center gap-3 justify-center">
              <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl" />
              <img src="/images/gaming/cadeau.webp" alt="" className="relative h-16 w-auto shrink-0 drop-shadow-[0_10px_30px_rgba(139,92,246,0.5)]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="relative">
                <p className="font-display text-sm font-black uppercase tracking-wide text-bone-50 leading-tight">Plus tu joues,<br />plus tu gagnes !</p>
                <p className="mt-1.5 text-[11px] text-bone-400">Grimpe dans le classement à chaque figure.</p>
                <a href="#classement" className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-100 hover:bg-white/15 transition">
                  Voir le classement <ArrowRight size={13} />
                </a>
              </div>
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

// ── État vide premium (aucune édition jouable) ───────────────
function EmptyPlayable({ hasUpcoming, loggedIn }) {
  return (
    <GlassCard className="mt-6 p-10 md:p-12 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><Grid3x3 size={30} /></div>
      <h3 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Aucune édition ouverte pour le moment</h3>
      <p className="mt-3 text-sm text-bone-400 max-w-md mx-auto">De nouvelles grilles arrivent bientôt. Consulte les prochaines éditions ou reviens plus tard.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasUpcoming && <a href="#a-venir" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-ink-900 hover:bg-emerald-400 transition"><Clock size={15} /> Voir les prochaines éditions</a>}
        {loggedIn && <Link to="/mon-compte" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-bone-100 hover:bg-white/5 transition"><Coins size={15} /> Voir mes grilles</Link>}
      </div>
    </GlassCard>
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
