// Vercel Serverless Function - POST /api/shop/order/create
// Crée une commande dans la boutique

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { user_id, club_id, items, total_amount, customer_email, customer_name } = req.body;

    if (!user_id || !items || !total_amount) {
      return res.status(400).json({ success: false, error: 'user_id, items et total_amount requis' });
    }

    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return res.status(200).json({
      success: true,
      order_id: orderId,
      status: 'pending_payment',
      total_amount,
      items_count: items.length,
      club_id: club_id || 'default',
    });

  } catch (error) {
    console.error('Erreur shop order/create:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la commande',
      message: error.message,
    });
  }
};
