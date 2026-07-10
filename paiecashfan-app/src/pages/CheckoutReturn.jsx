import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, Clock, Ticket } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { useTicketingCart } from '@/hooks/useTicketingCart';

// Page de retour Stripe (partagée succès / annulation).
// variant="success" : /checkout/success?order=<id> → réconcilie le statut.
// variant="cancel"  : /checkout/cancel?order=<id>  → marque la commande annulée.
export function CheckoutReturn({ variant }) {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const navigate = useNavigate();
  const { clear } = useTicketingCart();

  // 'checking' | 'completed' | 'pending' | 'failed' | 'cancelled' | 'error'
  const [state, setState] = useState(variant === 'cancel' ? 'cancelled' : 'checking');
  const cartCleared = useRef(false);

  // ── Annulation ──────────────────────────────────────────────
  useEffect(() => {
    if (variant !== 'cancel' || !orderId) return;
    apiFetch('/api/v2/checkout/cancel', { method: 'POST', body: JSON.stringify({ order: orderId }) })
      .catch(() => {});
  }, [variant, orderId]);

  // ── Succès : polling de réconciliation ──────────────────────
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

  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-md">
        <GlassCard className="p-8 text-center">
          {state === 'checking' && (
            <>
              <Loader2 className="mx-auto text-emerald-400 animate-spin" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Vérification du paiement…</h1>
              <p className="mt-3 text-sm text-bone-400">On confirme ta transaction avec PaieCashCoin, un instant.</p>
            </>
          )}

          {state === 'completed' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Paiement confirmé</h1>
              <p className="mt-3 text-sm text-bone-300">Ton paiement a bien été validé. Ton billet est disponible dans ton compte.</p>
              <div className="mt-7 flex flex-col gap-2">
                <Button variant="primary" size="md" onClick={() => navigate('/mon-compte')}>
                  <Ticket size={15} /> Voir mes billets
                </Button>
                <Link to="/billetterie" className="text-xs uppercase tracking-[0.18em] font-black text-bone-400 hover:text-bone-100">
                  Retour à la billetterie
                </Link>
              </div>
            </motion.div>
          )}

          {state === 'pending' && (
            <>
              <Clock className="mx-auto text-amber-400" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Paiement en cours</h1>
              <p className="mt-3 text-sm text-bone-400">
                Ta transaction est en cours de confirmation. Ton billet apparaîtra dans ton compte dès validation.
              </p>
              <Button variant="primary" size="md" className="mt-6" onClick={() => navigate('/mon-compte')}>
                Aller à mon compte
              </Button>
            </>
          )}

          {(state === 'failed' || state === 'error') && (
            <>
              <XCircle className="mx-auto text-red-400" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Paiement non abouti</h1>
              <p className="mt-3 text-sm text-bone-400">
                Le paiement n'a pas pu être finalisé. Aucun montant n'a été débité. Tu peux réessayer.
              </p>
              <Link to="/billetterie">
                <Button variant="primary" size="md" className="mt-6">Réessayer</Button>
              </Link>
            </>
          )}

          {state === 'cancelled' && (
            <>
              <XCircle className="mx-auto text-bone-400" size={48} />
              <h1 className="mt-5 font-display text-2xl font-black uppercase text-bone-50">Paiement annulé</h1>
              <p className="mt-3 text-sm text-bone-400">Tu as annulé le paiement. Ton panier est conservé, tu peux réessayer quand tu veux.</p>
              <Link to="/billetterie">
                <Button variant="primary" size="md" className="mt-6">Retour à la billetterie</Button>
              </Link>
            </>
          )}
        </GlassCard>
      </div>
    </Container>
  );
}
