// Vercel Serverless Function - POST /api/games/loto/play
// Gère le paiement Stripe Checkout (carte) et le tirage immédiat (wallet)

import Stripe from 'stripe';

// Lots LOTO (sans base de données - statiques)
const LOTO_PRIZES = [
  { id: 'jackpot', name: 'JACKPOT - Carrefour 10 000€', value: 10000, category: 'jackpot', match_requirement: '5+1' },
  { id: 'rang1', name: '1er rang - Bon Carrefour 1 000€', value: 1000, category: 'rang1', match_requirement: '5' },
  { id: 'rang2', name: '2ème rang - Bon Carrefour 200€', value: 200, category: 'rang2', match_requirement: '4+1' },
  { id: 'rang3', name: '3ème rang - Bon Carrefour 50€', value: 50, category: 'rang3', match_requirement: '4' },
  { id: 'rang4', name: '4ème rang - Bon Carrefour 20€', value: 20, category: 'rang4', match_requirement: '3+1' },
  { id: 'rang5', name: '5ème rang - Bon Carrefour 10€', value: 10, category: 'rang5', match_requirement: '3' },
  { id: 'rang6', name: '6ème rang - Bon Carrefour 5€', value: 5, category: 'rang6', match_requirement: '2+1' },
  { id: 'rang7', name: '7ème rang - Bon Carrefour 2€', value: 2, category: 'rang7', match_requirement: '1+1' },
  { id: 'rang8', name: '8ème rang - Bon Carrefour 2€', value: 2, category: 'rang8', match_requirement: '0+1' },
  { id: 'consolation', name: 'Lot de consolation - Produit frais Carrefour', value: 2, category: 'consolation', match_requirement: '0' },
];

function getPrize(matchedNumbers, matchedChance) {
  const key = matchedChance === 1 ? `${matchedNumbers}+1` : `${matchedNumbers}`;
  const prize = LOTO_PRIZES.find(p => p.match_requirement === key);
  return prize || LOTO_PRIZES.find(p => p.category === 'consolation');
}

function doTirage(numbers, chance) {
  // Tirage avec système de boost (garantit 2-3 numéros matchés)
  let winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
  const winningChance = Math.floor(Math.random() * 10) + 1;

  let matchedCount = numbers.filter(n => winningNumbers.includes(n)).length;

  if (matchedCount < 2) {
    const boostTarget = Math.random() < 0.5 ? 2 : 3;
    const numbersToBoost = boostTarget - matchedCount;
    const unmatchedUserNumbers = numbers.filter(n => !winningNumbers.includes(n));

    for (let i = 0; i < numbersToBoost && unmatchedUserNumbers.length > 0; i++) {
      const userNum = unmatchedUserNumbers.shift();
      let replaceIndex = winningNumbers.findIndex(wn => !numbers.includes(wn));
      if (replaceIndex === -1) replaceIndex = 0;
      winningNumbers[replaceIndex] = userNum;
    }
    matchedCount = numbers.filter(n => winningNumbers.includes(n)).length;
  }

  const matchedChance = chance === winningChance ? 1 : 0;
  const prize = getPrize(matchedCount, matchedChance);

  return {
    winning_numbers: winningNumbers,
    winning_chance: winningChance,
    matched_numbers: matchedCount,
    matched_chance: matchedChance,
    prize,
  };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { user_id, numbers, chance, payment_method, user_email, club, league } = req.body;

    // Validation
    if (!user_id || !numbers || !chance) {
      return res.status(400).json({ success: false, error: 'user_id, numbers et chance requis' });
    }
    if (!Array.isArray(numbers) || numbers.length !== 5) {
      return res.status(400).json({ success: false, error: 'Vous devez choisir exactement 5 numéros' });
    }
    if (numbers.some(n => n < 1 || n > 50)) {
      return res.status(400).json({ success: false, error: 'Les numéros doivent être entre 1 et 50' });
    }
    if (chance < 1 || chance > 10) {
      return res.status(400).json({ success: false, error: 'Le numéro chance doit être entre 1 et 10' });
    }

    const LOTO_PRICE = 2.00;

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
              name: 'LOTO PaieCashFan - Grille de numéros',
              description: `Vos numéros: ${numbers.join(', ')} + Chance ${chance}${club ? ` | Club: ${club}` : ''}`,
            },
            unit_amount: Math.round(LOTO_PRICE * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/loto.html?session_id={CHECKOUT_SESSION_ID}&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        cancel_url: `${origin}/loto.html?payment=cancelled&club=${encodeURIComponent(club || '')}&league=${encodeURIComponent(league || '')}`,
        customer_email: user_email || undefined,
        metadata: {
          user_id,
          numbers: JSON.stringify(numbers),
          chance: chance.toString(),
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
      const result = doTirage(numbers, chance);
      const gameId = `loto-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      return res.status(200).json({
        success: true,
        payment_required: false,
        game_id: gameId,
        user_numbers: numbers,
        user_chance: chance,
        winning_numbers: result.winning_numbers,
        winning_chance: result.winning_chance,
        matched_numbers: result.matched_numbers,
        matched_chance: result.matched_chance,
        prize: result.prize,
        amount_paid: LOTO_PRICE,
        payment_method,
        email_sent: false,
      });
    }

    return res.status(400).json({ success: false, error: 'Méthode de paiement non supportée (card ou wallet)' });

  } catch (error) {
    console.error('Erreur LOTO play:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du jeu LOTO',
      message: error.message,
    });
  }
};
