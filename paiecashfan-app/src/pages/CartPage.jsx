import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, Truck,
  BadgeCheck, RotateCcw, Lock, Ticket, Headphones, Tag,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
const STEPS = ['Panier', 'Livraison', 'Paiement', 'Confirmation'];

export function CartPage() {
  const { items, club, totalItems, totalPrice, totalEur, updateQty, removeItem, openCheckout } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (!user) return;
    apiFetch('/api/v2/me/pcc').then((j) => setBalance(j.data?.balance ?? null)).catch(() => {});
  }, [user]);

  const shopHref = club?.slug ? `/clubs/${club.slug}` : '/boutique';

  if (!items.length) {
    return (
      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-ink-900/50 p-10 text-center">
            <ShoppingBag className="mx-auto text-bone-600" size={40} />
            <h1 className="mt-4 font-display text-2xl font-black uppercase text-bone-50">Ton panier est vide</h1>
            <p className="mt-2 text-sm text-bone-400">Découvre les boutiques officielles des clubs.</p>
            <Link to="/boutique" className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300">
              <ShoppingBag size={14} /> Voir la boutique
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <Container>
        {/* En-tête + étapes */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight text-bone-50 sm:text-5xl">Votre panier</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-bone-400"><ShieldCheck size={13} className="text-emerald-400" /> Paiement 100% sécurisé en <span className="font-bold text-emerald-400">PaieCashCoin (PCC)</span></p>
          </div>
          <Stepper current={0} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Colonne articles */}
          <div>
            <div className="rounded-3xl border border-white/10 bg-ink-900/40 p-2 sm:p-4">
              <p className="px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-bone-500 font-black">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
              <div className="divide-y divide-white/5">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 p-3">
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                      {it.image ? <img src={it.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ShoppingBag size={20} className="text-bone-500" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-black text-bone-50 truncate">{it.name || 'Article'}</p>
                      {it.size && <p className="mt-0.5 text-xs text-bone-400">Taille : {it.size}</p>}
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> En stock</p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink-900/60 p-1">
                      <button onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))} aria-label="Diminuer" className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Minus size={12} /></button>
                      <span className="min-w-[1.75rem] text-center text-sm font-mono font-bold text-bone-50">{it.quantity}</span>
                      <button onClick={() => updateQty(it.id, it.quantity + 1)} aria-label="Augmenter" className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"><Plus size={12} /></button>
                    </div>
                    <div className="w-24 text-right shrink-0">
                      <p className="font-display text-base font-black text-emerald-400 tabular-nums">{fmt(it.total_pcc)} PCC</p>
                      <p className="text-[11px] text-bone-500 tabular-nums">{fmt(it.total_eur)} €</p>
                    </div>
                    <button onClick={() => removeItem(it.id)} aria-label="Retirer" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-bone-500 hover:text-rose-400"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>

              {/* Code promo */}
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-2">
                <Tag size={15} className="ml-2 text-bone-400" />
                <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Code promo" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-bone-100 outline-none placeholder:text-bone-500" />
                <button onClick={() => setPromoMsg(promo ? 'Codes promo bientôt disponibles.' : '')}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50">Appliquer</button>
              </div>
              {promoMsg && <p className="px-3 pt-2 text-xs text-amber-300">{promoMsg}</p>}
            </div>

            <Link to={shopHref} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-bone-200 hover:text-bone-50">
              <ArrowLeft size={14} /> Continuer mes achats
            </Link>
          </div>

          {/* Récapitulatif */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-[10px] uppercase tracking-[0.24em] text-bone-400 font-black">Récapitulatif</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-bone-400">Sous-total ({totalItems} art.)</span>
                  <div className="text-right"><span className="font-black text-bone-50">{fmt(totalPrice)} PCC</span><span className="block text-[11px] text-bone-600">{fmt(totalEur)} €</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-bone-400">Livraison</span>
                  <span className="font-black text-emerald-400">Gratuit</span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
                <span className="text-xs uppercase tracking-[0.2em] text-bone-400 font-black">Total <span className="text-bone-600">PCC</span></span>
                <div className="text-right"><p className="font-display text-2xl font-black text-emerald-400 tabular-nums leading-none">{fmt(totalPrice)} PCC</p><p className="mt-1 text-xs text-bone-500">{fmt(totalEur)} €</p></div>
              </div>

              <button onClick={openCheckout} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-4 text-xs font-black uppercase tracking-[0.16em] text-ink-900 transition hover:bg-emerald-300">
                <Lock size={14} /> Passer commande <ArrowRight size={14} />
              </button>
              <p className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-[11px] text-bone-500"><ShieldCheck size={13} className="text-emerald-400" /> Paiement 100% sécurisé</p>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <Perk icon={Truck} title="Livraison rapide" text="4 à 6 jours ouvrés" />
                <Perk icon={BadgeCheck} title="Produits officiels" text="100% authentiques" />
                <Perk icon={RotateCcw} title="Retour facile" text="30 jours pour changer d'avis" />
              </div>
            </div>

            {/* Solde PCC */}
            {user && balance != null && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-black">Mon solde PaieCashCoin</p>
                  <p className="mt-1 font-display text-2xl font-black text-emerald-400 tabular-nums">{fmt(balance)} PCC</p>
                  <p className="text-xs text-bone-500">≈ {fmt(balance)} €</p>
                </div>
                <img src="/paiecashfan-logo.webp" alt="PaieCashFan" className="h-14 w-14 shrink-0 rounded-2xl shadow-glow-emerald" />
              </div>
            )}
          </aside>
        </div>

        {/* Bandeau réassurance */}
        <div className="mt-10 grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-ink-900/40 p-5 sm:grid-cols-3">
          <Engage icon={Lock} title="Paiement sécurisé" text="Crypté et protégé" />
          <Engage icon={Ticket} title="Monnaie officielle" text="PaieCashCoin (PCC)" />
          <Engage icon={Headphones} title="Support dédié" text="À votre écoute 7j/7" />
        </div>
      </Container>
    </section>
  );
}

function Stepper({ current }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${active ? 'bg-emerald-400 text-ink-900' : 'bg-white/5 text-bone-500'}`}>{i + 1}</span>
              <span className={`hidden text-[11px] font-bold uppercase tracking-wider sm:inline ${active ? 'text-bone-50' : 'text-bone-500'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-white/10 sm:w-8" />}
          </div>
        );
      })}
    </div>
  );
}

function Perk({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-emerald-400"><Icon size={16} /></span>
      <div><p className="text-sm font-bold text-bone-100">{title}</p><p className="text-xs text-bone-500">{text}</p></div>
    </div>
  );
}

function Engage({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={18} className="text-emerald-400" />
      <div><p className="text-sm font-bold text-bone-100">{title}</p><p className="text-xs text-bone-500">{text}</p></div>
    </div>
  );
}
