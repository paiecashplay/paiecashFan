import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Grid3x3, Loader2, Lock, Check, Coins, AlertCircle, CheckCircle2, Clock, ShieldAlert, ChevronLeft, ChevronRight, X, RotateCcw, PencilLine, CalendarDays, Star, Trophy, BarChart3, Target, Sparkles, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { compFor } from '@/components/bingo/EditionCard';

const GRID = { express: 3, standard: 5, expert: 6 };
const NEEDED = { express: 9, standard: 24, expert: 36 };
const pad = (n) => String(n).padStart(2, '0');
function fmtCd(target, now) {
  const d = new Date(target).getTime() - now; if (d <= 0) return null;
  const dd = Math.floor(d / 86400000), h = Math.floor((d / 3600000) % 24), m = Math.floor((d / 60000) % 60), s = Math.floor((d / 1000) % 60);
  return dd > 0 ? `${dd}j ${pad(h)}h ${pad(m)}m` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}
const HOW_STEPS = [
  { icon: Grid3x3, color: 'violet',  title: 'Choisis et complète', text: 'la grille 5×5' },
  { icon: Target,  color: 'emerald', title: 'Pronostique',         text: '1 · N · 2' },
  { icon: Lock,    color: 'gold',    title: 'Valide avant',        text: 'la clôture' },
  { icon: Trophy,  color: 'emerald', title: 'Marque un max',       text: 'de points !' },
];
const STEP_COLORS = {
  violet:  { ring: 'border-violet-500/40 bg-violet-500/10 text-violet-300', num: 'bg-violet-500' },
  emerald: { ring: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', num: 'bg-emerald-500' },
  gold:    { ring: 'border-gold-400/40 bg-gold-400/10 text-gold-400', num: 'bg-gold-400' },
};
const FIGURE_LABELS = {
  LINE_HORIZONTAL: 'Ligne', LINE_VERTICAL: 'Colonne', DIAGONAL: 'Diagonale', FOUR_CORNERS: '4 coins',
  DOUBLE_LINE: 'Double ligne', TRIPLE_LINE: 'Triple ligne', SQUARE_2X2: 'Carré', CROSS: 'Croix',
  X_SHAPE: 'X', FULL_CARD: 'BINGO 🎉',
};

export function BingoPlay() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);     // { edition, matches, events, card, picks, credits }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);    // création carte / soumission
  const [savingCell, setSavingCell] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetCell, setSheetCell] = useState(null);   // case ouverte dans le bottom-sheet
  const [view, setView] = useState('grid');           // 'grid' | 'calendar'
  const [now, setNow] = useState(() => Date.parse(new Date().toISOString()));
  const gridRef = useRef(null);

  const load = () => apiFetch(`/api/v2/bingo/${slug}`).then((j) => setData(j.data)).catch((e) => setError(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);

  const eventsById = useMemo(() => Object.fromEntries((data?.events || []).map((e) => [e.id, e])), [data]);
  const picksByCell = useMemo(() => Object.fromEntries((data?.picks || []).map((p) => [p.cell_index, p])), [data]);
  // Grille ↔ Calendrier : eventId → cell_index (pour synchroniser les 2 vues).
  const cellByEvent = useMemo(() => Object.fromEntries((data?.card?.layout || []).filter((c) => c.eventId).map((c) => [c.eventId, c.cell])), [data]);
  const card = data?.card;
  const isDraft = card?.status === 'draft';
  const filled = (data?.picks || []).filter((p) => p.state !== 'free' && p.chosen_option).length;
  const totalCells = (data?.card?.layout || []).filter((c) => !c.free).length;

  async function startCard() {
    if (!user) { setError('Connecte-toi pour jouer.'); return; }
    setBusy(true); setError('');
    try { await apiFetch(`/api/v2/bingo/${slug}/card`, { method: 'POST' }); await load(); }
    catch (e) { setError(e.message); }
    setBusy(false);
  }

  async function selectCell(cellIndex, option) {
    if (!isDraft) return;
    setSavingCell(cellIndex);
    // maj optimiste
    setData((d) => ({ ...d, picks: d.picks.map((p) => p.cell_index === cellIndex ? { ...p, chosen_option: option, state: 'selected' } : p) }));
    try { await apiFetch(`/api/v2/bingo/card/${card.id}/picks`, { method: 'PUT', body: JSON.stringify({ selections: [{ cellIndex, chosenOption: option }] }) }); }
    catch (e) { setError(e.message); load(); }
    setSavingCell(null);
  }

  async function submit() {
    setBusy(true); setError('');
    try { await apiFetch(`/api/v2/bingo/card/${card.id}/submit`, { method: 'POST' }); setConfirmOpen(false); await load(); }
    catch (e) { setError(e.message); setConfirmOpen(false); }
    setBusy(false);
  }

  // Cases à remplir (hors FREE), triées par position.
  const fillCells = useMemo(() => (data?.card?.layout || []).filter((c) => !c.free).sort((a, b) => a.cell - b.cell), [data]);
  const cellOrder = useMemo(() => fillCells.map((c) => c.cell), [fillCells]);
  const firstEmptyCell = () => (fillCells.find((c) => !picksByCell[c.cell]?.chosen_option) || fillCells[0])?.cell ?? null;
  const nextEmptyCell = (fromCell) => {
    const start = cellOrder.indexOf(fromCell);
    for (let k = 1; k <= cellOrder.length; k++) {
      const idx = cellOrder[(start + k) % cellOrder.length];
      if (idx === fromCell) continue;
      if (!picksByCell[idx]?.chosen_option) return idx;
    }
    return null; // tout est rempli
  };
  function openSheet(cell) { if (cell != null && isDraft) setSheetCell(cell); }
  // « Compléter ma grille » : desktop → défile vers la grille (choix inline) ;
  // mobile → ouvre le sheet guidé.
  function completeGrid() {
    setView('grid');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) openSheet(firstEmptyCell());
    else setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  }
  function navSheet(dir) {
    const pos = cellOrder.indexOf(sheetCell);
    const np = pos + dir;
    if (np >= 0 && np < cellOrder.length) setSheetCell(cellOrder[np]);
  }
  async function pickInSheet(cell, option) {
    await selectCell(cell, option);
    setSheetCell(nextEmptyCell(cell));   // auto-avance vers la prochaine case vide (null → ferme)
  }
  async function resetPicks() {
    if (!window.confirm('Réinitialiser tous tes pronostics ? Cette grille redeviendra vide.')) return;
    setData((d) => ({ ...d, picks: d.picks.map((p) => p.state !== 'free' ? { ...p, chosen_option: null, state: 'not_selected' } : p) }));
    setSheetCell(null);
    try { await apiFetch(`/api/v2/bingo/card/${card.id}/picks`, { method: 'PUT', body: JSON.stringify({ selections: fillCells.map((c) => ({ cellIndex: c.cell, chosenOption: null })) }) }); }
    catch (e) { setError(e.message); load(); }
  }

  if (!data && !error) return <Container className="py-24"><div className="text-bone-400">Chargement…</div></Container>;
  if (error && !data) return <Container className="py-24"><div className="text-red-400">{error}</div></Container>;

  const ed = data.edition;
  const size = GRID[ed.format] || 5;
  const comp = compFor(ed.slug, ed.title);
  const avail = ed.availability;
  const matches = data.matches || [];
  const eventByMatch = Object.fromEntries((data.events || []).filter((e) => e.match_id).map((e) => [e.match_id, e]));
  const matchById = Object.fromEntries(matches.map((m) => [m.id, m]));
  const cd = ed.locks_at ? fmtCd(ed.locks_at, now) : null;
  const remaining = totalCells - filled;

  return (
    <div className="relative overflow-hidden" style={{ '--glow': comp.glow }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 15% -5%, ${comp.glow}22, transparent 40%)` }} />
      <Container className="relative py-8 md:py-12 max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/tombola/sport-bingo" className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100"><ArrowLeft size={16} /> Retour au Sport Bingo</Link>
          {user && data.credits != null && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5">
              <span className="text-[9px] uppercase tracking-widest text-bone-500 font-bold">Crédits</span>
              <span className="font-display text-base font-black text-emerald-400 inline-flex items-center gap-1"><Coins size={14} /> {data.credits}</span>
            </div>
          )}
        </div>

        {/* Titre */}
        <div className="mt-5">
          <div className="inline-flex items-center gap-2" style={{ color: comp.glow }}><Grid3x3 size={16} /><span className="text-[10px] uppercase tracking-[0.28em] font-black">Sport Bingo</span></div>
          <h1 className="mt-2 font-display text-3xl md:text-5xl font-black uppercase text-bone-50 leading-none">{ed.title}</h1>
          <p className="mt-2 text-sm text-bone-400">Pronostique et gagne des points !</p>
        </div>

        {error && <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle size={16} /> {error}</div>}

        {/* Hero cover + À propos */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr] items-stretch">
          <HeroCover ed={ed} comp={comp} cd={cd} size={size} avail={avail} />
          <AboutPanel ed={ed} size={size} />
        </div>

        {/* CTA principal — aligné sur la largeur de la card (colonne de gauche) */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div>
            {!user ? (
              <Link to="/login"><Button variant="primary" size="lg" className="w-full">Se connecter pour jouer</Button></Link>
            ) : !card ? (
              avail === 'playable'
                ? <Button variant="primary" size="lg" className="w-full" onClick={startCard} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Grid3x3 size={16} />} Jouer ma grille ({ed.cost_credits} crédits)</Button>
                : <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"><UnavailableNotice availability={avail} /></div>
            ) : isDraft ? (
              <Button variant="primary" size="lg" className="w-full" onClick={completeGrid}>
                <PencilLine size={16} /> {remaining > 0 ? `Compléter ma grille (${remaining} restante${remaining > 1 ? 's' : ''})` : 'Revoir mes pronostics'}
              </Button>
            ) : null}
          </div>
        </div>

        {/* Comment ça marche */}
        <HowItWorks />

        {/* Résultat / statut (carte validée ou notée) */}
        {card && card.status === 'scored' && (
          <div className="mt-6 rounded-2xl border border-gold-400/30 bg-gold-400/[0.08] p-5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Ton score</p>
            <p className="mt-1 font-display text-4xl font-black text-gold-400">{card.points_total} pts</p>
            {Array.isArray(card.figures_won) && card.figures_won.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {card.figures_won.map((f) => <span key={f} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-bold text-bone-200">{FIGURE_LABELS[f] || f}</span>)}
              </div>
            )}
          </div>
        )}
        {card && card.status === 'submitted' && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 size={16} /> Ta grille est validée. Les points seront calculés à la clôture de l'édition.
          </div>
        )}

        {/* Onglets Grille / Calendrier (dès qu'une carte existe) */}
        {card ? (
          <div className="mt-8 scroll-mt-24" ref={gridRef}>
            <ViewTabs view={view} setView={setView} glow={comp.glow} />

            {view === 'grid' ? (
              <GridPlay
                card={card} size={size} eventsById={eventsById} matchById={matchById} picksByCell={picksByCell}
                isDraft={isDraft} filled={filled} total={totalCells} reward={ed.reward_points || 0} comp={comp} busy={busy}
                onPickCell={selectCell} onOpenCell={openSheet} onReset={resetPicks} onValidate={() => setConfirmOpen(true)}
              />
            ) : (
              <>
                <div className="mt-4">
                  <CalendarView matches={matches} eventByMatch={eventByMatch} cellByEvent={cellByEvent} picksByCell={picksByCell} isDraft={isDraft} onPick={selectCell} glow={comp.glow} />
                </div>
                {isDraft && (
                  <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                    <button onClick={resetPicks} disabled={filled === 0} className="inline-flex items-center gap-1.5 text-xs font-bold text-bone-400 hover:text-red-400 disabled:opacity-40 disabled:hover:text-bone-400">
                      <RotateCcw size={13} /> Réinitialiser ma grille
                    </button>
                    <Button variant="gold" size="md" onClick={() => setConfirmOpen(true)} disabled={busy || filled < totalCells}>
                      <Check size={15} /> Valider ma grille
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Pas encore de carte : calendrier des matchs en aperçu (lecture seule) */
          matches.length > 0 && (
            <div className="mt-8">
              <SectionHead icon={CalendarDays} glow={comp.glow}>Calendrier des matchs</SectionHead>
              <CalendarView matches={matches} eventByMatch={eventByMatch} cellByEvent={{}} picksByCell={{}} isDraft={false} glow={comp.glow} />
            </div>
          )
        )}
      </Container>

      <AnimatePresence>
        {confirmOpen && card && (
          <ConfirmSubmit edition={ed} card={card} busy={busy} onCancel={() => setConfirmOpen(false)} onConfirm={submit} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetCell != null && card && isDraft && (
          <FillSheet
            key="fill-sheet"
            fillCells={fillCells}
            eventsById={eventsById}
            picksByCell={picksByCell}
            cellIndex={sheetCell}
            filled={filled}
            total={totalCells}
            savingCell={savingCell}
            onSelect={pickInSheet}
            onNav={navSheet}
            onClose={() => setSheetCell(null)}
            onReset={resetPicks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sous-titre de section ────────────────────────────────────
function SectionHead({ icon: Icon, glow, children }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-lg md:text-xl font-black uppercase tracking-tight" style={{ color: glow || '#34d399' }}>
      {Icon && <Icon size={16} />} <span className="text-bone-50">{children}</span>
    </h2>
  );
}

// ── Hero cover thémé ─────────────────────────────────────────
function HeroCover({ ed, comp, cd, size, avail }) {
  const subtitle = ed.theme?.subtitle || ed.badge || '';
  const diff = (ed.difficulty || 'standard').replace(/^./, (c) => c.toUpperCase());
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 min-h-[300px]" style={{ boxShadow: `0 0 70px -24px ${comp.glow}88` }}>
      <div className="absolute inset-0">
        {ed.cover_url
          ? <img src={ed.cover_url} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full" style={{ background: `radial-gradient(circle at 50% 30%, ${comp.glow}55, #0a0e14 72%)` }} />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,.1) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.9) 100%)' }} />
      </div>
      <div className="relative flex h-full flex-col justify-end p-6 min-h-[300px]">
        <h2 className="font-poster uppercase text-white leading-[0.85] max-w-[62%]" style={{ fontSize: 46 }}>{ed.title}</h2>
        {subtitle && <p className="mt-2 text-sm font-bold text-white/90">{comp.emoji} {subtitle}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/75">
          <Chip><Grid3x3 size={12} /> {size}×{size}</Chip>
          <Chip>{NEEDED[ed.format]} matchs</Chip>
          <Chip><BarChart3 size={12} /> {diff}</Chip>
        </div>
        {cd && avail !== 'completed' && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-black/40 backdrop-blur px-4 py-2.5 border border-white/10">
            <span className="text-xs text-white/70">Clôture des grilles dans</span>
            <span className="font-black tabular-nums" style={{ color: comp.glow }}>{cd}</span>
          </div>
        )}
      </div>
    </div>
  );
}
function Chip({ children }) { return <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1">{children}</span>; }

// ── Panneau « À propos » ─────────────────────────────────────
function AboutPanel({ ed, size }) {
  const rows = [
    { icon: Grid3x3, label: 'Format', value: `Grille ${size}×${size}` },
    { icon: CalendarDays, label: 'Nombre de matchs', value: NEEDED[ed.format] },
    { icon: BarChart3, label: 'Niveau', value: (ed.difficulty || 'standard').replace(/^./, (c) => c.toUpperCase()) },
    { icon: Star, label: 'Gain max', value: `${ed.reward_points || 0} pts` },
    { icon: Coins, label: 'Coût pour jouer', value: `${ed.cost_credits || 0} crédits` },
  ];
  return (
    <GlassCard className="p-5">
      <p className="text-[10px] uppercase tracking-[0.28em] text-bone-500 font-black">À propos</p>
      {ed.description && <p className="mt-2 text-sm text-bone-400">{ed.description}</p>}
      <div className="mt-4 divide-y divide-white/5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between py-2.5">
            <span className="inline-flex items-center gap-2 text-xs text-bone-400"><r.icon size={13} className="text-bone-500" /> {r.label}</span>
            <span className="text-sm font-black text-bone-100">{r.value}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── Comment ça marche (identique à la page Jeux) ─────────────
function HowItWorks() {
  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50"><Sparkles size={18} className="text-emerald-400" /> Comment ça marche</h2>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px] items-center">
        {/* Process en étapes */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
          {HOW_STEPS.map((s, i) => {
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
                {i < HOW_STEPS.length - 1 && <ArrowRight size={20} className="hidden sm:block self-center mt-4 shrink-0 text-bone-600" />}
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
            <Link to="/tombola/sport-bingo#classement" className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-100 hover:bg-white/15 transition">
              Voir le classement <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Onglets Grille / Calendrier ──────────────────────────────
function ViewTabs({ view, setView, glow }) {
  const Btn = ({ id, icon: Icon, children }) => (
    <button onClick={() => setView(id)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black uppercase tracking-wide transition ${view === id ? 'text-ink-900' : 'text-bone-300 hover:text-bone-100'}`} style={view === id ? { backgroundColor: glow } : {}}>
      <Icon size={15} /> {children}
    </button>
  );
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <Btn id="grid" icon={Grid3x3}>Grille</Btn>
        <Btn id="calendar" icon={CalendarDays}>Calendrier</Btn>
      </div>
    </div>
  );
}

// ── Vue Calendrier (liste des matchs, synchro avec la grille) ─
function CalendarView({ matches, eventByMatch, cellByEvent, picksByCell, isDraft, onPick, glow }) {
  const groups = {};
  matches.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).forEach((m) => { (groups[m.group_label || 'Matchs'] ||= []).push(m); });
  const fmtKick = (s) => { if (!s) return null; try { const d = new Date(s); return { date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }; } catch { return null; } };

  return (
    <div className="mt-4 space-y-5">
      {Object.entries(groups).map(([g, ms]) => (
        <div key={g}>
          <p className="text-[10px] uppercase tracking-[0.22em] text-bone-500 font-bold">{g}</p>
          <div className="mt-2 divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {ms.map((m) => {
              const ev = eventByMatch[m.id];
              const cell = ev ? cellByEvent[ev.id] : undefined;
              const chosen = cell != null ? picksByCell[cell]?.chosen_option : null;
              const settled = ev?.official_answer && !isDraft;
              const kick = fmtKick(m.kickoff_at);
              const options = ev?.options || ['1', 'N', '2'];
              const canPick = isDraft && cell != null;
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 sm:px-4 py-3">
                  {kick && <div className="hidden sm:block w-16 shrink-0 text-center"><p className="text-[11px] font-bold text-bone-200">{kick.date}</p><p className="text-[10px] text-bone-500">{kick.time}</p></div>}
                  <div className="flex-1 min-w-0 flex items-center justify-center gap-2">
                    <Team logo={m.home_logo} name={m.home} align="right" />
                    <span className="text-[10px] font-black text-bone-500 shrink-0">VS</span>
                    <Team logo={m.away_logo} name={m.away} align="left" />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {options.map((o) => {
                      const active = chosen === o;
                      const isAnswer = settled && ev.official_answer === o;
                      return (
                        <button key={o} disabled={!canPick} onClick={() => canPick && onPick(cell, o)}
                          className={`h-8 w-8 rounded-lg text-xs font-black transition ${active ? 'text-ink-900' : isAnswer ? 'bg-emerald-500 text-ink-900' : 'bg-white/5 text-bone-400 ' + (canPick ? 'hover:bg-white/10' : 'opacity-60 cursor-default')}`}
                          style={active ? { backgroundColor: glow, color: '#07101a' } : {}}>{o}</button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function Team({ logo, name, align }) {
  return (
    <div className={`flex items-center gap-2 min-w-0 flex-1 ${align === 'right' ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <div className="h-6 w-6 shrink-0 rounded-full bg-white/10 overflow-hidden grid place-items-center">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="text-[9px] font-black text-bone-500">{(name || '?').charAt(0).toUpperCase()}</span>}
      </div>
      <span className="text-sm font-bold text-bone-100 truncate">{name}</span>
    </div>
  );
}

// ── Grille premium : cards de match + sidebar ────────────────
// Codes FIFA officiels (fallback : 3 premières lettres si absent).
const normName = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const FIFA_CODES = {
  'maroc': 'MAR', 'tanzanie': 'TAN', 'egypte': 'EGY', 'ghana': 'GHA', 'senegal': 'SEN', 'cameroun': 'CMR',
  'nigeria': 'NGA', 'cote d ivoire': 'CIV', 'algerie': 'ALG', 'tunisie': 'TUN', 'mali': 'MLI', 'burkina faso': 'BFA',
  'rd congo': 'COD', 'gabon': 'GAB', 'afrique du sud': 'RSA', 'zambie': 'ZAM', 'guinee': 'GUI', 'benin': 'BEN',
  'angola': 'ANG', 'namibie': 'NAM', 'cap vert': 'CPV', 'mauritanie': 'MTN', 'ouganda': 'UGA', 'kenya': 'KEN',
  'rwanda': 'RWA', 'burundi': 'BDI', 'soudan': 'SDN', 'soudan du sud': 'SSD', 'ethiopie': 'ETH', 'somalie': 'SOM',
  'mozambique': 'MOZ', 'malawi': 'MWI', 'zimbabwe': 'ZIM', 'botswana': 'BOT', 'lesotho': 'LES', 'eswatini': 'SWZ',
  'comores': 'COM', 'maurice': 'MRI', 'seychelles': 'SEY', 'madagascar': 'MAD', 'congo': 'CGO', 'rep centrafricaine': 'CTA',
  'guinee equatoriale': 'EQG', 'tchad': 'CHA', 'djibouti': 'DJI', 'erythree': 'ERI', 'niger': 'NIG', 'togo': 'TOG',
};
const code3 = (name = '') => FIFA_CODES[normName(name)] || (name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || '—');
const fmtMatchDate = (s) => { if (!s) return null; try { const d = new Date(s); return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} • ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`; } catch { return null; } };

function GridPlay({ card, size, eventsById, matchById, picksByCell, isDraft, filled, total, reward, comp, busy, onPickCell, onOpenCell, onReset, onValidate }) {
  const cells = (card.layout || []).slice().sort((a, b) => a.cell - b.cell);
  return (
    <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px] items-start">
      {/* Grille */}
      <div>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {cells.map((c) => {
            const ev = c.eventId ? eventsById[c.eventId] : null;
            const match = ev?.match_id ? matchById[ev.match_id] : null;
            return <MatchCell key={c.cell} index={c.cell} free={c.free} event={ev} match={match} pick={picksByCell[c.cell]} isDraft={isDraft} comp={comp} onPick={(o) => onPickCell(c.cell, o)} onExpand={() => onOpenCell(c.cell)} />;
          })}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <button onClick={onReset} disabled={filled === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-bone-300 hover:text-red-400 disabled:opacity-40"><RotateCcw size={13} /> Réinitialiser ma grille</button>
          <span className="text-xs text-bone-500 font-bold">{filled}/{total} pronostics sélectionnés</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4 lg:sticky lg:top-6">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-xs"><span className="uppercase tracking-widest text-bone-500 font-bold">Progression</span><span className="font-black tabular-nums text-bone-100">{filled} / {total}</span></div>
          <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${total ? Math.round((filled / total) * 100) : 0}%`, backgroundColor: comp.glow }} /></div>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Points max possibles</p>
          <p className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-black text-gold-400"><Star size={18} /> {reward} pts</p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: comp.glow }}>Comment remplir ?</p>
          <ol className="mt-3 space-y-2 text-xs text-bone-300">
            <li className="flex gap-2"><Num n={1} glow={comp.glow} /> Choisis ton pronostic pour chaque match.</li>
            <li className="flex gap-2"><Num n={2} glow={comp.glow} /><span><b className="text-bone-100">1</b> = Victoire équipe 1<br /><b className="text-bone-100">N</b> = Match nul<br /><b className="text-bone-100">2</b> = Victoire équipe 2</span></li>
            <li className="flex gap-2"><Num n={3} glow={comp.glow} /> Marque le maximum de points !</li>
          </ol>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: comp.glow }}>Légende</p>
          <div className="mt-3 space-y-1.5 text-xs text-bone-300">
            <Leg dot={comp.glow}>Sélectionné</Leg>
            <Leg ring="#F2B705">En cours</Leg>
            <Leg dot="#E53935">Terminé</Leg>
            <Leg icon={Lock}>À venir</Leg>
            <Leg icon={Star} color="#fcd34d">Case gratuite</Leg>
          </div>
        </GlassCard>

        <ComboBar filled={filled} total={total} />

        {isDraft && <Button variant="gold" size="lg" className="w-full" onClick={onValidate} disabled={busy || filled < total}><Check size={16} /> Valider ma grille</Button>}
      </div>
    </div>
  );
}

function MatchCell({ index, free, event, match, pick, isDraft, comp, onPick, onExpand }) {
  if (free) return (
    <div className="rounded-xl border border-gold-400/40 bg-gold-400/[0.06] p-2 min-h-[132px] grid place-items-center text-center">
      <div><Star size={20} className="mx-auto text-gold-400" /><p className="mt-1 font-display text-xs font-black uppercase text-gold-400 leading-tight">Case<br />gratuite</p><p className="mt-1 text-[9px] font-black tracking-widest text-gold-400">★ FREE ★</p></div>
    </div>
  );
  const chosen = pick?.chosen_option;
  const settled = event?.official_answer && !isDraft;
  const correct = settled && chosen === event.official_answer;
  const incorrect = settled && chosen && chosen !== event.official_answer;
  const parts = (event?.label || '').split(/\s+-\s+/);
  const home = match?.home || parts[0] || '';
  const away = match?.away || parts[1] || '';
  const date = fmtMatchDate(match?.kickoff_at);
  const options = event?.options || ['1', 'N', '2'];

  let cls = 'border-white/10 bg-white/[0.03]'; let style = {};
  if (correct) cls = 'border-emerald-400/60 bg-emerald-500/10';
  else if (incorrect) cls = 'border-red-500/50 bg-red-500/10';
  else if (chosen) { cls = 'bg-white/[0.05]'; style = { borderColor: comp.glow, boxShadow: `0 0 22px -10px ${comp.glow}` }; }

  return (
    <div className={`relative rounded-xl border p-2 min-h-[132px] flex flex-col ${cls}`} style={style}>
      <span className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-bone-600">{pad(index + 1)}</span>
      <button onClick={onExpand} disabled={!isDraft} className="mt-3.5 flex items-center justify-center gap-1.5 disabled:cursor-default">
        <TeamMini logo={match?.home_logo} code={code3(home)} />
        <span className="text-[8px] font-black text-bone-500">vs</span>
        <TeamMini logo={match?.away_logo} code={code3(away)} />
      </button>
      {date && <p className="mt-1 text-center text-[8px] text-bone-500 truncate">{date}</p>}
      <div className="mt-auto flex gap-1 pt-1.5">
        {options.map((o) => {
          const active = chosen === o;
          const isAns = settled && event.official_answer === o;
          return (
            <button key={o} disabled={!isDraft} onClick={() => isDraft && onPick(o)}
              className={`flex-1 h-6 rounded text-[10px] font-black transition inline-flex items-center justify-center gap-0.5 ${active ? 'text-ink-900' : isAns ? 'bg-emerald-500 text-ink-900' : 'bg-white/5 text-bone-400 ' + (isDraft ? 'hover:bg-white/10' : 'opacity-60')}`}
              style={active ? { backgroundColor: comp.glow, color: '#07101a' } : {}}>{o}{active && <Check size={9} />}</button>
          );
        })}
      </div>
    </div>
  );
}
function TeamMini({ logo, code }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <div className="h-7 w-7 rounded-full bg-white/10 overflow-hidden grid place-items-center border border-white/10">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="text-[8px] font-black text-bone-500">{code.slice(0, 2)}</span>}
      </div>
      <span className="text-[9px] font-black text-bone-200">{code}</span>
    </div>
  );
}
function Num({ n, glow }) { return <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-black text-ink-900" style={{ backgroundColor: glow }}>{n}</span>; }
function Leg({ dot, ring, icon: Icon, color, children }) {
  return (
    <div className="flex items-center gap-2">
      {Icon ? <Icon size={12} style={{ color: color || '#94a3b8' }} /> : ring ? <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: ring }} /> : <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dot }} />}
      <span>{children}</span>
    </div>
  );
}
function ComboBar({ filled, total }) {
  const thresholds = [...new Set([5, 10, 15, 20, total].filter((v) => v <= total))];
  return (
    <div className="rounded-2xl border border-gold-400/30 bg-gold-400/[0.05] p-4">
      <p className="text-[10px] uppercase tracking-widest font-black text-gold-400">Bonus combo 🔥</p>
      <p className="mt-1 text-[11px] text-bone-400">Plus tu marques de bonnes prédictions, plus ton combo augmente !</p>
      <div className="mt-3 relative h-1.5 rounded-full bg-white/10">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gold-400" style={{ width: `${total ? Math.min(100, (filled / total) * 100) : 0}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-black text-bone-500">{thresholds.map((v) => <span key={v} className={filled >= v ? 'text-gold-400' : ''}>{v}</span>)}</div>
    </div>
  );
}

// ── Modal de confirmation (validation irréversible) ──────────
function ConfirmSubmit({ edition, card, busy, onCancel, onConfirm }) {
  const [accepted, setAccepted] = useState(false);
  const fmt = (s) => { try { return new Date(s).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return s; } };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400"><ShieldAlert size={20} /></div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold-400 font-black">Validation définitive</p>
            <h3 className="mt-1 font-display text-xl font-black uppercase text-bone-50">Valider ma grille ?</h3>
          </div>
        </div>

        <p className="mt-4 text-sm text-bone-400">
          Une fois validée, ta grille est <b className="text-bone-200">verrouillée</b> : tu ne pourras plus modifier tes pronostics.
          Les points seront calculés à la clôture de l'édition.
        </p>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <Row label="Édition" value={edition.title} />
          <Row label="Grille" value={({ express: '3×3', standard: '5×5', expert: '6×6' })[card.format] || '5×5'} />
          <Row label="Coût" value={`${edition.cost_credits} crédits`} icon={Coins} />
          {edition.locks_at && <Row label="Verrouillage" value={fmt(edition.locks_at)} icon={Clock} />}
        </div>

        <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-emerald-500" />
          <span className="text-xs text-bone-300">J'ai vérifié mes pronostics et j'accepte que ma grille soit validée de façon définitive.</span>
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={busy}>Annuler</Button>
          <Button variant="gold" size="md" onClick={onConfirm} disabled={!accepted || busy}>
            {busy ? <><Loader2 size={15} className="animate-spin" /> Validation…</> : <><Check size={15} /> Valider définitivement</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Message quand l'édition n'est pas jouable (accès direct à une URL).
function UnavailableNotice({ availability }) {
  const map = {
    upcoming: { text: 'Cette édition n\'est pas encore ouverte. Reviens à l\'ouverture des inscriptions !', to: '/tombola/sport-bingo', cta: 'Voir les jeux' },
    locked: { text: 'Les inscriptions sont closes pour cette édition.', to: '/tombola/sport-bingo', cta: 'Voir les jeux' },
    live: { text: 'Les matchs ont commencé : les inscriptions sont closes.', to: '/tombola/sport-bingo', cta: 'Voir les jeux' },
    calculating: { text: 'Les résultats sont en cours de calcul.', to: '/tombola/resultats', cta: 'Voir les résultats' },
    completed: { text: 'Cette édition est terminée.', to: '/tombola/resultats', cta: 'Voir les résultats' },
    cancelled: { text: 'Cette édition a été annulée.', to: '/tombola/sport-bingo', cta: 'Voir les jeux' },
  };
  const m = map[availability] || map.completed;
  return (
    <div className="mt-6">
      <p className="text-sm text-bone-300">{m.text}</p>
      <Link to={m.to}><Button variant="primary" size="md" className="mt-5">{m.cta}</Button></Link>
    </div>
  );
}

function Row({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-bold text-bone-100">{Icon && <Icon size={13} className="text-emerald-400" />}{value}</span>
    </div>
  );
}

function Cell({ free, event, pick, isDraft, onOpen }) {
  const chosen = pick?.chosen_option;
  const settled = event?.official_answer && !isDraft;
  const correct = settled && chosen === event.official_answer;
  const incorrect = settled && chosen && chosen !== event.official_answer;

  let ring = 'border-white/10 bg-white/[0.03]';
  if (free) ring = 'border-emerald-400/40 bg-emerald-400/10';
  else if (correct) ring = 'border-emerald-400/60 bg-emerald-500/15';
  else if (incorrect) ring = 'border-red-500/50 bg-red-500/10';
  else if (chosen) ring = 'border-cyan-400/50 bg-cyan-400/10';

  const badge = free ? null : (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-black ${
      chosen ? (correct ? 'bg-emerald-500 text-ink-900' : incorrect ? 'bg-red-500 text-white' : 'bg-cyan-400 text-ink-900') : 'bg-white/5 text-bone-600'}`}>
      {chosen || '?'}
    </span>
  );

  const inner = free ? (
    <div className="flex-1 grid place-items-center"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">FREE</span></div>
  ) : (
    <>
      <p className="text-[8px] sm:text-[9px] leading-tight text-bone-400 line-clamp-2 mb-1" title={event?.label}>{event?.label || '—'}</p>
      <div className="mt-auto flex items-center justify-between gap-1">
        {badge}
        {settled && <span className="text-[8px] font-bold text-bone-500">off. {event.official_answer}</span>}
      </div>
    </>
  );

  if (free || !isDraft) return <div className={`rounded-xl border p-2 min-h-[72px] flex flex-col ${ring}`}>{inner}</div>;
  return (
    <button onClick={onOpen} className={`rounded-xl border p-2 min-h-[72px] flex flex-col text-left transition hover:border-cyan-400/60 active:scale-[0.98] ${ring}`}>
      {inner}
    </button>
  );
}

// ── Bottom-sheet de remplissage (mobile-first) ───────────────
function FillSheet({ fillCells, eventsById, picksByCell, cellIndex, filled, total, savingCell, onSelect, onNav, onClose, onReset }) {
  const order = fillCells.map((c) => c.cell);
  const pos = order.indexOf(cellIndex);
  const cellDef = fillCells[pos];
  const ev = cellDef?.eventId ? eventsById[cellDef.eventId] : null;
  const label = ev?.label || '';
  const parts = label.split(/\s+(?:[-–]|vs\.?)\s+/i);
  const home = parts[0]?.trim(), away = parts[1]?.trim();
  const options = ev?.options || ['1', 'N', '2'];
  const chosen = picksByCell[cellIndex]?.chosen_option;
  const saving = savingCell === cellIndex;
  const subFor = (o) => o === '1' ? (home ? `Victoire ${home}` : 'Victoire domicile') : o === 'N' ? 'Match nul' : (away ? `Victoire ${away}` : 'Victoire extérieur');
  const pct = total ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-ink-950 p-5 shadow-2xl"
      >
        {/* Poignée + progression + fermer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-widest text-bone-500 font-bold">Case {pos + 1}/{order.length}</span>
              <span className="font-black tabular-nums text-emerald-400">{filled}/{total} complétées</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-bone-300 hover:text-bone-50"><X size={16} /></button>
        </div>

        {/* Match */}
        <div className="mt-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">Ton pronostic</p>
          {home && away ? (
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="font-display text-lg font-black text-bone-50 text-right flex-1">{home}</span>
              <span className="text-xs font-black text-bone-500">VS</span>
              <span className="font-display text-lg font-black text-bone-50 text-left flex-1">{away}</span>
            </div>
          ) : (
            <h3 className="mt-3 font-display text-xl font-black text-bone-50">{label || '—'}</h3>
          )}
        </div>

        {/* Options 1 / N / 2 en grand */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {options.map((o) => {
            const active = chosen === o;
            return (
              <button key={o} onClick={() => onSelect(cellIndex, o)} disabled={saving}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-4 transition disabled:opacity-60 ${
                  active ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_28px_-10px_rgba(34,211,238,0.7)]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl text-xl font-black ${active ? 'bg-cyan-400 text-ink-900' : 'bg-white/5 text-bone-200'}`}>{o}</span>
                <span className="text-[10px] leading-tight text-center text-bone-400 line-clamp-2">{subFor(o)}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation + réinitialiser */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => onNav(-1)} disabled={pos <= 0} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-bone-200 hover:text-emerald-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <button onClick={() => onNav(1)} disabled={pos >= order.length - 1} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-bone-200 hover:text-emerald-400 disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
          <button onClick={onReset} disabled={filled === 0} className="inline-flex items-center gap-1.5 text-xs font-bold text-bone-400 hover:text-red-400 disabled:opacity-40">
            <RotateCcw size={13} /> Réinitialiser
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-bone-500">Ton choix est enregistré automatiquement.</p>
      </motion.div>
    </div>
  );
}
