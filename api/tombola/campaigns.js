// Vercel Serverless Function - GET /api/tombola/campaigns
// Retourne les campagnes de tombola actives

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

const CAMPAIGNS = [
  {
    id: 'tombola-daily-1',
    title: 'Tombola Quotidienne - Billet Match',
    description: 'Gagnez une place pour le prochain match à domicile !',
    prize: 'Billet Match Domicile (valeur 35€)',
    prize_value: 35,
    ticket_price: 1.00,
    max_tickets: 500,
    tickets_sold: Math.floor(Math.random() * 300) + 100,
    draw_date: tomorrow.toISOString(),
    status: 'active',
    category: 'quotidienne',
    image: '🎫',
  },
  {
    id: 'tombola-weekly-1',
    title: 'Tombola Hebdomadaire - Maillot Signé',
    description: 'Tentez de gagner un maillot officiel dédicacé par les joueurs !',
    prize: 'Maillot Officiel Signé (valeur 120€)',
    prize_value: 120,
    ticket_price: 2.00,
    max_tickets: 1000,
    tickets_sold: Math.floor(Math.random() * 600) + 200,
    draw_date: nextWeek.toISOString(),
    status: 'active',
    category: 'hebdomadaire',
    image: '👕',
  },
  {
    id: 'tombola-vip-1',
    title: 'Tombola VIP - Expérience Exclusive',
    description: 'Rencontrez les joueurs et assistez à un entraînement !',
    prize: 'Visite vestiaires + Rencontre joueurs',
    prize_value: 500,
    ticket_price: 5.00,
    max_tickets: 200,
    tickets_sold: Math.floor(Math.random() * 100) + 30,
    draw_date: nextWeek.toISOString(),
    status: 'active',
    category: 'vip',
    image: '⭐',
  },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  return res.status(200).json({
    success: true,
    campaigns: CAMPAIGNS,
    total: CAMPAIGNS.length,
  });
};
