# 🚀 DÉMARRAGE RAPIDE - SERVEUR ALIPAY

## 📌 Installation en 5 minutes

### Prérequis
- Node.js 14+ installé
- npm 6+ installé
- Compte Stripe (gratuit)

---

## ⚡ ÉTAPE 1 : Installation

```bash
# Installer les dépendances
npm install
```

**Résultat :**
```
✅ express installé
✅ stripe installé
✅ body-parser installé
✅ cors installé
✅ dotenv installé
```

---

## 🔑 ÉTAPE 2 : Configuration Stripe

### 2.1 Créer un compte Stripe

```
https://dashboard.stripe.com/register
```

### 2.2 Récupérer les clés API

**Dans le dashboard Stripe :**
```
Developers → API keys
```

**Vous obtenez :**
- `pk_test_...` (Publishable key)
- `sk_test_...` (Secret key)

### 2.3 Activer Alipay

**Dans le dashboard Stripe :**
```
Settings → Payments → Payment methods → Alipay → Enable
```

### 2.4 Configurer le fichier .env

```bash
# Copier le fichier exemple
cp .env.example .env
```

**Éditer `.env` :**
```env
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
PORT=3000
```

---

## 🚀 ÉTAPE 3 : Démarrer le serveur

```bash
npm start
```

**Résultat attendu :**
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       🏟️  PAIECASHPLAY ALIPAY SERVER                  ║
║       ✅  Serveur démarré avec succès                  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

🚀 Serveur: http://localhost:3000
🔧 Environnement: development
🔑 Stripe Mode: TEST

📊 Routes disponibles:
   GET  /              - Page d'accueil
   POST /create-checkout-session - Créer session paiement
   GET  /success       - Page de succès
   GET  /cancel        - Page d'annulation
   POST /webhook       - Webhook Stripe
   GET  /health        - Health check

💡 Pour tester:
   Ouvrez votre navigateur sur http://localhost:3000
```

---

## 🧪 ÉTAPE 4 : Tester un paiement

### 4.1 Ouvrir l'application

```
http://localhost:3000
```

### 4.2 Cliquer sur "Payer avec Alipay"

**Ce qui se passe :**
1. Page Stripe s'ouvre
2. Option "Alipay" apparaît
3. Cliquez sur "Alipay"
4. **Simulateur Alipay s'ouvre** (mode test)
5. Cliquez sur "Authorize Test Payment"
6. Redirection vers page de succès

**✅ Aucun argent réel n'est débité !**

---

## 📊 ÉTAPE 5 : Vérifier le paiement

### 5.1 Dans le dashboard Stripe

```
https://dashboard.stripe.com/test/payments
```

**Vous verrez :**
- Montant : 399.00¥
- Méthode : Alipay
- Statut : Succeeded ✅
- Frais : ~1.50€

### 5.2 Dans les logs du serveur

```
✅ Session créée: cs_test_abc123
✅ Paiement confirmé: cs_test_abc123
💰 Montant: 399 CNY
🎁 Cashback: 11.97 OMC
```

---

## 🔧 ÉTAPE 6 : Configurer les Webhooks

### 6.1 Installer Stripe CLI

**macOS :**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows :**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux :**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 6.2 Authentifier Stripe CLI

```bash
stripe login
```

**Résultat :**
```
Your pairing code is: word-word-word
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser (^C to quit)
```

**Appuyez sur Enter** → Navigateur s'ouvre → Confirmez

### 6.3 Transférer les webhooks vers localhost

```bash
stripe listen --forward-to localhost:3000/webhook
```

**Résultat :**
```
Ready! Your webhook signing secret is whsec_abc123xyz...
2024-01-15 10:30:15   --> charge.succeeded [evt_abc123]
```

**Copiez le secret** et ajoutez-le dans `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
```

### 6.4 Tester un webhook

**Dans un autre terminal :**
```bash
stripe trigger checkout.session.completed
```

**Résultat dans les logs :**
```
✅ Paiement confirmé: cs_test_...
💰 Montant: 50 EUR
🎁 Cashback: 1.5 OMC
```

---

## 🌍 ÉTAPE 7 : Passer en Production

### 7.1 Basculer en mode Live

**Dans le dashboard Stripe :**
```
Mode Test → Mode Live (toggle en haut à droite)
```

### 7.2 Récupérer les clés Live

**Dans le dashboard Stripe (Mode Live) :**
```
Developers → API keys
```

**Mettre à jour `.env` :**
```env
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_LIVE
STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE_LIVE
```

### 7.3 Configurer le webhook Live

**Dans le dashboard Stripe (Mode Live) :**
```
Developers → Webhooks → Add endpoint
```

**URL de l'endpoint :**
```
https://marseille.paiecashplay.com/webhook
```

**Événements à écouter :**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

**Récupérer le secret** et mettre à jour `.env` :
```env
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_LIVE
```

### 7.4 Déployer sur un serveur

**Options de déploiement :**

**Render.com (Recommandé) :**
```
https://render.com
→ New Web Service
→ Connect GitHub repo
→ Build Command: npm install
→ Start Command: npm start
→ Environment: Ajouter les variables .env
```

**Fly.io :**
```bash
fly launch
fly secrets set STRIPE_SECRET_KEY=sk_live_...
fly deploy
```

**Heroku :**
```bash
heroku create paiecashplay-alipay
heroku config:set STRIPE_SECRET_KEY=sk_live_...
git push heroku main
```

---

## 🔍 ÉTAPE 8 : Monitoring

### 8.1 Dashboard Stripe

**Accès :**
```
https://dashboard.stripe.com
```

**Métriques :**
- Volume de paiements
- Taux de réussite
- Revenus
- Méthodes de paiement

### 8.2 Logs du serveur

**En production :**
```bash
# Voir les logs en temps réel
pm2 logs paiecashplay-alipay

# Voir les logs des 100 dernières lignes
pm2 logs paiecashplay-alipay --lines 100
```

---

## ✅ CHECKLIST

**Avant le lancement :**

- [ ] Node.js et npm installés
- [ ] Dépendances installées (`npm install`)
- [ ] Compte Stripe créé
- [ ] Alipay activé dans Stripe
- [ ] Clés API configurées dans `.env`
- [ ] Serveur démarre sans erreur
- [ ] Paiement test réussi
- [ ] Webhooks configurés
- [ ] Stripe CLI installé
- [ ] Webhooks testés localement

**Pour la production :**

- [ ] Clés Live configurées
- [ ] Webhook Live configuré
- [ ] Serveur déployé
- [ ] URL de production ajoutée
- [ ] Monitoring activé
- [ ] Tests de bout en bout réussis

---

## 🆘 DÉPANNAGE

### Erreur : "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Invalid API key"

**Vérifier :**
1. Que la clé dans `.env` est correcte
2. Que vous êtes en mode Test ou Live correspondant
3. Que le fichier `.env` est bien chargé

### Erreur : "Webhook signature verification failed"

**Solutions :**
1. Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
2. Utiliser `stripe listen` pour tester localement
3. Vérifier que le endpoint webhook est accessible

### Port 3000 déjà utilisé

**Changer le port :**
```env
PORT=3001
```

**Ou tuer le processus :**
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 📚 RESSOURCES

### Documentation
- **Stripe Alipay :** https://stripe.com/docs/payments/alipay
- **Stripe Checkout :** https://stripe.com/docs/checkout
- **Stripe Webhooks :** https://stripe.com/docs/webhooks

### Support
- **Email :** support@paiecashplay.com
- **Stripe Support :** support@stripe.com
- **Documentation :** Voir `GUIDE_INTEGRATION_ALIPAY_STRIPE.md`

---

## 🎉 FÉLICITATIONS !

Votre serveur Alipay est maintenant opérationnel ! 🚀

**Prochaines étapes :**
1. Intégrer avec votre base de données
2. Ajouter l'envoi d'emails
3. Implémenter le cashback OMC
4. Déployer en production
5. Monitorer les paiements

**Bon lancement ! 🏟️**
