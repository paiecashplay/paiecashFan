import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, HelpCircle, LifeBuoy } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';

// Brouillon de FAQ — à affiner avec le client. Chaque entrée : { q, a }.
const FAQ_ITEMS = [
  {
    q: 'Qu’est-ce que le PaieCashCoin (PCC) ?',
    a: "Le PaieCashCoin est la monnaie de la plateforme. Vous l’utilisez pour acheter vos billets, abonnements et produits dans les boutiques des clubs. 1 PCC équivaut à 1 €.",
  },
  {
    q: 'Comment payer mes billets et abonnements ?',
    a: 'Vous pouvez payer en PaieCashCoin (depuis votre wallet) ou par carte bancaire, en une fois ou en 5 fois. Le mode de paiement se choisit au moment de valider le panier.',
  },
  {
    q: 'Je n’ai pas de wallet PaieCashCoin, puis-je quand même acheter ?',
    a: 'Oui, absolument. Le paiement par carte bancaire est disponible partout sur la plateforme : aucun wallet n’est nécessaire pour acheter un billet, un abonnement ou un produit.',
  },
  {
    q: 'Comment récupérer mon billet ou mon abonnement après l’achat ?',
    a: 'Une fois le paiement validé, votre commande et sa preuve d’achat sont disponibles dans votre espace « Mon compte ». Les billets nominatifs (QR code) y seront également accessibles.',
  },
  {
    q: 'Puis-je échanger ou me faire rembourser un billet ?',
    a: 'Les conditions d’échange et de remboursement dépendent du club et de l’affiche. Contactez notre support via le formulaire de contact en précisant votre numéro de commande, nous étudierons votre demande.',
  },
  {
    q: 'Comment créer un compte ou me connecter ?',
    a: 'Vous pouvez créer un compte en quelques secondes avec votre email, ou vous connecter directement via Google depuis la page de connexion.',
  },
  {
    q: 'Qu’est-ce que le bonus +5% PaieCashCoin ?',
    a: 'En liant votre compte PaieCashCoin à votre compte PaieCashFan, vous bénéficiez d’un bonus de 5% en PCC sur vos achats. La liaison se fait depuis votre espace PaieCashCoin.',
  },
  {
    q: 'Comment fonctionne la boutique d’un club ?',
    a: 'Chaque club dispose de sa boutique officielle sur la plateforme. Vous y commandez vos produits et réglez en PaieCashCoin ou par carte bancaire, comme pour la billetterie.',
  },
  {
    q: 'Comment contacter le support ?',
    a: 'Via notre formulaire de contact, ou directement par email à contact@paiecashfan.com. Notre équipe vous répond en général sous 24 à 48h ouvrées.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="relative min-h-screen overflow-hidden pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(16,185,129,0.05),transparent_42%)]" />

      {/* En-tête */}
      <section className="relative py-14 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300"
          >
            <HelpCircle size={13} />
            Aide
          </motion.div>

          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-bone-50 md:text-6xl">
            Questions fréquentes
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-bone-300 md:text-base">
            Tout ce qu’il faut savoir sur les billets, les abonnements, les
            paiements et votre compte PaieCashFan.
          </p>
        </Container>
      </section>

      <Container className="relative">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_0.9fr]">
          {/* Liste */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const open = openIndex === index;
              return (
                <GlassCard
                  key={item.q}
                  className="overflow-hidden border border-white/10"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="font-display text-base font-black uppercase leading-tight text-bone-50">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-emerald-400 transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-sm leading-6 text-bone-300">
                      {item.a}
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          {/* Encart contact */}
          <div>
            <GlassCard className="border border-emerald-400/20 p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                <LifeBuoy size={20} className="text-emerald-400" />
              </div>
              <p className="mt-4 font-display text-lg font-black uppercase text-bone-50">
                Vous ne trouvez pas votre réponse ?
              </p>
              <p className="mt-2 text-sm leading-6 text-bone-300">
                Notre équipe support est là pour vous aider. Écrivez-nous, nous
                revenons vers vous rapidement.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-hero px-6 text-sm font-semibold text-ink-900 shadow-glow-emerald transition-all hover:shadow-glow-emerald-lg"
              >
                Contacter le support
              </Link>
            </GlassCard>
          </div>
        </div>
      </Container>
    </div>
  );
}
