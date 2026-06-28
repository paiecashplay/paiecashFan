import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  CalendarDays,
  ShieldCheck,
  Check,
  ShoppingBag,
  Search
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { allClubs } from '@/data/clubsRegistry';
import { useNavigate } from 'react-router-dom';
import { formatPCC } from '@/data/clubMerchandise';
import { getAutoTicketingPrices } from '@/utils/ticketingPrices';

function generateTicketingForClub(club) {
  const slug = club.slug;
  const prices = getAutoTicketingPrices({
    ...club,
    slug: club.slug
  });

  return {
    clubSlug: slug,
    clubName: club.name,
    city: club.city,
    logo: club.logo,
    primaryColor: club.primaryColor || '#10b981',

    subscriptions: [
      {
        id: `${slug}-season-pass`,
        type: 'subscription',
        name: `Abonnement ${club.name}`,
        price: prices.subscription,
        duration: 'Saison 2026-2027',
        description: `Abonnement saison pour suivre ${club.name} à domicile.`,
        benefits: [
          'Accès aux matchs à domicile',
          'Priorité billetterie',
          'Paiement possible en 10 fois avec 5 % de frais'
        ],
        conditions: [
          'Offre soumise aux disponibilités',
          'Tarifs variables selon tribune',
          'Données à confirmer avec le club'
        ]
      }
    ],

    tickets: [
      {
        id: `${slug}-single-ticket`,
        type: 'ticket',
        name: `Billet match ${club.name}`,
        price: prices.ticket,
        duration: 'Match à domicile',
        description: `Billet individuel pour assister à un match à domicile de ${club.name}.`,
        benefits: [
          'Billet pour un match',
          'Prix selon catégorie',
          'Places selon disponibilité'
        ],
        conditions: [
          'Prix variable selon l’affiche',
          'Offre soumise aux disponibilités',
          'Données à confirmer avec le club'
        ]
      }
    ]
  };
}

export function Billetterie() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const clubs = useMemo(() => {
    return allClubs()
        .filter((club) => club.country === 'France' && club.league === 'Ligue 1' && club.sport === 'football')
        .map(generateTicketingForClub);
    }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) =>
      club.clubName.toLowerCase().includes(search.toLowerCase())
    );
  }, [clubs, search]);

  const tabs = [
    { id: 'subscriptions', label: 'Abonnements', icon: CalendarDays },
    { id: 'tickets', label: 'Billets', icon: Ticket }
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.10),transparent_35%)]" />

      <section className="relative py-16 md:py-24">
        <Container>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 font-display text-5xl md:text-7xl font-black uppercase tracking-tight text-bone-50 leading-[0.95]"
          >
            Billets & abonnements
          </motion.h1>

          <p className="mt-5 max-w-2xl text-bone-300 text-base md:text-lg">
            Retrouvez les offres de billetterie pour tous les clubs de notre réseau.
            Les tarifs exacts restent variables selon les clubs, tribunes et affiches.
          </p>
        </Container>
      </section>

      <Container className="relative pb-8">
        <GlassCard className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'inline-flex items-center gap-2 h-11 px-5 rounded-full text-xs uppercase tracking-[0.18em] font-black transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-emerald-400 text-ink-900 shadow-lg shadow-emerald-400/20'
                        : 'bg-white/[0.04] border border-white/10 text-bone-300 hover:text-bone-50'
                    ].join(' ')}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-bone-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un club..."
                className="w-full h-11 rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-bone-100 placeholder:text-bone-500 outline-none focus:border-emerald-400/60"
              />
            </div>
          </div>
        </GlassCard>
      </Container>

      <Container className="relative pb-24">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club, index) => {
            const offers = club[activeTab] || [];

            return offers.map((offer) => (
              <motion.article
                key={offer.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.015 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                onClick={() =>
                    navigate(`/clubs/${club.clubSlug}/billetterie`)
                }
              >
                <GlassCard className="relative h-full p-6 overflow-hidden border border-white/10 hover:border-emerald-400/40 transition-all">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at top right, ${club.primaryColor}, transparent 45%)`
                    }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-2 grid place-items-center">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.clubName}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Ticket className="text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-black">
                        {offer.type === 'subscription' ? 'Abonnement' : 'Billet'}
                      </p>

                      <h3 className="mt-2 font-display text-xl font-black uppercase text-bone-50 leading-tight">
                        {offer.name}
                      </h3>

                      <p className="mt-1 text-xs text-bone-500">
                        {club.city}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-bone-500 font-bold">
                        Prix
                      </p>

                      <p className="font-display text-3xl font-black text-emerald-400">
                        À partir de {formatPCC(offer.price)} PCC 
                      </p>
                    </div>

                    
                  </div>

                  <p className="relative mt-4 text-sm text-bone-300">
                    {offer.description}
                  </p>

                  <ul className="relative mt-5 space-y-2">
                    {offer.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-xs text-bone-300">
                        <Check size={13} className="text-emerald-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      Conditions
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {offer.conditions.map((condition) => (
                        <li key={condition} className="text-xs text-bone-400">
                          • {condition}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-6 flex justify-end">
                    <Button
                        variant="primary"
                        size="md"
                        >
                        <ShoppingBag size={15} />
                        Voir la billetterie
                    </Button>
                  </div>
                </GlassCard>
              </motion.article>
            ));
          })}
        </div>
      </Container>
    </div>
  );
}