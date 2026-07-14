import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Grid3x3, Loader2, Lock, Check, Coins, AlertCircle, CheckCircle2, Clock, ShieldAlert, ChevronLeft, ChevronRight, X, RotateCcw, PencilLine } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const GRID = { express: 3, standard: 5, expert: 6 };
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

  const load = () => apiFetch(`/api/v2/bingo/${slug}`).then((j) => setData(j.data)).catch((e) => setError(e.message));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [slug]);

  const eventsById = useMemo(() => Object.fromEntries((data?.events || []).map((e) => [e.id, e])), [data]);
  const picksByCell = useMemo(() => Object.fromEntries((data?.picks || []).map((p) => [p.cell_index, p])), [data]);
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

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.14),transparent_40%)]" />
      <Container className="relative py-12 md:py-16 max-w-3xl">
        <Link to="/tombola" className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100"><ArrowLeft size={16} /> Retour aux jeux</Link>

        <div className="mt-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-400"><Grid3x3 size={16} /><span className="text-[10px] uppercase tracking-[0.28em] font-black">Sport Bingo</span></div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-black uppercase text-bone-50">{ed.title}</h1>
            {ed.description && <p className="mt-2 text-sm text-bone-400 max-w-xl">{ed.description}</p>}
          </div>
          {user && data.credits != null && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-right">
              <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Crédits</p>
              <p className="font-display text-xl font-black text-emerald-400 inline-flex items-center gap-1"><Coins size={16} /> {data.credits}</p>
            </div>
          )}
        </div>

        {error && <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle size={16} /> {error}</div>}

        {/* Pas de carte → intro / jouer */}
        {!card ? (
          <GlassCard className="mt-8 p-8 text-center">
            <Grid3x3 className="mx-auto text-emerald-400" size={44} />
            <h2 className="mt-4 font-display text-xl font-black uppercase text-bone-50">Grille {size}×{size}</h2>
            <p className="mt-2 text-sm text-bone-400">Pronostique le résultat (1 · N · 2) de chaque match. Complète des lignes, colonnes, diagonales… pour marquer des points.</p>
            <p className="mt-4 text-sm text-bone-300">Coût : <b className="text-emerald-400">{ed.cost_credits} crédits</b></p>
            {!user
              ? <Link to="/login"><Button variant="primary" size="md" className="mt-6">Se connecter pour jouer</Button></Link>
              : <Button variant="primary" size="md" className="mt-6" onClick={startCard} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Grid3x3 size={15} />} Jouer ({ed.cost_credits} crédits)</Button>}
          </GlassCard>
        ) : (
          <>
            {/* Statut de la grille */}
            <div className="mt-8">
              {isDraft ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-bone-400">Progression</span>
                    <span className="font-black tabular-nums text-bone-100">{filled}<span className="text-bone-500">/{totalCells}</span></span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400 transition-all duration-300" style={{ width: `${totalCells ? Math.round((filled / totalCells) * 100) : 0}%` }} />
                  </div>
                </>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-gold-400"><Lock size={12} /> Grille validée</span>
              )}
            </div>

            {/* Bouton principal de remplissage (mobile-first) */}
            {isDraft && (
              <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => openSheet(firstEmptyCell())}>
                <PencilLine size={16} /> {filled < totalCells ? `Compléter ma grille (${totalCells - filled} restante${totalCells - filled > 1 ? 's' : ''})` : 'Revoir mes pronostics'}
              </Button>
            )}

            {/* Grille (aperçu — appuie sur une case pour la modifier) */}
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {(card.layout || []).slice().sort((a, b) => a.cell - b.cell).map((c) => {
                const pk = picksByCell[c.cell];
                const ev = c.eventId ? eventsById[c.eventId] : null;
                return <Cell key={c.cell} free={c.free} event={ev} pick={pk} isDraft={isDraft} onOpen={() => openSheet(c.cell)} />;
              })}
            </div>

            {isDraft && (
              <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                <button onClick={resetPicks} disabled={filled === 0} className="inline-flex items-center gap-1.5 text-xs font-bold text-bone-400 hover:text-red-400 disabled:opacity-40 disabled:hover:text-bone-400">
                  <RotateCcw size={13} /> Réinitialiser
                </button>
                <Button variant="gold" size="md" onClick={() => setConfirmOpen(true)} disabled={busy || filled < totalCells}>
                  <Check size={15} /> Valider ma grille
                </Button>
              </div>
            )}
            {card.status === 'scored' ? (
              <div className="mt-6 rounded-2xl border border-gold-400/30 bg-gold-400/[0.08] p-5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Ton score</p>
                <p className="mt-1 font-display text-4xl font-black text-gold-400">{card.points_total} pts</p>
                {Array.isArray(card.figures_won) && card.figures_won.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {card.figures_won.map((f) => (
                      <span key={f} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-bold text-bone-200">{FIGURE_LABELS[f] || f}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : !isDraft && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 size={16} /> Ta grille est enregistrée. Les points seront calculés à la clôture de l'édition.
              </div>
            )}
          </>
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
