// Vercel Serverless Function - GET /api/shop/products/:clubId
// Retourne les produits disponibles pour un club

const PRODUCTS_BY_CATEGORY = [
  { id: 'maillot_domicile', name: 'Maillot Domicile 2024/25', description: 'Maillot officiel domicile de la saison', price: 89.99, category: 'maillots', image: '👕', stock: 50 },
  { id: 'maillot_exterieur', name: 'Maillot Extérieur 2024/25', description: 'Maillot officiel extérieur de la saison', price: 89.99, category: 'maillots', image: '👕', stock: 40 },
  { id: 'maillot_gardien', name: 'Maillot Gardien 2024/25', description: 'Maillot officiel du gardien', price: 79.99, category: 'maillots', image: '🧤', stock: 20 },
  { id: 'echarpe_officielle', name: 'Écharpe Officielle', description: 'Écharpe aux couleurs du club', price: 24.99, category: 'accessoires', image: '🧣', stock: 100 },
  { id: 'casquette', name: 'Casquette Officielle', description: 'Casquette brodée logo du club', price: 19.99, category: 'accessoires', image: '🧢', stock: 80 },
  { id: 'mug_club', name: 'Mug Club', description: 'Mug officiel avec logo du club', price: 14.99, category: 'accessoires', image: '☕', stock: 60 },
  { id: 'billet_match', name: 'Billet Match Domicile', description: 'Place tribune pour le prochain match à domicile', price: 35.00, category: 'billets', image: '🎫', stock: 200 },
  { id: 'billet_vip', name: 'Billet VIP', description: 'Place VIP avec accès salon et restauration', price: 150.00, category: 'billets', image: '⭐', stock: 30 },
  { id: 'abonnement_saison', name: 'Abonnement Saison', description: 'Abonnement pour tous les matchs à domicile', price: 299.00, category: 'abonnements', image: '📋', stock: 100 },
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  const { clubId } = req.query;

  return res.status(200).json({
    success: true,
    club_id: clubId || 'default',
    products: PRODUCTS_BY_CATEGORY,
    total: PRODUCTS_BY_CATEGORY.length,
  });
};
