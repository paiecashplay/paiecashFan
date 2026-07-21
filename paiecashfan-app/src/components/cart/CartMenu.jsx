import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));

// Icône panier (navbar) + mini-popup d'aperçu. « Passer commande » ouvre le
// grand modal de checkout premium (CheckoutModal, global).
export function CartMenu() {
  const cart = useCart();
  const { open, toggleCart, closeCart } = cart;
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) closeCart(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, closeCart]);

  if (!cart.club || cart.totalItems === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleCart}
        aria-label="Mon panier"
        title={`Panier — ${cart.totalItems} article${cart.totalItems > 1 ? 's' : ''}`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
      >
        <ShoppingBag size={16} />
        <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-black text-ink-900 shadow-glow-emerald">
          {cart.totalItems > 9 ? '9+' : cart.totalItems}
        </span>
      </button>

      {open && <MiniCart cart={cart} />}
    </div>
  );
}

function MiniCart({ cart }) {
  const { items, club, totalPrice, totalEur, updateQty, removeItem, clear, openCheckout } = cart;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-display text-sm font-black uppercase tracking-wider text-bone-50">Panier{club?.name ? ` · ${club.name}` : ''}</span>
        <button onClick={() => clear()} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-bone-500 hover:text-rose-400"><Trash2 size={11} /> Vider</button>
      </div>

      <div className="max-h-[42vh] overflow-y-auto divide-y divide-white/5">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
              {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ShoppingBag size={16} className="text-bone-500" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-bone-100 truncate">{it.name || 'Article'}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-bone-500 font-bold">
                {it.size && <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-bone-300">{it.size}</span>}
                <span className="font-mono">{fmt(it.unit_price_pcc)} PCC</span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/50 p-0.5">
                <button onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))} className="grid h-5 w-5 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Minus size={10} /></button>
                <span className="min-w-[1.25rem] text-center text-xs font-mono font-bold text-bone-50">{it.quantity}</span>
                <button onClick={() => updateQty(it.id, it.quantity + 1)} className="grid h-5 w-5 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Plus size={10} /></button>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-sm font-black text-emerald-400 tabular-nums">{fmt(it.total_pcc)} PCC</p>
              <button onClick={() => removeItem(it.id)} className="mt-0.5 text-[10px] uppercase tracking-wider text-bone-500 hover:text-rose-400 font-bold">Retirer</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3">
        <div className="flex items-end justify-between">
          <span className="text-[9px] uppercase tracking-[0.2em] text-bone-500 font-bold">Total</span>
          <div className="text-right">
            <p className="font-display text-xl font-black text-emerald-400 tabular-nums leading-none">{fmt(totalPrice)} PCC</p>
            <p className="text-[11px] text-bone-500">{fmt(totalEur)} €</p>
          </div>
        </div>
        <button onClick={openCheckout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 transition">
          Passer commande <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
