import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Globe, Wallet, CreditCard, Search,
  ShoppingBag, Trophy, Dices, Heart, Share2, Award,
  Plus, Minus, Check, X, ChevronLeft, ChevronRight, Volleyball
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { getFederationClubs, getClubFederation } from '@/data/clubsRegistry';
import { mockWallet, mockFans, mockTransactions, fallbackHeroStats, onlineCount } from '@/data/clubMocks';
import { PRODUCT_CATEGORIES, defaultMerchandise, formatPCC } from '@/data/clubMerchandise';
import { FederationClubsGrid } from '@/components/club/FederationClubsGrid';
import { useClubDetail } from '@/hooks/useClubDetail';
import { useCart } from '@/hooks/useCart';
import { slugify } from '@/lib/slugify';
import { cn } from '@/lib/cn';

const fmtAmount = (n, currency = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);

const fmtRel = (n) =>
  (n >= 0 ? '+' : '') + new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 2, signDisplay: 'never'
  }).format(Math.abs(n));

export function ClubDetail() {
  const { slug } = useParams();
  const { club, players, starPlayer, trophies, products, members, loading } = useClubDetail(slug);

  if (!club) return <NotFound slug={slug} />;

  // Page Fédération : si ce tenant est un hub, on remplace la boutique par
  // la grille des clubs membres. Priorité aux membres venant de la BASE
  // (federation_id), avec repli sur la liste statique (ex: Tanzanie héritée).
  const dbMembers = members.length > 0
    ? members.map((m) => ({
        slug:         m.slug,
        name:         m.name,
        code:         m.short_code,
        city:         m.city,
        stadium:      m.stadium,
        founded:      m.founded_year,
        logo:         m.logo_url,
        primaryColor: m.primary_color || club.primaryColor,
        countryFlag:  club.flagEmoji || ''
      }))
    : null;
  const federationClubs = club.isFederationHub ? (dbMembers || getFederationClubs(slug)) : null;
  const isFederationHub = Boolean(federationClubs && federationClubs.length > 0);

  // Bouton "Retour" dynamique, piloté par la base :
  //  • Page hub (ex: Cameroun)  → retour vers la confédération /federations/caf
  //  • Club membre (ex: Canon)  → retour vers le hub de sa fédération /clubs/<slug>
  //  • Sinon                    → repli statique (Tanzanie) ou accueil
  let backTo = '/';
  if (isFederationHub) {
    const conf = club.federationConfederation;
    backTo = conf ? `/federations/${conf.toLowerCase()}` : '/';
  } else if (club.federationSlug) {
    backTo = `/clubs/${club.federationSlug}`;
  } else {
    const parent = getClubFederation(slug);
    if (parent) backTo = `/clubs/${parent}`;
  }

  // Normalise les trophées : accepte la shape API (tableau plat avec champ
  // scope/label/count/years_text) ET la shape statique (trophies.breakdown).
  const trophyList = trophies.length > 0
    ? trophies
    : (club.trophies?.breakdown || []);
  const trophyTotal = trophies.length > 0
    ? trophies.reduce((s, t) => s + (t.count || 1), 0)
    : (club.trophies?.total || 0);

  // Normalise les joueurs : accepte la shape API (full_name, jersey_number…)
  // ET la shape statique (name, number…).
  const squadList = players.length > 0
    ? players.map((p) => ({
        number:   p.shirt_number ?? p.jersey_number ?? p.number,
        name:     p.full_name     ?? p.name,
        position: p.position,
        country:  p.nationality_code ?? p.country,
        image:    p.image_url     ?? p.image,
        stats:    p.stats
      }))
    : (club.squad || []);

  const starData = starPlayer
    ? {
        number:   starPlayer.shirt_number ?? starPlayer.jersey_number ?? starPlayer.number,
        name:     starPlayer.full_name      ?? starPlayer.name,
        position: starPlayer.position,
        image:    starPlayer.image_url      ?? starPlayer.image,
        stats:    starPlayer.stats
      }
    : club.starPlayer;

  return (
    <div className="relative">
      {/* Panel de side actions (mobile : barre flottante en bas, desktop : à gauche) */}
      <SideActions primaryColor={club.primaryColor} isFederationHub={isFederationHub} />

      {/* ═══ HERO style marketplace ═══════════════════════════════════ */}
      <ClubHero club={club} backTo={backTo} loading={loading} />

      {/* ═══ WALLET (2 cards Compte Bancaire + Wallet Crypto) ═══════ */}
      <Container className="relative pt-12 md:pt-16 pb-6">
        <WalletSection wallet={mockWallet} primaryColor={club.primaryColor} />
      </Container>

      {/* ═══ FANS STORIES (avatars carrousel) ═══════════════════════ */}
      <Container className="relative pt-6 pb-6">
        <FansStorySection fans={mockFans} club={club} />
      </Container>

      {/* ═══ TRANSACTIONS LIVE ═══════════════════════════════════════ */}
      <Container className="relative pt-6 pb-12">
        <TransactionsLiveSection items={mockTransactions} club={club} />
      </Container>

      {/* ═══ TROPHY CABINET ═══════════════════════════════════════════ */}
      {trophyList.length > 0 && (
        <TrophyCabinet
          trophies={{ total: trophyTotal, breakdown: trophyList }}
          primaryColor={club.primaryColor}
        />
      )}

      {/* ═══ STAR PLAYER ══════════════════════════════════════════════ */}
      {starData && (
        <StarPlayerSection player={starData} primaryColor={club.primaryColor} />
      )}

      {/* ═══ SQUAD SPOTLIGHT ══════════════════════════════════════════ */}
      {squadList.length > 0 && (
        <SquadSpotlight squad={squadList} primaryColor={club.primaryColor} />
      )}

      {/* ═══ Page Fédération : grille des clubs (au lieu de Boutique) ═ */}
      {isFederationHub ? (
        <FederationClubsGrid
          clubs={federationClubs}
          federationName={club.name}
          federationColor={club.primaryColor}
          leagueName="🌐 Équipes Masculines - Ligi Kuu Bara"
          cardBackground={club.cardBackground || club.stadiumImage}
        />
      ) : (
        <MerchandiseSection club={club} apiProducts={products} />
      )}

      {/* Espace bas pour la barre side actions mobile */}
      <div className="pb-32 md:pb-12" />
    </div>
  );
}

// ── HERO ─────────────────────────────────────────────────────────────
function ClubHero({ club, backTo = '/', loading = false }) {
  const stats = useMemo(() => {
    const s = fallbackHeroStats(club);
    // Override le compteur de trophées avec la vraie data du profil si dispo
    if (club.trophies?.total != null) s.trophies = club.trophies.total;
    if (club.squad?.length) s.squad = club.squad.length;
    return s;
  }, [club]);
  // Image du stade : custom du club si dispo. Tant que l'API charge et qu'on
  // n'a pas encore d'image (ex: club uniquement en BDD comme l'OL), on n'affiche
  // PAS le stade générique → on évite le flash « défaut puis saut ». Le fallback
  // générique n'est utilisé qu'une fois le chargement terminé sans image custom.
  const stadiumImage = club.stadiumImage || (loading ? null : '/images/futuristic_stadium_hero.png');

  return (
    <section className="relative overflow-hidden border-b border-white/5 min-h-[70vh] flex flex-col">
      {/* Background stade — image custom du club ou fallback générique */}
      <ClubStadiumBg src={stadiumImage} fallback="/images/futuristic_stadium_hero.png" />
      {/* Voile couleur club — mix-blend-color teinte uniformément toute l'image
          quelle que soit la teinte (vif comme l'OM ou marine foncé comme l'OL),
          tout en préservant les détails clairs/sombres du stade. */}
      <div
        className="absolute inset-0 mix-blend-color"
        style={{ background: club.primaryColor, opacity: 0.55 }}
      />
      {/* Renfort de teinte en haut + assombrissement progressif en bas pour
          garantir la lisibilité du texte du hero. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            ${club.primaryColor}33 0%,
            ${club.primaryColor}1A 30%,
            rgba(4,8,13,0.6) 65%,
            rgba(4,8,13,1) 100%)`
        }}
      />
      <div className="absolute inset-0 bg-ink-900/30" />

      <Container className="relative flex-1 flex flex-col items-center justify-center text-center py-16 md:py-24">
        <Link
          to={backTo}
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

          {/* Motto / devise / federation — `federation` peut être un objet
              (join API) ou une string (statique) : on normalise en string. */}
          {(() => {
            const fedLabel = typeof club.federation === 'string'
              ? club.federation
              : club.federation?.name;
            const label = club.motto || fedLabel;
            return label ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="mt-3 text-xs md:text-sm italic uppercase tracking-[0.18em]"
                style={{
                  color: club.mottoColor || '#a8c0b3',
                  textShadow: '0 2px 16px rgba(0,0,0,0.7)'
                }}
              >
                « {label} »
              </motion.p>
            ) : null;
          })()}

          {/* Méta chips inline — Fondation / Stade / Coach / Président pour clubs,
              Fondation / Ligue / Président pour sélections nationales */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 inline-flex items-center gap-px overflow-hidden rounded-full border border-white/10 bg-ink-900/60 backdrop-blur-md flex-wrap"
          >
            <MetaChip label="Fondation" value={club.founded || '—'} />
            <Divider />
            <MetaChip
              label={club.type === 'national' ? 'Ligue' : 'Stade'}
              value={club.stadium || club.league}
            />
            {club.coach && (
              <>
                <Divider />
                <MetaChip label="Coach" value={club.coach} />
              </>
            )}
            {club.president && (
              <>
                <Divider />
                <MetaChip label="Président" value={club.president} />
              </>
            )}
            {!club.coach && !club.president && (club.manager || club.type === 'national') && (
              <>
                <Divider />
                <MetaChip
                  label={club.type === 'national' ? 'Président' : 'Coach'}
                  value={club.president || club.manager || '—'}
                />
              </>
            )}
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
// Sur une page fédération (Tanzanie etc.), le bouton "Boutique" est
// remplacé par "Clubs" qui scrolle vers la grille des clubs membres.
function SideActions({ primaryColor, isFederationHub = false }) {
  // Scroll smooth vers une section. La classe scroll-mt-20 sur la section
  // cible compense la hauteur de la Navbar pour ne pas masquer le header.
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: 'Découvre cette page sur PaieCashFan',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard?.writeText(window.location.href);
      }
    } catch { /* user cancelled or unsupported */ }
  };

  // Page fédération : icône ballon de foot (Volleyball) au lieu du
  // panier — visuel plus parlant pour signaler une liste de clubs.
  const shopAction = isFederationHub
    ? { key: 'clubs', icon: Volleyball,  label: 'Clubs',    bg: 'from-emerald-400 to-emerald-600', onClick: () => scrollTo('clubs') }
    : { key: 'shop',  icon: ShoppingBag, label: 'Boutique', bg: 'from-emerald-400 to-emerald-600', onClick: () => scrollTo('merchandise') };

  const actions = [
    shopAction,
    { key: 'play',  icon: Trophy,      label: 'Palmarès',     bg: 'from-amber-400 to-amber-600',     onClick: () => scrollTo('trophies') },
    { key: 'games', icon: Dices,       label: 'Effectif',     bg: 'from-orange-400 to-rose-500',     onClick: () => scrollTo('squad') },
    { key: 'like',  icon: Heart,       label: 'J\'aime',      bg: 'from-rose-400 to-rose-600' },
    { key: 'share', icon: Share2,      label: 'Partager',     bg: 'from-cyan-400 to-cyan-600',       onClick: handleShare },
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
              onClick={a.onClick}
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

// ── STADIUM BACKGROUND ───────────────────────────────────────────────
// Affiche l'image du stade en background avec fondu enchaîné au chargement
// et fallback automatique si l'image custom du club n'existe pas (404).
// Tant que `src` est null (API en cours), seul un fond sombre est affiché —
// pas de stade générique → aucun flash « défaut puis saut ».
function ClubStadiumBg({ src, fallback }) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const finalSrc = errored ? fallback : src;

  // Réinitialise le fondu à chaque changement de source
  useEffect(() => { setLoaded(false); setErrored(false); }, [src]);

  return (
    <>
      {/* Base sombre toujours présente : évite tout flash blanc / image par défaut */}
      <div className="absolute inset-0 bg-ink-950" />

      {finalSrc && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out"
          style={{ backgroundImage: `url('${finalSrc}')`, opacity: loaded ? 1 : 0 }}
        />
      )}

      {/* Préchargement : on ne révèle l'image qu'une fois chargée (onLoad) */}
      {finalSrc && (
        <img
          src={finalSrc}
          alt=""
          aria-hidden
          className="hidden"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!errored && finalSrc !== fallback) setErrored(true);
            else setLoaded(true);
          }}
        />
      )}
    </>
  );
}

// ── TROPHY CABINET ───────────────────────────────────────────────────
// Affiche le palmarès complet du club : compteur total + liste des
// trophées avec count + années, regroupés par scope (european / world /
// domestic). Visuel inspiré de la capture utilisateur (table style).
function TrophyCabinet({ trophies, primaryColor }) {
  const scopeMeta = {
    european: { label: 'Europe',           colorClass: 'text-cyan-400'    },
    world:    { label: 'Monde',            colorClass: 'text-gold-400'    },
    domestic: { label: 'France',           colorClass: 'text-emerald-400' }
  };

  // Regroupe par scope, en préservant l'ordre.
  const groups = useMemo(() => {
    const out = { european: [], world: [], domestic: [] };
    for (const t of trophies.breakdown) {
      (out[t.scope] || out.domestic).push(t);
    }
    return out;
  }, [trophies.breakdown]);

  return (
    <section id="trophies" className="py-16 md:py-20 border-y border-white/5 scroll-mt-20">
      <Container>
        <header className="text-center mb-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: primaryColor }}>
            Le palmarès
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-bone-50">
            Trophy Cabinet
          </h2>
          <div className="mt-4 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border bg-white/[0.03] backdrop-blur-md"
            style={{ borderColor: `${primaryColor}55` }}>
            <Trophy size={16} style={{ color: primaryColor }} />
            <span className="font-display text-2xl md:text-3xl font-black tabular-nums" style={{ color: primaryColor }}>
              {trophies.total}
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-bone-300 font-bold">
              trophées au total
            </span>
          </div>
        </header>

        <div className="space-y-8">
          {Object.entries(groups).map(([scope, items]) => {
            if (!items.length) return null;
            const meta = scopeMeta[scope];
            return (
              <div key={scope}>
                <div className={`mb-3 text-[10px] font-bold uppercase tracking-[0.32em] ${meta.colorClass}`}>
                  {meta.label}
                </div>
                <div className="grid gap-2.5">
                  {items.map((t) => (
                    <TrophyRow key={t.label} trophy={t} primaryColor={primaryColor} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function TrophyRow({ trophy, primaryColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-4"
    >
      <span
        className="shrink-0 grid h-10 w-10 place-items-center rounded-xl"
        style={{ background: `${primaryColor}1A`, color: primaryColor, border: `1px solid ${primaryColor}40` }}
      >
        <Award size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-bone-50 truncate">{trophy.label}</div>
        {trophy.years && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-mono mt-0.5 line-clamp-1">
            {trophy.years}
          </div>
        )}
      </div>
      <div
        className="font-display text-3xl md:text-4xl font-black tabular-nums shrink-0"
        style={{ color: primaryColor }}
      >
        {trophy.count}
      </div>
    </motion.div>
  );
}

// ── STAR PLAYER ──────────────────────────────────────────────────────
// Section "STAR PLAYER" style marketplace : photo du joueur (gauche),
// gros numéro en background, infos + stats (droite).
function StarPlayerSection({ player, primaryColor }) {
  return (
    <section id="star-player" className="relative overflow-hidden py-20 md:py-28 border-y border-white/5 scroll-mt-20">
      {/* Gros numéro en background, ultra opaque */}
      <div
        className="pointer-events-none absolute right-4 md:right-12 top-1/2 -translate-y-1/2 font-display font-black select-none"
        style={{
          fontSize: 'clamp(180px, 32vw, 380px)',
          color: `${primaryColor}11`,
          lineHeight: 1,
          textShadow: `0 0 80px ${primaryColor}22`
        }}
        aria-hidden
      >
        {player.number}
      </div>

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 md:gap-16 items-center md:grid-cols-[1fr_1.1fr]"
        >
          {/* Photo */}
          <div className="relative flex justify-center md:justify-end">
            <PlayerPhoto
              player={player}
              size="lg"
              primaryColor={primaryColor}
            />
          </div>

          {/* Infos */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: primaryColor }}>
              Star Player
            </div>
            <div className="mt-3 text-bone-400 font-mono">#{player.number}</div>
            <h2 className="mt-2 font-display text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-bone-50 leading-[0.95]">
              {player.name}
            </h2>
            <div className="mt-2 text-sm uppercase tracking-[0.22em] text-bone-300 font-semibold">
              {player.position}
            </div>

            {/* Stats */}
            {player.stats && (
              <div className="mt-8 flex flex-wrap gap-3">
                <StatBox label="Buts" value={player.stats.goals ?? '—'} />
                <StatBox label="Passes décisives" value={player.stats.assists ?? '—'} />
                <StatBox
                  label="G + A"
                  value={(player.stats.goals ?? 0) + (player.stats.assists ?? 0)}
                  accentColor={primaryColor}
                />
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function StatBox({ label, value, accentColor }) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-4 min-w-[110px] text-center"
      style={accentColor ? { borderColor: `${accentColor}40`, background: `${accentColor}0D` } : undefined}
    >
      <div className="font-display text-3xl font-black text-bone-50 tabular-nums" style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-bone-400 font-bold">
        {label}
      </div>
    </div>
  );
}

// ── SQUAD SPOTLIGHT ──────────────────────────────────────────────────
// Grille des joueurs de l'équipe première organisée par poste (inspirée
// du site officiel om.fr/fr/equipe/hommes) : Gardiens / Défenseurs /
// Milieux / Attaquants. Évite de répéter le poste dans chaque card.
const POSITION_GROUPS = [
  { key: 'Gardien de but',    label: 'Gardiens de but' },
  { key: 'Défenseur',         label: 'Défenseurs' },
  { key: 'Milieu de terrain', label: 'Milieux de terrain' },
  { key: 'Attaquant',         label: 'Attaquants' }
];

function SquadSpotlight({ squad, primaryColor }) {
  const groups = useMemo(() => {
    const map = new Map();
    // Initialise les 4 groupes dans l'ordre canonique
    POSITION_GROUPS.forEach((g) => map.set(g.key, []));
    // Distribue les joueurs (ceux avec position inconnue tombent dans 'Autre')
    squad.forEach((p) => {
      const key = POSITION_GROUPS.some((g) => g.key === p.position) ? p.position : 'Autre';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });
    return map;
  }, [squad]);

  return (
    <section id="squad" className="py-16 md:py-20 scroll-mt-20">
      <Container>
        <header className="text-center mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: primaryColor }}>
            Featured Players
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-bone-50">
            Squad Spotlight
          </h2>
          <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
            {squad.length} joueurs · Saison 2025/26
          </p>
        </header>

        <div className="space-y-12 md:space-y-16">
          {/* Sections dans l'ordre canonique GK / DEF / MID / ATT */}
          {POSITION_GROUPS.map(({ key, label }) => {
            const players = groups.get(key) || [];
            if (players.length === 0) return null;
            return (
              <PositionSection
                key={key}
                label={label}
                players={players}
                primaryColor={primaryColor}
              />
            );
          })}

          {/* Joueurs avec un poste non-standard, regroupés en 'Autre' */}
          {groups.has('Autre') && groups.get('Autre').length > 0 && (
            <PositionSection
              key="Autre"
              label="Autres"
              players={groups.get('Autre')}
              primaryColor={primaryColor}
            />
          )}
        </div>
      </Container>
    </section>
  );
}

function PositionSection({ label, players, primaryColor }) {
  return (
    <div>
      {/* Header de section avec ligne dégradée à droite */}
      <div className="mb-5 md:mb-6 flex items-center gap-4">
        <h3 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50">
          {label}
        </h3>
        <span
          className="text-[11px] font-mono font-bold tabular-nums px-2 py-0.5 rounded-full"
          style={{
            background: `${primaryColor}1F`,
            color: primaryColor,
            border: `1px solid ${primaryColor}40`
          }}
        >
          {players.length}
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: `linear-gradient(to right, ${primaryColor}55, transparent)` }}
        />
      </div>

      {/* Grille des joueurs (sans la position en bas, donc cards plus aérées) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {players.map((p, i) => (
          <PlayerCard
            key={p.number}
            player={p}
            index={i}
            primaryColor={primaryColor}
            hidePosition
          />
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player, index, primaryColor, hidePosition = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.04 }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl border bg-white/[0.03] backdrop-blur-md p-4 pb-5 overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? primaryColor : 'rgba(255,255,255,0.1)',
        boxShadow: hovered
          ? `0 0 40px -8px ${primaryColor}88, 0 0 0 1px ${primaryColor}55 inset`
          : undefined,
        background: hovered
          ? `linear-gradient(180deg, ${primaryColor}10, rgba(255,255,255,0.03))`
          : undefined
      }}
    >
      {/* Halo radial coloré derrière la photo (apparaît au hover) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at 50% 35%, ${primaryColor}55, transparent 65%)`
        }}
        aria-hidden
      />

      {/* Gros numéro en background — plus visible au hover */}
      <div
        className="pointer-events-none absolute -right-4 -top-2 font-display font-black select-none transition-colors duration-300"
        style={{
          fontSize: '6rem',
          lineHeight: 1,
          color: hovered ? `${primaryColor}55` : `${primaryColor}1F`
        }}
        aria-hidden
      >
        {player.number}
      </div>

      <div className="relative">
        <PlayerPhoto player={player} size="sm" primaryColor={primaryColor} />
        <div className="mt-3 text-center">
          <div
            className="text-[10px] font-mono font-bold mb-1 tabular-nums transition-colors"
            style={{ color: hovered ? primaryColor : `${primaryColor}AA` }}
          >
            #{player.number}
          </div>
          <div className="font-display text-sm font-black uppercase text-bone-50 leading-tight line-clamp-2 tracking-tight">
            {player.name}
          </div>
          {!hidePosition && (
            <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-bone-400 font-bold">
              {player.position}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── MERCHANDISE (boutique du club) ───────────────────────────────────
// Section style marketplace as-nancy-lorraine avec une modale de
// sélection (taille + quantité) à l'ajout au panier.
//
// Panier persisté via useCart : items au format order_items
//   { id, product_id, size, quantity, unit_price_pcc, total_pcc }
function MerchandiseSection({ club, apiProducts = [] }) {
  const products = useMemo(() => {
    // Priorité : produits Supabase si disponibles, sinon données statiques
    if (apiProducts.length > 0) {
      return apiProducts.map((p) => {
        const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
        const cover = imgs[0] || p.image_url || '';
        return {
          id:       p.id,
          name:     p.name,
          category: p.category_slug || 'autre',
          price:    p.eur_price || 0,
          pccPrice: p.pcc_price || 0,
          image:    cover,                                       // vignette de la card
          images:   imgs.length ? imgs : (cover ? [cover] : []), // slider de la modale
          sizes:    p.sizes || [],
          description: p.description || ''
        };
      });
    }
    return club.merchandise || defaultMerchandise(club);
  }, [club, apiProducts]);
  const [activeCat, setActiveCat] = useState('all');
  const [openProduct, setOpenProduct] = useState(null);

  // Panier persisté (Supabase) si connecté + club en base, sinon local.
  const { items: cart, addItem, updateQty, removeItem, totalItems, totalPrice, persisted } = useCart(club.id);

  const filtered = useMemo(
    () => (activeCat === 'all' ? products : products.filter((p) => p.category === activeCat)),
    [products, activeCat]
  );

  // Ajoute (ou fusionne si même produit/taille déjà au panier) un item.
  const handleAddItem = async (item) => {
    await addItem(item); // { productId, size, qty, unitPrice }
    setOpenProduct(null);
  };

  return (
    <section id="merchandise" className="py-16 md:py-20 border-t border-white/5 scroll-mt-20">
      <Container>
        {/* Header */}
        <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-[0.32em]"
              style={{ color: club.primaryColor }}
            >
              Official Store
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-black uppercase tracking-tight text-bone-50">
              Boutique
            </h2>
            <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
              {products.length} produits · Paiement PCC
            </p>
          </div>

          {/* Compteur panier */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                Panier
              </div>
              <div
                className="font-display text-xl font-black tabular-nums"
                style={{ color: club.primaryColor }}
              >
                {totalItems} {totalItems > 1 ? 'articles' : 'article'}
              </div>
            </div>
            <div
              className="relative grid h-12 w-12 place-items-center rounded-xl border"
              style={{
                background: `${club.primaryColor}15`,
                borderColor: `${club.primaryColor}40`,
                color: club.primaryColor
              }}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full text-[10px] font-mono font-bold text-ink-900"
                  style={{ background: club.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Tabs catégories */}
        <div className="mb-8 overflow-x-auto -mx-2 px-2 scrollbar-none mask-fade-x">
          <div className="flex gap-2 min-w-max">
            {PRODUCT_CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? products.length
                : products.filter((p) => p.category === cat.id).length;
              const isActive = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={cn(
                    'shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full',
                    'text-[11px] uppercase tracking-[0.18em] font-bold transition-all duration-200',
                    isActive
                      ? 'text-ink-900 shadow-lg'
                      : 'bg-white/[0.04] border border-white/10 text-bone-300 hover:text-bone-50 hover:bg-white/[0.07]'
                  )}
                  style={isActive ? { background: club.primaryColor } : undefined}
                >
                  <span className="text-sm leading-none">{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-ink-900/20' : 'bg-white/5'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille produits */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-bone-400 text-sm">
            Aucun produit dans cette catégorie.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                primaryColor={club.primaryColor}
                inCart={cart.some((x) => x.product_id === p.id)}
                onOpen={() => setOpenProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Détail du panier */}
        {cart.length > 0 && (
          <CartFooter
            cart={cart}
            products={products}
            totalPrice={totalPrice}
            totalItems={totalItems}
            primaryColor={club.primaryColor}
            persisted={persisted}
            onRemove={(itemId) => removeItem(itemId)}
            onQtyChange={(itemId, qty) => updateQty(itemId, qty)}
          />
        )}
      </Container>

      {/* Modale de sélection du produit (taille + quantité) */}
      <AnimatePresence>
        {openProduct && (
          <ProductDetailModal
            product={openProduct}
            primaryColor={club.primaryColor}
            onClose={() => setOpenProduct(null)}
            onAdd={handleAddItem}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ── CART FOOTER ──────────────────────────────────────────────────────
// Affichage détaillé du panier : items avec qty/taille/prix unitaire +
// total + bouton checkout. Apparaît sous la grille produits dès qu'un
// article est ajouté.
function CartFooter({ cart, products, totalPrice, totalItems, primaryColor, persisted, onRemove, onQtyChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-10 rounded-2xl border bg-white/[0.04] backdrop-blur-md overflow-hidden"
      style={{ borderColor: `${primaryColor}55` }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[10px] uppercase tracking-[0.22em] text-bone-200 font-bold inline-flex items-center gap-2">
          <ShoppingBag size={14} style={{ color: primaryColor }} />
          Votre panier · {totalItems} {totalItems > 1 ? 'articles' : 'article'}
        </div>
        {persisted ? (
          <span className="text-[9px] uppercase tracking-[0.18em] text-emerald-400/80 font-bold inline-flex items-center gap-1">
            <Check size={10} /> Sauvegardé
          </span>
        ) : (
          <Link to="/login" className="text-[9px] uppercase tracking-[0.18em] text-amber-400/80 hover:text-amber-300 font-bold">
            Connecte-toi pour sauvegarder ton panier
          </Link>
        )}
      </div>

      {/* Items */}
      <ul className="divide-y divide-white/5">
        {cart.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          if (!product) return null;
          const lineTotal = Number(item.total_pcc ?? item.quantity * item.unit_price_pcc);
          return (
            <li key={item.id} className="px-5 py-4 flex items-center gap-4">
              {/* Mini photo */}
              <span
                className="shrink-0 grid h-12 w-12 place-items-center rounded-lg overflow-hidden"
                style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}40` }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-2xl">{product.emoji}</span>
                )}
              </span>

              {/* Nom + taille */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-bone-50 truncate">{product.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">
                  {item.size && (
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-bone-200 font-mono">
                      {item.size}
                    </span>
                  )}
                  <span className="font-mono">
                    {formatPCC(item.unit_price_pcc)} PCC × {item.quantity}
                  </span>
                </div>
              </div>

              {/* Quantité (- / +) */}
              <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/50 p-1">
                <QtyButton
                  onClick={() => onQtyChange(item.id, Math.max(1, item.quantity - 1))}
                  ariaLabel="Diminuer la quantité"
                >
                  <Minus size={12} strokeWidth={3} />
                </QtyButton>
                <span className="min-w-[1.5rem] text-center text-xs font-mono font-bold text-bone-50 tabular-nums">
                  {item.quantity}
                </span>
                <QtyButton
                  onClick={() => onQtyChange(item.id, item.quantity + 1)}
                  ariaLabel="Augmenter la quantité"
                >
                  <Plus size={12} strokeWidth={3} />
                </QtyButton>
              </div>

              {/* Total ligne + supprimer */}
              <div className="text-right shrink-0">
                <div
                  className="font-display text-base font-black tabular-nums"
                  style={{ color: primaryColor }}
                >
                  {formatPCC(lineTotal)}
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-bone-400 hover:text-rose-400 font-bold transition-colors"
                >
                  Retirer
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer : total + CTA */}
      <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between gap-4 bg-white/[0.02]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
            Total à payer
          </div>
          <div
            className="font-display text-2xl md:text-3xl font-black tabular-nums"
            style={{ color: primaryColor }}
          >
            {formatPCC(totalPrice)} PCC
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[11px] uppercase tracking-[0.18em] font-bold text-ink-900 shadow-lg transition-transform hover:scale-105"
          style={{ background: primaryColor }}
        >
          <ShoppingBag size={14} />
          Passer commande
        </button>
      </div>
    </motion.div>
  );
}

function QtyButton({ children, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-6 w-6 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  );
}

function ProductCard({ product, index, primaryColor, inCart, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      className="group relative rounded-2xl border bg-white/[0.03] backdrop-blur-md overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        borderColor: hovered ? primaryColor : 'rgba(255,255,255,0.1)',
        boxShadow: hovered ? `0 0 40px -8px ${primaryColor}66` : undefined
      }}
    >
      {/* Badge catégorie en haut à gauche */}
      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-ink-900/80 backdrop-blur-sm text-[9px] uppercase tracking-[0.22em] font-bold text-bone-200">
        {labelOf(product.category)}
      </div>

      {/* Tag "Déjà dans le panier" si applicable */}
      {inCart && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] uppercase tracking-[0.22em] font-bold">
          <Check size={10} strokeWidth={3} />
          Au panier
        </div>
      )}

      {/* Image (ou fallback emoji) */}
      <ProductImage
        product={product}
        primaryColor={primaryColor}
        hovered={hovered}
      />

      {/* Bas de la card : nom + prix + ADD */}
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-t border-white/5">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-bone-50 truncate">{product.name}</div>
          <div
            className="mt-0.5 text-[11px] font-mono tabular-nums"
            style={{ color: primaryColor }}
          >
            <span className="font-bold">{formatPCC(product.price)}</span>
            <span className="ml-1 opacity-70">PCC</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[10px] uppercase tracking-[0.18em] font-bold text-ink-900 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: primaryColor }}
        >
          <Plus size={12} strokeWidth={3} />
          Choisir
        </button>
      </div>
    </motion.div>
  );
}

// ── PRODUCT DETAIL MODAL ─────────────────────────────────────────────
// Popup au clic 'Choisir' / sur la card : carousel d'images, sélecteur
// de taille (si product.sizes existe), sélecteur de quantité, total
// dynamique, bouton 'Ajouter au panier'.
function ProductDetailModal({ product, primaryColor, onClose, onAdd }) {
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean);

  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(product.sizes?.[2] ?? product.sizes?.[0] ?? null);
  const [qty, setQty] = useState(1);

  // Fermeture au Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setImgIdx((i) => (i - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setImgIdx((i) => (i + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, images.length]);

  const lineTotal = qty * product.price;
  const requiresSize = product.sizes && product.sizes.length > 0;
  const canAdd = !requiresSize || !!size;

  const handleConfirm = () => {
    if (!canAdd) return;
    onAdd({
      productId: product.id,
      size: requiresSize ? size : null,
      qty,
      unitPrice: product.price
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] grid place-items-center p-4 md:p-6 bg-ink-950/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 16, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-ink-900/95 backdrop-blur-xl"
        style={{ borderColor: `${primaryColor}55` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton close */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-ink-900/80 border border-white/10 text-bone-300 hover:text-bone-50 hover:border-white/30 transition-colors backdrop-blur"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
          {/* Carousel images */}
          <div className="relative bg-white/[0.02] aspect-square md:aspect-auto md:min-h-[460px] grid place-items-center">
            <ProductImage
              product={{ ...product, image: images[imgIdx] }}
              primaryColor={primaryColor}
              hovered
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-ink-900/70 border border-white/15 text-bone-200 hover:text-bone-50 hover:border-white/30 transition-colors backdrop-blur"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-ink-900/70 border border-white/15 text-bone-200 hover:text-bone-50 hover:border-white/30 transition-colors backdrop-blur"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={16} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      aria-label={`Image ${i + 1}`}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === imgIdx ? '20px' : '6px',
                        background: i === imgIdx ? primaryColor : 'rgba(255,255,255,0.3)'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sélection */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: primaryColor }}>
              {labelOf(product.category)}
            </div>
            <h3 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-bone-50 leading-tight">
              {product.name}
            </h3>
            <div className="mt-3 inline-flex items-baseline gap-1.5">
              <span
                className="font-display text-3xl md:text-4xl font-black tabular-nums"
                style={{ color: primaryColor }}
              >
                {formatPCC(product.price)}
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-bone-400 font-bold">
                PCC
              </span>
            </div>

            {product.description && (
              <p className="mt-4 text-sm text-bone-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Tailles */}
            {requiresSize && (
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold mb-3">
                  Choisis ta taille
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const isActive = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          'min-w-[3rem] h-10 px-3 rounded-xl text-[11px] uppercase tracking-[0.18em] font-bold transition-all',
                          isActive
                            ? 'text-ink-900 shadow-lg'
                            : 'bg-white/[0.04] border border-white/10 text-bone-200 hover:border-white/20 hover:bg-white/[0.07]'
                        )}
                        style={isActive ? { background: primaryColor } : undefined}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantité */}
            <div className="mt-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold mb-3">
                Quantité
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/50 p-1">
                <QtyButton onClick={() => setQty(Math.max(1, qty - 1))} ariaLabel="Diminuer">
                  <Minus size={14} strokeWidth={3} />
                </QtyButton>
                <span className="min-w-[2.5rem] text-center text-base font-display font-black text-bone-50 tabular-nums">
                  {qty}
                </span>
                <QtyButton onClick={() => setQty(qty + 1)} ariaLabel="Augmenter">
                  <Plus size={14} strokeWidth={3} />
                </QtyButton>
              </div>
            </div>

            {/* Total + CTA */}
            <div className="mt-auto pt-8">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                  Total
                </span>
                <span
                  className="font-display text-2xl md:text-3xl font-black tabular-nums"
                  style={{ color: primaryColor }}
                >
                  {formatPCC(lineTotal)} PCC
                </span>
              </div>
              <button
                onClick={handleConfirm}
                disabled={!canAdd}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 h-12 rounded-full',
                  'text-xs uppercase tracking-[0.18em] font-bold transition-all',
                  canAdd
                    ? 'text-ink-900 hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                    : 'bg-white/5 text-bone-500 cursor-not-allowed'
                )}
                style={canAdd ? { background: primaryColor } : undefined}
              >
                {!canAdd && requiresSize && !size ? (
                  'Choisis une taille'
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    Ajouter au panier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductImage({ product, primaryColor, hovered }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative aspect-square w-full grid place-items-center overflow-hidden"
      style={{
        background: hovered
          ? `radial-gradient(circle at 50% 50%, ${primaryColor}22, transparent 70%), rgba(255,255,255,0.02)`
          : 'rgba(255,255,255,0.02)'
      }}
    >
      {product.image && !errored ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-contain transition-transform duration-500"
          style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
        />
      ) : (
        // Fallback : gros emoji centré avec halo gradient
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 rounded-full blur-3xl"
            style={{ background: `${primaryColor}44` }}
            aria-hidden
          />
          <span
            className="relative text-7xl md:text-8xl select-none transition-transform duration-500"
            style={{
              transform: hovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1) rotate(0)',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))'
            }}
            aria-hidden
          >
            {product.emoji}
          </span>
        </div>
      )}
    </div>
  );
}

function labelOf(catId) {
  return PRODUCT_CATEGORIES.find((c) => c.id === catId)?.label || catId;
}

// ── PHOTO JOUEUR ─────────────────────────────────────────────────────
// Container carré (plus de cercle) pour homogénéiser quel que soit le
// fond de la photo source (transparent ou blanc).
// Mode 'lg' (Star Player) : grand carré arrondi 3xl avec hover propre
// (bordure + glow rouge + zoom légèrement la photo).
// Mode 'sm' (PlayerCard) : carré arrondi xl qui prend toute la largeur
// de la card. L'effet hover est porté par la card parente.
function PlayerPhoto({ player, size = 'sm', primaryColor }) {
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);
  const derivedImage = player.image || `/images/players/${slugify(player.name)}.jpg`;
  const showPhoto = derivedImage && !errored;

  if (size === 'lg') {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group relative h-72 w-72 md:h-96 md:w-96 rounded-3xl overflow-hidden border-2 transition-all duration-300"
        style={{
          borderColor: hovered ? primaryColor : 'rgba(255,255,255,0.06)',
          background: `radial-gradient(circle at 50% 35%, ${primaryColor}${hovered ? '55' : '22'}, transparent 70%)`,
          boxShadow: hovered
            ? `0 0 100px -15px ${primaryColor}99, 0 0 0 1px ${primaryColor}55 inset`
            : `0 0 40px -20px ${primaryColor}44`
        }}
      >
        {showPhoto ? (
          <img
            src={derivedImage}
            alt={player.name}
            loading="lazy"
            onError={() => setErrored(true)}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500"
            style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          />
        ) : (
          <PlayerNumberPlaceholder
            number={player.number}
            name={player.name}
            size="lg"
            primaryColor={primaryColor}
          />
        )}
        {/* Fade vers le bas pour fondre les fonds clairs des photos
            dans la card sombre */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(to top, #04080d 0%, transparent 100%)',
            opacity: hovered ? 0.85 : 1
          }}
        />
      </div>
    );
  }

  // PlayerCard squad — carré arrondi qui prend toute la largeur de la card
  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden">
      {showPhoto ? (
        <img
          src={derivedImage}
          alt={player.name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <PlayerNumberPlaceholder
          number={player.number}
          name={player.name}
          size="sm"
          primaryColor={primaryColor}
        />
      )}
      {/* Fade bas subtle — fond les éventuels fonds blancs des photos
          dans la couleur de la card */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(to top, #04080d 0%, transparent 100%)' }}
      />
    </div>
  );
}

function PlayerNumberPlaceholder({ number, name, size, primaryColor }) {
  if (size === 'lg') {
    const initials = name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div
          className="text-[10px] uppercase tracking-[0.32em] font-bold mb-2"
          style={{ color: primaryColor }}
        >
          {initials}
        </div>
        <div
          className="font-display font-black tabular-nums leading-[0.85]"
          style={{
            color: primaryColor,
            fontSize: '14rem',
            textShadow: `0 0 60px ${primaryColor}66`
          }}
        >
          {number}
        </div>
      </div>
    );
  }
  // sm — fond gradient + numéro central
  return (
    <div
      className="h-full w-full grid place-items-center"
      style={{ background: `radial-gradient(circle, ${primaryColor}33, ${primaryColor}11)` }}
    >
      <span
        className="font-display text-4xl font-black tabular-nums"
        style={{ color: primaryColor }}
      >
        {number}
      </span>
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
