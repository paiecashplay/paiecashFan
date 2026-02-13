# PaieCashFan v8.0 - Super App Sport Mondiale

**Version:** 8.0.0  
**Date:** 13 Fevrier 2026  
**Status:** ✅ PHASE 2 COMPLETE (30%)

---

## DESCRIPTION

PaieCashFan est une Super App sportive qui connecte les fans du monde entier avec leurs clubs favoris. Elle integre merchandising, wallet crypto, reseau social, billets NFT, eSIM, et IA personnalisation.

### Caracteristiques Principales
- **212 Federations** mondiales supportees
- **500+ Clubs** avec merchandising officiel
- **29 API Endpoints** REST fonctionnels
- **SANS EMOJIS** - Compatible Vercel, Cloudflare, Netlify
- **Interface Moderne** - Design Instagram/TikTok style
- **LOTO** - Gamification pour gagner PCC et NFT

---

## URLS DE TEST

### Interface Utilisateur
- **Accueil** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/index.html
- **Federation CAF** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/federation.html?fed=caf
- **Club Maroc** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/club.html?club=ma&name=Maroc&fed=CAF

### API Endpoints
- **Health** : /api/health
- **Federations** : /api/federations
- **Stories** : /api/stories?club=Maroc
- **Feed** : /api/feed?club=Maroc
- **Wallet** : /api/wallet/balance

---

## FONCTIONNALITES

### ✅ TERMINE (Phase 1 & 2)

#### Interface Utilisateur
- **Index Principal** - Liste des federations mondiales
- **Page Federation** - Clubs par federation
- **Page Club** - Interface complete avec :
  - Stories horizontales (Instagram style)
  - Feed social avec posts sponsorises
  - Merchandising modal
  - **LOTO** sous logo Gamification
  - Systeme FOMO rewards
  - Navigation bottom moderne

#### Backend API (29 Endpoints)
- Auth (2) : register, login
- Wallet (4) : balance, transactions, send, deposit
- Stories & Feed (3) : stories, feed, interactions
- eSIM (3) : plans, activate, active
- Shop (4) : products, cart, checkout
- Tickets (4) : events, purchase, my-tickets, qr
- Social (3) : conversations, messages, feed
- IA (3) : recommendations, insights, predictions
- System (2) : health, stats
- Federations (2) : list, clubs
- Clubs (2) : details, merchandising
- Merchandising (1) : purchase

---

## INSTALLATION

### Prerequis
- Node.js 20+
- NPM
- Git

### Installation
```bash
# Cloner
git clone <repo-url>
cd webapp

# Installer
npm install

# Build
npm run build

# Demarrer
pm2 start ecosystem.config.cjs
```

---

## STRUCTURE

```
webapp/
├── src/
│   ├── index.tsx              # Backend Hono
│   └── api/
│       ├── types.ts
│       └── regie-publicitaire.ts
├── public/
│   ├── index.html            # Page principale
│   ├── federation.html       # Liste clubs
│   ├── club.html             # Interface club
│   └── data/
├── dist/                     # Build output
├── package.json
├── wrangler.jsonc
└── README.md
```

---

## COMMANDES

```bash
# Development
npm run build          # Build
npm run dev            # Dev mode

# PM2
pm2 start ecosystem.config.cjs
pm2 restart paiecashfan
pm2 logs paiecashfan --nostream

# Git
git status
git commit -m "message"
git log --oneline
```

---

## STACK TECHNIQUE

- **Frontend** : HTML5, CSS3, JavaScript ES6+, Axios, Font Awesome
- **Backend** : Hono 4.11.9, TypeScript 5+, Cloudflare Workers
- **Build** : Vite 6.4.1, Wrangler 4.65.0
- **DevOps** : PM2 6.0.14, Git, NPM

---

## API EXAMPLES

```bash
# Health
GET /api/health

# Federations
GET /api/federations

# Stories
GET /api/stories?club=Maroc

# Balance
GET /api/wallet/balance
```

---

## DEPLOIEMENT

### Cloudflare Pages
```bash
# Setup
npx wrangler whoami

# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name paiecashfan
```

---

## SUPPORT

- **Email** : support@paiecashfan.com
- **Docs** : STATUS.md, PHASE_2_COMPLETE.md

---

## CHANGELOG

### v8.0.0 (13 Feb 2026)
- ✅ Interface principale + federations
- ✅ Page club complete
- ✅ LOTO gamification
- ✅ Backend 29 endpoints
- ✅ SANS emojis - Compatible Vercel

---

**PaieCashFan v8.0 - Connectons les fans du monde entier !**
