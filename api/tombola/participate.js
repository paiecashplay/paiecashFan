// Vercel Serverless Function - POST /api/tombola/participate
// Enregistre une participation à une tombola

import Stripe from 'stripe';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { user_id, campaign_id, ticket_count, payment_method, user_email, club, league } = req.body;

    if (!user_id || !campaign_id) {
      return res.status(400).json({ success: false, error: 'user_id et campaign_id requis' });
    }

    const count = ticket_count || 1;
    const TICKET_PRICES = {
      'tombola-daily-1': 1.00,
      'tombola-weekly-1': 2.00,
      'tombola-vip-1': 5.00,
    };
    const ticketPrice = TICKET_PRICES[campaign_id] || 2.00;
    const totalAmount = ticketPrice * count;

    // Paiement par carte → Stripe Checkout
    if (payment_method === 'card') {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(500).json({ success: false, error: 'Stripe non configuré' });
      }

      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
      const origin = req.headers.origin || 'https://paiecashfan.vercel.app';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Tombola PaieCashFan - ${count} ticket(s)`,
              description: `Participation tombola ${campaign_id}${club ? ` | Club: ${club}` : ''}`,
            },
            unit_amount: Math.round(ticketPrice * 100),
          },
          quantity: count,
        }],
        mode: 'payment',
        success_url: `${origin}/tombola.html?payment=success&campaign=${campaign_id}&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        cancel_url: `${origin}/tombola.html?payment=cancelled&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        customer_email: user_email || undefined,
        metadata: {
          user_id,
          campaign_id,
          ticket_count: count.toString(),
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

    // Paiement wallet → participation immédiate
    const ticketNumbers = Array.from({ length: count }, () =>
      `T-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    );

    return res.status(200).json({
      success: true,
      payment_required: false,
      participation_id: `PART-${Date.now()}`,
      campaign_id,
      ticket_numbers: ticketNumbers,
      ticket_count: count,
      total_paid: totalAmount,
      message: `Vous participez avec ${count} ticket(s). Bonne chance !`,
    });

  } catch (error) {
    console.error('Erreur tombola participate:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la participation',
      message: error.message,
    });
  }
};
