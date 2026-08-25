import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Clock, PackageCheck, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { apiFetch } from '@/lib/api';
import { useTicketingCart } from '@/hooks/useTicketingCart';
import { OrderSuccessView, OrderFailureView } from '@/components/cart/CheckoutResult';

// Page de retour Stripe (partagée succès / annulation) — MÊME design que le
// checkout PCC (OrderSuccessView / OrderFailureView), pour tous les modes.
// variant="success" : /checkout/success?order=<id> → réconcilie le statut.
// variant="cancel"  : /checkout/cancel?order=<id>  → marque la commande annulée.
export function CheckoutReturn({ variant }) {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const navigate = useNavigate();
  const { clear } = useTicketingCart();

  // 'checking' | 'completed' | 'pending' | 'failed' | 'cancelled' | 'error'
  const [state, setState] = useState(variant === 'cancel' ? 'cancelled' : 'checking');
  const [order, setOrder] = useState(null); // { orderId, totalPcc, reference, ... }
  const cartCleared = useRef(false);

  useEffect(() => {
    if (variant !== 'cancel' || !orderId) return;
    apiFetch('/api/v2/checkout/cancel', { method: 'POST', body: JSON.stringify({ order: orderId }) }).catch(() => {});
  }, [variant, orderId]);

  useEffect(() => {
    if (variant !== 'success') return;
    if (!orderId) { setState('error'); return; }

    let alive = true;
    let attempts = 0;
    const MAX = 12; // ~30 s (12 × 2,5 s)

    const poll = async () => {
      if (!alive) return;
      attempts += 1;
      try {
        const res = await apiFetch(`/api/v2/checkout/status?order=${encodeURIComponent(orderId)}`);
        const st = res?.data?.status;
        if (res?.data?.order) setOrder(res.data.order);
        if (st === 'completed') {
          if (!cartCleared.current) { clear(); cartCleared.current = true; }
          setState('completed');
          return;
        }
        if (st === 'failed') { setState('failed'); return; }
      } catch { /* on retente */ }
      if (attempts >= MAX) { setState('pending'); return; }
      setTimeout(poll, 2500);
    };
    poll();
    return () => { alive = false; };
  }, [variant, orderId, clear]);

  const amountPcc = Number(order?.totalPcc || 0);
  const frame = 'overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#090b10] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]';
  // Boutique d'origine (mémorisée avant la redirection Stripe) → « Continuer mes achats ».
  const returnBoutique = (() => { try { return sessionStorage.getItem('pcf_return_boutique') || ''; } catch { return ''; } })();
  const continueTo = returnBoutique ? `/clubs/${returnBoutique}` : '/';

  // — États transitoires (vérification / en attente) : carte simple —
  if (state === 'checking' || state === 'pending') {
    return (
      <Container className="py-16 md:py-24">
        <div className={`mx-auto max-w-md p-8 text-center ${frame}`}>
          {state === 'checking' ? (
            <>
              <Loader2 className="mx-auto animate-spin text-emerald-400" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Vérification du paiement…</h1>
              <p className="mt-3 text-sm text-bone-400">On confirme ta transaction avec PaieCashCoin, un instant.</p>
            </>
          ) : (
            <>
              <Clock className="mx-auto text-amber-400" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Paiement en cours</h1>
              <p className="mt-3 text-sm text-bone-400">Ta transaction se confirme. Ta commande apparaîtra dans ton compte dès validation.</p>
              <button onClick={() => navigate('/mon-compte')} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300">Aller à mon compte</button>
            </>
          )}
        </div>
      </Container>
    );
  }

  // — Succès —
  if (state === 'completed') {
    return (
      <Container className="py-10 md:py-14">
        <div className={`mx-auto max-w-4xl ${frame}`}>
          <OrderSuccessView
            amountPcc={amountPcc} order={order}
            subtitle="Merci ! Ton paiement a bien été validé. Retrouve le suivi dans « Mes commandes »."
            actions={<>
              <button onClick={() => navigate('/mon-compte')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"><PackageCheck size={15} /> Voir mes commandes <ArrowRight size={14} /></button>
              <button onClick={() => navigate(continueTo)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-bone-200 transition hover:text-bone-50"><ShoppingBag size={15} /> Continuer mes achats</button>
            </>}
          />
        </div>
      </Container>
    );
  }

  // — Annulation —
  if (state === 'cancelled') {
    return (
      <Container className="py-10 md:py-14">
        <div className={`mx-auto max-w-4xl ${frame}`}>
          <OrderFailureView
            amountPcc={amountPcc}
            title="Paiement annulé"
            subtitle="Tu as annulé le paiement. Ton panier est conservé, tu peux réessayer quand tu veux."
            actions={<>
              <button onClick={() => navigate('/panier')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"><ArrowLeft size={15} /> Retour au panier</button>
              <button onClick={() => navigate('/')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-bone-200 transition hover:text-bone-50"><ShoppingBag size={15} /> Continuer</button>
            </>}
          />
        </div>
      </Container>
    );
  }

  // — Échec / erreur —
  return (
    <Container className="py-10 md:py-14">
      <div className={`mx-auto max-w-4xl ${frame}`}>
        <OrderFailureView
          amountPcc={amountPcc}
          subtitle="Le paiement n'a pas pu être finalisé. Aucun montant n'a été débité."
          onRetry={() => navigate('/panier')}
          onSupport={() => { window.location.href = 'mailto:contact@paiecashfan.com'; }}
          actions={<>
            <button onClick={() => navigate('/panier')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-bone-200 transition hover:text-bone-50"><ArrowLeft size={15} /> Retour au panier</button>
            <button onClick={() => navigate('/mon-compte')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"><PackageCheck size={15} /> Voir mes commandes</button>
          </>}
        />
      </div>
    </Container>
  );
}
