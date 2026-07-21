import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// Icône panier de la navbar : compteur (nombre d'unités) + clic direct vers
// /panier. Plus de mini-popup (parcours e-commerce simple).
export function CartMenu() {
  const cart = useCart();
  const navigate = useNavigate();

  if (!cart.club || cart.totalItems === 0) return null;

  return (
    <button
      onClick={() => navigate('/panier')}
      aria-label={`Ouvrir le panier, ${cart.totalItems} article${cart.totalItems > 1 ? 's' : ''}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-bone-200 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
    >
      <ShoppingBag size={16} />
      {/* Badge = total d'unités, animé à chaque changement */}
      <motion.span
        key={cart.totalItems}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 0.25 }}
        className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-emerald-400 px-1 text-[9px] font-black text-ink-900 shadow-glow-emerald"
      >
        {cart.totalItems > 9 ? '9+' : cart.totalItems}
      </motion.span>
    </button>
  );
}
