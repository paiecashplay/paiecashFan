import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Gift, Check, X, ShoppingBag, Users,
  ShieldCheck, Trophy, Sparkles, Gamepad2, Crown,
  Wallet, ArrowRight
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const CURRENT_DRAW = {
  prizeLabel: 'Maillot signé + 500 PCC',
  subtitle: 'Participe au tirage et tente de remporter ce lot exclusif.',
  endsAt: '2026-06-30T20:00:00',
  ticketPricePcc: 50,
  ticketsSold: 128,
  ticketsTotal: 500,
  image: '/images/products/olympique-de-marseille/home-jersey.png'
};

const GAMES = [
  {
    id: 'bingo-loto',
    name: 'Bingo Loto',
    category: 'Tombola',
    image: '/images/gaming/bingo-loto.png',
    isLive: true,
    price: 25,
    accent: 'from-purple-500/25 to-pink-500/10',
    description: 'Achète une grille, suis le tirage et tente de compléter ta combinaison.',
    benefits: ['Tirage simple', 'Lots PCC', 'Accessible à tous']
  },
  {
    id: '649-lottery',
    name: 'Loterie 6/49 ',
    category: 'Lottery',
    image: '/images/gaming/649-lottery.png',
    isLive: false,
    price: 49,
    accent: 'from-gold-400/25 to-amber-600/10',
    description: 'Sélectionne 6 numéros parmi 49 et participe au tirage.',
    benefits: ['6 numéros', 'Jackpot démo', 'Tirage programmé']
  },
  {
    id: 'fantasy-football',
    name: 'Football Fantasy ',
    category: 'Fantasy',
    image: '/images/gaming/fantasy-football.png',
    isLive: false,
    price: 75,
    accent: 'from-emerald-500/25 to-cyan-500/10',
    description: 'Compose ton équipe virtuelle et gagne des points selon les performances.',
    benefits: ['Choix des joueurs', 'Classement fans', 'Récompenses PCC']
  },
  {
    id: 'player-auction',
    name: 'Vente aux enchères des joueurs',
    category: 'Enchères',
    image: '/images/gaming/player-auction.png',
    isLive: false,
    price: 30,
    accent: 'from-cyan-500/25 to-blue-600/10',
    description: 'Participe à des enchères ludiques pour des lots exclusifs.',
    benefits: ['Lots limités', 'Expérience fan', 'Gameplay rapide']
  },
  {
    id: 'match-predictor',
    name: 'Prédiction de match',
    category: 'Prédiction',
    image: '/images/gaming/match-predictor.png',
    isLive: true,
    price: 20,
    accent: 'from-violet-500/25 to-fuchsia-600/10',
    description: 'Prédis le score ou le résultat d’un match.',
    benefits: ['Score exact', 'Résultat match', 'Bonus supporters']
  },
  {
    id: 'penalty-shootout',
    name: 'Tirs au but',
    category: 'Mini-jeu',
    image: '/images/gaming/penalty-shootout.png',
    isLive: true,
    price: 15,
    accent: 'from-orange-500/25 to-gold-400/10',
    description: 'Choisis ton côté et tente de marquer.',
    benefits: ['Jeu rapide', 'Animation fun', 'Récompense instantanée']
  },
  {
    id: 'pcc-mega-league',
    name: 'Ligue PCC Mega',
    category: 'Compétition',
    image: '/images/gaming/pcc-mega-league.png',
    isLive: false,
    price: 100,
    accent: 'from-emerald-400/25 to-gold-400/10',
    description: 'Participe à une grande ligue PaieCashFan avec classement.',
    benefits: ['Classement global', 'Lots premium', 'Grand tournoi PCC']
  }
];

const STEPS = [
  {
    n: 1,
    icon: Gamepad2,
    title: 'Choisis un jeu',
    text: 'Sélectionne ton expérience préférée parmi nos jeux exclusifs.'
  },
  {
    n: 2,
    icon: Wallet,
    title: 'Participe avec tes PCC',
    text: 'Utilise tes PCC pour acheter des tickets et participer aux tirages.'
  },
  {
    n: 3,
    icon: Gift,
    title: 'Découvre les résultats',
    text: 'Suis les tirages, découvre les gagnants et remporte des lots.'
  }
];

const PAST_DRAWS = [
  { id: 1, date: '21 juin 2026', winner: 'Awa K.', prize: 'Maillot domicile OM', emoji: '👕' },
  { id: 2, date: '20 juin 2026', winner: 'Yanis B.', prize: '1 000 PCC', emoji: '🪙' },
  { id: 3, date: '19 juin 2026', winner: 'Lina T.', prize: 'Écharpe collector', emoji: '🧣' },
  { id: 4, date: '18 juin 2026', winner: 'Samir D.', prize: '500 PCC', emoji: '💰' }
];

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00', expired: true };
  }

  return {
    days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
    hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
    minutes: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0'),
    seconds: String(Math.floor((diff / 1000) % 60)).padStart(2, '0'),
    expired: false
  };
}

export function Tombola() {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(CURRENT_DRAW.endsAt));
  const [selectedGame, setSelectedGame] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);

  const progress = useMemo(
    () => Math.min(100, Math.round((CURRENT_DRAW.ticketsSold / CURRENT_DRAW.ticketsTotal) * 100)),
    []
  );

  const totalPrice = selectedGame ? selectedGame.price * ticketQty : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(CURRENT_DRAW.endsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(245,158,11,0.15),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.10),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,13,0.2),rgba(4,8,13,0.95))]" />

      <section className="relative py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Badge variant="emerald">🎮 Tombola & Gaming</Badge>

              <h1 className="mt-6 font-display text-5xl md:text-7xl font-black uppercase tracking-tight text-bone-50 leading-[0.95]">
                Joue. Gagne.
                <br />
                <span className="text-gradient-hero">Vibre avec ton club.</span>
              </h1>

              <p className="mt-6 max-w-xl text-bone-300 text-base md:text-lg">
                Participe aux jeux exclusifs PaieCashFan et tente de remporter des lots fan,
                des PCC et des expériences premium.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3 max-w-2xl">
                <HeroFeature icon={Users} title="100% Fan" text="Pour les vrais supporters" />
                <HeroFeature icon={ShieldCheck} title="Sécurisé" text="Expérience encadrée" />
                <HeroFeature icon={Sparkles} title="Fun" text="Lots et animations" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-emerald-400/20 blur-3xl" />

              <GlassCard variant="strong" className="relative p-8 overflow-hidden">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />

                <div className="text-center">
                  <div className="mx-auto h-32 w-32 rounded-full border border-gold-400/40 bg-gold-400/10 grid place-items-center">
                    <Trophy size={72} className="text-gold-400" />
                  </div>

                  <h2 className="mt-6 font-display text-3xl font-black text-bone-50">
                    PCC Mega Rewards
                  </h2>

                  <p className="mt-2 text-sm text-bone-400">
                    Des jeux, des lots, des fans et une expérience unique.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </Container>
      </section>

      <Container className="relative pb-12">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_0.7fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard variant="strong" className="p-6 md:p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.12),transparent_40%)]" />

              <div className="relative grid gap-6 md:grid-cols-[140px_1fr_180px] md:items-center">
                <div className="rounded-2xl border border-gold-400/40 bg-gold-400/10 p-3 h-36 grid place-items-center overflow-hidden">
                  {CURRENT_DRAW.image ? (
                    <img
                      src={CURRENT_DRAW.image}
                      alt=""
                      className="max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Gift size={54} className="text-gold-400" />
                  )}
                </div>

                <div>
                  <div className="inline-flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
                      Tirage en cours
                    </p>

                    <span className="rounded-full bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-emerald-400 font-bold">
                      En cours
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl md:text-3xl font-black text-bone-50">
                    {CURRENT_DRAW.prizeLabel}
                  </h2>

                  <p className="mt-2 text-sm text-bone-400 max-w-md">
                    {CURRENT_DRAW.subtitle}
                  </p>

                  <div className="mt-6">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                      Fin du tirage dans
                    </p>

                    <div className="flex gap-2 flex-wrap">
                      <TimeBox value={timeLeft.days} label="Jours" />
                      <TimeBox value={timeLeft.hours} label="Heures" />
                      <TimeBox value={timeLeft.minutes} label="Minutes" />
                      <TimeBox value={timeLeft.seconds} label="Secondes" />
                    </div>
                  </div>
                </div>

                <div className="md:border-l md:border-white/10 md:pl-6">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                    Prix du ticket
                  </p>

                  <p className="mt-1 font-display text-3xl font-black text-emerald-400">
                    {CURRENT_DRAW.ticketPricePcc} PCC
                  </p>

                  <Button
                    variant="gold"
                    size="md"
                    className="mt-4 w-full"
                    onClick={() => {
                      setSelectedGame(GAMES[0]);
                      setTicketQty(1);
                    }}
                  >
                    Acheter un ticket
                  </Button>

                  <div className="mt-6">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                      Tickets vendus
                    </p>

                    <p className="mt-1 text-bone-100 font-bold">
                      {CURRENT_DRAW.ticketsSold}
                      <span className="text-bone-500"> / {CURRENT_DRAW.ticketsTotal}</span>
                    </p>

                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="h-full rounded-full bg-emerald-400"
                      />
                    </div>

                    <p className="mt-2 text-[10px] text-emerald-400 font-bold">
                      {progress}% vendus
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 h-full grid place-items-center text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.20),transparent_45%)]" />

              <div className="relative">
                <Crown size={54} className="mx-auto text-emerald-400" />

                <h3 className="mt-5 font-display text-xl font-black text-bone-50">
                  100% dédié aux fans
                </h3>

                <p className="mt-3 text-sm text-bone-400">
                  Des jeux funs, des lots exclusifs et une expérience unique.
                </p>

                <Button variant="outline" size="sm" className="mt-6">
                  En savoir plus
                  <ArrowRight size={14} />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Container>

      <Container className="relative pb-12">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
              Nos jeux
            </p>

            <h2 className="mt-2 font-display text-2xl md:text-4xl font-black uppercase text-bone-50">
              Choisis ton jeu
            </h2>
          </div>

          <Button variant="outline" size="sm">
            Voir comment ça marche
            <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.025 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 130,
                damping: 16
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedGame(game);
                  setTicketQty(1);
                }}
                className="group w-full text-left h-full"
              >
                <GlassCard className="relative h-full min-h-[330px] p-6 overflow-hidden border border-white/10 group-hover:border-emerald-400/50 transition-all duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.accent}`} />

                  <motion.div
                    className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.div
                    className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-gold-400/10 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.16),transparent_45%)]" />

                  <div className="relative h-full flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold">
                        {game.category}
                      </span>

                      {game.isLive ? (
                        <motion.span
                          animate={{
                            scale: [1, 1.08, 1],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                          className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-red-400 font-black shadow-lg shadow-red-500/20"
                        >
                          🔴 Live
                        </motion.span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-bone-400 font-black">
                          Bientôt
                        </span>
                      )}
                    </div>

                    <div className="mt-8 flex items-center gap-5">
                      <motion.div
                        className="relative h-44 w-44 shrink-0 overflow-hidden rounded-full"
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.2
                        }}
                        whileHover={{
                          scale: 1.12,
                          rotate: 5
                        }}
                      >
                        {/* Glow animé */}
                        <motion.div
                          className="absolute inset-0 rounded-full bg-emerald-400/20 blur-3xl"
                          animate={{
                            scale: [1, 1.35, 1],
                            opacity: [0.35, 0.8, 0.35]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />

                        {/* Cercle décoratif */}
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 bg-black/20 backdrop-blur-sm z-0" />

                        {/* Image */}
                        <motion.img
                          src={game.image}
                          alt={game.name}
                          className="relative z-10 h-full w-full object-cover rounded-full drop-shadow-[0_0_35px_rgba(16,185,129,0.6)]"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>

                      <div>
                        <h3 className="font-display text-2xl font-black uppercase text-bone-50 leading-tight">
                          {game.name}
                        </h3>

                        <p className="mt-2 text-sm text-bone-400 line-clamp-2">
                          {game.description}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-6 grid gap-2">
                      {game.benefits.slice(0, 3).map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-xs text-bone-300">
                          <Check size={13} className="text-emerald-400" />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-bone-500 font-bold">
                          Participation
                        </p>

                        <p className="font-display text-3xl font-black text-emerald-400">
                          {game.price}
                          <span className="ml-1 text-xs text-bone-300">PCC</span>
                        </p>
                      </div>

                      <div className="inline-flex h-11 px-6 items-center justify-center rounded-xl bg-emerald-400 text-ink-900 text-[10px] uppercase tracking-[0.18em] font-black shadow-lg shadow-emerald-400/20 transition-all group-hover:bg-emerald-300 group-hover:scale-105">
                        Jouer
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          ))}
        </div>
      </Container>

      <Container className="relative pb-12">
  <GlassCard className="p-6 md:p-8 overflow-hidden relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_40%)]" />

    <p className="relative text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
      Comment ça marche ?
    </p>

    <div className="relative mt-6 grid gap-6 md:grid-cols-3">
      {STEPS.map((step, index) => {
        const Icon = step.icon;

        return (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ y: -6, scale: 1.025 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.08,
              type: 'spring',
              stiffness: 140,
              damping: 16
            }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden"
          >
            <motion.div
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.25 }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div
                className="shrink-0 h-12 w-12 rounded-full border border-emerald-400/40 bg-emerald-400/10 grid place-items-center text-emerald-400 font-black shadow-lg shadow-emerald-400/10"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.25 }}
              >
                {step.n}
              </motion.div>

              <div>
                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                >
                  <Icon size={28} className="text-gold-400 mb-3" />
                </motion.div>

                <h3 className="font-display text-lg font-black text-bone-50">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm text-bone-400">
                  {step.text}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </GlassCard>
</Container>

      <Container className="relative pb-24">
  <div className="mb-6 flex items-center justify-between gap-4">
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400 font-black">
        Historique
      </p>

      <h2 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase text-bone-50">
        Derniers tirages
      </h2>
    </div>

    <button className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-400 hover:text-emerald-300">
      Voir tous les résultats
      <ArrowRight size={14} />
    </button>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {PAST_DRAWS.map((draw, index) => (
      <motion.div
        key={draw.id}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -7, scale: 1.025 }}
        viewport={{ once: true }}
        transition={{
          delay: index * 0.06,
          type: 'spring',
          stiffness: 140,
          damping: 16
        }}
      >
        <GlassCard className="p-5 min-h-[190px] overflow-hidden relative border border-white/10 hover:border-emerald-400/40 transition-all">
          <motion.div
            className="absolute -right-6 -bottom-6 text-7xl opacity-20"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
          >
            {draw.emoji}
          </motion.div>

          <motion.div
            className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: index * 0.2 }}
          />

          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gold-400">
                <Crown size={16} />

                <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">
                  {draw.date}
                </span>
              </div>

              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-emerald-400 font-black">
                Gagnant
              </span>
            </div>

            <h3 className="mt-5 font-display text-2xl font-black text-bone-50">
              {draw.winner}
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {draw.prize}
            </p>
          </div>
        </GlassCard>
      </motion.div>
    ))}
  </div>
</Container>

      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 14 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_35%)]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.28em] text-gold-400 font-bold">
                      Participation
                    </div>

                    <h3 className="mt-2 font-display text-2xl font-black text-bone-50">
                      {selectedGame.name}
                    </h3>

                    <p className="mt-2 text-sm text-bone-400">
                      {selectedGame.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedGame(null)}
                    className="rounded-full border border-white/10 px-3 py-1 text-bone-300 hover:text-bone-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MiniStat icon={Ticket} label="Prix" value={`${selectedGame.price} PCC`} color="text-gold-400" />
                  <MiniStat icon={Users} label="Participants" value="128" color="text-emerald-400" />
                  <MiniStat icon={ShieldCheck} label="Mode" value="Démo" color="text-cyan-400" />
                </div>

                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-bone-400 font-bold">
                    Quantité
                  </div>

                  <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-white/10 bg-ink-900/50 p-1">
                    <button
                      type="button"
                      onClick={() => setTicketQty((q) => Math.max(1, q - 1))}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"
                    >
                      -
                    </button>

                    <span className="min-w-[2rem] text-center text-sm font-mono font-bold text-bone-50">
                      {ticketQty}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTicketQty((q) => q + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-bone-200 hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div className="text-[10px] uppercase tracking-[0.32em] text-bone-400 font-bold">
                    Total
                  </div>

                  <div className="font-display text-3xl font-black text-gold-400 tabular-nums">
                    {totalPrice} PCC
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 flex justify-end">
                  <Button variant="gold" size="md" onClick={() => setSelectedGame(null)}>
                    <ShoppingBag size={15} />
                    Participer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroFeature({ icon: Icon, title, text }) {
  return (
    <GlassCard className="p-4">
      <Icon size={22} className="text-emerald-400" />
      <h3 className="mt-3 text-sm font-black text-bone-50">{title}</h3>
      <p className="mt-1 text-[11px] text-bone-400">{text}</p>
    </GlassCard>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center min-w-[58px]">
      <div className="font-mono text-xl font-black text-bone-50 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[8px] uppercase tracking-[0.16em] text-bone-500">
        {label}
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <GlassCard className="p-4 text-center">
      <Icon className={`mx-auto ${color}`} size={20} />

      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-bone-400">
        {label}
      </p>

      <p className="font-display text-xl font-black text-bone-50">
        {value}
      </p>
    </GlassCard>
  );
}