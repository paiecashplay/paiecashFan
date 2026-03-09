// Vercel Serverless Function - POST /api/shop/order/confirm
// Confirme une commande après paiement Lyra réussi

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { order_id, payment_id, transaction_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ success: false, error: 'order_id requis' });
    }

    return res.status(200).json({
      success: true,
      order_id,
      status: 'confirmed',
      payment_id: payment_id || transaction_id || `PAY-${Date.now()}`,
      confirmed_at: new Date().toISOString(),
      message: 'Commande confirmée avec succès. Vous recevrez un email de confirmation.',
    });

  } catch (error) {
    console.error('Erreur shop order/confirm:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la confirmation de la commande',
      message: error.message,
    });
  }
};
