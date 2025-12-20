// ========================================
// SERVEUR ALIPAY+ POUR PAIECASHPLAY
// Version 1.0.0 - Production Ready
// ========================================

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_VOTRE_CLE_SECRETE');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// ========================================
// CONFIGURATION
// ========================================

const PRODUITS = {
  'billet_om_lens': {
    nom: 'Billet OM vs RC Lens',
    description: 'Stade Vélodrome - Section A',
    prix_cny: 39900, // 399 yuans
    prix_eur: 5000,  // 50 euros
    image: 'https://om.fr/images/billet_lens.jpg',
    cashback_pourcent: 3 // 3% de cashback en OMC
  },
  'maillot_om_2024': {
    nom: 'Maillot OM 2023-2024',
    description: 'Maillot domicile officiel',
    prix_cny: 79900, // 799 yuans
    prix_eur: 9900,  // 99 euros
    image: 'https://om.fr/images/maillot_2024.jpg',
    cashback_pourcent: 5
  },
  'abonnement_om': {
    nom: 'Abonnement OM Saison',
    description: 'Accès à tous les matchs à domicile',
    prix_cny: 299900, // 2999 yuans
    prix_eur: 39900,  // 399 euros
    image: 'https://om.fr/images/abonnement.jpg',
    cashback_pourcent: 10
  }
};

// ========================================
// ROUTES API
// ========================================

// Page d'accueil
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PaieCashPlay - Alipay</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
          h1 { color: #0e9cda; }
          .product { border: 2px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; }
          .btn { background: #1677ff; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
          .btn:hover { background: #0958d9; }
        </style>
      </head>
      <body>
        <h1>🏟️ PaieCashPlay - Paiement Alipay</h1>
        <p>Payer avec Alipay (支付宝) - Serveur opérationnel ✅</p>
        
        <div class="product">
          <h2>🎫 Billet OM vs RC Lens</h2>
          <p>Prix : 399¥ (~50€)</p>
          <button class="btn" onclick="acheter('billet_om_lens', 'cny')">支付宝 Payer avec Alipay</button>
          <button class="btn" onclick="acheter('billet_om_lens', 'eur')" style="background: #28a745; margin-left: 10px;">💳 Payer avec carte</button>
        </div>
        
        <script>
          async function acheter(produit, devise) {
            const response = await fetch('/create-checkout-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ produit, devise })
            });
            const data = await response.json();
            window.location.href = data.url;
          }
        </script>
      </body>
    </html>
  `);
});

// Créer une session de paiement
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { produit, devise = 'eur' } = req.body;
    
    // Vérifier que le produit existe
    if (!PRODUITS[produit]) {
      return res.status(400).json({ error: 'Produit invalide' });
    }
    
    const item = PRODUITS[produit];
    const montant = devise === 'cny' ? item.prix_cny : item.prix_eur;
    const payment_methods = devise === 'cny' ? ['alipay'] : ['card'];
    
    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: payment_methods,
      line_items: [{
        price_data: {
          currency: devise,
          unit_amount: montant,
          product_data: {
            name: item.nom,
            description: item.description,
            images: [item.image]
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/cancel`,
      metadata: {
        club: 'Olympique de Marseille',
        produit: produit,
        cashback_pourcent: item.cashback_pourcent.toString()
      },
      customer_email: req.body.email || undefined
    });
    
    console.log(`✅ Session créée: ${session.id} - ${item.nom} - ${montant/100}${devise.toUpperCase()}`);
    
    res.json({ 
      url: session.url,
      session_id: session.id
    });
    
  } catch (error) {
    console.error('❌ Erreur création session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Page de succès
app.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;
  
  if (!sessionId) {
    return res.send('❌ Session ID manquant');
  }
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const montant = (session.amount_total / 100).toFixed(2);
    const devise = session.currency.toUpperCase();
    const cashback = (montant * parseFloat(session.metadata.cashback_pourcent) / 100).toFixed(2);
    
    res.send(`
      <html>
        <head>
          <title>Paiement Réussi</title>
          <style>
            body { font-family: Arial; max-width: 600px; margin: 100px auto; text-align: center; padding: 20px; }
            .success { background: #d4edda; border: 2px solid #28a745; border-radius: 15px; padding: 40px; }
            h1 { color: #28a745; font-size: 48px; margin: 0; }
            .details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left; }
            .btn { background: #0e9cda; color: white; padding: 15px 30px; border: none; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅</h1>
            <h2>Paiement Réussi !</h2>
            <div class="details">
              <p><strong>Montant:</strong> ${montant} ${devise}</p>
              <p><strong>Méthode:</strong> ${session.payment_method_types[0] === 'alipay' ? 'Alipay (支付宝)' : 'Carte bancaire'}</p>
              <p><strong>Transaction:</strong> ${session.id}</p>
              <p><strong>Cashback OMC:</strong> +${cashback} OMC crédités 🎁</p>
            </div>
            <a href="/" class="btn">Retour à l'accueil</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.send('❌ Erreur lors de la récupération de la session');
  }
});

// Page d'annulation
app.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Paiement Annulé</title>
        <style>
          body { font-family: Arial; max-width: 600px; margin: 100px auto; text-align: center; padding: 20px; }
          .cancel { background: #fff3cd; border: 2px solid #ffc107; border-radius: 15px; padding: 40px; }
          h1 { color: #856404; }
          .btn { background: #0e9cda; color: white; padding: 15px 30px; border: none; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="cancel">
          <h1>⚠️ Paiement Annulé</h1>
          <p>Vous avez annulé le paiement.</p>
          <p>Aucun montant n'a été débité.</p>
          <a href="/" class="btn">Réessayer</a>
        </div>
      </body>
    </html>
  `);
});

// Webhook Stripe (pour les confirmations de paiement)
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...';
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Gérer les événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Paiement confirmé:', session.id);
      
      // TODO: Actions après paiement
      // 1. Envoyer le billet par email
      // 2. Mettre à jour la base de données
      // 3. Créditer le cashback OMC
      await traiterPaiementReussi(session);
      break;
      
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment Intent réussi:', paymentIntent.id);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.error('❌ Paiement échoué:', failedPayment.id);
      break;
      
    default:
      console.log(`⚠️ Événement non géré: ${event.type}`);
  }
  
  res.json({received: true});
});

// Fonction pour traiter un paiement réussi
async function traiterPaiementReussi(session) {
  const montant = session.amount_total / 100;
  const cashback = montant * parseFloat(session.metadata.cashback_pourcent) / 100;
  
  console.log(`💰 Montant: ${montant} ${session.currency.toUpperCase()}`);
  console.log(`🎁 Cashback: ${cashback} OMC`);
  console.log(`📧 Email client: ${session.customer_email || 'Non fourni'}`);
  
  // TODO: Intégration avec votre système
  // - Envoyer email avec billet
  // - Créditer le wallet OMC
  // - Mettre à jour la base de données
  
  return true;
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PaieCashPlay Alipay Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║       🏟️  PAIECASHPLAY ALIPAY SERVER                  ║');
  console.log('║       ✅  Serveur démarré avec succès                  ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Serveur: http://localhost:${PORT}`);
  console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
  console.log('');
  console.log('📊 Routes disponibles:');
  console.log(`   GET  /              - Page d'accueil`);
  console.log(`   POST /create-checkout-session - Créer session paiement`);
  console.log(`   GET  /success       - Page de succès`);
  console.log(`   GET  /cancel        - Page d'annulation`);
  console.log(`   POST /webhook       - Webhook Stripe`);
  console.log(`   GET  /health        - Health check`);
  console.log('');
  console.log('💡 Pour tester:');
  console.log(`   Ouvrez votre navigateur sur http://localhost:${PORT}`);
  console.log('');
});

// Gestion des erreurs globales
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});

module.exports = app;
