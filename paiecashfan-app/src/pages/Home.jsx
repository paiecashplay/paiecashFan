import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Placeholder Home — sera étoffée à la Phase B :
//   - Barre de recherche d'équipe/club/fédération
//   - Cartes prépayées + eSIM côte-à-côte
//   - Onglets Football France / Autres Sports / Football Européen / Fédérations
//   - Grille de clubs Ligue 1 connectée à /api/federations
//   - Sections piliers (Co-streaming, Tombola, Boutique, Fan club)
// Pour l'instant on a juste le Hero pour valider que le scaffolding tourne.
export function Home() {
  return (
    <section className="relative overflow-hidden tech-backdrop">
      <Container className="relative pt-16 md:pt-24 pb-32 md:pb-44 text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } }
          }}
          className="flex flex-col items-center"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
          >
            <Badge variant="indigo">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              Saison 2026 — Plateforme live
            </Badge>
          </motion.div>

          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 24 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="mt-8 font-display text-display-2xl font-bold leading-[0.92] tracking-tight text-bone-50"
          >
            Connectez-vous à votre
            <br />
            <span className="text-gradient-hero">équipe préférée.</span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 16 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.7 } }
            }}
            className="mt-7 max-w-2xl text-lg md:text-xl text-bone-300 leading-relaxed"
          >
            Cartes prépayées, eSIM mondiale, boutiques officielles, tombola quotidienne,
            co-streaming entre fans — du Vélodrome au Stade Mohammed V.
          </motion.p>

          {/* Search placeholder (Phase B = barre de recherche réelle) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.7 } }
            }}
            className="mt-10 w-full max-w-2xl"
          >
            <div className="glass-strong rounded-full flex items-center px-2 pl-6 h-16 shadow-glow-indigo">
              <Search size={18} className="text-bone-400 shrink-0" />
              <input
                type="text"
                placeholder="Rechercher une équipe, un club, une fédération…"
                className="flex-1 bg-transparent border-0 outline-none px-4 text-bone-100 placeholder:text-bone-500 text-base"
              />
              <Button size="md" className="shrink-0">
                Chercher
                <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.7 } }
            }}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-bone-400 font-mono"
          >
            <Stat value="500+" label="clubs partenaires" />
            <Divider />
            <Stat value="125 000" label="fans actifs" />
            <Divider />
            <Stat value="6" label="fédérations" />
          </motion.div>
        </motion.div>
      </Container>

      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[80%] bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-48 w-[60%] bg-cyan-500/15 blur-3xl" />
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-xl font-bold text-bone-100 tabular-nums">{value}</span>
      <span className="text-bone-400">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="h-1 w-1 rounded-full bg-white/10" aria-hidden />;
}
