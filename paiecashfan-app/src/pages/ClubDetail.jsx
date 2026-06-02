import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Globe, Wallet, CreditCard, Search,
  ShoppingBag, Trophy, Dices, Heart, Share2
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { findClubBySlug } from '@/data/clubsRegistry';
import { mockWallet, mockFans, mockTransactions, fallbackHeroStats, onlineCount } from '@/data/clubMocks';

const fmtAmount = (n, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);

const fmtRel = (n) =>
  (n >= 0 ? '+' : '') + new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 2, signDisplay: 'never'
  }).format(Math.abs(n));

export function ClubDetail() {
  const { slug } = useParams();
  const club = findClubBySlug(slug);

  if (!club) return <NotFound slug={slug} />;

  return (
    <div className="relative">
      {/* Panel de side actions (mobile : barre flottante en bas, desktop : à gauche) */}
      <SideActions primaryColor={club.primaryColor} />

      {/* ═══ HERO style marketplace ═══════════════════════════════════ */}
      <ClubHero club={club} />

      {/* ═══ WALLET (2 cards Compte Bancaire + Wallet Crypto) ═══════ */}
      <Container className="relative pt-12 md:pt-16 pb-6">
        <WalletSection wallet={mockWallet} primaryColor={club.primaryColor} />
      </Container>

      {/* ═══ FANS STORIES (avatars carrousel) ═══════════════════════ */}
      <Container className="relative pt-6 pb-6">
        <FansStorySection fans={mockFans} club={club} />
      </Container>

      {/* ═══ TRANSACTIONS LIVE ═══════════════════════════════════════ */}
      <Container className="relative pt-6 pb-32 md:pb-24">
        <TransactionsLiveSection items={mockTransactions} club={club} />
      </Container>
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────
function ClubHero({ club }) {
  const stats = useMemo(() => fallbackHeroStats(club), [club]);

  return (
    <section className="relative overflow-hidden border-b border-white/5 min-h-[70vh] flex flex-col">
      {/* Background stade flouté avec teinte couleur du club */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/futuristic_stadium_hero.png')" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            ${club.primaryColor}20 0%,
            ${club.primaryColor}40 30%,
            rgba(4,8,13,0.6) 65%,
            rgba(4,8,13,1) 100%)`
        }}
      />
      <div className="absolute inset-0 bg-ink-900/40" />

      <Container className="relative flex-1 flex flex-col items-center justify-center text-center py-16 md:py-24">
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-bone-200 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={14} />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          {/* Logo / Crest */}
          <CrestLarge club={club} />

          {/* Nom du club */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-bone-50"
            style={{ textShadow: '0 4px 32px rgba(0,0,0,0.8)' }}
          >
            {club.name}
          </motion.h1>

          {/* Motto / devise / federation */}
          {(club.motto || club.federation) && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-3 text-xs md:text-sm italic text-bone-300 uppercase tracking-[0.18em]"
              style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}
            >
              « {club.motto || club.federation} »
            </motion.p>
          )}

          {/* Méta chips inline */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 inline-flex items-center gap-px overflow-hidden rounded-full border border-white/10 bg-ink-900/60 backdrop-blur-md"
          >
            <MetaChip label="Fondation" value={club.founded || '—'} />
            <Divider />
            <MetaChip label={club.type === 'national' ? 'Ligue' : 'Stade'} value={club.stadium || club.league} />
            <Divider />
            <MetaChip label={club.type === 'national' ? 'Président' : 'Coach'} value={club.president || club.manager || '—'} />
          </motion.div>
        </motion.div>

        {/* Stats inline en bas du Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-center">
            <BigStat value={stats.trophies} label="Total Trophies" />
            <BigStat value={stats.founded}  label="Year Founded" />
            <BigStat value={stats.squad}    label="Squad Size" suffix=" Players" />
            <BigStat value={stats.tokens}   label="Fan Tokens" />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function CrestLarge({ club }) {
  const colorBg = `${club.primaryColor}20`;
  if (club.logo) {
    return (
      <div
        className="relative h-28 w-28 md:h-36 md:w-36 rounded-full grid place-items-center"
        style={{
          background: `radial-gradient(circle, ${club.primaryColor}40, transparent 70%)`,
          boxShadow: `0 0 80px -10px ${club.primaryColor}88`
        }}
      >
        <div
          className="h-24 w-24 md:h-32 md:w-32 rounded-full grid place-items-center backdrop-blur-sm"
          style={{ background: colorBg, border: `2px solid ${club.primaryColor}80` }}
        >
          <img
            src={club.logo}
            alt={club.name}
            className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className="h-28 w-28 md:h-36 md:w-36 rounded-full grid place-items-center text-4xl md:text-5xl font-display font-black"
      style={{
        background: colorBg,
        border: `2px solid ${club.primaryColor}80`,
        color: club.primaryColor,
        boxShadow: `0 0 80px -10px ${club.primaryColor}88`
      }}
    >
      {club.code?.slice(0, 3) || '⚽'}
    </div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div className="px-3 py-2 md:px-4 md:py-2.5">
      <div className="text-[8px] uppercase tracking-[0.22em] text-bone-400 font-bold">{label}</div>
      <div className="text-[11px] md:text-xs font-mono text-bone-100 mt-0.5">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 self-center bg-white/10" />;
}

function BigStat({ value, label, suffix = '' }) {
  return (
    <div>
      <div className="font-display text-2xl md:text-3xl font-black text-bone-50 tabular-nums" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
        {value}{suffix}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">{label}</div>
    </div>
  );
}

// ── WALLET ───────────────────────────────────────────────────────────
function WalletSection({ wallet, primaryColor }) {
  return (
    <div className="grid gap-3 md:gap-4 md:grid-cols-2">
      <WalletCard
        icon={<CreditCard size={18} />}
        accentColor="#10b981"
        label={wallet.bank.label}
        amount={fmtAmount(wallet.bank.balance, wallet.bank.currency)}
        sub={wallet.bank.note}
      />
      <WalletCard
        icon={<Wallet size={18} />}
        accentColor="#a78bfa"
        label={wallet.crypto.label}
        amount={fmtAmount(wallet.crypto.balance, 'EUR')}
        sub={`${wallet.crypto.currency} · ${wallet.crypto.address}`}
      />
    </div>
  );
}

function WalletCard({ icon, accentColor, label, amount, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 md:p-6 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30" style={{ background: accentColor }} />

      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 place-items-center rounded-xl ring-1"
          style={{ color: accentColor, background: `${accentColor}1A`, borderColor: `${accentColor}40` }}
        >
          {icon}
        </div>
        <div className="text-sm font-semibold text-bone-200">{label}</div>
      </div>

      <div className="mt-4 font-display text-3xl md:text-4xl font-black text-bone-50 tabular-nums">
        {amount}
      </div>
      <div className="mt-1 text-xs text-bone-400 font-mono">{sub}</div>
    </motion.div>
  );
}

// ── FANS STORIES ─────────────────────────────────────────────────────
function FansStorySection({ fans, club }) {
  const count = onlineCount(fans);
  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-bone-300">
          Fans en ligne
        </h2>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {count} en ligne
        </span>
      </div>

      <div className="overflow-x-auto mask-fade-x -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {fans.map((f, i) => (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center shrink-0 w-16"
            >
              <span
                className="relative h-14 w-14 rounded-full p-0.5 ring-2"
                style={{ borderColor: club.primaryColor, ringColor: `${club.primaryColor}66` }}
              >
                <span className="block h-full w-full rounded-full overflow-hidden bg-ink-700">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="h-full w-full grid place-items-center text-[10px] font-bold text-bone-300">
                      {f.initials || f.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                {f.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
                )}
              </span>
              <span className="mt-1.5 text-[10px] text-bone-400 truncate w-full text-center" title={f.name}>
                {f.name.length > 8 ? f.name.slice(0, 8) + '…' : f.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TRANSACTIONS LIVE ────────────────────────────────────────────────
function TransactionsLiveSection({ items, club }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-bone-300">
          Transactions en temps réel
        </h2>
        <button className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold hover:text-emerald-300">
          Voir tout
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-4 md:px-5 py-3.5"
          >
            <span className="shrink-0 grid h-10 w-10 place-items-center rounded-xl text-xl bg-white/5">
              {t.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-bone-50 truncate">{t.label}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold mt-0.5">
                {t.sub}
              </div>
            </div>
            <div
              className={`font-display font-bold text-sm md:text-base tabular-nums whitespace-nowrap ${
                t.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {t.direction === 'in' ? '+' : '−'}{fmtRel(t.amount)}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ── SIDE ACTIONS (panier / trophée / dés / like / share / search) ────
function SideActions({ primaryColor }) {
  const actions = [
    { key: 'shop',  icon: ShoppingBag, label: 'Boutique',     bg: 'from-emerald-400 to-emerald-600' },
    { key: 'play',  icon: Trophy,      label: 'Gamification', bg: 'from-amber-400 to-amber-600' },
    { key: 'games', icon: Dices,       label: 'Jeux',         bg: 'from-orange-400 to-rose-500' },
    { key: 'like',  icon: Heart,       label: 'J\'aime',      bg: 'from-rose-400 to-rose-600' },
    { key: 'share', icon: Share2,      label: 'Partager',     bg: 'from-cyan-400 to-cyan-600' },
    { key: 'find',  icon: Search,      label: 'Rechercher',   bg: 'from-bone-300 to-bone-500' }
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-4 md:right-auto md:inset-x-auto md:justify-start">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="pointer-events-auto flex md:flex-col gap-2 p-2 rounded-full border border-white/10 bg-ink-900/80 backdrop-blur-xl shadow-card"
      >
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              aria-label={a.label}
              title={a.label}
              className={`relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${a.bg} text-ink-900 hover:scale-110 active:scale-95 transition-transform shadow-lg`}
            >
              <Icon size={16} strokeWidth={2.4} />
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── NOT FOUND ────────────────────────────────────────────────────────
function NotFound({ slug }) {
  return (
    <section className="min-h-[60vh] py-24 text-center">
      <Container>
        <Globe size={48} className="mx-auto text-bone-400 opacity-40 mb-6" />
        <h1 className="font-display text-display-lg font-bold">Club introuvable</h1>
        <p className="mt-4 text-bone-300 font-mono text-sm">slug : <span className="text-bone-100">{slug}</span></p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-6 h-12 rounded-full bg-emerald-500 text-ink-900 font-bold text-sm uppercase tracking-[0.1em]"
        >
          Retour à l'accueil
        </Link>
      </Container>
    </section>
  );
}
