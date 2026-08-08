import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ticket, Heart, Gamepad2, Trophy, ShoppingBag, Coins, Gift, Calendar,
  ChevronRight, ArrowUpRight, Plus, Sparkles, Wallet, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import { PccRechargeModal } from '@/components/wallet/PccRechargeModal';
import { FanCard, FanStatCard, FanSectionTitle, FanEmpty, FanError, FanRowsSkeleton } from '@/components/fan/ui';

// Programme de fidélité / XP : pas de moteur backend → carte honnête "bientôt".
const FAN_LEVEL_ENABLED = false;

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return s; } };

export function FanOverview() {
  const { user, profile } = useAuth();
  const [data, setData] = useState({ orders: null, pcc: null, history: null, bingo: null, prizes: null, favorites: null });
  const [err, setErr] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  function load() {
    setErr(false);
    Promise.allSettled([
      apiFetch('/api/v2/me/orders'),
      apiFetch('/api/v2/me/pcc'),
      apiFetch('/api/v2/me/pcc-history'),
      apiFetch('/api/v2/bingo/me/cards'),
      apiFetch('/api/v2/me/prizes'),
      apiFetch('/api/v2/me/favorites'),
    ]).then(([o, p, h, b, pr, f]) => {
      setData({
        orders: o.status === 'fulfilled' ? (o.value.data?.orders || []) : [],
        pcc: p.status === 'fulfilled' ? p.value.data : null,
        history: h.status === 'fulfilled' ? (h.value.data?.transactions || []) : [],
        bingo: b.status === 'fulfilled' ? (b.value.data?.cards || []) : [],
        prizes: pr.status === 'fulfilled' ? (pr.value.data?.prizes || pr.value.data?.claims || []) : [],
        favorites: f.status === 'fulfilled' ? (f.value.data?.favorites || []) : [],
      });
    }).catch(() => setErr(true));
  }
  useEffect(() => { load(); }, []);

  // Compat anciens deep-links ?tab= (notifications, boutons existants)
  const [sp] = useSearchParams();
  const tabRedirect = { orders: '/mon-compte/commandes', bingo: '/mon-compte/activites', prizes: '/mon-compte/gains', history: '/mon-compte/pcc', moderation: '/mon-compte/moderation' }[sp.get('tab')];

  const { orders, pcc, history, bingo, prizes, favorites } = data;
  const loading = orders === null;

  if (tabRedirect) return <Navigate to={tabRedirect} replace />;

  // ── Activité récente agrégée (données déjà chargées) ────────
  const activity = useMemo(() => buildActivity({ orders, history, bingo, prizes }), [orders, history, bingo, prizes]);

  const name = profile?.display_name || 'Fan';
  const walletReady = pcc?.walletReady;

  return (
    <div className="space-y-6">
      {/* ══ HERO ══ */}
      <FanCard className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <img src="/images/heroBOfan.webp" alt="" aria-hidden className="h-full w-full object-cover object-center opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,11,16,0.94)_0%,rgba(6,11,16,0.74)_40%,rgba(6,11,16,0.42)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(6,11,16,0.55)_0%,transparent_45%)]" />
        </div>

        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          {/* Gauche : bienvenue + niveau */}
          <div className="min-w-0 flex-1">
            <h1 className="text-[30px] font-extrabold leading-tight text-white md:text-[32px]">Bienvenue {name} ! 👋</h1>
            <p className="mt-1 text-[15px] text-white/60">Ravi de te revoir parmi la communauté PaieCashFan.</p>
            <FanLevelCard />
          </div>

          {/* Droite : SOLDE PCC "lingot d'or" (remplace l'emblème) */}
          <div className="w-full shrink-0 md:w-[300px]">
            <div className="pcc-gold-card p-5">
              <div className="relative z-[1]">
                <div className="flex items-center gap-2 text-gold-400">
                  <Wallet size={16} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Solde PaieCashCoin</p>
                </div>
                {loading ? (
                  <div className="mt-3 h-9 w-32 animate-pulse rounded-lg bg-gold-400/15" />
                ) : walletReady ? (
                  <>
                    <p className="mt-2 font-display text-4xl font-black tabular-nums text-[#fde68a] [text-shadow:0_0_18px_rgba(251,191,36,0.35)]">{pcc.balance != null ? fmt(pcc.balance) : '—'} <span className="text-xl">PCC</span></p>
                    <p className="mt-0.5 text-[12px] text-gold-400/70">Disponible pour tes achats</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#f5dea0]/85">Crée ton wallet PaieCashCoin pour payer en PCC et gagner des bonus.</p>
                )}
                <button
                  onClick={() => setRechargeOpen(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-ink-950 shadow-[0_6px_20px_rgba(251,191,36,0.28)] transition hover:bg-gold-400"
                >
                  {walletReady ? 'Recharger' : 'Créer mon wallet'} <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </FanCard>

      {/* ══ KPI ══ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FanStatCard index={0} icon={Ticket} label="Billets & commandes" value={loading ? '—' : fmt((orders || []).filter((o) => o.status === 'completed').length)} hint="Commandes payées" to="/mon-compte/commandes" />
        <FanStatCard index={1} icon={Heart} label="Favoris" value={loading ? '—' : fmt((favorites || []).length)} hint="Clubs suivis" accent="text-rose-400" to="/mon-compte/favoris" />
        <FanStatCard index={2} icon={Gamepad2} label="Parties jouées" value={loading ? '—' : fmt((bingo || []).length)} hint="Sport Bingo" accent="text-cyan-400" to="/mon-compte/activites" />
        <FanStatCard index={3} icon={Trophy} label="Récompenses" value={loading ? '—' : fmt((prizes || []).length)} hint="Gains reçus" accent="text-gold-400" to="/mon-compte/gains" />
      </div>

      {/* ══ Grille principale ══ */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* Activité récente */}
        <FanCard className="p-6">
          <FanSectionTitle action="Voir toute l'activité" actionTo="/mon-compte/commandes">Activité récente</FanSectionTitle>
          <div className="mt-4">
            {loading ? (
              <FanRowsSkeleton rows={4} />
            ) : err ? (
              <FanError onRetry={load} />
            ) : activity.length === 0 ? (
              <FanEmpty icon={Sparkles} title="Aucune activité récente" hint="Tes achats, gains et transactions apparaîtront ici." />
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {activity.map((a) => <ActivityRow key={a.id} a={a} />)}
              </ul>
            )}
          </div>
        </FanCard>

        {/* Right rail */}
        <div className="space-y-6">
          <FavoriteClubsWidget favorites={favorites} loading={loading} />
          <UpcomingEventsWidget favorites={favorites} orders={orders} />
          <ChallengesWidget bingo={bingo} />
        </div>
      </div>

      {rechargeOpen && (
        <PccRechargeModal
          email={user?.email}
          found={pcc?.found}
          reason={pcc?.found === false ? null : (walletReady ? null : "Ton compte PaieCashCoin existe mais son wallet n'est pas encore activé.")}
          onClose={() => setRechargeOpen(false)}
        />
      )}
    </div>
  );
}

// ── Carte niveau / fidélité (feature-flag : pas de faux XP) ────
function FanLevelCard() {
  if (!FAN_LEVEL_ENABLED) {
    return (
      <div className="mt-5 inline-flex max-w-md items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-400/10 text-gold-400"><Sparkles size={20} /></span>
        <div>
          <p className="text-sm font-bold text-white">Programme de fidélité</p>
          <p className="text-[12px] text-white/45">Niveaux & récompenses supporter — bientôt disponible.</p>
        </div>
      </div>
    );
  }
  return null; // brancher le vrai moteur XP ici quand il existera
}

// ── Ligne d'activité ──────────────────────────────────────────
function ActivityRow({ a }) {
  const Icon = a.icon;
  return (
    <li className="flex items-center gap-3 py-3.5">
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04]', a.accent)}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{a.title}</p>
        {a.desc && <p className="truncate text-[12px] text-white/45">{a.desc}</p>}
        {a.ref && <p className="truncate text-[10px] uppercase tracking-wider text-white/25">Réf. {a.ref}</p>}
      </div>
      <div className="shrink-0 text-right">
        {a.badge && <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider', a.badge.cls)}>{a.badge.label}</span>}
        {a.amount && <p className={cn('mt-1 font-display text-sm font-black tabular-nums', a.amountCls || 'text-emerald-400')}>{a.amount}</p>}
        <p className="mt-0.5 text-[11px] text-white/35">{a.date}</p>
      </div>
    </li>
  );
}

// ── Right rail : Mes clubs ────────────────────────────────────
function FavoriteClubsWidget({ favorites, loading }) {
  return (
    <FanCard className="p-5">
      <FanSectionTitle action="Voir tout" actionTo="/mon-compte/clubs">Mes clubs</FanSectionTitle>
      <div className="mt-3">
        {loading ? (
          <FanRowsSkeleton rows={2} />
        ) : (favorites || []).length === 0 ? (
          <FanEmpty className="py-6" icon={Heart} title="Aucun club favori" hint="Ajoute ton premier club pour suivre son actu." action="Ajouter un club" actionTo="/fan-club" />
        ) : (
          <div className="space-y-2">
            {favorites.slice(0, 4).map((f) => (
              <Link key={f.club.id} to={`/clubs/${f.club.slug}`} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:border-emerald-500/25">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                  {f.club.logo ? <img src={f.club.logo} alt="" className="max-h-6 max-w-6 object-contain" /> : <span className="text-xs font-black text-white/60">{(f.club.name || '?')[0]}</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{f.club.name}</p>
                  <p className="truncate text-[11px] text-white/40">{[f.club.league_name, f.club.city].filter(Boolean).join(' · ') || f.club.sport}</p>
                </div>
                {f.isPrimary && <span className="shrink-0 rounded-full border border-gold-400/30 bg-gold-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-gold-400">Principal</span>}
                <ChevronRight size={15} className="shrink-0 text-white/25" />
              </Link>
            ))}
            <Link to="/fan-club" className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/12 py-2.5 text-xs font-bold text-white/50 transition hover:border-emerald-500/30 hover:text-emerald-400">
              <Plus size={14} /> Ajouter un club
            </Link>
          </div>
        )}
      </div>
    </FanCard>
  );
}

// ── Right rail : Prochains événements (API-Football si dispo) ──
function UpcomingEventsWidget({ favorites, orders }) {
  const [state, setState] = useState({ loading: true, event: null });
  const primary = useMemo(() => (favorites || []).find((f) => f.isPrimary) || (favorites || [])[0], [favorites]);

  useEffect(() => {
    if (favorites == null) return;
    if (!primary?.club?.slug) { setState({ loading: false, event: null }); return; }
    let alive = true;
    apiFetch(`/api/v2/live/club/${primary.club.slug}/fixtures`)
      .then((j) => { if (alive) setState({ loading: false, event: (j.data?.upcoming || [])[0] || null }); })
      .catch(() => { if (alive) setState({ loading: false, event: null }); });
    return () => { alive = false; };
  }, [primary, favorites]);

  return (
    <FanCard className="p-5">
      <FanSectionTitle action="Voir tout" actionTo="/mon-compte/clubs">Prochains événements</FanSectionTitle>
      <div className="mt-3">
        {state.loading ? (
          <FanRowsSkeleton rows={1} />
        ) : !state.event ? (
          <FanEmpty className="py-6" icon={Calendar} title="Aucun événement à venir" hint="Les prochains matchs de tes clubs apparaîtront ici." />
        ) : (
          <EventCard event={state.event} primaryClub={primary.club} orders={orders} />
        )}
      </div>
    </FanCard>
  );
}

function EventCard({ event, primaryClub }) {
  const d = event.kickoff ? new Date(event.kickoff) : null;
  const day = d ? d.toLocaleDateString('fr-FR', { day: '2-digit' }) : '—';
  const mon = d ? d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '').toUpperCase() : '';
  const ticketSlug = event.homeSlug || primaryClub?.slug || null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-start gap-3">
        <div className="grid w-12 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-center">
          <span className="font-display text-lg font-black leading-none text-white">{day}</span>
          <span className="mt-0.5 text-[9px] font-bold tracking-widest text-emerald-400">{mon}</span>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          {event.homeLogo ? <img src={event.homeLogo} alt="" className="max-h-7 max-w-7 object-contain" /> : <Calendar size={16} className="text-white/40" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-white">{event.homeTeam} <span className="text-white/40">vs</span> {event.awayTeam}</p>
          {event.venue && <p className="truncate text-[11px] text-white/45">{event.venue}</p>}
          {event.competition && <p className="truncate text-[11px] text-white/45">{event.competition}</p>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <Link to={ticketSlug ? `/clubs/${ticketSlug}/billetterie` : '/billetterie'} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-ink-950 transition hover:bg-emerald-400">
          <Ticket size={13} /> Achetez votre billet
        </Link>
        <Link to="/mon-compte/commandes" className="text-[11px] font-bold text-white/45 transition hover:text-emerald-400">Mes billets</Link>
      </div>
    </div>
  );
}

// ── Right rail : Défis & jeux (pas de faux défi 3/5) ──────────
function ChallengesWidget({ bingo }) {
  const lastPlayable = (bingo || []).find((c) => c.status === 'draft' || c.status === 'submitted');
  return (
    <FanCard className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
      <FanSectionTitle action="Découvrir" actionTo="/tombola/sport-bingo">Jeux & défis</FanSectionTitle>
      <div className="relative mt-3 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400"><Gamepad2 size={20} /></span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">Sport Bingo</p>
          <p className="text-[12px] text-white/50">
            {lastPlayable ? 'Tu as une grille à compléter — tente le BINGO !' : 'Gagne des PCC et des lots en pronostiquant les matchs.'}
          </p>
        </div>
      </div>
      <Link to="/tombola/sport-bingo" className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-500/20">
        {lastPlayable ? 'Compléter ma grille' : 'Jouer maintenant'} <ArrowRight size={13} />
      </Link>
    </FanCard>
  );
}

// ── Agrégateur d'activité (front, données déjà chargées) ──────
function buildActivity({ orders, history, bingo, prizes }) {
  const items = [];
  (orders || []).forEach((o) => {
    const isTicket = o.kind === 'ticketing';
    items.push({
      id: `o-${o.id}`, ts: new Date(o.createdAt).getTime(),
      icon: isTicket ? Ticket : ShoppingBag, accent: 'text-emerald-400',
      title: isTicket ? 'Billet' : 'Achat confirmé',
      desc: [(o.items || []).map((i) => `${i.quantity > 1 ? i.quantity + '× ' : ''}${i.name}`).join(', '), o.clubName].filter(Boolean).join(' · '),
      ref: o.reference, date: fmtDate(o.createdAt),
      amount: o.totalPcc ? `${fmt(o.totalPcc)} PCC` : null,
      badge: o.status === 'completed' ? { label: 'Payée', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' } : null,
    });
  });
  (history || []).forEach((t) => {
    items.push({
      id: `h-${t.id}`, ts: new Date(t.createdAt).getTime(),
      icon: Coins, accent: 'text-cyan-400',
      title: t.description || 'Transaction PCC', desc: t.mode || null,
      date: fmtDate(t.createdAt), amount: `−${fmt(t.pccUsed || t.amountEur)} PCC`, amountCls: 'text-white/70',
    });
  });
  (bingo || []).filter((c) => c.status === 'scored' && Number(c.points_total) > 0).forEach((c) => {
    items.push({
      id: `b-${c.id}`, ts: new Date(c.submitted_at || c.created_at).getTime(),
      icon: Gamepad2, accent: 'text-gold-400',
      title: 'Grille Sport Bingo', desc: c.edition?.title || null,
      date: fmtDate(c.submitted_at || c.created_at), amount: `${fmt(c.points_total)} pts`, amountCls: 'text-gold-400',
    });
  });
  (prizes || []).forEach((p) => {
    items.push({
      id: `p-${p.id}`, ts: new Date(p.createdAt || p.created_at || Date.now()).getTime(),
      icon: Gift, accent: 'text-gold-400',
      title: 'Gain reçu', desc: [p.prizeLabel, p.clubName].filter(Boolean).join(' · ') || null,
      date: fmtDate(p.createdAt || p.created_at),
    });
  });
  return items.filter((i) => !Number.isNaN(i.ts)).sort((a, b) => b.ts - a.ts).slice(0, 6);
}
