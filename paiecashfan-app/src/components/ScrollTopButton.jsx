import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

// Bouton flottant « retour en haut » : apparaît une fois la page scrollée,
// remonte en douceur au clic. Style verre sombre + accent émeraude (cohérent
// avec le SideDock). Positionné en bas à droite, relevé au-dessus du dock
// mobile (< sm) pour ne pas le chevaucher.
export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Remonter en haut"
          title="Remonter en haut"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="fixed right-4 bottom-24 sm:bottom-6 z-30 grid h-11 w-11 place-items-center rounded-full
                     border border-emerald-500/30 bg-ink-900/80 backdrop-blur-xl text-emerald-400
                     shadow-[0_8px_30px_-6px_rgba(0,0,0,0.7)]
                     hover:bg-emerald-500 hover:text-ink-900 hover:border-emerald-400
                     transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
        >
          <ArrowUp size={18} strokeWidth={2.6} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
