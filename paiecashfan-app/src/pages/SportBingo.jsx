import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid3x3, Trophy, Sparkles, ShieldCheck, Target, ArrowLeft,
  Crown, Medal, Coins, Clock, CheckCircle2, Pencil, HeartHandshake,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const FMT = { express: '3×3', standard: '5×5', expert: '6×6' };
const FIGURE_LABELS = {
  LINE_HORIZONTAL: 'Ligne', LINE_VERTICAL: 'Colonne', DIAGONAL: 'Diagonale', FOUR_CORNERS: '4 coins',
  DOUBLE_LINE: 'Double ligne', TRIPLE_LINE: 'Triple ligne', SQUARE_2X2: 'Carré', CROSS: 'Croix',
  X_SHAPE: 'X', FULL_CARD: 'BINGO 🎉',
};
const CARD_STATUS = {
  draft: { label: 'À compléter', cls: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10' },
  submitted: { label: 'En attente', cls: 'text-gold-400 border-gold-400/30 bg-gold-400/10' },
  scored: { label: 'Notée', cls: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' },
};

const HOW = [
  { icon: Grid3x3, title: 'Prends une grille', text: 'Choisis une édition et génère ta grille de pronostics (1 · N · 2).' },
  { icon: Pencil, title: 'Complète tes pronos', text: 'Remplis chaque case avant l\'heure de verrouillage, puis valide.' },
  { icon: Trophy, title: 'Marque des figures', text: 'Lignes, colonnes, diagonales, coins, BINGO… chaque figure rapporte des points.' },
];

const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return s; } };

export function SportBingo() {
  const { user } = useAuth();
  const [editions, setEditions] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    apiFetch('/api/v2/bingo').then((j) => setEditions(j.data?.editions || [])).catch(() => setEditions([]));
    apiFetch('/api/v2/bingo/leaderboard').then((j) => setLeaderboard(j.data?.entries || [])).catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) { setMyCards([]); return; }
    apiFetch('/api/v2/bingo/me/cards').then((j) => setMyCards(j.data?.cards || [])).catch(() => {});
  }, [user]);

  const playable = useMemo(() => (editions || []).filter((e) => ['open', 'scheduled', 'live'].includes(e.status)), [editions]);
  const featured = playable[0] || null;
  const rest = playable.slice(1);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(245,158,11,0.12),transparent_36%)]" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative py-14 md:py-20">
        <Container>
          <Link to="/tombola" className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100"><ArrowLeft size={16} /> Retour aux jeux</Link>
          <div className="mt-6"><Badge variant="emerald">🎯 Sport Bingo</Badge></div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-black uppercase tracking-tight text-bone-50 leading-[0.95]">
            Pronostique.<br /><span className="text-gradient-hero">Aligne. Gagne.</span>
          </h1>
          <p className="mt-6 max-w-xl text-bone-300 text-base md:text-lg">
            Remplis ta grille de pronostics 1 · N · 2 sur les matchs de la semaine.
            Complète des lignes, des diagonales, un BINGO… et grimpe au classement.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
            <HeroFeature icon={Target} title="Pronostics" text="1 · N · 2 sur de vrais matchs" />
            <HeroFeature icon={Trophy} title="Figures" text="Lignes, coins, BINGO…" />
            <HeroFeature icon={ShieldCheck} title="Crédits virtuels" text="Jeu gratuit, sans argent réel" />
          </div>
        </Container>
      </section>

      {/* ── ÉDITIONS JOUABLES ────────────────────────────── */}
      <Container className="relative pb-8">
        <SectionTitle icon={Grid3x3}>Éditions à jouer</SectionTitle>
        {editions === null ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : playable.length === 0 ? (
          <GlassCard className="mt-6 p-10 text-center">
            <Grid3x3 className="mx-auto text-bone-600" size={40} />
            <p className="mt-4 text-sm text-bone-400">Aucune édition ouverte pour le moment. Reviens bientôt !</p>
          </GlassCard>
        ) : (
          <>
            {featured && <FeaturedEdition ed={featured} />}
            {rest.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rest.map((ed) => <EditionCard key={ed.id} ed={ed} />)}
              </div>
            )}
          </>
        )}
      </Container>

      {/* ── MES CARTES ───────────────────────────────────── */}
      {user && myCards.length > 0 && (
        <Container className="relative py-8">
          <SectionTitle icon={Coins}>Mes cartes</SectionTitle>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {myCards.map((c) => <MyCard key={c.id} card={c} />)}
          </div>
        </Container>
      )}

      {/* ── CLASSEMENT ───────────────────────────────────── */}
      <Container className="relative py-12">
        <SectionTitle icon={Trophy}>Classement</SectionTitle>
        {leaderboard.length === 0 ? (
          <GlassCard className="mt-6 p-8 text-center text-sm text-bone-400">
            Le classement s'affichera dès la première édition clôturée.
          </GlassCard>
        ) : (
          <GlassCard className="mt-6 p-2 sm:p-4">
            <div className="divide-y divide-white/5">
              {leaderboard.map((e) => <LeaderRow key={e.userId} e={e} me={e.userId === user?.id} />)}
            </div>
          </GlassCard>
        )}
      </Container>

      {/* ── COMMENT JOUER ────────────────────────────────── */}
      <Container className="relative py-8">
        <SectionTitle icon={Sparkles}>Comment jouer</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW.map((s, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><s.icon size={18} /></div>
                <span className="text-2xl font-display font-black text-bone-700">{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-black text-bone-50">{s.title}</h3>
              <p className="mt-1 text-sm text-bone-400">{s.text}</p>
            </GlassCard>
          ))}
        </div>
      </Container>

      {/* ── JEU RESPONSABLE ──────────────────────────────── */}
      <Container className="relative py-8 pb-16">
        <GlassCard className="p-6 md:p-8 border border-emerald-400/15">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><HeartHandshake size={20} /></div>
            <div>
              <h3 className="font-display text-xl font-black uppercase text-bone-50">Jeu responsable</h3>
              <p className="mt-2 text-sm text-bone-400 max-w-2xl">
                Le Sport Bingo se joue avec des <b className="text-bone-200">crédits virtuels</b>, sans argent réel : c'est un jeu
                gratuit et convivial entre supporters. Joue pour le plaisir et le fun de la compétition.
                Réservé aux personnes de 18 ans et plus.
              </p>
            </div>
          </div>
        </GlassCard>
      </Container>
    </div>
  );
}

// ── Édition en vedette ───────────────────────────────────────
function FeaturedEdition({ ed }) {
  return (
    <GlassCard variant="strong" className="mt-6 p-6 md:p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.14),transparent_42%)]" />
      <div className="relative grid gap-6 md:grid-cols-[1fr_200px] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">À l'affiche</p>
            {ed.badge && <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-bone-300 font-bold">{ed.badge}</span>}
          </div>
          <h2 className="mt-3 font-display text-2xl md:text-4xl font-black text-bone-50">{ed.title}</h2>
          {ed.description && <p className="mt-2 text-sm text-bone-400 max-w-md">{ed.description}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-bone-300"><Grid3x3 size={15} className="text-emerald-400" /> Grille {FMT[ed.format] || '5×5'}</span>
            <span className="inline-flex items-center gap-2 text-bone-300"><Coins size={15} className="text-emerald-400" /> {ed.cost_credits} crédits</span>
            {ed.locks_at && <span className="inline-flex items-center gap-2 text-bone-300"><Clock size={15} className="text-emerald-400" /> Ferme le {fmtDate(ed.locks_at)}</span>}
          </div>
        </div>
        <div className="md:border-l md:border-white/10 md:pl-6">
          <Link to={`/bingo/${ed.slug}`}><Button variant="gold" size="md" className="w-full"><Grid3x3 size={15} /> Jouer maintenant</Button></Link>
        </div>
      </div>
    </GlassCard>
  );
}

function EditionCard({ ed }) {
  return (
    <Link to={`/bingo/${ed.slug}`}>
      <GlassCard className="p-5 h-full hover:border-emerald-400/40 transition-all border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0"><Grid3x3 size={20} /></div>
          {ed.badge && <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-bone-400 font-bold">{ed.badge}</span>}
        </div>
        <h3 className="mt-4 font-display text-lg font-black text-bone-50">{ed.title}</h3>
        {ed.description && <p className="mt-1 text-xs text-bone-500 line-clamp-2">{ed.description}</p>}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Grille {FMT[ed.format] || '5×5'}</span>
          <span className="text-xs font-black text-emerald-400">{ed.cost_credits} crédits</span>
        </div>
      </GlassCard>
    </Link>
  );
}

// ── Mes cartes ───────────────────────────────────────────────
function MyCard({ card }) {
  const st = CARD_STATUS[card.status] || CARD_STATUS.draft;
  const ed = card.edition;
  return (
    <Link to={ed ? `/bingo/${ed.slug}` : '#'}>
      <GlassCard className="p-5 h-full hover:border-white/20 transition-all border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-black text-bone-50 line-clamp-1">{ed?.title || 'Édition'}</h3>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold ${st.cls}`}>{st.label}</span>
        </div>
        <p className="mt-1 text-xs text-bone-500">Grille {FMT[card.format] || '5×5'}{ed?.ends_at ? ` · fin le ${fmtDate(ed.ends_at)}` : ''}</p>

        {card.status === 'scored' ? (
          <div className="mt-4">
            <p className="font-display text-2xl font-black text-gold-400">{card.points_total} pts</p>
            {Array.isArray(card.figures_won) && card.figures_won.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {card.figures_won.slice(0, 4).map((f) => (
                  <span key={f} className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-bone-300">{FIGURE_LABELS[f] || f}</span>
                ))}
                {card.figures_won.length > 4 && <span className="text-[10px] text-bone-500 font-bold">+{card.figures_won.length - 4}</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-bone-300">
            {card.status === 'draft'
              ? <><Pencil size={13} className="text-cyan-300" /> Reprendre ma grille</>
              : <><CheckCircle2 size={13} className="text-gold-400" /> En attente des résultats</>}
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
      <div className="w-8 shrink-0 text-center">
        {podium ? <RankIcon size={20} className={`mx-auto ${rankColor}`} /> : <span className="font-display font-black text-bone-500">{e.rank}</span>}
      </div>
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

// ── Petits composants ────────────────────────────────────────
function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-emerald-400" />
      <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-bone-50">{children}</h2>
    </div>
  );
}
function HeroFeature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <Icon size={18} className="text-emerald-400" />
      <p className="mt-2 text-sm font-bold text-bone-100">{title}</p>
      <p className="text-xs text-bone-500">{text}</p>
    </div>
  );
}
