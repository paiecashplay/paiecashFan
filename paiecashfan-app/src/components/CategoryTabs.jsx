import { motion } from 'framer-motion';
import { Container } from './ui/Container';
import { cn } from '@/lib/cn';
import { categories } from '@/data/leagues';

export function CategoryTabs({ active, onChange }) {
  return (
    <section className="relative">
      <Container>
        <div className="relative">
          {/* Scrollable on mobile */}
          <div className="overflow-x-auto -mx-2 px-2 scrollbar-none mask-fade-x">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => {
                const isActive = active === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onChange(cat.id)}
                    className={cn(
                      'relative shrink-0 inline-flex items-center gap-2.5 h-12 px-5 rounded-full',
                      'text-sm font-semibold transition-colors duration-200',
                      isActive ? 'text-ink-900' : 'text-bone-300 hover:text-bone-50'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="category-pill"
                        className="absolute inset-0 rounded-full bg-gradient-hero shadow-glow-indigo"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!isActive && (
                      <span className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur" />
                    )}
                    <span className="relative z-10 text-base leading-none">{cat.icon}</span>
                    <span className="relative z-10">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
