import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Gift, Check, X, Users, ShieldCheck, Trophy, Sparkles,
  Gamepad2, Wallet, Loader2, CheckCircle2, AlertCircle, Minus, Plus
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const PCC_APP_URL = import.meta.env.VITE_PAIECASHCOIN_URL || 'https://www.paiecashcoin.com';

// Grille de jeux « à venir » — showcase statique (pas encore branché).
const UPCOMING_GAMES = [
  { id: 'bingo-loto', name: 'Bingo Loto', category: 'Tombola' },
  { id: '649-lottery', name: 'Loterie 6/49', category: 'Lottery' },
  { id: 'fantasy-football', name: 'Football Fantasy', category: 'Fantasy' },
  { id: 'match-predictor', name: 'Prédiction de match', category: 'Prédiction' },
  { id: 'penalty-shootout', name: 'Tirs au but', category: 'Mini-jeu' },
  { id: 'pcc-mega-league', name: 'Ligue PCC Mega', category: 'Compétition' },
];

const STEPS = [
  { n: 1, icon: Gift, title: 'Choisis une tombola', text: 'Parcours les tombolas en cours et leurs lots.' },
  { n: 2, icon: Wallet, title: 'Achète des tickets en PCC', text: 'Plus tu as de tickets, plus tu as de chances.' },
  { n: 3, icon: Trophy, title: 'Tirage automatique', text: 'À la date de fin, un gagnant est tiré au sort.' },
];

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { d: '00', h: '00', m: '00', s: '00', expired: true };
  return {
    d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
    h: String(Math.floor((diff / 3600000) % 24)).padStart(2, '0'),
    m: String(Math.floor((diff / 60000) % 60)).padStart(2, '0'),
    s: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
    expired: false,
  };
}

const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return s; } };

export function Tombola() {
  const [campaigns, setCampaigns] = useState(null);
  const [buying, setBuying] = useState(null); // campagne en cours d'achat (modale)

  const load = () => {
    apiFetch('/api/v2/tombola')
      .then((j) => setCampaigns(j.data?.campaigns || []))
      .catch(() => setCampaigns([]));
  };
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (campaigns || []).filter((c) => c.status === 'active'), [campaigns]);
  const past = useMemo(() => (campaigns || []).filter((c) => c.status === 'drawn'), [campaigns]);
  const featured = active[0] || null;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(245,158,11,0.15),transparent_35%)]" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative py-14 md:py-20">
        <Container>
          <Badge variant="emerald">🎁 Tombola</Badge>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-black uppercase tracking-tight text-bone-50 leading-[0.95]">
            Joue. Gagne.<br /><span className="text-gradient-hero">Vibre avec ton club.</span>
          </h1>
          <p className="mt-6 max-w-xl text-bone-300 text-base md:text-lg">
            Achète des tickets avec tes PCC et tente de remporter des lots fan exclusifs.
            Tirage au sort automatique à la fin de chaque tombola.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
            <HeroFeature icon={Users} title="100% Fan" text="Pour les vrais supporters" />
            <HeroFeature icon={ShieldCheck} title="Sécurisé" text="Paiement PCC encadré" />
            <HeroFeature icon={Sparkles} title="Transparent" text="Tirage aléatoire" />
          </div>
        </Container>
      </section>

      {/* ── TOMBOLAS EN COURS ────────────────────────────── */}
      <Container className="relative pb-8">
        <SectionTitle icon={Ticket}>Tombolas en cours</SectionTitle>

        {campaigns === null ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : active.length === 0 ? (
          <GlassCard className="mt-6 p-10 text-center">
            <Gift className="mx-auto text-bone-600" size={40} />
            <p className="mt-4 text-sm text-bone-400">Aucune tombola en cours pour le moment. Reviens bientôt !</p>
          </GlassCard>
        ) : (
          <>
            {featured && <FeaturedDraw campaign={featured} onBuy={() => setBuying(featured)} />}
            {active.length > 1 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {active.slice(1).map((c) => <TombolaCard key={c.id} campaign={c} onBuy={() => setBuying(c)} />)}
              </div>
            )}
          </>
        )}
      </Container>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────── */}
      <Container className="relative py-12">
        <SectionTitle icon={Sparkles}>Comment ça marche</SectionTitle>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <GlassCard key={s.n} className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <s.icon size={18} />
                </div>
                <span className="text-2xl font-display font-black text-bone-700">{s.n}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-black text-bone-50">{s.title}</h3>
              <p className="mt-1 text-sm text-bone-400">{s.text}</p>
            </GlassCard>
          ))}
        </div>
      </Container>

      {/* ── GAGNANTS PASSÉS ──────────────────────────────── */}
      {past.length > 0 && (
        <Container className="relative py-8">
          <SectionTitle icon={Trophy}>Tirages passés</SectionTitle>
          <div className="mt-6 space-y-3">
            {past.map((c) => (
              <GlassCard key={c.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-base font-black text-bone-50 truncate">{c.prizeLabel || c.title}</p>
                    <p className="text-xs text-bone-500">{c.drawnAt ? fmtDate(c.drawnAt) : ''}{c.clubName ? ` · ${c.clubName}` : ''}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Gagnant</p>
                  <p className="font-bold text-emerald-400">{c.winnerName || '—'}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </Container>
      )}

      {/* ── JEUX À VENIR (showcase) ──────────────────────── */}
      <Container className="relative py-12">
        <SectionTitle icon={Gamepad2}>Jeux à venir</SectionTitle>
        <div className="mt-6 grid gap-3 grid-cols-2 md:grid-cols-3">
          {UPCOMING_GAMES.map((g) => (
            <div key={g.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{g.category}</span>
                <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-bone-400 font-bold">Bientôt</span>
              </div>
              <p className="mt-3 font-display text-lg font-black text-bone-100">{g.name}</p>
            </div>
          ))}
        </div>
      </Container>

      <AnimatePresence>
        {buying && (
          <BuyModal campaign={buying} onClose={() => setBuying(null)} onDone={() => { setBuying(null); load(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tirage en vedette (grande carte + compte à rebours) ──────
function FeaturedDraw({ campaign, onBuy }) {
  const [t, setT] = useState(() => getTimeLeft(campaign.endsAt));
  useEffect(() => { const i = setInterval(() => setT(getTimeLeft(campaign.endsAt)), 1000); return () => clearInterval(i); }, [campaign.endsAt]);
  const progress = campaign.ticketsTotal ? Math.min(100, Math.round((campaign.ticketsSold / campaign.ticketsTotal) * 100)) : null;

  return (
    <GlassCard variant="strong" className="mt-6 p-6 md:p-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.12),transparent_40%)]" />
      <div className="relative grid gap-6 md:grid-cols-[150px_1fr_190px] md:items-center">
        <div className="rounded-2xl border border-gold-400/40 bg-gold-400/10 p-3 h-36 grid place-items-center overflow-hidden">
          {campaign.imageUrl
            ? <img src={campaign.imageUrl} alt="" className="max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            : <Gift size={54} className="text-gold-400" />}
        </div>

        <div>
          <div className="inline-flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">Tirage en cours</p>
            {campaign.clubName && <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-widest text-bone-300 font-bold">{campaign.clubName}</span>}
          </div>
          <h2 className="mt-3 font-display text-2xl md:text-3xl font-black text-bone-50">{campaign.prizeLabel || campaign.title}</h2>
          {campaign.description && <p className="mt-2 text-sm text-bone-400 max-w-md">{campaign.description}</p>}
          <div className="mt-6">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">Fin du tirage dans</p>
            <div className="flex gap-2 flex-wrap">
              <TimeBox value={t.d} label="Jours" /><TimeBox value={t.h} label="Heures" />
              <TimeBox value={t.m} label="Minutes" /><TimeBox value={t.s} label="Secondes" />
            </div>
          </div>
        </div>

        <div className="md:border-l md:border-white/10 md:pl-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">Prix du ticket</p>
          <p className="mt-1 font-display text-3xl font-black text-emerald-400">{campaign.ticketPricePcc} PCC</p>
          <Button variant="gold" size="md" className="mt-4 w-full" onClick={onBuy} disabled={t.expired}>
            <Ticket size={15} /> {t.expired ? 'Terminé' : 'Acheter un ticket'}
          </Button>
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">Tickets vendus</p>
            <p className="mt-1 text-bone-100 font-bold">{campaign.ticketsSold}{campaign.ticketsTotal ? <span className="text-bone-500"> / {campaign.ticketsTotal}</span> : ''}</p>
            {progress != null && (
              <>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-[10px] text-emerald-400 font-bold">{progress}% vendus</p>
              </>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Carte tombola (grille) ───────────────────────────────────
function TombolaCard({ campaign, onBuy }) {
  const t = getTimeLeft(campaign.endsAt);
  return (
    <GlassCard className="p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400 shrink-0">
          <Gift size={20} />
        </div>
        {campaign.clubName && <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{campaign.clubName}</span>}
      </div>
      <h3 className="mt-4 font-display text-lg font-black text-bone-50">{campaign.prizeLabel || campaign.title}</h3>
      <p className="mt-1 text-xs text-bone-500">Fin le {fmtDate(campaign.endsAt)}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Ticket</p>
          <p className="font-display text-xl font-black text-emerald-400">{campaign.ticketPricePcc} PCC</p>
        </div>
        <Button variant="primary" size="sm" onClick={onBuy} disabled={t.expired}>
          <Ticket size={13} /> Participer
        </Button>
      </div>
    </GlassCard>
  );
}

// ── Modale d'achat de tickets (paiement PCC) ─────────────────
function BuyModal({ campaign, onClose, onDone }) {
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | paying | success
  const [error, setError] = useState('');
  const [topUp, setTopUp] = useState(false);
  const total = qty * campaign.ticketPricePcc;

  async function pay() {
    setError(''); setTopUp(false);
    if (!user) { setError('Connecte-toi pour participer.'); return; }
    setStatus('paying');
    try {
      await apiFetch(`/api/v2/tombola/${campaign.id}/buy`, { method: 'POST', body: JSON.stringify({ quantity: qty }) });
      setStatus('success');
    } catch (e) {
      const msg = e?.message || 'Achat impossible.';
      if (/insuffisant|wallet|recharge/i.test(msg)) setTopUp(true); else setError(msg);
      setStatus('idle');
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl">
        {status === 'success' ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
            <h3 className="mt-4 font-display text-2xl font-black uppercase text-bone-50">Tickets achetés !</h3>
            <p className="mt-3 text-sm text-bone-300">Tu as {qty} ticket{qty > 1 ? 's' : ''} pour « {campaign.prizeLabel || campaign.title} ». Bonne chance ! 🍀</p>
            <Button variant="primary" size="md" className="mt-6" onClick={onDone}>Fermer</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">Tombola</p>
                <h3 className="mt-2 font-display text-xl font-black uppercase text-bone-50">{campaign.prizeLabel || campaign.title}</h3>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-bone-300 hover:text-bone-50">✕</button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">Quantité</span>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/50 p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Minus size={12} /></button>
                <span className="min-w-[2rem] text-center text-sm font-mono font-bold text-bone-50">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Plus size={12} /></button>
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] uppercase tracking-[0.32em] text-bone-400 font-bold">Total</span>
              <span className="font-display text-3xl font-black text-emerald-400 tabular-nums">{total} PCC</span>
            </div>

            {error && <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}
            {topUp && (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <p className="text-sm text-amber-200">Solde PCC insuffisant.</p>
                <a href={PCC_APP_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-amber-300 transition"><Wallet size={14} /> Recharger mon wallet</a>
              </div>
            )}
            {!user && !error && <p className="mt-4 text-center text-xs text-bone-500">Tu dois être connecté pour participer.</p>}

            <div className="mt-6 flex justify-end">
              <Button variant="gold" size="md" onClick={pay} disabled={status === 'paying'}>
                {status === 'paying' ? <><Loader2 size={15} className="animate-spin" /> Paiement…</> : <><Ticket size={15} /> Payer {total} PCC</>}
              </Button>
            </div>
          </>
        )}
      </motion.div>
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

function TimeBox({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center min-w-[3.5rem]">
      <div className="font-display text-2xl font-black text-bone-50 tabular-nums">{value}</div>
      <div className="text-[8px] uppercase tracking-[0.18em] text-bone-500 font-bold">{label}</div>
    </div>
  );
}
