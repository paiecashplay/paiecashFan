import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Ticket,
  CalendarDays,
  Check,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Wallet,
  Loader2,
  AlertCircle,
  CreditCard,
  Layers,
  CalendarClock
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useClubDetail } from '@/hooks/useClubDetail';
import { useTicketingCart } from '@/hooks/useTicketingCart';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { formatPCC } from '@/data/clubMerchandise';
import { buildDefaultTicketing } from '@/utils/ticketingPrices';

const PCC_APP_URL = import.meta.env.VITE_PAIECASHCOIN_URL || 'https://www.paiecashcoin.com';

const PAY_MODES = [
  { id: 'pcc_full',  label: 'PCC',         icon: Wallet,        cta: 'Payer en PCC',           hint: 'Débit direct de ton solde PCC disponible.' },
  { id: 'card_full', label: 'Carte',       icon: CreditCard,    cta: 'Payer par carte',        hint: 'Paiement carte sécurisé via Stripe.' },
  { id: 'pcc_split', label: 'PCC + carte', icon: Layers,        cta: 'Payer (PCC + carte)',    hint: 'Ton solde PCC couvre une partie, la carte le reste.' },
  { id: 'bnpl',      label: '3× / 4×',     icon: CalendarClock, cta: 'Payer en 3× / 4×',       hint: 'Paiement fractionné (Klarna / Afterpay selon éligibilité).' },
];

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
  const navigate = useNavigate();
  const { club, loading } = useClubDetail(slug);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const { cart, addItem, removeItem, clear } = useTicketingCart();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Offres : saisies dans le BO (club.ticketing) ; sinon valeurs par défaut.
  const ticketing = useMemo(() => {
    if (!club) return { subscriptions: [], tickets: [] };
    return club.ticketing || buildDefaultTicketing(club);
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
                    À partir de {offer.price} PCC{offer.price_eur ? ` · ${offer.price_eur} €` : ''}
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
            onAddToCart={(item) => addItem({ ...item, clubSlug: slug })}
        />
       )}

       {isCartOpen && (
        <TicketingCartModal
            cart={cart}
            onClose={() => setIsCartOpen(false)}
            onRemoveItem={(indexToRemove) => removeItem(indexToRemove)}
            onClearCart={clear}
            navigate={navigate}
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
  const unitEur = Number(offer.price_eur) || 0;
  const totalEur = isSubscription ? unitEur : unitEur * qty;

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

              <div className="text-right">
                <div className="font-display text-3xl font-black text-emerald-400 tabular-nums">
                  {formatPCC(totalPrice)} PCC
                </div>
                {totalEur > 0 && <div className="text-sm text-bone-400 tabular-nums">soit {totalEur.toFixed(2).replace('.', ',')} €</div>}
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
                unitEur,
                quantity: isSubscription ? 1 : qty,
                totalPrice,
                totalEur,
                priceLabel: `${formatPCC(totalPrice)} PCC${totalEur ? ` · ${totalEur.toFixed(2).replace('.', ',')} €` : ''}`,
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


function TicketingCartModal({ cart, onClose, onRemoveItem, onClearCart, navigate }) {
  const { user } = useAuth();
  const total = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const totalEur = cart.reduce((sum, item) => sum + Number(item.totalEur || 0), 0);

  // 'idle' | 'paying' | 'success' — plus messages d'erreur / solde insuffisant.
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [topUp, setTopUp] = useState(null);        // { balance, missing } si solde insuffisant
  const [confirmation, setConfirmation] = useState(null);
  const [mode, setMode] = useState('pcc_full');    // pcc_full | card_full | pcc_split | bnpl

  async function handleCheckout() {
    setError('');
    setTopUp(null);

    if (!user) {
      setError('Connecte-toi pour finaliser ton paiement.');
      return;
    }

    // On n'envoie que { clubSlug, offerId, quantity } : le serveur recalcule les prix.
    const items = cart
      .filter((it) => it.clubSlug)
      .map((it) => ({ clubSlug: it.clubSlug, offerId: it.id, quantity: it.quantity }));

    if (!items.length) {
      setError('Panier invalide, vide-le et rajoute tes billets.');
      return;
    }

    setStatus('paying');
    try {
      const res = await apiFetch('/api/v2/checkout/ticketing', {
        method: 'POST',
        body: JSON.stringify({ items, mode, origin: window.location.origin }),
      });

      // Modes carte/mixte/BNPL → redirection vers Stripe (le panier reste, il
      // sera vidé au retour "success"). Mode PCC → confirmation immédiate.
      if (res?.data?.redirect) {
        window.location.href = res.data.redirect;
        return;
      }

      setConfirmation(res?.data || null);
      setStatus('success');
      onClearCart?.();
    } catch (err) {
      // apiFetch remonte le message backend. On détecte le cas "recharge".
      const msg = err?.message || 'Paiement impossible pour le moment.';
      if (/insuffisant|wallet|recharge/i.test(msg)) {
        setTopUp({ message: msg });
      } else {
        setError(msg);
      }
      setStatus('idle');
    }
  }

  // ── Écran de confirmation après paiement ──────────────────────
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-emerald-400/30 bg-ink-950 p-8 text-center shadow-2xl"
        >
          <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
          <h3 className="mt-4 font-display text-2xl font-black uppercase text-bone-50">
            Paiement confirmé
          </h3>
          <p className="mt-3 text-sm text-bone-300">
            Ton paiement de{' '}
            <span className="font-bold text-emerald-400">
              {Number(confirmation?.totalEur || totalEur).toFixed(2).replace('.', ',')} €
            </span>{' '}
            en PCC a bien été pris en compte.
          </p>

          {Array.isArray(confirmation?.orders) && confirmation.orders.length > 0 && (
            <div className="mt-5 space-y-2 text-left">
              {confirmation.orders.map((o) => (
                <div key={o.reference} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-black text-bone-100">{o.clubName}</p>
                  <p className="mt-1 text-[11px] text-bone-500">Réf. {o.reference}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-2">
            <Button variant="primary" size="md" onClick={() => navigate?.('/mon-compte')}>
              Voir mes commandes
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.18em] font-black text-bone-400 hover:text-bone-100"
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

              <div className="text-right">
                <div className="font-display text-3xl font-black text-emerald-400">
                  {total.toFixed(2).replace('.', ',')} PCC
                </div>
                {totalEur > 0 && <div className="text-sm text-bone-400">soit {totalEur.toFixed(2).replace('.', ',')} €</div>}
              </div>
            </div>

            {/* Choix du mode de paiement */}
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold mb-2">Mode de paiement</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAY_MODES.map((m) => {
                  const Icon = m.icon;
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={[
                        'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11px] font-bold transition-all',
                        active
                          ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                          : 'border-white/10 bg-white/[0.03] text-bone-300 hover:border-white/20',
                      ].join(' ')}
                    >
                      <Icon size={17} className={active ? 'text-emerald-400' : 'text-bone-400'} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-bone-500">{PAY_MODES.find((m) => m.id === mode)?.hint}</p>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {topUp && (
              <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
                <div className="flex items-start gap-2 text-sm text-amber-200">
                  <Wallet size={16} className="mt-0.5 shrink-0" />
                  <span>{topUp.message}</span>
                </div>
                <a
                  href={`${PCC_APP_URL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-ink-900 hover:bg-amber-300 transition"
                >
                  <Wallet size={14} />
                  Recharger mon wallet PCC
                </a>
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
                disabled={status === 'paying'}
              >
                {status === 'paying' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    {mode === 'pcc_full' ? 'Paiement...' : 'Redirection...'}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    {PAY_MODES.find((m) => m.id === mode)?.cta || 'Payer'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}