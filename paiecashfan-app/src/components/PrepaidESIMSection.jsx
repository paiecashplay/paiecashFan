import { motion } from 'framer-motion';
import { CreditCard, Smartphone, ArrowRight, Globe2, Zap, Shield } from 'lucide-react';
import { Container } from './ui/Container';

const cards = [
  {
    id: 'prepaid',
    icon: CreditCard,
    title: 'Cartes Prépayées PaieCash',
    tagline: 'Jusqu’à 10 % cashback · Sans frais · Instantané',
    cta: 'Commander',
    accent: 'indigo',
    features: [
      { icon: Zap,     text: 'Activation immédiate' },
      { icon: Shield,  text: 'Sans découvert ni frais cachés' }
    ]
  },
  {
    id: 'esim',
    icon: Smartphone,
    title: 'eSIM PaieCash',
    tagline: '120+ pays · 4G/5G · Activation QR instantanée',
    cta: 'Découvrir',
    accent: 'cyan',
    features: [
      { icon: Globe2, text: '120+ destinations' },
      { icon: Zap,    text: 'Pas de carte physique' }
    ]
  }
];

const accents = {
  indigo: {
    iconBg:   'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
    glow:     'group-hover:shadow-glow-indigo',
    border:   'hover:border-indigo-500/40',
    btn:      'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500'
  },
  cyan: {
    iconBg:   'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
    glow:     'group-hover:shadow-glow-cyan',
    border:   'hover:border-cyan-500/40',
    btn:      'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500'
  }
};

export function PrepaidESIMSection() {
  return (
    <section className="relative py-16 md:py-20">
      <Container>
        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {cards.map((c, i) => {
            const Icon = c.icon;
            const a = accents[c.accent];
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className={`group relative rounded-2xl border border-white/10 glass-strong overflow-hidden transition-all duration-300 ${a.border} ${a.glow}`}
              >
                <div className="relative flex items-center gap-6 p-6 md:p-7">
                  <div className={`shrink-0 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl ring-1 transition-transform group-hover:scale-110 ${a.iconBg}`}>
                    <Icon size={26} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg md:text-xl font-bold text-bone-50">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-bone-300 leading-snug">
                      {c.tagline}
                    </p>
                  </div>

                  <button className={`shrink-0 hidden sm:inline-flex items-center gap-2 h-11 px-6 rounded-full text-xs font-bold uppercase tracking-[0.12em] text-white transition-all duration-200 ${a.btn}`}>
                    {c.cta}
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* Feature pills (mobile shows as row) */}
                <div className="hidden md:flex border-t border-white/5 px-6 md:px-7 py-3 gap-4">
                  {c.features.map((f) => {
                    const Fi = f.icon;
                    return (
                      <span key={f.text} className="inline-flex items-center gap-1.5 text-xs text-bone-400">
                        <Fi size={12} className="opacity-70" />
                        {f.text}
                      </span>
                    );
                  })}
                </div>

                {/* Halos décoratifs */}
                <div className={`pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-20 ${c.accent === 'indigo' ? 'bg-indigo-500' : 'bg-cyan-500'}`} />
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
