// Vercel Serverless Function - GET /api/games/scratch/result/:sessionId
// Récupère le résultat du tirage SCRATCH après paiement Stripe Checkout

const Stripe = require('stripe');

const SCRATCH_PRIZES = [
  { id: 'billet_vip', name: 'Billet VIP Match', description: 'Place VIP pour le prochain match à domicile', value: 150, category: 'experience', probability: 2 },
  { id: 'maillot_signe', name: 'Maillot Signé', description: 'Maillot officiel dédicacé par les joueurs', value: 120, category: 'merchandise', probability: 3 },
  { id: 'bon_boutique_50', name: 'Bon Boutique 50€', description: 'Bon d\'achat valable dans la boutique officielle', value: 50, category: 'voucher', probability: 8 },
  { id: 'pack_supporter', name: 'Pack Supporter', description: 'Écharpe + casquette + porte-clés officiel', value: 35, category: 'merchandise', probability: 12 },
  { id: 'bon_boutique_20', name: 'Bon Boutique 20€', description: 'Bon d\'achat valable dans la boutique officielle', value: 20, category: 'voucher', probability: 15 },
  { id: 'cashback_5', name: 'Cashback 5€', description: 'Remboursement de 5€ sur votre prochain achat', value: 5, category: 'cashback', probability: 20 },
  { id: 'ticket_gratuit', name: 'Ticket Gratuit', description: 'Un ticket scratch offert pour la prochaine partie', value: 2, category: 'replay', probability: 40 },
];

function drawScratchPrize() {
  const isWinner = Math.random() < 0.30;
  if (!isWinner) return null;

  const totalProb = SCRATCH_PRIZES.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProb;

  for (const prize of SCRATCH_PRIZES) {
    random -= prize.probability;
    if (random <= 0) return prize;
  }
  return SCRATCH_PRIZES[SCRATCH_PRIZES.length - 1];
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const sessionId = req.query.sessionId || req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id requis' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(500).json({ success: false, error: 'Stripe non configuré' });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Paiement non confirmé',
        payment_status: session.payment_status,
      });
    }

    const { club, league } = session.metadata;
    const prize = drawScratchPrize();
    const gameId = `scratch-stripe-${sessionId.substring(0, 12)}`;

    return res.status(200).json({
      success: true,
      payment_required: false,
      game_id: gameId,
      session_id: sessionId,
      is_winner: prize !== null,
      prize: prize ? {
        id: prize.id,
        name: prize.name,
        description: prize.description,
        value: prize.value,
        category: prize.category,
      } : null,
      amount_paid: parseFloat(session.metadata?.amount || '2'),
      payment_method: 'card',
      club: club || '',
      league: league || '',
    });

  } catch (error) {
    console.error('Erreur SCRATCH result:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du résultat SCRATCH',
      message: error.message,
    });
  }
};
