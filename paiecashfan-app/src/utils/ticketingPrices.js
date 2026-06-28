export function stableNumber(seedText, min, max) {
  const seed = String(seedText)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return min + (seed % (max - min + 1));
}

export function getAutoTicketingPrices(club) {
  const slug = club?.slug || club?.id || club?.name || 'club';

  return {
    ticket: stableNumber(`${slug}-ticket`, 25, 80),
    subscription: stableNumber(`${slug}-subscription`, 180, 650)
  };
}

// Construit l'offre de billetterie par défaut (1 abonnement + 1 billet) à
// partir des prix auto-générés. Sert à la fois :
//   • de repli côté front quand le club n'a pas d'offres saisies en base,
//   • de pré-remplissage dans l'éditeur du BO.
export function buildDefaultTicketing(club) {
  const slug = club?.slug || club?.id || 'club';
  const name = club?.name || 'le club';
  const prices = getAutoTicketingPrices(club);

  return {
    subscriptions: [
      {
        id: `${slug}-season-pass`,
        type: 'subscription',
        name: `Abonnement ${name}`,
        price: prices.subscription,
        duration: 'Saison 2026-2027',
        description: `Abonnement saison pour suivre ${name} à domicile.`,
        benefits: [
          'Accès aux matchs à domicile',
          'Priorité billetterie',
          'Paiement possible en 10 fois avec 5 % de frais'
        ],
        conditions: [
          'Offre soumise aux disponibilités',
          'Tarifs variables selon la tribune',
          'Données à confirmer avec le club'
        ]
      }
    ],
    tickets: [
      {
        id: `${slug}-single-ticket`,
        type: 'ticket',
        name: `Billet match ${name}`,
        price: prices.ticket,
        duration: 'Match à domicile',
        description: `Billet individuel pour assister à un match à domicile de ${name}.`,
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