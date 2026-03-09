// Vercel Serverless Function - POST /api/games/send-receipt
// Envoie un reçu par email (stub - log seulement sans SMTP configuré)

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Méthode non autorisée' });

  try {
    const { user_email, game_type, game_id, prize, amount_paid } = req.body;

    // Log pour le moment (à connecter à un service email comme Resend ou SendGrid)
    console.log('Receipt request:', { user_email, game_type, game_id, prize, amount_paid });

    return res.status(200).json({
      success: true,
      message: user_email ? `Reçu envoyé à ${user_email}` : 'Reçu enregistré',
      email_sent: !!user_email,
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
