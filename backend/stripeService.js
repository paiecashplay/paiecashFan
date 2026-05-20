require('dotenv').config();
const Stripe = require('stripe');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Create a Stripe checkout session.
 * @param {string} userId
 * @param {number} pccAmount - Number of PCC coins the user wants to buy
 * @param {number} fiatTotal - Fiat cost (calculated by rateConfig)
 * @param {string} currency - e.g. 'eur', 'usd', 'chf'
 */
async function createCheckoutSession(userId, pccAmount, fiatTotal, currency = 'eur') {
  if (!stripe) throw new Error("Stripe is not configured.");

  const amountInCents = Math.round(fiatTotal * 100);
  const currencyUpper = currency.toUpperCase();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: 'PaieCash.coin (PCC)',
          description: `Purchase ${pccAmount.toLocaleString()} PCC for ${fiatTotal} ${currencyUpper}`
        },
        unit_amount: amountInCents,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${FRONTEND_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/dashboard?checkout=cancel`,
    metadata: {
      userId: userId,
      pccAmount: pccAmount.toString(),
      fiatAmount: fiatTotal.toString(),
      currency: currency.toLowerCase()
    }
  });

  return session;
}

function verifyWebhookSignature(payload, signature) {
  if (!stripe) return null;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return event;
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    throw err;
  }
}

module.exports = {
  createCheckoutSession,
  verifyWebhookSignature,
  stripe
};
