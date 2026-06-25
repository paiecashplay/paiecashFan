import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Ticket,
  CalendarDays,
  Check,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Minus,
  Plus,
  Trash2
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useClubDetail } from '@/hooks/useClubDetail';
import { formatPCC } from '@/data/clubMerchandise';
import { getAutoTicketingPrices } from '@/utils/ticketingPrices';


function generateClubTicketing(club) {
  const prices = getAutoTicketingPrices({
    ...club,
    slug: club.slug
  });
  return {
    subscriptions: [
      {
        id: `${club.slug}-season-pass`,
        type: 'subscription',
        name: `Abonnement ${club.name}`,
        price: prices.subscription,
        duration: 'Saison 2026-2027',
        description: `Abonnement saison pour suivre ${club.name} à domicile.`,
        benefits: [
          'Accès aux matchs à domicile',
          'Priorité billetterie',
          'Paiement possible en 10 fois avec 5 % de frais'
        ],
        conditions: [
          'Offre soumise aux disponibilités',
          'Tarifs variables selon la tribune',
          'Données à confirmer avec le club'
        ]
      }
    ],
    tickets: [
      {
        id: `${club.slug}-single-ticket`,
        type: 'ticket',
        name: `Billet match ${club.name}`,
        price: prices.ticket,
        duration: 'Match à domicile',
        description: `Billet individuel pour assister à un match à domicile de ${club.name}.`,
        benefits: [
          'Billet pour un match',
          'Prix selon catégorie',
          'Places selon disponibilité'
        ],
        conditions: [
          'Prix variable selon l’affiche',
          'Offre soumise aux disponibilités',
          'Données à confirmer avec le club'
        ]
      }
    ]
  };
}

function QtyButton({ children, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10 transition"
    >
      {children}
    </button>
  );
}

export function ClubBilletterie() {
  const { slug } = useParams();
  const { club, loading } = useClubDetail(slug);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [cart, setCart] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const ticketing = useMemo(() => {
    if (!club) return { subscriptions: [], tickets: [] };
    return club.ticketing || generateClubTicketing(club);
  }, [club]);

  if (loading && !club) {
    return (
      <Container className="py-24">
        <div className="text-bone-400">Chargement de la billetterie...</div>
      </Container>
    );
  }

  if (!club) {
    return (
      <Container className="py-24">
        <div className="text-bone-400">Club introuvable.</div>
      </Container>
    );
  }

  const tabs = [
    { id: 'subscriptions', label: 'Abonnements', icon: CalendarDays },
    { id: 'tickets', label: 'Billets', icon: Ticket },
  ];

  const offers = ticketing[activeTab] || [];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_35%)]" />

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
            <div className="h-20 w-20 rounded-2xl border border-white/10 bg-white/[0.04] p-3 grid place-items-center">
              {club.logo && (
                <img src={club.logo} alt={club.name} className="max-h-full max-w-full object-contain" />
              )}
            </div>

            <div>

              <h1 className="mt-3 font-display text-4xl md:text-6xl font-black uppercase text-bone-50">
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
            <div className="flex items-center justify-between gap-4 flex-wrap">

            <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                        'inline-flex items-center gap-2 h-11 px-5 rounded-full text-xs uppercase tracking-[0.18em] font-black transition-all whitespace-nowrap',
                        isActive
                        ? 'bg-emerald-400 text-ink-900 shadow-lg shadow-emerald-400/20'
                        : 'bg-white/[0.04] border border-white/10 text-bone-300 hover:text-bone-50'
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
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-3 h-11 px-5 rounded-full bg-white/[0.04] border border-white/10 text-bone-100 hover:border-emerald-400/40 transition-all"
            >
                <ShoppingCart size={18} className="text-emerald-400" />

                <span className="text-xs uppercase tracking-[0.18em] font-black">
                Panier
                </span>

                <span className="grid h-6 min-w-[24px] px-1 place-items-center rounded-full bg-emerald-400 text-ink-900 text-[11px] font-black">
                {cart.length}
                </span>
            </button>

            </div>
        </GlassCard>
      </Container>

      <Container className="relative pb-24">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer, index) => (
            <motion.article
              key={offer.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.015 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              onClick={() => setSelectedOffer(offer)}
            >
              <GlassCard className="h-full p-6 border border-white/10 hover:border-emerald-400/40 transition-all">
                <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-400 font-black">
                  {offer.type === 'subscription' ? 'Abonnement' : 'Billet'}
                </p>

                <h3 className="mt-3 font-display text-2xl font-black uppercase text-bone-50">
                  {offer.name}
                </h3>

                <p className="mt-2 text-xs text-bone-500">
                  {offer.duration}
                </p>

                <p className="mt-6 font-display text-3xl font-black text-emerald-400">
                    À partir de {offer.price} PCC 
                </p>

                <p className="mt-4 text-sm text-bone-300">
                  {offer.description}
                </p>

                <ul className="mt-5 space-y-2">
                  {offer.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-xs text-bone-300">
                      <Check size={13} className="text-emerald-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Conditions
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {offer.conditions.map((condition) => (
                      <li key={condition} className="text-xs text-bone-400">
                        • {condition}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="primary" size="md">
                    <ShoppingBag size={15} />
                    {offer.type === 'subscription' ? 'Souscrire' : 'Acheter'}
                  </Button>
                </div>
              </GlassCard>
            </motion.article>
          ))}
        </div>
      </Container>

      {selectedOffer && (
        <TicketingOfferModal
            club={club}
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onAddToCart={(item) => {
            setCart((prev) => [...prev, item]);
            }}
        />
       )}

       {isCartOpen && (
        <TicketingCartModal
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            onRemoveItem={(indexToRemove) => {
                setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
            }}
        />
        )}
    </div>
  );
}

function TicketingOfferModal({ club, offer, onClose, onAddToCart }) {
  const isSubscription = offer.type === 'subscription';
  const [qty, setQty] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const unitPrice = Number(offer.price) || 0;
  const totalPrice = isSubscription ? unitPrice : unitPrice * qty;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
              {isSubscription ? 'Abonnement' : 'Billet'}
            </div>

            <h3 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase text-bone-50">
              {offer.name}
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {club.name} · {offer.duration}
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

        <div className="mt-6 font-display text-3xl font-black text-emerald-400">
           À partir de {offer.price} PCC 
        </div>

        <p className="mt-5 text-sm text-bone-300">
          {offer.description}
        </p>

        <div className="mt-6">
          <h4 className="text-sm font-black uppercase mb-2 text-emerald-400">
            Avantages
          </h4>

          <ul className="space-y-2">
            {offer.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2 text-sm text-bone-300">
                <Check size={14} className="text-emerald-400" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-black uppercase mb-2 text-emerald-400">
            Conditions
          </h4>

          <ul className="space-y-2">
            {offer.conditions.map((condition) => (
              <li key={condition} className="flex gap-2 text-sm text-bone-300">
                <Check size={14} className="text-emerald-400" />
                {condition}
              </li>
            ))}
          </ul>
        </div>

        {!isSubscription && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
              Quantité
            </div>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/50 p-1">
              <QtyButton
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                ariaLabel="Diminuer la quantité"
              >
                <Minus size={12} />
              </QtyButton>

              <span className="min-w-[2rem] text-center text-sm font-mono font-bold text-bone-50">
                {qty}
              </span>

              <QtyButton
                onClick={() => setQty((q) => q + 1)}
                ariaLabel="Augmenter la quantité"
              >
                <Plus size={12} />
              </QtyButton>
            </div>

            <div className="mt-6 flex items-end justify-between gap-6">
              <div className="text-[10px] uppercase tracking-[0.32em] text-bone-400 font-bold">
                Total
              </div>

              <div className="font-display text-3xl font-black text-emerald-400 tabular-nums">
                {formatPCC(totalPrice)} PCC
              </div>
            </div>
          </div>
        )}

        {successMessage && (
        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {successMessage}
        </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
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
                quantity: isSubscription ? 1 : qty,
                totalPrice,
                priceLabel: `${formatPCC(totalPrice)} PCC`      
              });

               setSuccessMessage(
                    isSubscription
                    ? 'Abonnement ajouté au panier avec succès.'
                    : 'Billet ajouté au panier avec succès.'
                );

                setTimeout(() => {
                    setSuccessMessage('');
                }, 2500);

            }}>

            <ShoppingBag size={15} />
            Ajouter au panier
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


function TicketingCartModal({ cart, onClose, onRemoveItem }) {
  const total = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
              Panier billetterie
            </div>

            <h3 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase text-bone-50">
              Votre panier
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {cart.length} élément{cart.length > 1 ? 's' : ''} ajouté{cart.length > 1 ? 's' : ''}
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
            <ShoppingCart className="mx-auto text-emerald-400" size={34} />
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
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-black">
                      {item.type === 'subscription' ? 'Abonnement' : 'Billet'}
                    </p>

                    <h4 className="mt-1 font-display text-lg font-black text-bone-50">
                      {item.name}
                    </h4>

                    <p className="mt-1 text-xs text-bone-500">
                      {item.clubName}
                    </p>

                    <p className="mt-2 text-xs text-bone-400">
                      Quantité : <span className="font-bold text-bone-100">{item.quantity}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-bone-500 font-bold">
                      Total
                    </p>

                    <p className="font-display text-xl font-black text-emerald-400">
                      { item.priceLabel }
                    </p>
                    <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-red-400 hover:bg-red-500/20 transition"
                    >
                        <Trash2 size={12} />
                        
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 pt-5 border-t border-white/10 flex items-end justify-between gap-4">
              <div className="text-[10px] uppercase tracking-[0.32em] text-bone-400 font-bold">
                Total panier
              </div>

              <div className="font-display text-3xl font-black text-emerald-400">
                {total.toFixed(2).replace('.', ',')} PCC
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md">
                <ShoppingBag size={15} />
                  Payer Maintenant
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}