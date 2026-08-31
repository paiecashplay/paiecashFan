import { Lock, Ticket, Trash2 } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { useTicketingCart } from '@/hooks/useTicketingCart';
import { useCart } from '@/context/CartContext';
import { formatPCC } from '@/data/clubMerchandise';

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

// Section « Billetterie » du panier unifié : liste les billets/abonnements.
// Le paiement se fait dans le modal de checkout commun (openCheckout) — un seul
// règlement pour la billetterie ET la boutique. L'émission Redtaag a lieu après
// encaissement, côté serveur.
export function TicketingCart() {
  const { cart, removeItem } = useTicketingCart();
  const { openCheckout } = useCart();

  const total = cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
  const totalEur = cart.reduce((sum, item) => sum + Number(item.totalEur || 0), 0);

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
                Quantité :{' '}
                <span className="font-bold text-bone-100">{item.quantity}</span>
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

      {/* Total + accès au paiement unifié */}
      <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-bone-400">
            Total billetterie
          </span>
          <p className="font-display text-2xl font-black text-emerald-400">
            {priceText(total, totalEur)}
          </p>
        </div>
        <button
          type="button"
          onClick={openCheckout}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-ink-900 transition hover:bg-emerald-300"
        >
          <Lock size={14} />
          Passer au paiement
        </button>
      </div>

      <p className="mt-3 text-[11px] text-bone-500">
        Billetterie et boutique sont réglées en une seule fois au paiement.
      </p>
    </GlassCard>
  );
}
