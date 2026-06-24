import { motion } from 'framer-motion';

// Dock d'actions flottant, vitré et premium. Partagé par les pages club &
// fédération. Deux dispositions automatiques pour ne JAMAIS déborder sur le
// contenu :
//   • < 1536px : dock horizontal centré en bas (façon dock macOS)
//   • ≥ 1536px : rail vertical à gauche (la gouttière est alors assez large)
// Chaque action affiche son libellé en tooltip au survol. Accent = couleur du
// club / de la fédération.
//
// actions : [{ key, icon, label, onClick? }]
export function SideDock({ actions, accent = '#10b981' }) {
  return (
    <div className="pointer-events-none fixed z-40 inset-x-0 bottom-5 flex justify-center
                    2xl:inset-x-auto 2xl:bottom-auto 2xl:top-1/2 2xl:-translate-y-1/2 2xl:left-5 2xl:justify-start">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex 2xl:flex-col items-center gap-1 p-1.5 rounded-2xl
                   border border-white/10 bg-ink-900/70 backdrop-blur-xl
                   shadow-[0_8px_40px_-8px_rgba(0,0,0,0.75)] ring-1 ring-inset ring-white/5"
      >
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              type="button"
              onClick={a.onClick}
              aria-label={a.label}
              title={a.label}
              className="group relative grid h-11 w-11 place-items-center rounded-xl
                         text-bone-300 hover:text-white cursor-pointer
                         transition-colors duration-200 outline-none
                         focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {/* Fond teinté qui apparaît au survol / focus */}
              <span
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                           group-focus-visible:opacity-100 transition-opacity duration-200"
                style={{ background: `${accent}26`, boxShadow: `inset 0 0 0 1px ${accent}66` }}
                aria-hidden
              />
              <Icon size={18} strokeWidth={2.2} className="relative" />

              {/* Libellé en tooltip — au-dessus en mode bas, à droite en mode rail */}
              <span
                className="pointer-events-none absolute z-10 whitespace-nowrap
                           text-[10px] font-bold uppercase tracking-[0.16em]
                           px-2.5 py-1.5 rounded-lg bg-ink-800/95 text-bone-50
                           border border-white/10 shadow-xl backdrop-blur-sm
                           opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                           group-focus-visible:opacity-100 transition-all duration-200
                           bottom-full mb-2 left-1/2 -translate-x-1/2
                           2xl:bottom-auto 2xl:mb-0 2xl:left-full 2xl:ml-3 2xl:translate-x-0
                           2xl:top-1/2 2xl:-translate-y-1/2"
              >
                {a.label}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
