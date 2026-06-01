import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { HeroFuturist } from '@/components/HeroFuturist';
import { HeroSearch } from '@/components/HeroSearch';
import { PrepaidESIMSection } from '@/components/PrepaidESIMSection';
import { CategoryTabs } from '@/components/CategoryTabs';
import { CategoryContent } from '@/components/CategoryContent';

export function Home() {
  const [activeCategory, setActiveCategory] = useState('fr');

  return (
    <>
      {/* ── HERO FUTURISTE avec joueur, cycling word et cards flottantes ── */}
      <HeroFuturist />

      {/* ── BARRE DE RECHERCHE (section dédiée pour rester accessible) ── */}
      <section className="relative py-12 md:py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-bone-50">
                Trouvez votre club
              </h2>
              <p className="mt-1 text-sm text-bone-400 font-body">
                Plus de 500 clubs partenaires, 6 fédérations, des milliers d'équipes
              </p>
            </div>
            <HeroSearch />
          </motion.div>
        </Container>
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-[60%] bg-emerald-500/10 blur-3xl" />
      </section>

      {/* ── CARTES PRÉPAYÉES + eSIM ─────────────────── */}
      <PrepaidESIMSection />

      {/* ── ONGLETS CATÉGORIES ──────────────────────── */}
      <div id="tabs">
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* ── CONTENU (clubs / fédés / events) ────────── */}
      <CategoryContent active={activeCategory} />
    </>
  );
}
