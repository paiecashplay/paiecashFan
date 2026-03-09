// Vercel Serverless Function - GET /api/games/scratch/prizes/:orgId
// Retourne la liste des lots disponibles pour le scratch

const SCRATCH_PRIZES = [
  { id: 'billet_vip', name: 'Billet VIP Match', description: 'Place VIP pour le prochain match à domicile', value: 150, category: 'experience', is_active: true },
  { id: 'maillot_signe', name: 'Maillot Signé', description: 'Maillot officiel dédicacé par les joueurs', value: 120, category: 'merchandise', is_active: true },
  { id: 'bon_boutique_50', name: 'Bon Boutique 50€', description: 'Bon d\'achat valable dans la boutique officielle', value: 50, category: 'voucher', is_active: true },
  { id: 'pack_supporter', name: 'Pack Supporter', description: 'Écharpe + casquette + porte-clés officiel', value: 35, category: 'merchandise', is_active: true },
  { id: 'bon_boutique_20', name: 'Bon Boutique 20€', description: 'Bon d\'achat valable dans la boutique officielle', value: 20, category: 'voucher', is_active: true },
  { id: 'cashback_5', name: 'Cashback 5€', description: 'Remboursement de 5€ sur votre prochain achat', value: 5, category: 'cashback', is_active: true },
  { id: 'ticket_gratuit', name: 'Ticket Gratuit', description: 'Un ticket scratch offert pour la prochaine partie', value: 2, category: 'replay', is_active: true },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  return res.status(200).json({
    success: true,
    prizes: SCRATCH_PRIZES,
    total: SCRATCH_PRIZES.length,
  });
};
