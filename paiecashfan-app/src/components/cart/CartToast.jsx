import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Toast discret « article ajouté au panier ». N'ouvre PAS de popup, ne bloque
// pas l'UI, se ferme seul (~2.8s), ne couvre pas la navbar (top-24).
export function CartToast() {
  const { lastAdded, clearLastAdded } = useCart();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!lastAdded) return undefined;
    setItem(lastAdded);
    const t = setTimeout(() => setItem(null), 2800);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const close = () => { setItem(null); clearLastAdded(); };

  return (
    <AnimatePresence onExitComplete={clearLastAdded}>
      {item && (
        <motion.div
          role="status" aria-live="polite"
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[95] left-4 right-4 bottom-5 sm:left-auto sm:right-5 sm:bottom-auto sm:top-24 sm:w-[360px] rounded-2xl border border-emerald-400/20 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
              {item.image
                ? <img src={item.image} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                : <ShoppingBag size={18} className="text-bone-500" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-400">
                <CheckCircle2 size={13} /> Article ajouté au panier
              </p>
              <p className="mt-1 text-sm font-bold text-bone-100 truncate">{item.name || 'Article'}</p>
              <p className="text-[11px] text-bone-500">{item.size ? `Taille ${item.size} · ` : ''}Quantité {item.qty}</p>
            </div>
            <button onClick={close} aria-label="Fermer" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-bone-500 hover:text-bone-200"><X size={14} /></button>
          </div>

          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => { close(); navigate('/panier'); }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-400 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300"
            >
              Voir le panier <ArrowRight size={12} />
            </button>
            <button
              onClick={close}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-bone-300 hover:text-bone-50"
            >
              Continuer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
