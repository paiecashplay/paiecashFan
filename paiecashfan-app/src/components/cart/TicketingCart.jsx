import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Layers,
  Loader2,
  ShoppingBag,
  Ticket,
  Trash2,
  Wallet,
} from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { PccRechargeModal } from '@/components/wallet/PccRechargeModal';
import { useTicketingCart } from '@/hooks/useTicketingCart';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { formatPCC } from '@/data/clubMerchandise';

const PAY_MODES = [
  { id: 'pcc_full', label: 'PCC', icon: Wallet, cta: 'Payer en PCC', hint: 'Débit direct de ton solde PCC disponible.' },
  { id: 'card_full', label: 'Carte', icon: CreditCard, cta: 'Payer par carte', hint: 'Paiement carte sécurisé via Stripe.' },
  { id: 'pcc_split', label: 'PCC + carte', icon: Layers, cta: 'Payer (PCC + carte)', hint: 'Ton solde PCC couvre une partie, la carte le reste.' },
  { id: 'bnpl', label: '5×', icon: CalendarClock, cta: 'Payer en 5×', hint: 'Paiement fractionné (selon éligibilité).' },
];

function getValidPrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function formatEuro(value) {
  const price = getValidPrice(value);
  if (price === null) return '';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// "12 500 PCC · 85,00 €"
function priceText(price, priceEur) {
  const pcc = getValidPrice(price);
  const eur = getValidPrice(priceEur);
  if (pcc === null && eur === null) return 'Voir les tarifs';
  return [
    pcc !== null ? `${formatPCC(pcc)} PCC` : null,
    eur !== null ? `${formatEuro(eur)} €` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

// Section « Billetterie » du panier unifié : circuit d'émission propre
// (checkout /api/v2/checkout/ticketing), distinct de la boutique.
export function TicketingCart() {
  const { cart, removeItem, clear } = useTicketingCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('pcc_full');
  const [status, setStatus] = useState('idle'); // idle | paying | success
  const [error, setError] = useState('');
  const [topUp, setTopUp] = useState(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const total = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const totalEur = cart.reduce((sum, item) => sum + Number(item.totalEur || 0), 0);

  async function handleCheckout() {
    setError('');
    setTopUp(null);

    if (!user) {
      setError('Connecte-toi pour finaliser ton paiement.');
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
      setError('Panier billetterie invalide, vide-le et rajoute tes billets.');
      return;
    }

    setStatus('paying');
    try {
      const response = await apiFetch('/api/v2/checkout/ticketing', {
        method: 'POST',
        body: JSON.stringify({ items, mode, origin: window.location.origin }),
      });

      if (response?.data?.redirect) {
        window.location.href = response.data.redirect;
        return;
      }

      setConfirmation(response?.data || null);
      setStatus('success');
      clear();
    } catch (checkoutError) {
      const message = checkoutError?.message || 'Paiement impossible pour le moment.';
      if (/insuffisant|wallet|recharge/i.test(message)) {
        setTopUp({ message, found: checkoutError?.data?.found });
      } else {
        setError(message);
      }
      setStatus('idle');
    }
  }

  // Succès : confirmation inline.
  if (status === 'success') {
    const confirmedPcc = getValidPrice(confirmation?.totalPcc);
    const confirmedEur = getValidPrice(confirmation?.totalEur);
    return (
      <GlassCard className="border border-emerald-400/30 p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
        <h3 className="mt-3 font-display text-xl font-black uppercase text-bone-50">
          Billetterie confirmée
        </h3>
        <p className="mt-2 text-sm text-bone-300">
          Ton paiement
          {confirmedPcc !== null
            ? ` de ${priceText(confirmedPcc, confirmedEur)}`
            : ''}{' '}
          a bien été pris en compte.
        </p>
        {Array.isArray(confirmation?.orders) && confirmation.orders.length > 0 && (
          <div className="mt-4 space-y-2 text-left">
            {confirmation.orders.map((order) => (
              <div
                key={order.reference}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="text-xs font-black text-bone-100">{order.clubName}</p>
                <p className="mt-1 text-[11px] text-bone-500">Réf. {order.reference}</p>
              </div>
            ))}
          </div>
        )}
        <Button
          variant="primary"
          size="md"
          className="mt-5 w-full justify-center"
          onClick={() => navigate('/mon-compte')}
        >
          Voir mes commandes
        </Button>
      </GlassCard>
    );
  }

  if (!cart.length) return null;

  return (
    <GlassCard className="border border-white/10 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Ticket size={18} className="text-emerald-400" />
          <h2 className="font-display text-xl font-black uppercase text-bone-50">
            Billetterie
          </h2>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-bone-500">
          {cart.length} élément{cart.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Articles */}
      <div className="mt-4 space-y-3">
        {cart.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                {item.type === 'subscription' ? 'Abonnement' : 'Billet'}
              </p>
              <h4 className="mt-1 font-display text-base font-black text-bone-50">
                {item.name}
              </h4>
              <p className="mt-0.5 text-xs text-bone-500">{item.clubName}</p>
              <p className="mt-1.5 text-xs text-bone-400">
                Quantité : <span className="font-bold text-bone-100">{item.quantity}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-bone-500">
                Total
              </p>
              <p className="font-display text-lg font-black text-emerald-400">
                {priceText(item.totalPrice, item.totalEur)}
              </p>
              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label={`Retirer ${item.name}`}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-red-400 transition hover:bg-red-500/20"
              >
                <Trash2 size={12} />
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-bone-400">
          Total billetterie
        </span>
        <p className="text-right font-display text-2xl font-black text-emerald-400">
          {priceText(total, totalEur)}
        </p>
      </div>

      {/* Modes de paiement */}
      <div className="mt-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bone-400">
          Mode de paiement
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAY_MODES.map((paymentMode) => {
            const Icon = paymentMode.icon;
            const active = mode === paymentMode.id;
            return (
              <button
                key={paymentMode.id}
                type="button"
                onClick={() => setMode(paymentMode.id)}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-[11px] font-bold transition-all',
                  active
                    ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-300'
                    : 'border-white/10 bg-white/[0.03] text-bone-300 hover:border-white/20',
                ].join(' ')}
              >
                <Icon size={17} className={active ? 'text-emerald-400' : 'text-bone-400'} />
                {paymentMode.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-bone-500">
          {PAY_MODES.find((paymentMode) => paymentMode.id === mode)?.hint}
        </p>
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
          <button
            type="button"
            onClick={() => setRechargeOpen(true)}
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

      <div className="mt-5 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleCheckout}
          disabled={status === 'paying'}
          className="w-full justify-center sm:w-auto"
        >
          {status === 'paying' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {mode === 'pcc_full' ? 'Paiement…' : 'Redirection…'}
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              {PAY_MODES.find((paymentMode) => paymentMode.id === mode)?.cta || 'Payer'}
            </>
          )}
        </Button>
      </div>

      {rechargeOpen && (
        <PccRechargeModal
          email={user?.email}
          found={topUp?.found}
          reason={topUp?.message || 'Ton solde PCC est insuffisant pour ce paiement.'}
          onClose={() => setRechargeOpen(false)}
        />
      )}
    </GlassCard>
  );
}
