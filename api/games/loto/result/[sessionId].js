// Vercel Serverless Function - GET /api/games/loto/result/:sessionId
// Récupère le résultat du tirage LOTO après paiement Stripe Checkout

const Stripe = require('stripe');

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
  return LOTO_PRIZES.find(p => p.match_requirement === key) || LOTO_PRIZES.find(p => p.category === 'consolation');
}

function doTirage(numbers, chance) {
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
  return {
    winning_numbers: winningNumbers,
    winning_chance: winningChance,
    matched_numbers: matchedCount,
    matched_chance: matchedChance,
    prize: getPrize(matchedCount, matchedChance),
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    // Supporte les deux formats : /result/:sessionId et /result?session_id=xxx
    const sessionId = req.query.sessionId || req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'session_id requis' });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(500).json({ success: false, error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' });
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

    const { user_id, numbers: numbersStr, chance: chanceStr, club, league } = session.metadata;
    const numbers = JSON.parse(numbersStr || '[]');
    const chance = parseInt(chanceStr || '1', 10);

    const result = doTirage(numbers, chance);
    const gameId = `loto-stripe-${sessionId.substring(0, 12)}`;

    return res.status(200).json({
      success: true,
      payment_required: false,
      game_id: gameId,
      session_id: sessionId,
      user_numbers: numbers,
      user_chance: chance,
      winning_numbers: result.winning_numbers,
      winning_chance: result.winning_chance,
      matched_numbers: result.matched_numbers,
      matched_chance: result.matched_chance,
      prize: result.prize,
      amount_paid: 2.00,
      payment_method: 'card',
      club: club || '',
      league: league || '',
    });

  } catch (error) {
    console.error('Erreur LOTO result:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du résultat',
      message: error.message,
    });
  }
};
