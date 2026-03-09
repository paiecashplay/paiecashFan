// Vercel Serverless Function - POST /api/games/scratch/play
// Gère le paiement Stripe Checkout (carte) et le tirage immédiat (wallet)

import Stripe from 'stripe';

// Lots Scratch (statiques, sans base de données)
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
  const isWinner = Math.random() < 0.30; // 30% de chance de gagner
  if (!isWinner) return null;

  const totalProb = SCRATCH_PRIZES.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProb;

  for (const prize of SCRATCH_PRIZES) {
    random -= prize.probability;
    if (random <= 0) return prize;
  }
  return SCRATCH_PRIZES[SCRATCH_PRIZES.length - 1];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { user_id, organization_id, amount, payment_method, user_email, club, league } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id requis' });
    }

    const SCRATCH_PRICE = amount || 2.00;

    // Paiement par carte → Stripe Checkout
    if (payment_method === 'card') {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(500).json({ success: false, error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
      }

      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'https://paiecashfan.vercel.app';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SCRATCH PaieCashFan - Ticket à gratter',
              description: `Ticket à gratter avec chance de gagner des lots exclusifs !${club ? ` | Club: ${club}` : ''}`,
            },
            unit_amount: Math.round(SCRATCH_PRICE * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/scratch.html?session_id={CHECKOUT_SESSION_ID}&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        cancel_url: `${origin}/scratch.html?payment=cancelled&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        customer_email: user_email || undefined,
        metadata: {
          user_id,
          organization_id: organization_id || club || 'default',
          amount: SCRATCH_PRICE.toString(),
          club: club || '',
          league: league || '',
        },
      });

      return res.status(200).json({
        success: true,
        payment_required: true,
        checkout_url: session.url,
        session_id: session.id,
      });
    }

    // Paiement wallet → tirage immédiat
    if (payment_method === 'wallet' || payment_method === 'mobile') {
      const prize = drawScratchPrize();
      const gameId = `scratch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      return res.status(200).json({
        success: true,
        payment_required: false,
        game_id: gameId,
        is_winner: prize !== null,
        prize: prize ? {
          id: prize.id,
          name: prize.name,
          description: prize.description,
          value: prize.value,
          category: prize.category,
        } : null,
        amount_paid: SCRATCH_PRICE,
        payment_method,
      });
    }

    return res.status(400).json({ success: false, error: 'Méthode de paiement non supportée (card ou wallet)' });

  } catch (error) {
    console.error('Erreur SCRATCH play:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du jeu SCRATCH',
      message: error.message,
    });
  }
};
