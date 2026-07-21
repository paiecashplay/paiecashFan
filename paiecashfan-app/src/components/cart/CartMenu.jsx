import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Wallet, CreditCard, Layers, CalendarClock, Loader2, X, Minus, Plus, MapPin, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { PccRechargeModal } from '@/components/wallet/PccRechargeModal';

const PAY_MODES = [
  { id: 'pcc_full',  label: 'PCC',    icon: Wallet,        cta: 'Payer en PCC' },
  { id: 'card_full', label: 'Carte',  icon: CreditCard,    cta: 'Payer par carte' },
  { id: 'pcc_split', label: 'PCC+CB',  icon: Layers,       cta: 'Payer (PCC + carte)' },
  { id: 'bnpl',      label: '3×/4×',   icon: CalendarClock, cta: 'Payer en 3× / 4×' },
];
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));

// Icône panier + popup mini-panier (checkout complet). Global : accessible
// partout via la navbar, et ouvrable depuis la boutique (contexte `open`).
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

  // Pas d'article → pas d'icône panier.
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

      {open && <CartPopup cart={cart} />}
    </div>
  );
}

function CartPopup({ cart }) {
  const { items, club, totalPrice, totalEur, updateQty, removeItem, clear, closeCart } = cart;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('pcc_full');
  const [status, setStatus] = useState('idle');   // idle | paying
  const [payError, setPayError] = useState('');
  const [topUp, setTopUp] = useState(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const activeMode = PAY_MODES.find((m) => m.id === mode) || PAY_MODES[0];

  function openCheckout() {
    if (!user) { setPayError('Connecte-toi pour commander.'); return; }
    if (!items.length) return;
    setPayError(''); setTopUp(null);
    setShippingOpen(true);
  }

  async function pay(shipping) {
    setPayError(''); setTopUp(null); setStatus('paying');
    try {
      const res = await apiFetch('/api/v2/checkout/boutique', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size || null })),
          mode, origin: window.location.origin, shipping,
        }),
      });
      if (res?.data?.redirect) { window.location.href = res.data.redirect; return; }
      await clear();
      setStatus('idle'); setShippingOpen(false); closeCart();
      navigate('/mon-compte');
    } catch (err) {
      const msg = err?.message || 'Paiement impossible pour le moment.';
      if (/insuffisant|wallet|recharge/i.test(msg)) { setTopUp({ message: msg, found: err?.data?.found }); setShippingOpen(false); }
      else setPayError(msg);
      setStatus('idle');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="font-display text-sm font-black uppercase tracking-wider text-bone-50">
          Panier{club?.name ? ` · ${club.name}` : ''}
        </span>
        <button onClick={() => clear()} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-bone-500 hover:text-rose-400">
          <Trash2 size={11} /> Vider
        </button>
      </div>

      {/* Articles */}
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

      {/* Mode de paiement */}
      <div className="px-4 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {PAY_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = m.id === mode;
            return (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition ${isActive ? 'bg-emerald-400 text-ink-900' : 'bg-white/[0.04] border border-white/10 text-bone-300 hover:text-bone-50'}`}>
                <Icon size={12} /> {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {topUp && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
          <p className="text-xs text-amber-200">{topUp.message || 'Solde PCC insuffisant.'}</p>
          <button onClick={() => setRechargeOpen(true)} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink-900 hover:bg-amber-300">
            <Wallet size={12} /> Recharger
          </button>
        </div>
      )}
      {payError && <p className="mx-4 mt-2 text-xs text-rose-300">{payError}</p>}

      {/* Total + payer */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.2em] text-bone-500 font-bold">Total</p>
          <p className="font-display text-xl font-black text-emerald-400 tabular-nums leading-none">{fmt(totalPrice)} PCC</p>
          <p className="text-[11px] text-bone-500">{fmt(totalEur)} €</p>
        </div>
        <button onClick={openCheckout} disabled={status === 'paying' || !user}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 transition disabled:opacity-60">
          {status === 'paying'
            ? <><Loader2 size={13} className="animate-spin" /> {mode === 'pcc_full' ? 'Paiement…' : 'Redirection…'}</>
            : <><ShoppingBag size={13} /> {activeMode.cta}</>}
        </button>
      </div>
      {!user && <p className="px-4 pb-3 text-center text-[11px] text-bone-500">Connecte-toi pour commander.</p>}

      {shippingOpen && (
        <ShippingModal totalPcc={totalPrice} cta={activeMode.cta} paying={status === 'paying'} error={payError}
          onSubmit={pay} onClose={() => { if (status !== 'paying') setShippingOpen(false); }} />
      )}
      {rechargeOpen && (
        <PccRechargeModal email={user?.email} found={topUp?.found}
          reason={topUp?.message || 'Ton solde PCC est insuffisant pour ce paiement.'} onClose={() => setRechargeOpen(false)} />
      )}
    </motion.div>
  );
}

// Modale d'adresse de livraison (produits physiques).
function ShippingModal({ totalPcc, cta, paying, error, onSubmit, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', address1: '', address2: '', postalCode: '', city: '', country: 'France' });
  const [localError, setLocalError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit() {
    setLocalError('');
    if (!form.name || !form.address1 || !form.postalCode || !form.city) { setLocalError('Nom, adresse, code postal et ville sont obligatoires.'); return; }
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2"><MapPin size={18} className="text-emerald-400" /><h3 className="font-display text-lg font-black uppercase text-bone-50">Adresse de livraison</h3></div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>
        <p className="mt-1.5 text-xs text-bone-400">On t'enverra ta commande à cette adresse.</p>
        <div className="mt-4 space-y-2.5">
          <ShipField label="Nom complet *" value={form.name} onChange={set('name')} />
          <ShipField label="Adresse *" value={form.address1} onChange={set('address1')} />
          <ShipField label="Complément (optionnel)" value={form.address2} onChange={set('address2')} />
          <div className="grid grid-cols-2 gap-2.5">
            <ShipField label="Code postal *" value={form.postalCode} onChange={set('postalCode')} />
            <ShipField label="Ville *" value={form.city} onChange={set('city')} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <ShipField label="Pays" value={form.country} onChange={set('country')} />
            <ShipField label="Téléphone (optionnel)" value={form.phone} onChange={set('phone')} />
          </div>
        </div>
        {(localError || error) && <p className="mt-3 text-sm text-rose-300">{localError || error}</p>}
        <button onClick={submit} disabled={paying}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-ink-900 hover:bg-emerald-300 transition disabled:opacity-60">
          {paying ? <><Loader2 size={14} className="animate-spin" /> Traitement…</> : <><ShoppingBag size={14} /> {cta} · {fmt(totalPcc)} PCC</>}
        </button>
      </motion.div>
    </div>
  );
}

function ShipField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">{label}</span>
      <input value={value} onChange={onChange} className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50" />
    </label>
  );
}
