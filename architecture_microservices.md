# 🏗️ ARCHITECTURE MICROSERVICES - PAIECASHPLAY MULTI-CLUBS

## 🎯 Vision

Créer une **architecture scalable** permettant de déployer PaieCashPlay pour **chaque club professionnel** avec :
- 🏟️ **Microservice indépendant par club**
- 🎨 **Branding personnalisé automatique**
- 💾 **Base de données dédiée par club**
- 🌐 **Sous-domaine dédié** (ex: `marseille.paiecashplay.com`, `parisfc.paiecashplay.com`)
- 📊 **Dashboard centralisé** pour gestion multi-clubs

---

## 🏛️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    paiecashplay.com (Hub Central)               │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Dashboard Admin  │  │  API Gateway     │                   │
│  │  Multi-Clubs      │  │  (Reverse Proxy) │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Microservice    │  │  Microservice    │  │  Microservice    │
│  Marseille       │  │  Paris FC        │  │  Lyon            │
│                  │  │                  │  │                  │
│  marseille.      │  │  parisfc.        │  │  lyon.           │
│  paiecashplay    │  │  paiecashplay    │  │  paiecashplay    │
│  .com            │  │  .com            │  │  .com            │
│                  │  │                  │  │                  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │ Node.js    │  │  │  │ Node.js    │  │  │  │ Node.js    │  │
│  │ Express    │  │  │  │ Express    │  │  │  │ Express    │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
│  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │ MongoDB    │  │  │  │ MongoDB    │  │  │  │ MongoDB    │  │
│  │ om_db      │  │  │  │ parisfc_db │  │  │  │ lyon_db    │  │
│  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 📁 Structure du Projet

```
paiecashplay-multiclub/
│
├── 📁 config/
│   ├── clubs.json              # Configuration de tous les clubs
│   ├── ligue1.json             # Clubs Ligue 1
│   └── gateway.config.js       # Configuration API Gateway
│
├── 📁 shared/
│   ├── templates/              # Templates réutilisables
│   ├── components/             # Composants communs
│   └── utils/                  # Utilitaires partagés
│
├── 📁 microservices/
│   │
│   ├── 📁 marseille/
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── .env
│   │   ├── config.json
│   │   └── public/
│   │       └── index.html
│   │
│   ├── 📁 parisfc/
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── .env
│   │   ├── config.json
│   │   └── public/
│   │       └── index.html
│   │
│   └── 📁 [autres clubs]/
│
├── 📁 gateway/
│   ├── server.js               # API Gateway
│   └── routes.js               # Routing multi-clubs
│
├── 📁 admin/
│   ├── dashboard.html          # Dashboard admin
│   └── api.js                  # API admin
│
├── 📁 scripts/
│   ├── create-club.js          # Script création nouveau club
│   ├── deploy-club.js          # Script déploiement
│   └── sync-data.js            # Synchronisation données
│
└── README.md
```

---

## 🏆 Configuration Ligue 1

### Fichier : `config/ligue1.json`

```json
{
  "ligue": {
    "name": "Ligue 1",
    "country": "France",
    "season": "2024-2025"
  },
  "clubs": [
    {
      "id": "om",
      "name": "Olympique de Marseille",
      "shortName": "OM",
      "subdomain": "marseille",
      "colors": {
        "primary": "#0e9cda",
        "secondary": "#ffffff"
      },
      "logo": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
      "stadium": "Stade Vélodrome",
      "capacity": 67394,
      "founded": 1899,
      "website": "https://www.om.fr"
    },
    {
      "id": "parisfc",
      "name": "Paris Football Club",
      "shortName": "Paris FC",
      "subdomain": "parisfc",
      "colors": {
        "primary": "#1e3a8a",
        "secondary": "#dc2626"
      },
      "logo": "https://upload.wikimedia.org/wikipedia/fr/9/95/Logo_Paris_FC_2020.svg",
      "stadium": "Stade Charléty",
      "capacity": 20000,
      "founded": 1969,
      "website": "https://www.parisfc.fr"
    },
    {
      "id": "psg",
      "name": "Paris Saint-Germain",
      "shortName": "PSG",
      "subdomain": "psg",
      "colors": {
        "primary": "#004170",
        "secondary": "#DA020E"
      },
      "logo": "https://upload.wikimedia.org/wikipedia/fr/7/76/Paris_Saint-Germain_logo.svg",
      "stadium": "Parc des Princes",
      "capacity": 47929,
      "founded": 1970,
      "website": "https://www.psg.fr"
    },
    {
      "id": "ol",
      "name": "Olympique Lyonnais",
      "shortName": "OL",
      "subdomain": "lyon",
      "colors": {
        "primary": "#DA020E",
        "secondary": "#0E3386",
        "tertiary": "#FFFFFF"
      },
      "logo": "https://upload.wikimedia.org/wikipedia/fr/e/e2/Olympique_lyonnais_%28logo%29.svg",
      "stadium": "Groupama Stadium",
      "capacity": 59186,
      "founded": 1950,
      "website": "https://www.ol.fr"
    },
    {
      "id": "monaco",
      "name": "AS Monaco",
      "shortName": "Monaco",
      "subdomain": "monaco",
      "colors": {
        "primary": "#DA020E",
        "secondary": "#FFFFFF"
      },
      "logo": "https://upload.wikimedia.org/wikipedia/commons/4/49/Logo_AS_Monaco.svg",
      "stadium": "Stade Louis II",
      "capacity": 18523,
      "founded": 1924,
      "website": "https://www.asmonaco.com"
    }
  ]
}
```

---

## 🔧 Template de Microservice

### Fichier : `shared/templates/club-server.template.js`

```javascript
// Template générique pour créer un serveur club
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

class ClubMicroservice {
  constructor(config) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static('public'));
    this.app.set('view engine', 'ejs');
  }

  setupRoutes() {
    // Page d'accueil personnalisée
    this.app.get('/', (req, res) => {
      res.render('index', {
        club: this.config
      });
    });

    // API billets
    this.app.get('/api/tickets', this.getTickets.bind(this));
    this.app.post('/api/tickets/buy', this.buyTicket.bind(this));

    // API merchandising
    this.app.get('/api/shop', this.getShopItems.bind(this));
    this.app.post('/api/shop/buy', this.buyItem.bind(this));

    // Paiement Alipay
    this.app.post('/api/payment/alipay', this.createAlipaySession.bind(this));

    // Webhooks Stripe
    this.app.post('/webhook', this.handleWebhook.bind(this));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        club: this.config.name,
        service: 'PaieCashPlay Microservice',
        timestamp: new Date().toISOString()
      });
    });
  }

  async getTickets(req, res) {
    // Logique spécifique au club
    const tickets = [
      {
        id: 1,
        match: `${this.config.shortName} vs RC Lens`,
        date: '2024-12-15',
        price: 50,
        stadium: this.config.stadium,
        available: true
      }
    ];
    res.json(tickets);
  }

  async buyTicket(req, res) {
    // Logique d'achat de billet
    const { ticketId, paymentMethod } = req.body;
    
    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [paymentMethod],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: 5000, // 50€
          product_data: {
            name: `Billet ${this.config.name}`,
            description: this.config.stadium
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/cancel`,
      metadata: {
        club: this.config.id,
        type: 'ticket'
      }
    });

    res.json({ url: session.url });
  }

  async getShopItems(req, res) {
    // Merchandising du club
    const items = [
      {
        id: 1,
        name: `Maillot ${this.config.shortName} 2024`,
        price: 90,
        image: `${this.config.logo}`,
        available: true
      }
    ];
    res.json(items);
  }

  async buyItem(req, res) {
    // Logique d'achat merchandising
    // Similaire à buyTicket
  }

  async createAlipaySession(req, res) {
    // Session Alipay spécifique
    const { amount, description } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['alipay'],
      line_items: [{
        price_data: {
          currency: 'cny',
          unit_amount: amount * 100,
          product_data: {
            name: description,
            description: this.config.name
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/success`,
      cancel_url: `${process.env.APP_URL}/cancel`
    });

    res.json({ url: session.url });
  }

  async handleWebhook(req, res) {
    // Gestion webhooks Stripe
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`✅ Paiement confirmé pour ${this.config.name}:`, session.id);
      // Logique métier spécifique
    }

    res.json({ received: true });
  }

  start(port) {
    this.app.listen(port, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║                                                        ║');
      console.log(`║       🏟️  ${this.config.name.padEnd(40)} ║`);
      console.log('║       ✅  Microservice démarré                         ║');
      console.log('║                                                        ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 URL: http://localhost:${port}`);
      console.log(`🏟️ Stade: ${this.config.stadium}`);
      console.log(`🎨 Couleurs: ${this.config.colors.primary}`);
      console.log('');
    });
  }
}

module.exports = ClubMicroservice;
```

---

## 🔴 Microservice Paris FC

### Fichier : `microservices/parisfc/server.js`

```javascript
require('dotenv').config();
const ClubMicroservice = require('../../shared/templates/club-server.template');

// Configuration Paris FC
const config = {
  id: 'parisfc',
  name: 'Paris Football Club',
  shortName: 'Paris FC',
  subdomain: 'parisfc',
  colors: {
    primary: '#1e3a8a',
    secondary: '#dc2626'
  },
  logo: 'https://upload.wikimedia.org/wikipedia/fr/9/95/Logo_Paris_FC_2020.svg',
  stadium: 'Stade Charléty',
  capacity: 20000,
  founded: 1969,
  website: 'https://www.parisfc.fr'
};

// Créer et démarrer le microservice
const parisfc = new ClubMicroservice(config);
parisfc.start(process.env.PORT || 3001);
```

### Fichier : `microservices/parisfc/package.json`

```json
{
  "name": "paiecashplay-parisfc",
  "version": "1.0.0",
  "description": "Microservice PaieCashPlay pour Paris FC",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["parisfc", "paiement", "alipay"],
  "author": "PaieCashPlay",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "stripe": "^14.10.0",
    "dotenv": "^16.3.1",
    "ejs": "^3.1.9",
    "cors": "^2.8.5"
  }
}
```

### Fichier : `microservices/parisfc/.env`

```env
# Paris FC Microservice Configuration
PORT=3001
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK

# Application
APP_URL=http://localhost:3001
APP_NAME=PaieCashPlay Paris FC

# Database
DATABASE_URL=mongodb://localhost:27017/parisfc_db

# Club Specific
CLUB_ID=parisfc
CLUB_NAME=Paris Football Club
```

---

## 🌐 API Gateway

### Fichier : `gateway/server.js`

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Configuration des microservices
const services = {
  marseille: 'http://localhost:3000',
  parisfc: 'http://localhost:3001',
  lyon: 'http://localhost:3002',
  psg: 'http://localhost:3003',
  monaco: 'http://localhost:3004'
};

// Routage dynamique basé sur le sous-domaine
app.use((req, res, next) => {
  const host = req.hostname;
  const subdomain = host.split('.')[0];
  
  if (services[subdomain]) {
    return createProxyMiddleware({
      target: services[subdomain],
      changeOrigin: true
    })(req, res, next);
  }
  
  next();
});

// Page d'accueil du hub
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PaieCashPlay - Multi-Clubs</title>
        <style>
          body { font-family: Arial; padding: 50px; text-align: center; }
          .club-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
          .club-card { border: 2px solid #ddd; padding: 30px; border-radius: 15px; cursor: pointer; }
          .club-card:hover { border-color: #0e9cda; transform: scale(1.05); }
        </style>
      </head>
      <body>
        <h1>🏟️ PaieCashPlay Multi-Clubs</h1>
        <p>Sélectionnez votre club :</p>
        <div class="club-grid">
          ${Object.keys(services).map(club => `
            <div class="club-card" onclick="window.location.href='http://${club}.paiecashplay.com'">
              <h2>${club.toUpperCase()}</h2>
              <p>Accéder à l'app</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `);
});

app.listen(3100, () => {
  console.log('🌐 API Gateway démarré sur le port 3100');
  console.log('📍 Clubs disponibles:');
  Object.keys(services).forEach(club => {
    console.log(`   • ${club}: ${services[club]}`);
  });
});
```

---

## 🛠️ Script de Création de Club

### Fichier : `scripts/create-club.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createClub() {
  console.log('🏟️  CRÉATION NOUVEAU CLUB PAIECASHPLAY\n');
  
  const clubId = await prompt('ID du club (ex: lille): ');
  const clubName = await prompt('Nom complet (ex: LOSC Lille): ');
  const shortName = await prompt('Nom court (ex: LOSC): ');
  const stadium = await prompt('Stade (ex: Stade Pierre-Mauroy): ');
  const primaryColor = await prompt('Couleur primaire (hex, ex: #e30613): ');
  const port = await prompt('Port du microservice (ex: 3005): ');
  
  const clubDir = path.join(__dirname, '..', 'microservices', clubId);
  
  // Créer le dossier
  if (!fs.existsSync(clubDir)) {
    fs.mkdirSync(clubDir, { recursive: true });
  }
  
  // Créer server.js
  const serverContent = `require('dotenv').config();
const ClubMicroservice = require('../../shared/templates/club-server.template');

const config = {
  id: '${clubId}',
  name: '${clubName}',
  shortName: '${shortName}',
  stadium: '${stadium}',
  colors: {
    primary: '${primaryColor}',
    secondary: '#ffffff'
  },
  subdomain: '${clubId}'
};

const ${clubId} = new ClubMicroservice(config);
${clubId}.start(${port});
`;
  
  fs.writeFileSync(path.join(clubDir, 'server.js'), serverContent);
  
  // Créer package.json
  const packageContent = {
    name: `paiecashplay-${clubId}`,
    version: '1.0.0',
    description: `Microservice PaieCashPlay pour ${clubName}`,
    main: 'server.js',
    scripts: {
      start: 'node server.js',
      dev: 'nodemon server.js'
    },
    dependencies: {
      express: '^4.18.2',
      stripe: '^14.10.0',
      dotenv: '^16.3.1',
      ejs: '^3.1.9'
    }
  };
  
  fs.writeFileSync(
    path.join(clubDir, 'package.json'),
    JSON.stringify(packageContent, null, 2)
  );
  
  // Créer .env
  const envContent = `PORT=${port}
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
APP_URL=http://localhost:${port}
CLUB_ID=${clubId}
CLUB_NAME=${clubName}
`;
  
  fs.writeFileSync(path.join(clubDir, '.env'), envContent);
  
  console.log('\n✅ Club créé avec succès !');
  console.log(`📁 Dossier: microservices/${clubId}`);
  console.log(`\n🚀 Pour démarrer:`);
  console.log(`   cd microservices/${clubId}`);
  console.log(`   npm install`);
  console.log(`   npm start`);
  
  rl.close();
}

createClub();
```

---

**Suite dans le prochain message...**
