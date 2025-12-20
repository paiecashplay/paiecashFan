# 🚀 GUIDE DE DÉPLOIEMENT MULTI-CLUBS

## 📌 Vue d'ensemble

Ce guide explique comment déployer PaieCashPlay pour **tous les clubs de Ligue 1** avec une architecture microservices scalable.

---

## 🏗️ Architecture

### Principe

Chaque club dispose de :
- ✅ **Son propre microservice** (Node.js + Express)
- ✅ **Sa propre base de données** (MongoDB dédiée)
- ✅ **Son propre sous-domaine** (`marseille.paiecashplay.com`)
- ✅ **Son propre compte Stripe** (clés API dédiées)
- ✅ **Son branding personnalisé** (couleurs, logo, stade)

### Avantages

✅ **Isolation** : Un problème sur un club n'affecte pas les autres  
✅ **Scalabilité** : Ajout d'un nouveau club en 5 minutes  
✅ **Performance** : Chaque microservice peut scaler indépendamment  
✅ **Maintenance** : Déploiement et mise à jour par club  
✅ **Personnalisation** : 100% brandé par club  

---

## 🚀 DÉMARRAGE RAPIDE

### Option 1 : Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/paiecashplay/multiclub.git
cd paiecashplay-multiclub

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Stripe

# 3. Démarrer tous les services
docker-compose up -d

# 4. Vérifier les services
docker-compose ps
```

**Résultat :**
```
✅ Gateway      : http://localhost:3100
✅ Marseille    : http://localhost:3000
✅ Paris FC     : http://localhost:3001
✅ Lyon         : http://localhost:3002
✅ PSG          : http://localhost:3003
✅ Monaco       : http://localhost:3004
✅ Admin        : http://localhost:3200
```

---

### Option 2 : Installation Manuelle

#### Étape 1 : Installer le template partagé

```bash
cd shared/templates
npm install
```

#### Étape 2 : Déployer Marseille

```bash
cd microservices/marseille
cp .env.example .env
# Éditer .env avec les clés Stripe OM
npm install
npm start
```

**Résultat :**
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       🏟️  Olympique de Marseille                      ║
║       ✅  Microservice démarré                         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

🚀 URL: http://localhost:3000
🏟️ Stade: Stade Vélodrome
🎨 Couleurs: #0e9cda
```

#### Étape 3 : Déployer Paris FC

```bash
cd microservices/parisfc
cp .env.example .env
# Éditer .env avec les clés Stripe Paris FC
npm install
npm start
```

**Résultat :**
```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       🏟️  Paris Football Club                         ║
║       ✅  Microservice démarré                         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

🚀 URL: http://localhost:3001
🏟️ Stade: Stade Charléty
🎨 Couleurs: #1e3a8a
```

---

## 🆕 CRÉER UN NOUVEAU CLUB

### Méthode 1 : Script Automatique

```bash
node scripts/create-club.js
```

**Questions interactives :**
```
🏟️  CRÉATION NOUVEAU CLUB PAIECASHPLAY

ID du club (ex: lille): lille
Nom complet (ex: LOSC Lille): LOSC Lille
Nom court (ex: LOSC): LOSC
Stade (ex: Stade Pierre-Mauroy): Stade Pierre-Mauroy
Couleur primaire (hex, ex: #e30613): #e30613
Port du microservice (ex: 3005): 3005

✅ Club créé avec succès !
📁 Dossier: microservices/lille

🚀 Pour démarrer:
   cd microservices/lille
   npm install
   npm start
```

---

### Méthode 2 : Manuelle

#### Étape 1 : Dupliquer le template

```bash
cp -r microservices/parisfc microservices/lille
cd microservices/lille
```

#### Étape 2 : Modifier `server.js`

```javascript
const config = {
  id: 'lille',
  name: 'LOSC Lille',
  shortName: 'LOSC',
  subdomain: 'lille',
  colors: {
    primary: '#e30613',
    secondary: '#ffffff'
  },
  logo: 'https://upload.wikimedia.org/wikipedia/fr/f/f6/Logo_LOSC_2018.svg',
  stadium: 'Stade Pierre-Mauroy',
  capacity: 50186,
  founded: 1944,
  website: 'https://www.losc.fr'
};
```

#### Étape 3 : Modifier `.env`

```env
PORT=3005
CLUB_ID=lille
CLUB_NAME=LOSC Lille
DATABASE_URL=mongodb://localhost:27017/lille_db
STRIPE_SECRET_KEY=sk_test_LILLE_...
```

#### Étape 4 : Modifier `package.json`

```json
{
  "name": "paiecashplay-lille",
  "description": "Microservice PaieCashPlay pour LOSC Lille"
}
```

#### Étape 5 : Démarrer

```bash
npm install
npm start
```

---

## 🌐 CONFIGURATION DNS ET SOUS-DOMAINES

### Développement Local

**Fichier `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows) :**

```
127.0.0.1 marseille.paiecashplay.local
127.0.0.1 parisfc.paiecashplay.local
127.0.0.1 lyon.paiecashplay.local
127.0.0.1 psg.paiecashplay.local
127.0.0.1 monaco.paiecashplay.local
```

**Accès :**
- http://marseille.paiecashplay.local:3000
- http://parisfc.paiecashplay.local:3001

---

### Production

**Configuration DNS (Cloudflare, AWS Route 53, etc.) :**

```
Type: A
Nom: *.paiecashplay.com
Valeur: [IP du serveur]
TTL: Auto
Proxy: Activé
```

**Ou configuration par sous-domaine :**

```
marseille.paiecashplay.com → [IP serveur]:3000
parisfc.paiecashplay.com   → [IP serveur]:3001
lyon.paiecashplay.com      → [IP serveur]:3002
psg.paiecashplay.com       → [IP serveur]:3003
monaco.paiecashplay.com    → [IP serveur]:3004
```

---

## 🔐 CONFIGURATION STRIPE PAR CLUB

### Principe

Chaque club doit avoir **son propre compte Stripe** pour :
- ✅ Comptabilité séparée
- ✅ Reporting indépendant
- ✅ Gestion des litiges par club
- ✅ Conformité fiscale

### Configuration

**1. Créer un compte Stripe Connect pour chaque club**

```
https://dashboard.stripe.com/connect
```

**2. Récupérer les clés par club**

| Club | Account ID | Secret Key | Publishable Key |
|------|-----------|------------|-----------------|
| OM | `acct_om123` | `sk_live_om...` | `pk_live_om...` |
| Paris FC | `acct_pfc456` | `sk_live_pfc...` | `pk_live_pfc...` |
| Lyon | `acct_ol789` | `sk_live_ol...` | `pk_live_ol...` |

**3. Configurer dans `.env` de chaque microservice**

```env
# microservices/marseille/.env
STRIPE_SECRET_KEY=sk_live_om...
STRIPE_ACCOUNT_ID=acct_om123

# microservices/parisfc/.env
STRIPE_SECRET_KEY=sk_live_pfc...
STRIPE_ACCOUNT_ID=acct_pfc456
```

---

## 📊 DASHBOARD ADMIN CENTRALISÉ

### Accès

```
http://admin.paiecashplay.com
ou
http://localhost:3200
```

### Fonctionnalités

- ✅ **Vue d'ensemble multi-clubs**
- ✅ **Statistiques temps réel** (CA, transactions, utilisateurs)
- ✅ **Gestion des clubs** (ajouter, modifier, désactiver)
- ✅ **Monitoring** (santé des microservices)
- ✅ **Logs centralisés**
- ✅ **Déploiement** (un clic par club)

---

## 🔄 DÉPLOIEMENT CONTINU

### GitHub Actions

**Fichier `.github/workflows/deploy-club.yml` :**

```yaml
name: Deploy Club Microservice

on:
  push:
    branches: [main]
    paths:
      - 'microservices/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Detect changed clubs
        id: changes
        run: |
          CLUBS=$(git diff --name-only HEAD^ HEAD | grep microservices | cut -d'/' -f2 | uniq)
          echo "clubs=$CLUBS" >> $GITHUB_OUTPUT
      
      - name: Deploy to production
        run: |
          for CLUB in ${{ steps.changes.outputs.clubs }}; do
            echo "Deploying $CLUB..."
            ./scripts/deploy-club.sh $CLUB
          done
```

---

## 📈 MONITORING

### Health Checks

Chaque microservice expose un endpoint `/health` :

```bash
curl http://marseille.paiecashplay.com/health
```

**Réponse :**
```json
{
  "status": "OK",
  "club": "Olympique de Marseille",
  "service": "PaieCashPlay Microservice",
  "timestamp": "2025-12-07T18:30:00Z",
  "database": "connected",
  "stripe": "configured"
}
```

### Prometheus + Grafana

**Configuration `prometheus.yml` :**

```yaml
scrape_configs:
  - job_name: 'paiecashplay-clubs'
    static_configs:
      - targets:
        - 'marseille.paiecashplay.com:3000'
        - 'parisfc.paiecashplay.com:3001'
        - 'lyon.paiecashplay.com:3002'
```

---

## 🔒 SÉCURITÉ

### HTTPS / SSL

**Certbot (Let's Encrypt) :**

```bash
certbot certonly --webroot \
  -w /var/www/html \
  -d marseille.paiecashplay.com \
  -d parisfc.paiecashplay.com \
  -d lyon.paiecashplay.com
```

### Rate Limiting

Chaque microservice doit implémenter :

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes par IP
});

app.use('/api/', limiter);
```

### CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://paiecashplay.com',
    'https://marseille.paiecashplay.com',
    'https://parisfc.paiecashplay.com'
  ],
  credentials: true
}));
```

---

## 💾 BASE DE DONNÉES

### Architecture

- **1 instance MongoDB par club**
- **Collections identiques** mais données séparées
- **Backup automatique quotidien**

### Collections Standard

```javascript
// Même structure pour tous les clubs
{
  users: Collection,           // Utilisateurs du club
  tickets: Collection,         // Billets vendus
  transactions: Collection,    // Historique paiements
  products: Collection,        // Merchandising
  nfts: Collection,           // NFTs du club
  loyalty: Collection         // Programme fidélité
}
```

### Backup

```bash
# Script de backup quotidien
#!/bin/bash
CLUBS=("marseille" "parisfc" "lyon" "psg" "monaco")

for CLUB in "${CLUBS[@]}"; do
  mongodump \
    --uri="mongodb://localhost:27017/${CLUB}_db" \
    --out="/backups/${CLUB}/$(date +%Y%m%d)"
done
```

---

## 🎨 PERSONNALISATION PAR CLUB

### Thème Dynamique

Chaque microservice charge automatiquement :

```javascript
// Génération CSS dynamique
app.get('/theme.css', (req, res) => {
  const css = `
    :root {
      --primary-color: ${config.colors.primary};
      --secondary-color: ${config.colors.secondary};
    }
    
    .header {
      background: var(--primary-color);
    }
    
    .logo {
      background-image: url(${config.logo});
    }
  `;
  
  res.type('text/css').send(css);
});
```

### Templates EJS

```html
<!-- views/index.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= club.name %> - PaieCashPlay</title>
  <link rel="stylesheet" href="/theme.css">
</head>
<body>
  <header style="background: <%= club.colors.primary %>">
    <img src="<%= club.logo %>" alt="<%= club.shortName %>">
    <h1><%= club.name %></h1>
  </header>
  
  <main>
    <h2>🏟️ <%= club.stadium %></h2>
    <p>Capacité : <%= club.capacity.toLocaleString() %> places</p>
  </main>
</body>
</html>
```

---

## 📋 CHECKLIST DÉPLOIEMENT

### Par Club

- [ ] Compte Stripe créé
- [ ] Clés API configurées
- [ ] Base de données créée
- [ ] Variables d'environnement définies
- [ ] Microservice déployé
- [ ] Health check OK
- [ ] DNS configuré
- [ ] SSL activé
- [ ] Tests de paiement réussis
- [ ] Monitoring actif

### Global

- [ ] API Gateway déployé
- [ ] Dashboard admin accessible
- [ ] Backups automatiques configurés
- [ ] CI/CD fonctionnel
- [ ] Documentation à jour

---

## 🏆 RÉSULTAT FINAL

Avec cette architecture, vous pouvez :

✅ **Déployer un nouveau club en 5 minutes**  
✅ **Scaler indépendamment chaque club**  
✅ **Gérer 100+ clubs sans problème**  
✅ **Isoler les problèmes par club**  
✅ **Personnaliser 100% par club**  

**🚀 Prêt pour tous les clubs de Ligue 1 et au-delà !**

---

**Version :** 1.0.0  
**Date :** 2025-12-07  
**Équipe :** PaieCashPlay Development Team
