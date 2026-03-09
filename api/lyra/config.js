// Vercel Serverless Function - GET /api/lyra/config
// Retourne la configuration publique Lyra (PayZen) pour le formulaire de paiement

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  const publicKey = process.env.LYRA_PUBLIC_KEY;
  if (!publicKey) {
    return res.status(500).json({ success: false, error: 'Lyra non configuré (LYRA_PUBLIC_KEY manquant)' });
  }

  return res.status(200).json({
    success: true,
    publicKey,
    endpoint: process.env.LYRA_ENDPOINT || 'https://api.payzen.eu',
  });
};
