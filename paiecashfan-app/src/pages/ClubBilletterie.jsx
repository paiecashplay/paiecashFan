import { useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Layers,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Trash2,
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

  const offers = Array.isArray(
    ticketing?.[activeTab]
  )
    ? ticketing[activeTab]
    : [];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.06),transparent_38%)]" />

      <section className="relative py-14 md:py-20">
        <Container>
          <Link
            to={`/clubs/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-50"
          >
            <ArrowLeft size={16} />
            Retour au club
          </Link>

          <div className="mt-8 flex items-center gap-5">
            <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              {club.logo && (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div>
              <h1 className="mt-3 font-display text-4xl font-black uppercase text-bone-50 md:text-6xl">
                {club.name}
              </h1>

              <p className="mt-2 text-bone-400">
                Billets et abonnements pour ce club.
              </p>
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

      <Container className="relative pb-24">
        {offers.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <Ticket
              size={32}
              className="mx-auto text-bone-600"
            />

            <h2 className="mt-4 text-base font-bold text-bone-200">
              Aucune offre disponible
            </h2>

            <p className="mt-2 text-sm text-bone-500">
              Ce club ne propose actuellement aucune
              offre dans cette catégorie.
            </p>
          </div>
        ) : (
          <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => (
              <motion.article
                key={offer.id}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                whileHover={{
                  y: -6,
                  scale: 1.015,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.04,
                }}
                onClick={() =>
                  setSelectedOffer(offer)
                }
                className="h-full cursor-pointer"
              >
                <GlassCard className="flex h-full flex-col border border-white/10 p-6 transition-all hover:border-emerald-400/40">
                  <div className="flex flex-1 flex-col">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
                      {offer.type ===
                      'subscription'
                        ? 'Abonnement'
                        : 'Billet'}
                    </p>

                    <h3 className="mt-3 font-display text-2xl font-black uppercase text-bone-50">
                      {offer.name}
                    </h3>

                    {offer.duration && (
                      <p className="mt-2 text-xs text-bone-500">
                        {offer.duration}
                      </p>
                    )}

                    <TicketingPrice
                      price={offer.price}
                      priceEur={offer.price_eur}
                      prefix="À partir de "
                      className="mt-6 block font-display text-2xl font-black leading-tight text-emerald-400"
                    />

                    <p className="mt-4 text-sm text-bone-300">
                      {offer.description}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {(offer.benefits || []).map(
                        (benefit) => (
                          <li
                            key={benefit}
                            className="flex items-center gap-2 text-xs text-bone-300"
                          >
                            <Check
                              size={13}
                              className="shrink-0 text-emerald-400"
                            />

                            {benefit}
                          </li>
                        )
                      )}
                    </ul>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-bone-400">
                        <ShieldCheck
                          size={14}
                          className="text-emerald-400"
                        />

                        Conditions
                      </div>

                      <ul className="mt-3 space-y-1.5">
                        {(offer.conditions || []).map(
                          (condition) => (
                            <li
                              key={condition}
                              className="text-xs text-bone-400"
                            >
                              • {condition}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      className="min-w-[150px] justify-center"
                    >
                      <ShoppingBag size={15} />

                      {offer.type ===
                      'subscription'
                        ? 'Souscrire'
                        : 'Acheter'}
                    </Button>
                  </div>
                </GlassCard>
              </motion.article>
            ))}
          </div>
        )}
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
              (benefit) => (
                <li
                  key={benefit}
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
              (condition) => (
                <li
                  key={condition}
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