import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, ShieldCheck, Truck, Zap, Wallet, CreditCard, Loader2,
  CheckCircle2, ShoppingBag, Lock, User, MapPin, PackageCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { PccRechargeModal } from '@/components/wallet/PccRechargeModal';
import { shippingFee, shippingZone, ZONE_LABEL } from '@/lib/shipping';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const SHIP = { standard: { label: 'Standard', delay: '4 à 6 jours ouvrés' }, express: { label: 'Express', delay: '24-48h' } };
const STEPS = ['Livraison', 'Paiement', 'Confirmation'];

// Grand modal de checkout premium (assistant 3 étapes).
export function CheckoutModal() {
  const cart = useCart();
  const { checkoutOpen, closeCheckout } = cart;

  // Verrou du scroll de la page tant que le modal est ouvert.
  useEffect(() => {
    if (!checkoutOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [checkoutOpen]);

  return (
    <AnimatePresence>
      {checkoutOpen && <CheckoutInner cart={cart} onClose={closeCheckout} />}
    </AnimatePresence>
  );
}

function CheckoutInner({ cart, onClose }) {
  const { items, totalPrice, totalEur, clear } = cart;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);            // 0 Livraison · 1 Paiement · 2 Confirmation
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: user?.email || '', phone: '',
    address1: '', address2: '', postalCode: '', city: '', country: 'France',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [payMethod, setPayMethod] = useState('pcc');   // pcc | card
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [topUp, setTopUp] = useState(null);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(null);    // snapshot pour l'écran de confirmation

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const feePcc = shippingFee(form.country, shippingMethod);   // frais selon la zone (pays)
  const grandPcc = totalPrice + feePcc;
  const grandEur = totalEur + feePcc;

  const infoOk = form.firstName && form.lastName && form.email && form.address1 && form.postalCode && form.city;

  function goNext() {
    setError('');
    if (!infoOk) { setError('Renseigne tes informations et ton adresse (champs *).'); return; }
    setStep(1);
  }

  async function submitOrder() {
    setError(''); setTopUp(null); setPaying(true);
    try {
      const res = await apiFetch('/api/v2/checkout/boutique', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, size: i.size || null })),
          mode: payMethod === 'card' ? 'card_full' : 'pcc_full',
          shippingMethod,
          origin: window.location.origin,
          shipping: {
            firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone,
            address1: form.address1, address2: form.address2, postalCode: form.postalCode, city: form.city, country: form.country,
          },
        }),
      });
      if (res?.data?.redirect) { window.location.href = res.data.redirect; return; }
      // PCC → payé immédiatement : on fige le récap puis on vide le panier.
      setConfirmed({ items: [...items], feePcc, grandPcc, grandEur });
      await clear();
      setStep(2); setPaying(false);
    } catch (err) {
      const msg = err?.message || 'Paiement impossible pour le moment.';
      if (/insuffisant|wallet|recharge/i.test(msg)) setTopUp({ message: msg, found: err?.data?.found });
      else setError(msg);
      setPaying(false);
    }
  }

  const summaryItems = confirmed?.items || items;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={paying ? undefined : onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative flex h-full w-full flex-col overflow-hidden border border-white/[0.06] bg-[#090b10] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] sm:h-[85vh] sm:max-h-[85vh] sm:w-[1100px] sm:max-w-[calc(100vw-3rem)] sm:rounded-[28px]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4 sm:px-8">
          <button onClick={step === 0 ? onClose : () => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bone-400 hover:text-bone-100">
            <ArrowLeft size={15} /> Retour
          </button>
          <div className="text-center">
            <h2 className="font-display text-base font-black uppercase tracking-tight text-bone-50 sm:text-lg">Finaliser votre commande</h2>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold"><Lock size={10} /> Commande sécurisée</p>
          </div>
          <button onClick={onClose} disabled={paying} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-bone-400 hover:text-bone-100 disabled:opacity-50"><X size={16} /></button>
        </div>

        {/* Progression */}
        <ProgressSteps step={step} />

        {/* Corps 2 colonnes */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Gauche (formulaire / confirmation) */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:w-[65%]">
            {step === 0 && <StepLivraison form={form} set={set} shippingMethod={shippingMethod} setShippingMethod={setShippingMethod} />}
            {step === 1 && <StepPaiement payMethod={payMethod} setPayMethod={setPayMethod} topUp={topUp} onRecharge={() => setRechargeOpen(true)} form={form} shippingMethod={shippingMethod} />}
            {step === 2 && <StepConfirmation onViewOrder={() => { onClose(); navigate('/mon-compte'); }} onContinue={onClose} email={form.email} />}
            {error && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
          </div>

          {/* Droite (récap sticky) */}
          {step !== 2 && (
            <aside className="shrink-0 border-t border-white/[0.06] bg-white/[0.02] px-5 py-6 sm:px-6 lg:w-[35%] lg:border-l lg:border-t-0">
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-bone-400 font-black">Votre commande</h3>
              <div className="mt-4 space-y-3 max-h-[26vh] overflow-y-auto pr-1">
                {summaryItems.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                      {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ShoppingBag size={16} className="text-bone-500" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-bone-100 truncate">{it.name || 'Article'}</p>
                      <p className="text-[10px] uppercase tracking-wider text-bone-500 font-bold">{it.size ? `Taille ${it.size} · ` : ''}× {it.quantity}</p>
                    </div>
                    <p className="font-display text-sm font-black text-bone-50 tabular-nums">{fmt(it.total_pcc)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                <Row label={`Sous-total (${cart.totalItems} art.)`} value={`${fmt(totalPrice)} PCC`} sub={`${fmt(totalEur)} €`} />
                <Row label="Livraison" value={feePcc ? `${fmt(feePcc)} PCC` : 'Gratuit'} valueCls={feePcc ? '' : 'text-emerald-400'} />
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-bone-400 font-black">Total</span>
                <div className="text-right">
                  <p className="font-display text-2xl font-black text-emerald-400 tabular-nums leading-none">{fmt(grandPcc)} PCC</p>
                  <p className="mt-1 text-xs text-bone-500">{fmt(grandEur)} €</p>
                </div>
              </div>

              <button
                onClick={step === 0 ? goNext : submitOrder}
                disabled={paying || (step === 1 && payMethod !== 'pcc' && payMethod !== 'card')}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink-900 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {paying ? <><Loader2 size={15} className="animate-spin" /> {payMethod === 'card' ? 'Redirection…' : 'Paiement…'}</>
                  : step === 0 ? <>Continuer <ArrowLeft size={15} className="rotate-180" /></>
                  : <><Lock size={14} /> Confirmer ma commande</>}
              </button>
              <button onClick={step === 0 ? onClose : () => setStep(0)} className="mt-2 w-full text-center text-[11px] font-bold uppercase tracking-wider text-bone-500 hover:text-bone-300">
                {step === 0 ? 'Retour au panier' : 'Modifier la livraison'}
              </button>
              <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[10px] text-bone-600"><ShieldCheck size={12} className="text-emerald-400" /> Paiement 100% sécurisé</p>
            </aside>
          )}
        </div>
      </motion.div>

      {rechargeOpen && (
        <PccRechargeModal email={form.email || user?.email} found={topUp?.found}
          reason={topUp?.message || 'Ton solde PCC est insuffisant pour ce paiement.'} onClose={() => setRechargeOpen(false)} />
      )}
    </div>
  );
}

function ProgressSteps({ step }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-b border-white/[0.06] px-5 py-4 sm:gap-4 sm:px-8">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black transition ${done ? 'bg-emerald-400 text-ink-900' : active ? 'bg-emerald-400/20 text-emerald-400 ring-2 ring-emerald-400' : 'bg-white/5 text-bone-500'}`}>
                {done ? <CheckCircle2 size={15} /> : i + 1}
              </span>
              <span className={`hidden text-xs font-bold uppercase tracking-wider sm:inline ${active ? 'text-bone-50' : done ? 'text-emerald-400' : 'text-bone-500'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`h-px w-6 sm:w-12 ${done ? 'bg-emerald-400' : 'bg-white/10'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function StepLivraison({ form, set, shippingMethod, setShippingMethod }) {
  return (
    <div>
      <SectionTitle icon={User} title="Informations personnelles" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom *" value={form.firstName} onChange={set('firstName')} />
        <Field label="Nom *" value={form.lastName} onChange={set('lastName')} />
      </div>
      <Field label="Adresse mail *" type="email" value={form.email} onChange={set('email')} />
      <Field label="Téléphone" value={form.phone} onChange={set('phone')} />

      <SectionTitle icon={MapPin} title="Adresse de livraison" className="mt-7" />
      <Field label="Adresse *" value={form.address1} onChange={set('address1')} />
      <Field label="Complément" value={form.address2} onChange={set('address2')} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Code postal *" value={form.postalCode} onChange={set('postalCode')} />
        <Field label="Ville *" value={form.city} onChange={set('city')} />
      </div>
      <Field label="Pays" value={form.country} onChange={set('country')} />

      <SectionTitle icon={Truck} title="Mode de livraison" className="mt-7" />
      <p className="mb-2 text-[11px] text-bone-500">Zone : <span className="font-bold text-bone-300">{ZONE_LABEL[shippingZone(form.country)]}</span> (selon le pays)</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(() => {
          const std = shippingFee(form.country, 'standard');
          const exp = shippingFee(form.country, 'express');
          return (
            <>
              <RadioCard active={shippingMethod === 'standard'} onClick={() => setShippingMethod('standard')} icon={Truck}
                title="Standard" desc="4 à 6 jours ouvrés" price={std ? `${fmt(std)} PCC` : 'Gratuit'} priceGreen={!std} />
              <RadioCard active={shippingMethod === 'express'} onClick={() => setShippingMethod('express')} icon={Zap}
                title="Express" desc="24-48h" price={exp ? `${fmt(exp)} PCC` : 'Gratuit'} priceGreen={!exp} />
            </>
          );
        })()}
      </div>
    </div>
  );
}

function StepPaiement({ payMethod, setPayMethod, topUp, onRecharge }) {
  return (
    <div>
      <SectionTitle icon={Wallet} title="Mode de paiement" />
      <div className="space-y-3">
        <RadioCard active={payMethod === 'pcc'} onClick={() => setPayMethod('pcc')} icon={Wallet}
          title="PaieCashCoin (PCC)" desc="Débit de ton solde PCC" wide />
        <RadioCard active={payMethod === 'card'} onClick={() => setPayMethod('card')} icon={CreditCard}
          title="Carte bancaire" desc="Paiement carte sécurisé via Stripe" wide />
        <RadioCard active={false} onClick={() => {}} icon={CreditCard} title="PayPal" desc="Bientôt disponible" wide disabled />
      </div>

      {topUp && (
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <p className="text-sm text-amber-200">{topUp.message || 'Solde PCC insuffisant.'}</p>
          <button onClick={onRecharge} className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-amber-300"><Wallet size={13} /> Recharger mon wallet</button>
        </div>
      )}
    </div>
  );
}

function StepConfirmation({ onViewOrder, onContinue, email }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-emerald-400/15 text-emerald-400">
        <PackageCheck size={44} />
      </motion.div>
      <h3 className="mt-6 font-display text-2xl font-black uppercase text-bone-50">Commande confirmée !</h3>
      <p className="mt-3 max-w-sm text-sm text-bone-300">Merci ! Ta commande est enregistrée. Tu recevras le suivi de livraison dans « Mes commandes »{email ? ` et par email (${email})` : ''}.</p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <button onClick={onViewOrder} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300"><PackageCheck size={14} /> Voir ma commande</button>
        <button onClick={onContinue} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-xs font-black uppercase tracking-wider text-bone-200 hover:text-bone-50"><ShoppingBag size={14} /> Continuer mes achats</button>
      </div>
    </div>
  );
}

// ── Éléments UI ──────────────────────────────────────────────
function SectionTitle({ icon: Icon, title, className = '' }) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`}>
      <Icon size={16} className="text-emerald-400" />
      <h3 className="font-display text-sm font-black uppercase tracking-wide text-bone-100">{title}</h3>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="mb-3 block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">{label}</span>
      <input
        type={type} value={value} onChange={onChange}
        className="mt-1.5 h-[58px] w-full rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 text-sm text-bone-100 outline-none transition placeholder:text-bone-600 focus:border-emerald-400/60 focus:bg-emerald-400/[0.03] focus:ring-1 focus:ring-emerald-400/40"
      />
    </label>
  );
}

function RadioCard({ active, onClick, icon: Icon, title, desc, price, priceGreen, wide, disabled }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled}
      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${wide ? 'w-full' : ''} ${
        active ? 'border-emerald-400/60 bg-emerald-400/[0.06]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-emerald-400' : 'border-white/20'}`}>
        {active && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
      </span>
      <Icon size={20} className={active ? 'text-emerald-400' : 'text-bone-400'} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-bone-50">{title}</p>
        <p className="text-xs text-bone-500">{desc}</p>
      </div>
      {price && <span className={`shrink-0 text-sm font-black tabular-nums ${priceGreen ? 'text-emerald-400' : 'text-bone-100'}`}>{price}</span>}
    </button>
  );
}

function Row({ label, value, sub, valueCls = '' }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-bone-400">{label}</span>
      <div className="text-right">
        <span className={`font-bold text-bone-100 ${valueCls}`}>{value}</span>
        {sub && <span className="block text-[11px] text-bone-600">{sub}</span>}
      </div>
    </div>
  );
}
