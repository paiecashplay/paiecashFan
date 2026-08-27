import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Gift,
  Heart,
  Layers,
  LifeBuoy,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Ticket,
  Trash2,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PccRechargeModal } from '@/components/wallet/PccRechargeModal';
import { useClubDetail } from '@/hooks/useClubDetail';
import { useTicketingCart } from '@/hooks/useTicketingCart';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { formatPCC } from '@/data/clubMerchandise';
import { buildDefaultTicketing } from '@/utils/ticketingPrices';
import { ClubSideActions } from '@/components/club/ClubSideActions';

const PAY_MODES = [
  {
    id: 'pcc_full',
    label: 'PCC',
    icon: Wallet,
    cta: 'Payer en PCC',
    hint: 'Débit direct de ton solde PCC disponible.',
  },
  {
    id: 'card_full',
    label: 'Carte',
    icon: CreditCard,
    cta: 'Payer par carte',
    hint: 'Paiement carte sécurisé via Stripe.',
  },
  {
    id: 'pcc_split',
    label: 'PCC + carte',
    icon: Layers,
    cta: 'Payer (PCC + carte)',
    hint:
      'Ton solde PCC couvre une partie, la carte le reste.',
  },
  {
    id: 'bnpl',
    label: '3× / 4×',
    icon: CalendarClock,
    cta: 'Payer en 3× / 4×',
    hint:
      'Paiement fractionné (Klarna / Afterpay selon éligibilité).',
  },
];

/**
 * Retourne un nombre valide ou null.
 */
function getValidPrice(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const price = Number(value);

  return Number.isFinite(price) && price >= 0
    ? price
    : null;
}

/**
 * Formate un prix en euros.
 */
function formatEuro(value) {
  const price = getValidPrice(value);

  if (price === null) {
    return '';
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Affichage uniforme :
 * 12 500 PCC · 85,00 €
 */
function TicketingPrice({
  price,
  priceEur,
  prefix = '',
  className = '',
}) {
  const pccPrice = getValidPrice(price);
  const euroPrice = getValidPrice(priceEur);

  if (pccPrice === null && euroPrice === null) {
    return (
      <span className={className}>
        Voir les tarifs
      </span>
    );
  }

  return (
    <span className={className}>
      {prefix}

      {pccPrice !== null && (
        <>
          {formatPCC(pccPrice)} PCC
        </>
      )}

      {pccPrice !== null &&
        euroPrice !== null &&
        ' · '}

      {euroPrice !== null && (
        <>
          {formatEuro(euroPrice)} €
        </>
      )}
    </span>
  );
}

function QtyButton({
  children,
  onClick,
  ariaLabel,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

export function ClubBilletterie() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    club,
    loading,
  } = useClubDetail(slug);

  const [activeTab, setActiveTab] =
    useState('subscriptions');

  const {
    cart,
    addItem,
    removeItem,
    clear,
  } = useTicketingCart();

  const [selectedOffer, setSelectedOffer] =
    useState(null);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  /**
   * Offres saisies dans le BO.
   * En leur absence, création des offres par défaut.
   */
  const ticketing = useMemo(() => {
    if (!club) {
      return {
        subscriptions: [],
        tickets: [],
      };
    }

    return (
      club.ticketing ||
      buildDefaultTicketing(club)
    );
  }, [club]);

  // ── Fixtures (matchs) via API-Football ────────────────────────────
  const [fixtures, setFixtures] = useState({
    upcoming: [],
    recent: [],
  });
  const [loadingFixtures, setLoadingFixtures] =
    useState(true);

  useEffect(() => {
    if (!slug) return undefined;

    let cancelled = false;
    setLoadingFixtures(true);

    apiFetch(`/api/v2/live/club/${slug}/fixtures?next=20`)
      .then((json) => {
        if (cancelled) return;
        const body = json?.data || json || {};
        setFixtures({
          upcoming: Array.isArray(body.upcoming)
            ? body.upcoming
            : [],
          recent: Array.isArray(body.recent)
            ? body.recent
            : [],
        });
      })
      .catch(() => {
        if (!cancelled)
          setFixtures({ upcoming: [], recent: [] });
      })
      .finally(() => {
        if (!cancelled) setLoadingFixtures(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Abonnements triés par prix décroissant : chaque offre = une
  // « formule / tribune » sélectionnable (le modèle n'a pas de tribunes).
  const subscriptions = useMemo(() => {
    const list = Array.isArray(ticketing?.subscriptions)
      ? ticketing.subscriptions
      : [];
    return [...list].sort(
      (a, b) =>
        (getValidPrice(b?.price) || 0) -
        (getValidPrice(a?.price) || 0)
    );
  }, [ticketing]);

  const tickets = useMemo(
    () =>
      Array.isArray(ticketing?.tickets)
        ? ticketing.tickets
        : [],
    [ticketing]
  );

  // Offre billet la moins chère → prix « à partir de » affiché par match.
  const lowestTicket = useMemo(() => {
    if (!tickets.length) return null;
    return tickets.reduce((low, cur) => {
      const lp = getValidPrice(low?.price);
      const cp = getValidPrice(cur?.price);
      if (lp === null) return cur;
      if (cp === null) return low;
      return cp < lp ? cur : low;
    }, null);
  }, [tickets]);

  // Formule d'abonnement sélectionnée (défaut = la plus premium).
  const [selectedSubId, setSelectedSubId] =
    useState(null);
  const selectedSubscription = useMemo(() => {
    if (!subscriptions.length) return null;
    return (
      subscriptions.find(
        (s) => s.id === selectedSubId
      ) || subscriptions[0]
    );
  }, [subscriptions, selectedSubId]);

  // Matchs à domicile (billets) + prochain match.
  const homeMatches = useMemo(() => {
    const up = Array.isArray(fixtures.upcoming)
      ? fixtures.upcoming
      : [];
    const home = up.filter(
      (f) => f?.homeSlug === slug
    );
    return home.length ? home : up;
  }, [fixtures, slug]);

  const nextMatch = homeMatches[0] || null;

  const competitions = useMemo(() => {
    const list = [];
    homeMatches.forEach((f) => {
      const c = (f?.competition || '').trim();
      if (c && !list.includes(c)) list.push(c);
    });
    return list;
  }, [homeMatches]);

  const [matchFilter, setMatchFilter] =
    useState('Tous');
  const filteredMatches = useMemo(() => {
    if (matchFilter === 'Tous') return homeMatches;
    return homeMatches.filter(
      (f) => (f?.competition || '') === matchFilter
    );
  }, [homeMatches, matchFilter]);

  if (loading && !club) {
    return (
      <Container className="py-24">
        <div className="text-bone-400">
          Chargement de la billetterie...
        </div>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="py-24">
        <div className="text-bone-400">
          Club introuvable.
        </div>
      </Container>
    );
  }

  const tabs = [
    {
      id: 'subscriptions',
      label: 'Abonnements',
      icon: CalendarDays,
    },
    {
      id: 'tickets',
      label: 'Billets',
      icon: Ticket,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <ClubSideActions
        primaryColor={club.primaryColor}
        clubSlug={slug}
        clubId={club.id}
        showSearch={false}
      />

    <div className="md:pl-24 2xl:pl-0">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.06),transparent_38%)]" />
        
        <section className="relative py-8 md:py-12">
          <Container>
            <Link
              to={`/clubs/${slug}`}
              className="inline-flex items-center gap-2 text-sm text-bone-400 transition hover:text-bone-50"
            >
              <ArrowLeft size={16} />
              Retour au club
            </Link>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
              {/* Identité club + stats */}
              <div className="flex flex-col justify-between">
                <div className="flex items-start gap-5">
                  <div
                    className="grid h-24 w-24 shrink-0 place-items-center rounded-[22px] border border-white/10 bg-white/[0.04] p-3"
                    style={{
                      boxShadow: `0 0 40px -12px ${club.primaryColor}55`,
                    }}
                  >
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Ticket
                        size={30}
                        className="text-emerald-400"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-display text-4xl font-black uppercase leading-[0.9] text-bone-50 md:text-6xl">
                      {club.name}
                    </h1>
                    <p className="mt-3 max-w-md text-sm leading-6 text-bone-300">
                      Billets et abonnements pour soutenir{' '}
                      {club.name}
                      {club.stadium
                        ? ` au ${club.stadium}`
                        : ''}
                      .
                    </p>
                  </div>
                </div>

                {/* Bandeau stats */}
                {(() => {
                  const chips = buildStatChips(
                    club,
                    competitions[0]
                  );
                  if (!chips.length) return null;
                  return (
                    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-4">
                      {chips.map((chip) => {
                        const Icon = chip.icon;
                        return (
                          <div
                            key={chip.label}
                            className="flex items-center gap-3 bg-ink-950/60 px-4 py-3.5"
                          >
                            <Icon
                              size={18}
                              className="shrink-0 text-emerald-400"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-bone-50">
                                {chip.value}
                              </p>
                              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-bone-500">
                                {chip.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Photo stade */}
              <div className="relative min-h-[200px] overflow-hidden rounded-[26px] border border-white/10">
                <img
                  src={
                    club.stadiumImage ||
                    '/images/stadium-bg.png'
                  }
                  alt={club.stadium || club.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src =
                      '/images/stadium-bg.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  style={{
                    background: `radial-gradient(circle at 70% 20%, ${club.primaryColor}, transparent 60%)`,
                  }}
                />
              </div>
            </div>
          </Container>
        </section>

        <Container className="relative pb-8">
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setActiveTab(tab.id)
                      }
                      className={[
                        'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-xs font-black uppercase tracking-[0.18em] transition-all',
                        isActive
                          ? 'bg-emerald-400 text-ink-900 shadow-lg shadow-emerald-400/20'
                          : 'border border-white/10 bg-white/[0.04] text-bone-300 hover:text-bone-50',
                      ].join(' ')}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCartOpen(true)
                }
                className="inline-flex h-11 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 text-bone-100 transition-all hover:border-emerald-400/40"
              >
                <ShoppingCart
                  size={18}
                  className="text-emerald-400"
                />

                <span className="text-xs font-black uppercase tracking-[0.18em]">
                  Panier
                </span>

                <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-emerald-400 px-1 text-[11px] font-black text-ink-900">
                  {cart.length}
                </span>
              </button>
            </div>
          </GlassCard>
        </Container>

        <Container className="relative pb-14">
          {activeTab === 'subscriptions' ? (
            <SubscriptionsView
              subscriptions={subscriptions}
              selected={selectedSubscription}
              onSelect={setSelectedSubId}
              onSubscribe={(offer) =>
                setSelectedOffer(offer)
              }
            />
          ) : (
            <TicketsView
              club={club}
              slug={slug}
              nextMatch={nextMatch}
              matches={filteredMatches}
              loadingFixtures={loadingFixtures}
              competitions={competitions}
              activeFilter={matchFilter}
              onFilter={setMatchFilter}
              tickets={tickets}
              lowestTicket={lowestTicket}
              onSelectOffer={(offer) =>
                setSelectedOffer(offer)
              }
              onSeePlaces={() =>
                lowestTicket &&
                setSelectedOffer(lowestTicket)
              }
            />
          )}
        </Container>

        <Container className="relative pb-24">
          <ReassuranceBar tab={activeTab} />
        </Container>

        {selectedOffer && (
          <TicketingOfferModal
            club={club}
            offer={selectedOffer}
            onClose={() =>
              setSelectedOffer(null)
            }
            onAddToCart={(item) =>
              addItem({
                ...item,
                clubSlug: slug,
              })
            }
          />
        )}

        {isCartOpen && (
          <TicketingCartModal
            cart={cart}
            onClose={() =>
              setIsCartOpen(false)
            }
            onRemoveItem={(indexToRemove) =>
              removeItem(indexToRemove)
            }
            onClearCart={clear}
            navigate={navigate}
          />
        )}
      </div>
      <div className="pb-32 md:pb-12" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers de présentation (dates, stats)
// ─────────────────────────────────────────────────────────────
const MONTHS_SHORT = [
  'JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN',
  'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.',
];

function formatMatchDay(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: '' };
  }
  return {
    day: String(date.getDate()),
    month: MONTHS_SHORT[date.getMonth()] || '',
  };
}

function formatFullMatchDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// "Regular Season - 3" → "Journée 3" ; sinon on garde le libellé brut.
function formatRound(round) {
  if (!round) return '';
  const match = /(\d+)\s*$/.exec(String(round));
  if (/regular season/i.test(round) && match) {
    return `Journée ${match[1]}`;
  }
  return String(round);
}

// Stats du hero : on n'affiche QUE les chips dont la donnée existe.
function buildStatChips(club, competition) {
  const chips = [];
  if (club?.stadium) {
    chips.push({ icon: MapPin, value: club.stadium, label: 'Stade' });
  }
  const capacity =
    club?.capacity || club?.places || club?.stadiumCapacity;
  if (capacity) {
    chips.push({
      icon: Users,
      value: new Intl.NumberFormat('fr-FR').format(capacity),
      label: 'Places',
    });
  }
  if (club?.founded) {
    chips.push({
      icon: CalendarDays,
      value: String(club.founded),
      label: 'Année de fondation',
    });
  }
  const comp = competition || club?.league;
  if (comp) {
    chips.push({ icon: Trophy, value: comp, label: 'Compétition' });
  }
  return chips;
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <Icon size={32} className="mx-auto text-bone-600" />
      <h2 className="mt-4 text-base font-bold text-bone-200">
        {title}
      </h2>
      <p className="mt-2 text-sm text-bone-500">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Vue ABONNEMENTS
// ─────────────────────────────────────────────────────────────
function SubscriptionsView({
  subscriptions,
  selected,
  onSelect,
  onSubscribe,
}) {
  if (!subscriptions.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Aucun abonnement disponible"
        text="Ce club ne propose pas encore d'abonnement à la vente."
      />
    );
  }

  const offer = selected || subscriptions[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr_0.95fr]">
      {/* Détail de l'offre sélectionnée */}
      <GlassCard className="flex flex-col border border-emerald-400/20 p-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
          Abonnement
          {offer.duration ? ` · ${offer.duration}` : ''}
        </p>

        <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-bone-50 md:text-3xl">
          {offer.name}
        </h2>

        {offer.description && (
          <p className="mt-3 text-sm leading-6 text-bone-300">
            {offer.description}
          </p>
        )}

        <TicketingPrice
          price={offer.price}
          priceEur={offer.price_eur}
          prefix="À partir de "
          className="mt-5 block font-display text-3xl font-black text-emerald-400"
        />

        <ul className="mt-5 space-y-2.5">
          {(offer.benefits || []).map((benefit, index) => (
            <li
              key={`benefit-${index}`}
              className="flex items-start gap-2.5 text-[13px] leading-5 text-bone-200"
            >
              <Check
                size={15}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
              {benefit}
            </li>
          ))}
        </ul>

        {(offer.conditions || []).length > 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-bone-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              Conditions
            </div>
            <ul className="mt-3 space-y-1.5">
              {offer.conditions.map((condition, index) => (
                <li
                  key={`condition-${index}`}
                  className="text-[13px] leading-5 text-bone-500"
                >
                  • {condition}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={() => onSubscribe(offer)}
          >
            <ShoppingBag size={16} />
            Souscrire à l'abonnement
          </Button>
        </div>
      </GlassCard>

      {/* Choix de la formule / tribune */}
      <GlassCard className="flex flex-col border border-white/10 p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
          {subscriptions.length > 1
            ? 'Choisissez votre formule'
            : 'Votre formule'}
        </p>

        <div className="mt-4 space-y-2.5">
          {subscriptions.map((sub) => {
            const active = sub.id === offer.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelect(sub.id)}
                className={[
                  'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all',
                  active
                    ? 'border-emerald-400/60 bg-emerald-400/[0.06]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20',
                ].join(' ')}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-950/60">
                  <Ticket
                    size={18}
                    className={
                      active ? 'text-emerald-400' : 'text-bone-500'
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black uppercase text-bone-50">
                    {sub.name}
                  </p>
                  {sub.duration && (
                    <p className="truncate text-[11px] text-bone-500">
                      {sub.duration}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {getValidPrice(sub.price_eur) !== null && (
                    <p className="text-sm font-black text-bone-100">
                      {formatEuro(sub.price_eur)} €
                    </p>
                  )}
                  {getValidPrice(sub.price) !== null && (
                    <p className="text-[11px] font-bold text-emerald-400">
                      {formatPCC(sub.price)} PCC
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
          <Star size={15} className="mt-0.5 shrink-0 text-gold-400" />
          <div>
            <p className="text-xs font-bold text-bone-100">
              Paiement en 5 fois possible
            </p>
            <p className="text-[11px] text-bone-500">
              PCC ou carte bancaire
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Avantages + aide */}
      <div className="flex flex-col gap-5">
        <AdvantagesCard />
        <HelpCard />
      </div>
    </div>
  );
}

function AdvantagesCard() {
  const items = [
    { icon: ShieldCheck, title: 'Place garantie', text: 'Tous les matchs à domicile de la saison' },
    { icon: Star, title: 'Priorité billetterie', text: 'Accès en avant-première aux coupes' },
    { icon: Gift, title: 'Réductions exclusives', text: "Jusqu'à -15% sur la boutique officielle" },
    { icon: Award, title: 'Événements privés', text: 'Rencontrez les joueurs et le club' },
    { icon: RefreshCw, title: 'Transfert de place', text: 'Cédez votre place facilement' },
  ];
  return (
    <GlassCard className="border border-white/10 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
        Vos avantages abonné
      </p>
      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                <Icon size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-bone-50">
                  {item.title}
                </p>
                <p className="text-[11px] leading-5 text-bone-500">
                  {item.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function HelpCard() {
  return (
    <GlassCard className="border border-white/10 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
        Besoin d'aide ?
      </p>
      <p className="mt-3 text-sm leading-6 text-bone-300">
        Notre équipe support est disponible pour vous accompagner.
      </p>
      <Link
        to="/contact"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-bone-100 transition hover:border-emerald-400/40"
      >
        <LifeBuoy size={15} className="text-emerald-400" />
        Contacter le support
        <ArrowRight size={14} />
      </Link>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
// Vue BILLETS (matchs)
// ─────────────────────────────────────────────────────────────
function TicketsView({
  club,
  slug,
  nextMatch,
  matches,
  loadingFixtures,
  competitions,
  activeFilter,
  onFilter,
  tickets,
  lowestTicket,
  onSelectOffer,
  onSeePlaces,
}) {
  const fromPrice = getValidPrice(lowestTicket?.price);
  const filters = ['Tous', ...competitions];
  const INITIAL_MATCHES = 4;
  const [showAllMatches, setShowAllMatches] = useState(false);
  const visibleMatches = showAllMatches
    ? matches
    : matches.slice(0, INITIAL_MATCHES);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_0.95fr]">
      {/* Liste des matchs */}
      <GlassCard className="border border-white/10 p-6">
        <h2 className="font-display text-2xl font-black uppercase text-bone-50">
          Billets matchs
        </h2>
        <p className="mt-1 text-sm text-bone-400">
          Réservez vos places pour les prochains matchs à domicile.
        </p>

        {competitions.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = filter === activeFilter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onFilter(filter)}
                  className={[
                    'rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all',
                    active
                      ? 'border-emerald-400 bg-emerald-400 text-ink-900'
                      : 'border-white/10 bg-white/[0.02] text-bone-300 hover:border-white/20',
                  ].join(' ')}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {loadingFixtures ? (
            <div className="flex items-center justify-center gap-3 py-14 text-sm text-bone-400">
              <Loader2
                size={20}
                className="animate-spin text-emerald-400"
              />
              Chargement des matchs…
            </div>
          ) : matches.length === 0 ? (
            tickets.length > 0 ? (
              // Pas encore de calendrier (fixtures) → on affiche les offres
              // billet existantes (tarifs back stagiaire) pour ne pas rester
              // vide. Les billets par match arriveront via Redtaag / fixtures.
              <div className="space-y-3">
                {tickets.map((offer) => (
                  <TicketOfferCard
                    key={offer.id}
                    offer={offer}
                    onSelect={() => onSelectOffer(offer)}
                  />
                ))}
                <p className="pt-1 text-center text-[11px] text-bone-500">
                  Les billets par match seront disponibles dès
                  l'annonce du calendrier.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-12 text-center">
                <Ticket size={28} className="mx-auto text-bone-600" />
                <p className="mt-3 text-sm text-bone-300">
                  Aucun billet disponible pour le moment.
                </p>
                <p className="mt-1 text-xs text-bone-500">
                  Les prochaines affiches apparaîtront ici dès leur
                  annonce.
                </p>
              </div>
            )
          ) : (
            visibleMatches.map((match) => (
              <MatchRow
                key={match.fixtureId}
                match={match}
                club={club}
                slug={slug}
                fromPrice={fromPrice}
                onSeePlaces={onSeePlaces}
              />
            ))
          )}
        </div>

        {matches.length > INITIAL_MATCHES && (
          <button
            type="button"
            onClick={() => setShowAllMatches((value) => !value)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] py-3.5 text-xs font-black uppercase tracking-[0.16em] text-bone-300 transition hover:text-bone-50"
          >
            {showAllMatches
              ? 'Voir moins'
              : `Voir tous les matchs (${matches.length})`}
            <ArrowRight
              size={14}
              className={showAllMatches ? '-rotate-90' : 'rotate-90'}
            />
          </button>
        )}
      </GlassCard>

      {/* Prochain match + réassurance + aide */}
      <div className="flex flex-col gap-5">
        {nextMatch && (
          <NextMatchCard
            match={nextMatch}
            slug={slug}
            onSeePlaces={onSeePlaces}
          />
        )}
        <WhyBuyCard />
        <HelpCard />
      </div>
    </div>
  );
}

// Carte d'offre billet (repli quand aucun calendrier n'est disponible) :
// reprend les tarifs back existants pour ne jamais afficher un onglet vide.
function TicketOfferCard({ offer, onSelect }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-emerald-400/30">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
        <Ticket size={20} className="text-emerald-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
          Billet
        </p>
        <h3 className="mt-0.5 font-display text-lg font-black uppercase leading-tight text-bone-50">
          {offer.name}
        </h3>
        {offer.description && (
          <p className="mt-1 text-[13px] leading-5 text-bone-400">
            {offer.description}
          </p>
        )}
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {(offer.benefits || []).slice(0, 3).map((benefit, index) => (
            <li
              key={`t-benefit-${index}`}
              className="flex items-center gap-1.5 text-[11px] text-bone-500"
            >
              <Check size={12} className="shrink-0 text-emerald-400" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[10px] uppercase tracking-wider text-bone-500">
          À partir de
        </p>
        <TicketingPrice
          price={offer.price}
          priceEur={offer.price_eur}
          className="block font-display text-lg font-black leading-tight text-emerald-400"
        />
        <Button
          variant="primary"
          size="sm"
          className="mt-2 justify-center"
          onClick={onSelect}
        >
          <ShoppingBag size={14} />
          Voir les places
        </Button>
      </div>
    </div>
  );
}

function MatchRow({ match, club, slug, fromPrice, onSeePlaces }) {
  const day = formatMatchDay(match.kickoff);
  const isHome = match.homeSlug === slug;
  const clubName =
    club?.name || (isHome ? match.homeTeam : match.awayTeam);
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const opponentLogo = isHome ? match.awayLogo : match.homeLogo;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 transition hover:border-emerald-400/30">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/10 bg-ink-950/60">
        <span className="font-display text-lg font-black leading-none text-emerald-400">
          {day.day}
        </span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-bone-500">
          {day.month}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-bone-50">
          {clubName} <span className="text-bone-500">vs</span>{' '}
          {opponent}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-bone-500">
          {[match.competition, formatRound(match.round)]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {match.venue && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-bone-500">
            <MapPin size={11} className="shrink-0" />
            {match.venue}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        {fromPrice !== null && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-bone-500">
              À partir de
            </p>
            <p className="font-display text-lg font-black text-emerald-400">
              {formatPCC(fromPrice)} PCC
            </p>
          </>
        )}
        <button
          type="button"
          onClick={onSeePlaces}
          className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"
        >
          Voir les places
        </button>
      </div>

      {opponentLogo && (
        <img
          src={opponentLogo}
          alt={opponent}
          className="hidden h-10 w-10 shrink-0 object-contain lg:block"
          loading="lazy"
        />
      )}
    </div>
  );
}

function NextMatchCard({ match, slug, onSeePlaces }) {
  const home = { name: match.homeTeam, logo: match.homeLogo };
  const away = { name: match.awayTeam, logo: match.awayLogo };

  return (
    <GlassCard className="border border-emerald-400/20 p-5 text-center">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-bone-400">
        Prochain match
      </p>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          {home.logo && (
            <img
              src={home.logo}
              alt={home.name}
              className="h-14 w-14 object-contain"
            />
          )}
          <span className="max-w-[84px] truncate text-xs font-bold text-bone-100">
            {home.name}
          </span>
        </div>

        <span className="font-display text-lg font-black text-bone-500">
          VS
        </span>

        <div className="flex flex-col items-center gap-2">
          {away.logo && (
            <img
              src={away.logo}
              alt={away.name}
              className="h-14 w-14 object-contain"
            />
          )}
          <span className="max-w-[84px] truncate text-xs font-bold text-bone-100">
            {away.name}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm font-bold text-bone-100">
        {formatFullMatchDate(match.kickoff)}
      </p>
      {match.venue && (
        <p className="mt-0.5 text-xs text-bone-500">
          {match.venue}
        </p>
      )}

      <Button
        variant="primary"
        size="md"
        className="mt-4 w-full justify-center"
        onClick={onSeePlaces}
      >
        <Ticket size={15} />
        Voir les billets
      </Button>
    </GlassCard>
  );
}

function WhyBuyCard() {
  const items = [
    { icon: ShieldCheck, title: 'Billets officiels', text: '100% authentiques et garantis' },
    { icon: MapPin, title: 'Placement garanti', text: 'Choisissez vos places en temps réel' },
    { icon: Lock, title: 'Paiement sécurisé', text: 'Avec vos PCC ou carte bancaire' },
    { icon: LifeBuoy, title: 'Support dédié', text: 'Une équipe à votre écoute' },
  ];
  return (
    <GlassCard className="border border-white/10 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
        Pourquoi acheter ici ?
      </p>
      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                <Icon size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-bone-50">
                  {item.title}
                </p>
                <p className="text-[11px] leading-5 text-bone-500">
                  {item.text}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function ReassuranceBar({ tab }) {
  const items =
    tab === 'subscriptions'
      ? [
          { icon: Wallet, title: 'Paiement en PCC', text: 'Utilisez vos PaieCashCoin' },
          { icon: CreditCard, title: 'Paiement en CB', text: 'Carte bancaire sécurisée' },
          { icon: CalendarClock, title: 'Paiement en 5×', text: 'Réglez en plusieurs fois' },
          { icon: LifeBuoy, title: 'Support dédié', text: 'Une équipe à votre écoute' },
        ]
      : [
          { icon: Wallet, title: 'Paiement en PCC', text: 'Utilisez vos PaieCashCoin' },
          { icon: CreditCard, title: 'Paiement en CB', text: 'Carte bancaire sécurisée' },
          { icon: Lock, title: 'Sécurisé & garanti', text: 'Transactions 100% sécurisées' },
          { icon: Heart, title: 'Expérience premium', text: 'Vivez chaque match à fond' },
        ];

  return (
    <GlassCard className="border border-white/10 p-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                <Icon size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-black text-bone-50">
                  {item.title}
                </p>
                <p className="text-[11px] text-bone-500">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function TicketingOfferModal({
  club,
  offer,
  onClose,
  onAddToCart,
}) {
  const isSubscription =
    offer.type === 'subscription';

  const [qty, setQty] = useState(1);

  const [successMessage, setSuccessMessage] =
    useState('');

  const unitPrice =
    getValidPrice(offer.price) || 0;

  const totalPrice = isSubscription
    ? unitPrice
    : unitPrice * qty;

  const unitEur =
    getValidPrice(offer.price_eur) || 0;

  const totalEur = isSubscription
    ? unitEur
    : unitEur * qty;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
              {isSubscription
                ? 'Abonnement'
                : 'Billet'}
            </div>

            <h3 className="mt-2 font-display text-2xl font-black uppercase text-bone-50 md:text-3xl">
              {offer.name}
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {club.name}

              {offer.duration
                ? ` · ${offer.duration}`
                : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-bone-300 hover:text-bone-50"
          >
            ✕
          </button>
        </div>

        <TicketingPrice
          price={offer.price}
          priceEur={offer.price_eur}
          prefix="À partir de "
          className="mt-6 block font-display text-3xl font-black text-emerald-400"
        />

        <p className="mt-5 text-sm text-bone-300">
          {offer.description}
        </p>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-black uppercase text-emerald-400">
            Avantages
          </h4>

          <ul className="space-y-2">
            {(offer.benefits || []).map(
              (benefit, benefitIndex) => (
                <li
                  key={`benefit-${benefitIndex}`}
                  className="flex gap-2 text-sm text-bone-300"
                >
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  {benefit}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="mb-2 text-sm font-black uppercase text-emerald-400">
            Conditions
          </h4>

          <ul className="space-y-2">
            {(offer.conditions || []).map(
              (condition, conditionIndex) => (
                <li
                  key={`condition-${conditionIndex}`}
                  className="flex gap-2 text-sm text-bone-300"
                >
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  {condition}
                </li>
              )
            )}
          </ul>
        </div>

        {!isSubscription && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-bone-400">
              Quantité
            </div>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/50 p-1">
              <QtyButton
                onClick={() =>
                  setQty((currentQty) =>
                    Math.max(
                      1,
                      currentQty - 1
                    )
                  )
                }
                ariaLabel="Diminuer la quantité"
              >
                <Minus size={12} />
              </QtyButton>

              <span className="min-w-[2rem] text-center font-mono text-sm font-bold text-bone-50">
                {qty}
              </span>

              <QtyButton
                onClick={() =>
                  setQty(
                    (currentQty) =>
                      currentQty + 1
                  )
                }
                ariaLabel="Augmenter la quantité"
              >
                <Plus size={12} />
              </QtyButton>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-end justify-between gap-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-bone-400">
            {isSubscription
              ? 'Prix'
              : 'Total'}
          </div>

          <TicketingPrice
            price={totalPrice}
            priceEur={totalEur}
            className="text-right font-display text-3xl font-black text-emerald-400"
          />
        </div>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {successMessage}
          </div>
        )}

        <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onAddToCart({
                id: offer.id,
                name: offer.name,
                type: offer.type,
                clubName: club.name,

                unitPrice,
                unitEur,

                quantity: isSubscription
                  ? 1
                  : qty,

                totalPrice,
                totalEur,

                priceLabel: [
                  `${formatPCC(
                    totalPrice
                  )} PCC`,

                  totalEur > 0
                    ? `${formatEuro(
                        totalEur
                      )} €`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · '),
              });

              setSuccessMessage(
                isSubscription
                  ? 'Abonnement ajouté au panier.'
                  : 'Billet ajouté au panier.'
              );

              window.setTimeout(() => {
                onClose();
              }, 900);
            }}
          >
            <ShoppingBag size={15} />
            Ajouter au panier
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function TicketingCartModal({
  cart,
  onClose,
  onRemoveItem,
  onClearCart,
  navigate,
}) {
  const { user } = useAuth();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.totalPrice || 0),
    0
  );

  const totalEur = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.totalEur || 0),
    0
  );

  const [status, setStatus] =
    useState('idle');

  const [error, setError] =
    useState('');

  const [topUp, setTopUp] =
    useState(null);

  const [rechargeOpen, setRechargeOpen] =
    useState(false);

  const [confirmation, setConfirmation] =
    useState(null);

  const [mode, setMode] =
    useState('pcc_full');

  async function handleCheckout() {
    setError('');
    setTopUp(null);

    if (!user) {
      setError(
        'Connecte-toi pour finaliser ton paiement.'
      );
      return;
    }

    const items = cart
      .filter((item) => item.clubSlug)
      .map((item) => ({
        clubSlug: item.clubSlug,
        offerId: item.id,
        quantity: item.quantity,
      }));

    if (!items.length) {
      setError(
        'Panier invalide, vide-le et rajoute tes billets.'
      );
      return;
    }

    setStatus('paying');

    try {
      const response = await apiFetch(
        '/api/v2/checkout/ticketing',
        {
          method: 'POST',
          body: JSON.stringify({
            items,
            mode,
            origin: window.location.origin,
          }),
        }
      );

      if (response?.data?.redirect) {
        window.location.href =
          response.data.redirect;
        return;
      }

      setConfirmation(
        response?.data || null
      );

      setStatus('success');

      onClearCart?.();
    } catch (checkoutError) {
      const message =
        checkoutError?.message ||
        'Paiement impossible pour le moment.';

      if (
        /insuffisant|wallet|recharge/i.test(
          message
        )
      ) {
        setTopUp({
          message,
          found:
            checkoutError?.data?.found,
        });
      } else {
        setError(message);
      }

      setStatus('idle');
    }
  }

  if (status === 'success') {
    const confirmedPcc =
      getValidPrice(
        confirmation?.totalPcc
      ) ?? total;

    const confirmedEur =
      getValidPrice(
        confirmation?.totalEur
      ) ?? totalEur;

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 12,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-ink-950 p-8 text-center shadow-2xl"
        >
          <CheckCircle2
            className="mx-auto text-emerald-400"
            size={54}
          />

          <h3 className="mt-4 font-display text-2xl font-black uppercase text-bone-50">
            Paiement confirmé
          </h3>

          <p className="mt-3 text-sm text-bone-300">
            Ton paiement de{' '}
            <TicketingPrice
              price={confirmedPcc}
              priceEur={confirmedEur}
              className="font-bold text-emerald-400"
            />{' '}
            a bien été pris en compte.
          </p>

          {Array.isArray(
            confirmation?.orders
          ) &&
            confirmation.orders.length >
              0 && (
              <div className="mt-5 space-y-2 text-left">
                {confirmation.orders.map(
                  (order) => (
                    <div
                      key={
                        order.reference
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <p className="text-xs font-black text-bone-100">
                        {order.clubName}
                      </p>

                      <p className="mt-1 text-[11px] text-bone-500">
                        Réf.{' '}
                        {order.reference}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

          <div className="mt-7 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                navigate?.('/mon-compte')
              }
            >
              Voir mes commandes
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-black uppercase tracking-[0.18em] text-bone-400 hover:text-bone-100"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-400">
              Panier billetterie
            </div>

            <h3 className="mt-2 font-display text-2xl font-black uppercase text-bone-50 md:text-3xl">
              Votre panier
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {cart.length} élément
              {cart.length > 1 ? 's' : ''}{' '}
              ajouté
              {cart.length > 1 ? 's' : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-bone-300 hover:text-bone-50"
          >
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <ShoppingCart
              className="mx-auto text-emerald-400"
              size={34}
            />

            <p className="mt-3 text-sm text-bone-400">
              Votre panier est vide pour le moment.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                      {item.type ===
                      'subscription'
                        ? 'Abonnement'
                        : 'Billet'}
                    </p>

                    <h4 className="mt-1 font-display text-lg font-black text-bone-50">
                      {item.name}
                    </h4>

                    <p className="mt-1 text-xs text-bone-500">
                      {item.clubName}
                    </p>

                    <p className="mt-2 text-xs text-bone-400">
                      Quantité :{' '}
                      <span className="font-bold text-bone-100">
                        {item.quantity}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bone-500">
                      Total
                    </p>

                    <TicketingPrice
                      price={item.totalPrice}
                      priceEur={item.totalEur}
                      className="font-display text-xl font-black text-emerald-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveItem(index)
                      }
                      aria-label={`Retirer ${item.name} du panier`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-bone-400">
                Total panier
              </div>

              <TicketingPrice
                price={total}
                priceEur={totalEur}
                className="text-right font-display text-3xl font-black text-emerald-400"
              />
            </div>

            <div className="mt-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-bone-400">
                Mode de paiement
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAY_MODES.map(
                  (paymentMode) => {
                    const Icon =
                      paymentMode.icon;

                    const active =
                      mode ===
                      paymentMode.id;

                    return (
                      <button
                        key={
                          paymentMode.id
                        }
                        type="button"
                        onClick={() =>
                          setMode(
                            paymentMode.id
                          )
                        }
                        className={[
                          'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11px] font-bold transition-all',
                          active
                            ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                            : 'border-white/10 bg-white/[0.03] text-bone-300 hover:border-white/20',
                        ].join(' ')}
                      >
                        <Icon
                          size={17}
                          className={
                            active
                              ? 'text-emerald-400'
                              : 'text-bone-400'
                          }
                        />

                        {paymentMode.label}
                      </button>
                    );
                  }
                )}
              </div>

              <p className="mt-2 text-[11px] text-bone-500">
                {
                  PAY_MODES.find(
                    (paymentMode) =>
                      paymentMode.id ===
                      mode
                  )?.hint
                }
              </p>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {topUp && (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <div className="flex items-start gap-2 text-sm text-amber-200">
                  <Wallet
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {topUp.message}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRechargeOpen(true)
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink-900 transition hover:bg-amber-300"
                >
                  <Wallet size={14} />
                  Recharger mon wallet PCC
                </button>
              </div>
            )}

            {!user && !error && (
              <p className="mt-4 text-center text-xs text-bone-500">
                Tu dois être connecté pour payer.
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckout}
                disabled={
                  status === 'paying'
                }
              >
                {status === 'paying' ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    {mode === 'pcc_full'
                      ? 'Paiement...'
                      : 'Redirection...'}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />

                    {PAY_MODES.find(
                      (paymentMode) =>
                        paymentMode.id ===
                        mode
                    )?.cta || 'Payer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {rechargeOpen && (
        <PccRechargeModal
          email={user?.email}
          found={topUp?.found}
          reason={
            topUp?.message ||
            'Ton solde PCC est insuffisant pour ce paiement.'
          }
          onClose={() =>
            setRechargeOpen(false)
          }
        />
      )}
    </div>
  );
}