// Vercel Serverless Function - POST /api/lyra/create-payment
// Crée un formulaire de paiement Lyra (PayZen) pour la boutique clubs

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { amount, currency, order_id, customer_email, customer_name, description } = req.body;

    if (!amount || !order_id) {
      return res.status(400).json({ success: false, error: 'amount et order_id requis' });
    }

    const username = process.env.LYRA_USERNAME;
    const password = process.env.LYRA_PASSWORD;
    const endpoint = process.env.LYRA_ENDPOINT || 'https://api.payzen.eu';

    if (!username || !password) {
      return res.status(500).json({ success: false, error: 'Lyra non configuré (LYRA_USERNAME ou LYRA_PASSWORD manquant)' });
    }

    const credentials = Buffer.from(`${username}:${password}`).toString('base64');

    const payload = {
      amount: Math.round(amount * 100), // en centimes
      currency: currency || 'EUR',
      orderId: order_id,
      customer: {
        email: customer_email || '',
        billingDetails: {
          firstName: customer_name ? customer_name.split(' ')[0] : '',
          lastName: customer_name ? customer_name.split(' ').slice(1).join(' ') : '',
        },
      },
      metadata: {
        description: description || 'Achat boutique PaieCashFan',
      },
    };

    const response = await fetch(`${endpoint}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status !== 'SUCCESS') {
      console.error('Erreur Lyra CreatePayment:', data);
      return res.status(400).json({
        success: false,
        error: 'Erreur création paiement Lyra',
        details: data.answer?.errorMessage || data.status,
      });
    }

    return res.status(200).json({
      success: true,
      formToken: data.answer.formToken,
      publicKey: process.env.LYRA_PUBLIC_KEY,
    });

  } catch (error) {
    console.error('Erreur Lyra create-payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du paiement Lyra',
      message: error.message,
    });
  }
};
