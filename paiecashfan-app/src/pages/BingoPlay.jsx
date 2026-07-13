import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Grid3x3, Loader2, Lock, Check, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    try { await apiFetch(`/api/v2/bingo/card/${card.id}/submit`, { method: 'POST' }); await load(); }
    catch (e) { setError(e.message); }
    setBusy(false);
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
            <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
              {isDraft
                ? <p className="text-sm text-bone-400">{filled}/{totalCells} cases complétées</p>
                : <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-gold-400"><Lock size={12} /> Grille validée</span>}
            </div>

            {/* Grille */}
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {(card.layout || []).slice().sort((a, b) => a.cell - b.cell).map((c) => {
                const pk = picksByCell[c.cell];
                const ev = c.eventId ? eventsById[c.eventId] : null;
                return <Cell key={c.cell} free={c.free} event={ev} pick={pk} isDraft={isDraft} saving={savingCell === c.cell} onSelect={(o) => selectCell(c.cell, o)} />;
              })}
            </div>

            {isDraft && (
              <div className="mt-6 flex justify-end">
                <Button variant="gold" size="md" onClick={submit} disabled={busy || filled < totalCells}>
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Valider ma grille
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
    </div>
  );
}

function Cell({ free, event, pick, isDraft, saving, onSelect }) {
  const chosen = pick?.chosen_option;
  const settled = event?.official_answer && !isDraft;
  const correct = settled && chosen === event.official_answer;
  const incorrect = settled && chosen && chosen !== event.official_answer;

  let ring = 'border-white/10 bg-white/[0.03]';
  if (free) ring = 'border-emerald-400/40 bg-emerald-400/10';
  else if (correct) ring = 'border-emerald-400/60 bg-emerald-500/15';
  else if (incorrect) ring = 'border-red-500/50 bg-red-500/10';
  else if (chosen) ring = 'border-cyan-400/50 bg-cyan-400/10';

  return (
    <div className={`rounded-xl border p-2 min-h-[76px] flex flex-col ${ring}`}>
      {free ? (
        <div className="flex-1 grid place-items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">FREE</span>
        </div>
      ) : (
        <>
          <p className="text-[9px] leading-tight text-bone-400 line-clamp-2 mb-1" title={event?.label}>{event?.label || '—'}</p>
          <div className="mt-auto flex gap-1">
            {(event?.options || ['1', 'N', '2']).map((o) => {
              const active = chosen === o;
              const isAnswer = settled && event.official_answer === o;
              return (
                <button
                  key={o}
                  disabled={!isDraft}
                  onClick={() => onSelect(o)}
                  className={`flex-1 h-6 rounded text-[10px] font-black transition ${
                    active ? 'bg-cyan-400 text-ink-900'
                    : isAnswer ? 'bg-emerald-500 text-ink-900'
                    : 'bg-white/5 text-bone-400 ' + (isDraft ? 'hover:bg-white/10' : 'opacity-60')}`}
                >{o}</button>
              );
            })}
          </div>
          {saving && <Loader2 size={10} className="animate-spin text-bone-500 mt-1 mx-auto" />}
        </>
      )}
    </div>
  );
}
