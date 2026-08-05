import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  Loader2,
  Search,
  ShieldCheck,
  ShoppingBag,
  Ticket,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatPCC } from '@/data/clubMerchandise';
import { apiFetch } from '@/lib/api';
import { buildDefaultTicketing } from '@/utils/ticketingPrices';

const CLUBS_LIMIT = 500;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_DETAILS_LIMIT = 12;

/**
 * Retourne un prix numérique valide.
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

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

/**
 * Formate le prix en euros.
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
 * Sélectionne l'offre réelle ayant le prix PCC le plus bas.
 *
 * Le prix, la description, les avantages et les conditions
 * affichés appartiennent tous à cette même offre.
 */
function getLowestOffer(offers) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return null;
  }

  return offers.reduce((lowestOffer, currentOffer) => {
    if (!lowestOffer) {
      return currentOffer;
    }

    const lowestPrice = getValidPrice(
      lowestOffer?.price
    );

    const currentPrice = getValidPrice(
      currentOffer?.price
    );

    if (
      lowestPrice === null &&
      currentPrice !== null
    ) {
      return currentOffer;
    }

    if (currentPrice === null) {
      return lowestOffer;
    }

    return currentPrice < lowestPrice
      ? currentOffer
      : lowestOffer;
  }, null);
}

/**
 * Extrait metadata de façon sécurisée.
 */
function getMetadata(club) {
  if (
    club?.metadata &&
    typeof club.metadata === 'object' &&
    !Array.isArray(club.metadata)
  ) {
    return club.metadata;
  }

  return {};
}

/**
 * Normalise les propriétés d'un club provenant de l'API.
 */
function normalizeClub(rawClub) {
  const metadata = getMetadata(rawClub);

  return {
    ...rawClub,

    id:
      rawClub?.id ||
      rawClub?.uuid ||
      metadata?.id ||
      metadata?.uuid ||
      null,

    uuid:
      rawClub?.uuid ||
      rawClub?.id ||
      metadata?.uuid ||
      metadata?.id ||
      null,

    slug:
      rawClub?.slug ||
      metadata?.slug ||
      '',

    name:
      rawClub?.name ||
      rawClub?.club_name ||
      metadata?.name ||
      'Club',

    city:
      rawClub?.city ||
      metadata?.city ||
      '',

    country:
      rawClub?.country ||
      rawClub?.country_name ||
      metadata?.country ||
      '',

    league:
      rawClub?.league ||
      rawClub?.league_name ||
      metadata?.league ||
      '',

    sport:
      rawClub?.sport ||
      metadata?.sport ||
      '',

    logo:
      rawClub?.logo ||
      rawClub?.logo_url ||
      metadata?.logo ||
      metadata?.logo_url ||
      '',

    primaryColor:
      rawClub?.primaryColor ||
      rawClub?.primary_color ||
      metadata?.primaryColor ||
      metadata?.primary_color ||
      '#10b981',

    metadata,

    ticketing:
      rawClub?.ticketing ||
      metadata?.ticketing ||
      null,
  };
}

/**
 * Fusionne les informations de la liste et du détail.
 *
 * Les données détaillées sont prioritaires.
 */
function mergeClubData(listedClub, detailedClub) {
  const normalizedListedClub =
    normalizeClub(listedClub);

  const normalizedDetailedClub =
    normalizeClub(detailedClub);

  const listedMetadata = getMetadata(
    normalizedListedClub
  );

  const detailedMetadata = getMetadata(
    normalizedDetailedClub
  );

  return normalizeClub({
    ...normalizedListedClub,
    ...normalizedDetailedClub,

    id:
      normalizedDetailedClub.id ||
      normalizedListedClub.id,

    uuid:
      normalizedDetailedClub.uuid ||
      normalizedListedClub.uuid,

    slug:
      normalizedDetailedClub.slug ||
      normalizedListedClub.slug,

    name:
      normalizedDetailedClub.name ||
      normalizedListedClub.name,

    city:
      normalizedDetailedClub.city ||
      normalizedListedClub.city,

    country:
      normalizedDetailedClub.country ||
      normalizedListedClub.country,

    league:
      normalizedDetailedClub.league ||
      normalizedListedClub.league,

    sport:
      normalizedDetailedClub.sport ||
      normalizedListedClub.sport,

    logo:
      normalizedDetailedClub.logo ||
      normalizedListedClub.logo,

    primaryColor:
      normalizedDetailedClub.primaryColor ||
      normalizedListedClub.primaryColor,

    metadata: {
      ...listedMetadata,
      ...detailedMetadata,
    },

    ticketing:
      normalizedDetailedClub.ticketing ||
      detailedMetadata?.ticketing ||
      normalizedListedClub.ticketing ||
      listedMetadata?.ticketing ||
      null,
  });
}

/**
 * Même logique que ClubBilletterie :
 *
 * 1. club.ticketing ;
 * 2. club.metadata.ticketing ;
 * 3. buildDefaultTicketing(club).
 */
function getClubTicketing(club) {
  if (!club) {
    return {
      subscriptions: [],
      tickets: [],
    };
  }

  const metadata = getMetadata(club);

  const ticketing =
    club.ticketing ||
    metadata?.ticketing ||
    buildDefaultTicketing(club);

  return {
    subscriptions: Array.isArray(
      ticketing?.subscriptions
    )
      ? ticketing.subscriptions
      : [],

    tickets: Array.isArray(ticketing?.tickets)
      ? ticketing.tickets
      : [],
  };
}

/**
 * Construit une seule carte Abonnement
 * et une seule carte Billet par club.
 */
function buildTicketingSummary(rawClub) {
  const club = normalizeClub(rawClub);
  const ticketing = getClubTicketing(club);

  const selectedSubscription = getLowestOffer(
    ticketing.subscriptions
  );

  const selectedTicket = getLowestOffer(
    ticketing.tickets
  );

  const clubSlug = String(club.slug || '').trim();

  const baseClub = {
    clubId: club.id,
    clubUuid: club.uuid,
    clubSlug,
    clubName: club.name,
    city: club.city,
    country: club.country,
    league: club.league,
    sport: club.sport,
    logo: club.logo,
    primaryColor: club.primaryColor,
  };

  function createSummaryOffer(
    selectedOffer,
    type,
    totalOffers
  ) {
    if (!selectedOffer) {
      return null;
    }

    return {
      ...selectedOffer,

      id: `${clubSlug}-${type}-summary`,
      type,

      name:
        selectedOffer.name ||
        (type === 'subscription'
          ? `Abonnement ${club.name}`
          : `Billet ${club.name}`),

      price: getValidPrice(selectedOffer.price),

      price_eur: getValidPrice(
        selectedOffer.price_eur
      ),

      description:
        selectedOffer.description || '',

      duration:
        selectedOffer.duration || '',

      benefits: Array.isArray(
        selectedOffer.benefits
      )
        ? selectedOffer.benefits
        : [],

      conditions: Array.isArray(
        selectedOffer.conditions
      )
        ? selectedOffer.conditions
        : [],

      totalOffers,
    };
  }

  const subscriptionSummary =
    createSummaryOffer(
      selectedSubscription,
      'subscription',
      ticketing.subscriptions.length
    );

  const ticketSummary = createSummaryOffer(
    selectedTicket,
    'ticket',
    ticketing.tickets.length
  );

  return {
    ...baseClub,

    subscriptions: subscriptionSummary
      ? [subscriptionSummary]
      : [],

    tickets: ticketSummary
      ? [ticketSummary]
      : [],
  };
}

/**
 * Accepte plusieurs structures possibles de réponse API.
 */
function getClubsFromResponse(response) {
  if (Array.isArray(response?.data?.clubs)) {
    return response.data.clubs;
  }

  if (Array.isArray(response?.clubs)) {
    return response.clubs;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

/**
 * Extrait le club de la réponse de détail.
 */
function getClubFromDetailResponse(
  response,
  fallbackClub
) {
  return (
    response?.data?.club ||
    response?.club ||
    response?.data ||
    fallbackClub
  );
}

/**
 * Clé stable utilisée pour le cache.
 */
function getClubCacheKey(club) {
  return String(
    club?.slug ||
      club?.id ||
      club?.uuid ||
      ''
  ).trim();
}

export function Billetterie() {
  const [activeTab, setActiveTab] =
    useState('subscriptions');

  const [query, setQuery] = useState('');
  const [serverSearch, setServerSearch] =
    useState('');

  /**
   * Liste légère renvoyée par l'endpoint général.
   */
  const [listedClubs, setListedClubs] =
    useState([]);

  /**
   * Détails chargés progressivement.
   */
  const [detailsByKey, setDetailsByKey] =
    useState({});

  const [loadingList, setLoadingList] =
    useState(true);

  const [loadError, setLoadError] =
    useState('');

  /**
   * Contient les clés des clubs dont le détail
   * est actuellement en cours de chargement.
   */
  const [loadingDetailKeys, setLoadingDetailKeys] =
    useState(() => new Set());

  /**
   * Cache qui reste immédiatement accessible
   * à l'intérieur des fonctions asynchrones.
   */
  const detailsCacheRef = useRef(new Map());

  /**
   * Empêche deux appels simultanés pour le même club.
   */
  const inFlightDetailsRef = useRef(new Map());

  const navigate = useNavigate();

  /**
   * Recherche différée, comme sur la page Fan Club.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setServerSearch(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  /**
   * Charge rapidement la liste initiale ou
   * les résultats d'une recherche côté serveur.
   *
   * Aucun détail de club n'est chargé ici.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadClubList() {
      setLoadingList(true);
      setLoadError('');

      try {
        const params = new URLSearchParams();

        params.set(
          'limit',
          String(CLUBS_LIMIT)
        );

        if (serverSearch) {
          params.set('search', serverSearch);
        }

        const response = await apiFetch(
          `/api/v2/marketplace/clubs?${params.toString()}`
        );

        const clubs = getClubsFromResponse(response)
          .filter(Boolean)
          .map(normalizeClub);

        if (!cancelled) {
          setListedClubs(clubs);
        }
      } catch (error) {
        if (!cancelled) {
          setListedClubs([]);

          setLoadError(
            error?.message ||
              'Impossible de charger les billetteries.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingList(false);
        }
      }
    }

    loadClubList();

    return () => {
      cancelled = true;
    };
  }, [serverSearch]);

  /**
   * Charge le détail d'un seul club et le conserve
   * dans le cache.
   */
  const ensureClubDetail = useCallback(
    async (listedClub) => {
      const normalizedClub =
        normalizeClub(listedClub);

      const cacheKey =
        getClubCacheKey(normalizedClub);

      if (!cacheKey) {
        return normalizedClub;
      }

      /**
       * Le détail a déjà été chargé.
       */
      if (detailsCacheRef.current.has(cacheKey)) {
        return detailsCacheRef.current.get(cacheKey);
      }

      /**
       * Une requête est déjà en cours pour ce club.
       */
      if (inFlightDetailsRef.current.has(cacheKey)) {
        return inFlightDetailsRef.current.get(
          cacheKey
        );
      }

      const detailPromise = (async () => {
        setLoadingDetailKeys((currentKeys) => {
          const nextKeys = new Set(currentKeys);
          nextKeys.add(cacheKey);
          return nextKeys;
        });

        try {
          const identifier =
            normalizedClub.id ||
            normalizedClub.uuid ||
            normalizedClub.slug;

          if (!identifier) {
            return normalizedClub;
          }

          const response = await apiFetch(
            `/api/v2/marketplace/clubs/${encodeURIComponent(
              identifier
            )}`
          );

          const rawDetailedClub =
            getClubFromDetailResponse(
              response,
              normalizedClub
            );

          const completeClub = mergeClubData(
            normalizedClub,
            rawDetailedClub
          );

          detailsCacheRef.current.set(
            cacheKey,
            completeClub
          );

          setDetailsByKey((currentDetails) => ({
            ...currentDetails,
            [cacheKey]: completeClub,
          }));

          return completeClub;
        } catch {
          /**
           * En cas d'échec, on conserve le club de la liste.
           * buildDefaultTicketing pourra alors être utilisé.
           */
          detailsCacheRef.current.set(
            cacheKey,
            normalizedClub
          );

          setDetailsByKey((currentDetails) => ({
            ...currentDetails,
            [cacheKey]: normalizedClub,
          }));

          return normalizedClub;
        } finally {
          inFlightDetailsRef.current.delete(
            cacheKey
          );

          setLoadingDetailKeys((currentKeys) => {
            const nextKeys = new Set(currentKeys);
            nextKeys.delete(cacheKey);
            return nextKeys;
          });
        }
      })();

      inFlightDetailsRef.current.set(
        cacheKey,
        detailPromise
      );

      return detailPromise;
    },
    []
  );

  /**
   * Pour une recherche, charge immédiatement
   * les détails des premiers résultats.
   *
   * Cela permet d'obtenir rapidement les mêmes
   * informations que ClubBilletterie.
   */
  useEffect(() => {
    if (
      !serverSearch ||
      listedClubs.length === 0
    ) {
      return;
    }

    const priorityResults = listedClubs.slice(
      0,
      SEARCH_DETAILS_LIMIT
    );

    priorityResults.forEach((club) => {
      ensureClubDetail(club);
    });
  }, [
    ensureClubDetail,
    listedClubs,
    serverSearch,
  ]);

  /**
   * Fusionne la liste rapide avec les détails déjà
   * chargés, puis construit les cartes.
   */
  const clubs = useMemo(() => {
    return listedClubs
      .map((listedClub) => {
        const cacheKey =
          getClubCacheKey(listedClub);

        const completeClub =
          detailsByKey[cacheKey] ||
          listedClub;

        return buildTicketingSummary(
          completeClub
        );
      })
      .filter(
        (club) =>
          club.clubSlug &&
          (
            club.subscriptions.length > 0 ||
            club.tickets.length > 0
          )
      )
      .sort((firstClub, secondClub) =>
        String(firstClub.clubName).localeCompare(
          String(secondClub.clubName),
          'fr',
          {
            sensitivity: 'base',
          }
        )
      );
  }, [detailsByKey, listedClubs]);

  /**
   * Sécurité supplémentaire lorsque l'API renvoie
   * des résultats plus larges que la recherche.
   */
  const displayedClubs = useMemo(() => {
    const normalizedSearch =
      serverSearch
        .trim()
        .toLocaleLowerCase('fr-FR');

    if (!normalizedSearch) {
      return clubs;
    }

    return clubs.filter((club) =>
      [
        club.clubName,
        club.city,
        club.country,
        club.league,
        club.sport,
      ].some((value) =>
        String(value || '')
          .toLocaleLowerCase('fr-FR')
          .includes(normalizedSearch)
      )
    );
  }, [clubs, serverSearch]);

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

  function openClubTicketing(clubSlug) {
    if (!clubSlug) {
      return;
    }

    navigate(
      `/clubs/${encodeURIComponent(
        clubSlug
      )}/billetterie`
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dégradé très discret */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(16,185,129,0.025),transparent_42%)]" />

      {/* En-tête */}
      <section className="relative py-14 md:py-20">
        <Container>

          <motion.h1
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-3 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-bone-50 md:text-6xl"
          >
            Billets & abonnements
          </motion.h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-bone-300 md:text-base">
            Retrouvez les offres de billetterie des
            clubs présents sur la plateforme.
            Recherchez un club pour accéder à ses
            billets et abonnements.
          </p>
        </Container>
      </section>

      {/* Onglets et recherche */}
      <Container className="relative pb-7">
        <GlassCard className="border border-white/10 p-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
                      'inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[11px] font-black uppercase tracking-[0.15em] transition-all',
                      isActive
                        ? 'border-emerald-400 bg-emerald-400 text-ink-950 shadow-lg shadow-emerald-400/15'
                        : 'border-white/10 bg-white/[0.025] text-bone-300 hover:border-white/20 hover:text-bone-50',
                    ].join(' ')}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              {loadingList && query.trim() ? (
                <Loader2
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-400"
                />
              ) : (
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-bone-500"
                />
              )}

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Rechercher un club..."
                className="h-10 w-full rounded-full border border-white/10 bg-white/[0.025] pl-10 pr-4 text-xs text-bone-100 outline-none placeholder:text-bone-500 focus:border-emerald-400/50"
              />
            </div>
          </div>
        </GlassCard>
      </Container>

      {/* Cartes */}
      <Container className="relative pb-20">
        {loadError && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </div>
        )}

        {loadingList && (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-bone-400">
            <Loader2
              size={20}
              className="animate-spin text-emerald-400"
            />

            {serverSearch
              ? 'Recherche de la billetterie par nom de club…'
              : 'Chargement de la billetterie…'}
          </div>
        )}

        {!loadingList &&
          displayedClubs.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center">
              <Ticket
                size={32}
                className="mx-auto text-bone-600"
              />

              <h2 className="mt-4 text-sm font-bold text-bone-200">
                Aucune billetterie trouvée
              </h2>

              <p className="mt-2 text-xs text-bone-500">
                Aucun club ne correspond à votre
                recherche dans cette catégorie.
              </p>
            </div>
          )}

        {!loadingList && (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedClubs.map(
              (club, clubIndex) => {
                const offers = Array.isArray(
                  club?.[activeTab]
                )
                  ? club[activeTab]
                  : [];

                const clubKey =
                  getClubCacheKey({
                    slug: club.clubSlug,
                    id: club.clubId,
                    uuid: club.clubUuid,
                  });

                const listedClub =
                  listedClubs.find(
                    (item) =>
                      getClubCacheKey(item) ===
                      clubKey
                  );

                const detailIsLoading =
                  loadingDetailKeys.has(clubKey);

                const detailIsLoaded =
                  Boolean(detailsByKey[clubKey]);

                return offers.map((offer) => {
                  const visibleBenefits =
                    Array.isArray(
                      offer.benefits
                    )
                      ? offer.benefits.slice(0, 3)
                      : [];

                  const visibleConditions =
                    Array.isArray(
                      offer.conditions
                    )
                      ? offer.conditions.slice(0, 3)
                      : [];

                  return (
                    <motion.article
                      key={offer.id}
                      initial={{
                        opacity: 0,
                        y: 16,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      whileHover={{
                        y: -4,
                      }}
                      onViewportEnter={() => {
                        if (
                          listedClub &&
                          !detailIsLoaded
                        ) {
                          ensureClubDetail(
                            listedClub
                          );
                        }
                      }}
                      viewport={{
                        once: true,
                        margin: '180px',
                      }}
                      transition={{
                        delay:
                          (clubIndex % 12) * 0.02,
                      }}
                      onClick={() =>
                        openClubTicketing(
                          club.clubSlug
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' ||
                          event.key === ' '
                        ) {
                          event.preventDefault();

                          openClubTicketing(
                            club.clubSlug
                          );
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      className="h-full cursor-pointer outline-none"
                    >
                      <GlassCard className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-[26px] border border-emerald-400/20 bg-ink-950/80 p-6 transition-all hover:border-emerald-400/40">
                        {/* Halo discret */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-[0.08]"
                          style={{
                            background: `radial-gradient(circle at top right, ${club.primaryColor}, transparent 52%)`,
                          }}
                        />

                        {/* Chargement discret du détail */}
                        {detailIsLoading && (
                          <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/80 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-bone-500">
                            <Loader2
                              size={11}
                              className="animate-spin text-emerald-400"
                            />
                            Actualisation
                          </div>
                        )}

                        <div className="relative flex flex-1 flex-col">
                          {/* Club */}
                          <div className="flex min-h-[72px] items-start gap-4">
                            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] border border-white/10 bg-white/[0.035] p-2.5">
                              {club.logo ? (
                                <img
                                  src={club.logo}
                                  alt={club.clubName}
                                  className="max-h-full max-w-full object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <Ticket
                                  size={24}
                                  className="text-emerald-400"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                                {offer.type ===
                                'subscription'
                                  ? 'Abonnement'
                                  : 'Billet'}
                              </p>

                              <h3 className="mt-2 font-display text-xl font-black uppercase leading-tight text-bone-50">
                                {offer.name}
                              </h3>

                              {club.city && (
                                <p className="mt-1 text-xs text-bone-500">
                                  {club.city}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Prix PCC · euro */}
                          <div className="mt-6 min-h-[64px]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-bone-500">
                              Prix
                            </p>

                            <p className="mt-1 break-words font-display text-2xl font-black leading-tight text-emerald-400">
                              {offer.price !== null &&
                              offer.price !==
                                undefined ? (
                                <>
                                  À partir de{' '}
                                  {formatPCC(
                                    offer.price
                                  )}{' '}
                                  PCC
                                  {offer.price_eur !==
                                    null &&
                                  offer.price_eur !==
                                    undefined
                                    ? ` · ${formatEuro(
                                        offer.price_eur
                                      )} €`
                                    : ''}
                                </>
                              ) : (
                                'Voir les tarifs'
                              )}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="mt-3 min-h-[42px] text-sm leading-6 text-bone-300">
                            {offer.description}
                          </p>

                          {/* Avantages */}
                          <ul className="mt-5 min-h-[76px] space-y-2">
                            {visibleBenefits.map(
                              (benefit) => (
                                <li
                                  key={benefit}
                                  className="flex items-start gap-2 text-[13px] leading-5 text-bone-300"
                                >
                                  <Check
                                    size={15}
                                    className="mt-0.5 shrink-0 text-emerald-400"
                                  />

                                  <span>
                                    {benefit}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>

                          {/* Conditions */}
                          <div className="mt-5 min-h-[108px] rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-bone-400">
                              <ShieldCheck
                                size={15}
                                className="text-emerald-400"
                              />

                              Conditions
                            </div>

                            <ul className="mt-3 space-y-1.5">
                              {visibleConditions.map(
                                (condition) => (
                                  <li
                                    key={condition}
                                    className="text-[13px] leading-5 text-bone-500"
                                  >
                                    • {condition}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>

                        {/* Bouton aligné */}
                        <div className="relative mt-5 flex justify-end">
                          <Button
                            variant="primary"
                            size="md"
                            className="min-w-[185px] justify-center rounded-full text-sm"
                            onClick={(event) => {
                              event.stopPropagation();

                              openClubTicketing(
                                club.clubSlug
                              );
                            }}
                          >
                            <ShoppingBag size={15} />
                            Voir la billetterie
                          </Button>
                        </div>
                      </GlassCard>
                    </motion.article>
                  );
                });
              }
            )}
          </div>
        )}
      </Container>
    </div>
  );
}