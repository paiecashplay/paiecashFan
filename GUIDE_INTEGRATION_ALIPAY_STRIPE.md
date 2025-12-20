# 🚀 GUIDE D'INTÉGRATION ALIPAY+ via STRIPE

## 📌 Vue d'ensemble

Ce guide vous permet d'intégrer **Alipay** dans PaieCashPlay en **moins de 1 heure**, en utilisant Stripe comme PSP (Payment Service Provider).

---

## 🎯 Pourquoi Alipay pour l'OM ?

### Marché potentiel
- **1+ milliard** d'utilisateurs Alipay
- **200+ millions** de touristes chinois par an (pré-COVID)
- **Fans chinois de l'OM** : Diaspora + nouveaux supporters
- **Paiement en yuans (CNY)** : Sans friction de change

### Avantages compétitifs
- ✅ **Premier club français** avec Alipay
- ✅ **Expérience sans couture** pour fans chinois
- ✅ **Cashback automatique** en OMC (token du club)
- ✅ **QR Code scan** : Paiement en 2 secondes

---

## 🔧 ÉTAPE 1 : Configuration Stripe (10 minutes)

### 1.1 Créer un compte Stripe

```
URL : https://dashboard.stripe.com/register
```

**Informations requises :**
- Nom du club : Olympique de Marseille
- Email : tech@om.fr (ou votre email)
- Pays : France
- Type : Entreprise

**Mode Test activé par défaut** ✅

---

### 1.2 Récupérer les clés API

**Chemin dans le dashboard :**
```
Developers → API keys
```

**Vous obtenez 2 clés :**

**Clé publique (Publishable key) :**
```
pk_test_51Ab...xyz
```
→ Utilisée côté client (JavaScript)

**Clé secrète (Secret key) :**
```
sk_test_51Ab...xyz
```
→ Utilisée côté serveur (Node.js, PHP, Python)

**⚠️ SÉCURITÉ** : Ne jamais exposer `sk_test` côté client !

---

### 1.3 Activer Alipay

**Chemin dans le dashboard :**
```
Settings → Payments → Payment methods
```

**Actions :**
1. Rechercher "Alipay"
2. Cliquer sur "Enable"
3. Confirmer l'activation

**Résultat :** Alipay est maintenant disponible 🎉

---

## 💻 ÉTAPE 2 : Code d'intégration (20 minutes)

### 2.1 Installation Stripe (Node.js)

```bash
npm install stripe
npm install express
npm install body-parser
```

---

### 2.2 Serveur Node.js minimal

**Fichier : `server.js`**

```javascript
const express = require('express');
const stripe = require('stripe')('sk_test_VOTRE_CLE_SECRETE');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Créer une session de paiement Alipay
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['alipay'],
      line_items: [{
        price_data: {
          currency: 'cny', // Yuans chinois
          unit_amount: 39900, // 399 yuans = 399.00¥
          product_data: {
            name: 'Billet OM vs RC Lens',
            description: 'Stade Vélodrome - Section A',
            images: ['https://om.fr/images/billet.jpg']
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'https://marseille.paiecashplay.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://marseille.paiecashplay.com/cancel',
      metadata: {
        club: 'Olympique de Marseille',
        match: 'OM vs Lens',
        section: 'Vélodrome A'
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook pour recevoir les confirmations de paiement
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = 'whsec_...'; // Récupéré dans Stripe Dashboard

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // ✅ Paiement confirmé !
    console.log('✅ Paiement Alipay confirmé:', session.id);
    
    // TODO: Envoyer le billet par email
    // TODO: Mettre à jour la base de données
    // TODO: Créditer le cashback OMC
  }

  res.json({received: true});
});

app.listen(3000, () => {
  console.log('🚀 Serveur démarré sur http://localhost:3000');
});
```

---

### 2.3 Frontend HTML

**Fichier : `public/index.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Payer avec Alipay</title>
    <style>
        .btn-alipay {
            background: #1677ff;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>🎫 Acheter un billet OM</h1>
    <p>OM vs RC Lens - Stade Vélodrome</p>
    <p>Prix : 399¥ (~50€)</p>
    
    <button class="btn-alipay" onclick="payerAvecAlipay()">
        支付宝 Payer avec Alipay
    </button>
    
    <script>
        async function payerAvecAlipay() {
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            // Rediriger vers la page de paiement Stripe
            window.location.href = data.url;
        }
    </script>
</body>
</html>
```

---

### 2.4 Lancer le serveur

```bash
node server.js
```

**Accéder à l'application :**
```
http://localhost:3000
```

---

## 🧪 ÉTAPE 3 : Tester en Mode Sandbox (5 minutes)

### 3.1 Flux de test complet

1. **Ouvrir** : `http://localhost:3000`
2. **Cliquer** : "Payer avec Alipay"
3. **Page Stripe s'ouvre** avec option Alipay
4. **Sélectionner Alipay**
5. **Simulateur Alipay s'ouvre** (mode test)
6. **Cliquer** : "Authorize Test Payment"
7. **Redirection** : Page de succès

**✅ Aucun argent réel n'est débité en mode test**

---

### 3.2 Numéros de test Alipay

**En mode test, utilisez :**

**Succès :**
```
Alipay Test Account (fourni par Stripe)
→ Le simulateur s'ouvre automatiquement
→ Cliquez "Authorize"
```

**Échec :**
```
Simuler un échec dans le dashboard Stripe
```

---

### 3.3 Vérifier les paiements

**Dans le dashboard Stripe :**
```
Payments → All payments
```

**Vous verrez :**
- Montant : 399.00¥
- Méthode : Alipay
- Statut : Succeeded ✅
- Frais : 2.9% + 0.30€

---

## 🔐 ÉTAPE 4 : Webhooks (15 minutes)

### 4.1 Créer un endpoint webhook

**Dans le dashboard Stripe :**
```
Developers → Webhooks → Add endpoint
```

**URL de l'endpoint :**
```
https://marseille.paiecashplay.com/webhook
```

**Événements à écouter :**
- `checkout.session.completed` ✅
- `payment_intent.succeeded` ✅
- `payment_intent.payment_failed` ❌

---

### 4.2 Récupérer le secret du webhook

**Dans le dashboard Stripe :**
```
Developers → Webhooks → [votre endpoint] → Signing secret
```

**Format :**
```
whsec_abc123xyz...
```

**Ajouter dans server.js :**
```javascript
const webhookSecret = 'whsec_abc123xyz...';
```

---

### 4.3 Tester les webhooks localement

**Installer Stripe CLI :**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
```

**Configurer :**
```bash
stripe login
```

**Transférer les webhooks vers localhost :**
```bash
stripe listen --forward-to localhost:3000/webhook
```

**Tester un webhook :**
```bash
stripe trigger checkout.session.completed
```

---

## 💰 ÉTAPE 5 : Tarifs et Frais

### 5.1 Frais Stripe

**Tarif standard :**
- **2.9% + 0.30€** par transaction réussie
- **Pas de frais d'abonnement**
- **Pas de frais cachés**

**Exemple :**
```
Billet à 50€ :
- Frais : 50 × 2.9% + 0.30€ = 1.75€
- Vous recevez : 48.25€
```

---

### 5.2 Conversion de devises

**Alipay (CNY → EUR) :**
- **Taux de change** : Taux interbancaire + 1%
- **Exemple** : 399¥ = ~50€
- **Conversion automatique** par Stripe

---

### 5.3 Délai de paiement

**Versement sur votre compte :**
- **Mode standard** : 2 jours ouvrés
- **Mode express** : Jour même (frais additionnels)

---

## 🌍 ÉTAPE 6 : Passage en Production (10 minutes)

### 6.1 Activer le mode Live

**Dans le dashboard Stripe :**
```
Mode Test → Mode Live (toggle en haut à droite)
```

---

### 6.2 Récupérer les clés Live

**Dans le dashboard Stripe (Mode Live) :**
```
Developers → API keys
```

**Vous obtenez :**
```
pk_live_51Ab...xyz
sk_live_51Ab...xyz
```

---

### 6.3 Mettre à jour le code

**Fichier : `server.js`**

```javascript
// AVANT (Test)
const stripe = require('stripe')('sk_test_...');

// APRÈS (Production)
const stripe = require('stripe')('sk_live_...');
```

**Frontend : `index.html`**

```javascript
// Pas de changement nécessaire !
// Les clés publiques sont gérées côté serveur
```

---

### 6.4 Configurer les webhooks Live

**Dans le dashboard Stripe (Mode Live) :**
```
Developers → Webhooks → Add endpoint
```

**URL :**
```
https://marseille.paiecashplay.com/webhook
```

**⚠️ Ne pas oublier de mettre à jour** `webhookSecret` avec la nouvelle clé Live

---

## 📊 ÉTAPE 7 : Monitoring et Analytics

### 7.1 Dashboard Stripe

**Accès :**
```
https://dashboard.stripe.com
```

**Métriques disponibles :**
- Volume de paiements
- Taux de réussite
- Frais totaux
- Revenus nets
- Méthodes de paiement utilisées

---

### 7.2 Rapports personnalisés

**Dans le dashboard :**
```
Reports → Custom reports
```

**Créer des rapports sur :**
- Paiements Alipay vs autres méthodes
- Ventes par match
- Revenus par section (Tribune)
- Cashback distribué

---

## 🔥 ÉTAPE 8 : Optimisations

### 8.1 Cashback automatique en OMC

**Ajouter dans le webhook :**

```javascript
app.post('/webhook', async (req, res) => {
  // ... code existant ...
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const montant = session.amount_total / 100; // Convertir en euros
    
    // Calculer le cashback (3%)
    const cashback = montant * 0.03;
    
    // Créditer le compte OMC de l'utilisateur
    await crediterOMC(session.customer_email, cashback);
    
    console.log(`✅ Cashback de ${cashback} OMC crédité`);
  }
  
  res.json({received: true});
});

async function crediterOMC(email, montant) {
  // TODO: Intégrer avec votre base de données OMC
  // Exemple :
  // await db.users.update(
  //   { email: email },
  //   { $inc: { omcBalance: montant } }
  // );
}
```

---

### 8.2 QR Code Alipay

**Générer un QR Code pour paiement rapide :**

```javascript
const QRCode = require('qrcode');

app.get('/qr/:sessionId', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  
  // Générer le QR code
  const qrCode = await QRCode.toDataURL(session.url);
  
  res.send(`<img src="${qrCode}" alt="Scan pour payer">`);
});
```

**Affichage :**
```html
<img src="/qr/cs_test_abc123" alt="Scanner avec Alipay">
```

---

### 8.3 Multi-devises

**Supporter plusieurs devises :**

```javascript
const devises = {
  'CNY': 39900, // 399¥
  'EUR': 5000,  // 50€
  'USD': 5500   // 55$
};

app.post('/create-checkout-session', async (req, res) => {
  const devise = req.body.currency || 'EUR';
  const montant = devises[devise];
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: devise === 'CNY' ? ['alipay'] : ['card'],
    line_items: [{
      price_data: {
        currency: devise.toLowerCase(),
        unit_amount: montant,
        // ... reste du code
      }
    }],
    // ... reste du code
  });
  
  res.json({ url: session.url });
});
```

---

## 🎓 RESSOURCES OFFICIELLES

### Documentation Stripe
- **Alipay** : https://stripe.com/docs/payments/alipay
- **Checkout** : https://stripe.com/docs/checkout/quickstart
- **Webhooks** : https://stripe.com/docs/webhooks
- **API Reference** : https://stripe.com/docs/api

### Support
- **Email** : support@stripe.com
- **Chat** : Dans le dashboard (24/7)
- **Téléphone** : +33 1 76 40 13 82

---

## ✅ CHECKLIST FINALE

**Avant le lancement :**

- [ ] Compte Stripe créé et vérifié
- [ ] Alipay activé dans Settings
- [ ] Clés API testées (test et live)
- [ ] Serveur Node.js déployé
- [ ] Webhooks configurés (test et live)
- [ ] Tests de paiement réussis
- [ ] Cashback OMC intégré
- [ ] Monitoring activé
- [ ] URL de production configurées
- [ ] Documentation interne créée

---

## 🏆 RÉSULTAT

**Après cette intégration, l'OM pourra :**

✅ Accepter les paiements de **1+ milliard de Chinois**  
✅ Offrir une **expérience sans friction**  
✅ Distribuer du **cashback en OMC automatiquement**  
✅ Se positionner comme **club tech-forward**  
✅ Ouvrir de **nouveaux marchés internationaux**

---

**🎉 FÉLICITATIONS - VOUS ÊTES PRÊT À LANCER ALIPAY ! 🎉**
