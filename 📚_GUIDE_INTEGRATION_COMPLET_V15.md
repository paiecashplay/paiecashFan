# 📚 GUIDE D'INTÉGRATION COMPLET - PAIECASHFAN V15
## Intégration Thirdweb - Wallet Invisible, Stablecoin, NFT Billetterie

---

## 🚀 DÉMARRAGE RAPIDE (5 MINUTES)

### 1. Créer un compte Thirdweb

```bash
# Aller sur https://thirdweb.com/dashboard
# Créer un compte gratuit
# Obtenir votre Client ID
```

### 2. Installer le SDK PaieCashFan

#### Option A : Web Components (Recommandé - Sans framework)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Billetterie PaieCashFan</title>
</head>
<body>
    <!-- Widget Wallet -->
    <paiecashfan-wallet
        client-id="YOUR_CLIENT_ID"
        club-id="angers-sco"
        theme="light"
        language="fr"
        thirdweb-client-id="YOUR_THIRDWEB_CLIENT_ID"
    ></paiecashfan-wallet>
    
    <!-- Widget Paiement -->
    <paiecashfan-payment
        client-id="YOUR_CLIENT_ID"
        product-id="ticket-angers-psg-2025"
        product-name="Ticket Angers SCO vs PSG"
        product-image="https://example.com/ticket.jpg"
        price="50"
        currency="EUR"
        club-id="angers-sco"
        theme="light"
        thirdweb-client-id="YOUR_THIRDWEB_CLIENT_ID"
    ></paiecashfan-payment>
    
    <!-- Charger le SDK -->
    <script src="https://cdn.paiecashfan.com/sdk/paiecashfan-wallet-widget.js"></script>
    <script src="https://cdn.paiecashfan.com/sdk/paiecashfan-payment-widget.js"></script>
</body>
</html>
```

#### Option B : React/Next.js

```bash
npm install thirdweb @paiecashfan/sdk
```

```tsx
import { PaieCashFanWallet, PaieCashFanPayment } from '@paiecashfan/sdk';

export default function TicketPage() {
  return (
    <div>
      <PaieCashFanWallet
        clientId="YOUR_CLIENT_ID"
        clubId="angers-sco"
        theme="light"
      />
      
      <PaieCashFanPayment
        productId="ticket-angers-psg-2025"
        productName="Ticket Angers SCO vs PSG"
        price={50}
        currency="EUR"
        clubId="angers-sco"
      />
    </div>
  );
}
```

---

## 📦 INSTALLATION COMPLÈTE

### Backend Node.js/TypeScript

```bash
# Créer projet Node.js
npm init -y
npm install typescript ts-node @types/node --save-dev

# Installer dépendances
npm install thirdweb express prisma @prisma/client ioredis amqplib
npm install dotenv winston zod

# Installer types
npm install @types/express @types/amqplib --save-dev
```

### Frontend React/Next.js

```bash
# Créer projet Next.js
npx create-next-app@latest paiecashfan-app --typescript --tailwind

# Installer SDK Thirdweb
npm install thirdweb

# Installer composants PaieCashFan
npm install @paiecashfan/sdk
```

---

## ⚙️ CONFIGURATION

### .env Backend

```env
# Thirdweb
THIRDWEB_SECRET_KEY=your_secret_key_here
THIRDWEB_CLIENT_ID=your_client_id_here
BACKEND_WALLET_PRIVATE_KEY=0x...

# Blockchain
GLOBAL_STABLECOIN_ADDRESS=0x...
NFT_TICKET_CONTRACT_ADDRESS=0x...
POLYGON_RPC_URL=https://polygon-rpc.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/paiecashfan
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672

# API Keys
BRIDGE_API_KEY=your_bridge_api_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
SUMSUB_APP_TOKEN=your_sumsub_token

# App
APP_URL=https://app.paiecashfan.com
NODE_ENV=production
PORT=3000
```

### .env Frontend

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_API_URL=https://api.paiecashfan.com
NEXT_PUBLIC_STABLECOIN_ADDRESS=0x...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

---

## 🏗️ DÉPLOIEMENT SMART CONTRACTS

### 1. Déployer le Stablecoin ERC20

```bash
# Utiliser Thirdweb Deploy CLI
npx thirdweb deploy

# Ou via Dashboard Thirdweb:
# 1. Aller sur https://thirdweb.com/dashboard/contracts
# 2. Cliquer "Deploy Contract"
# 3. Choisir "Token" → "Token (ERC20)"
# 4. Configurer:
#    - Name: PaieCash USD
#    - Symbol: PCUSD
#    - Initial Supply: 0 (mint on-demand)
#    - Chain: Polygon
# 5. Deploy
```

### 2. Déployer le NFT Ticket ERC721

```bash
# Via Thirdweb Dashboard:
# 1. "Deploy Contract" → "NFT" → "NFT Collection (ERC721)"
# 2. Configurer:
#    - Name: PaieCashFan Tickets
#    - Symbol: PCFT
#    - Royalty: 2.5% (pour le club)
#    - Chain: Polygon
# 3. Deploy
```

### 3. Configurer les Permissions

```solidity
// Ajouter le backend wallet comme minter
// Via Thirdweb Dashboard → Contract → Permissions
// Add Role: MINTER_ROLE
// Address: 0xBACKEND_WALLET_ADDRESS
```

---

## 🔐 SÉCURITÉ

### Backend Wallet (Gasless Transactions)

```typescript
// backend/utils/thirdweb.client.ts
import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";

export const thirdwebClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!
});

export const backendWallet = privateKeyToAccount({
  client: thirdwebClient,
  privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY!
});

// ⚠️ IMPORTANT: JAMAIS exposer la clé privée côté client
// Toutes les transactions sensibles (mint, burn) doivent passer par le backend
```

### Middleware de Sécurité

```typescript
// backend/middleware/security.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { walletService } from '../services/wallet.service';

export async function kycMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { userId } = req.body;
  
  // Vérifier le niveau KYC
  const kycLevel = await walletService.checkKYCLevel(userId);
  
  // Vérifier les limites
  const amount = parseFloat(req.body.amount);
  
  if (kycLevel === 0 && amount > 100) {
    return res.status(403).json({
      error: "KYC level 1 required for amounts > 100 EUR"
    });
  }
  
  if (kycLevel === 1 && amount > 1000) {
    return res.status(403).json({
      error: "KYC level 2 required for amounts > 1000 EUR"
    });
  }
  
  next();
}
```

---

## 🎨 PERSONNALISATION WHITE-LABEL

### Widgets Web Components

```html
<!-- Personnaliser les couleurs et le branding -->
<paiecashfan-payment
    client-id="YOUR_CLIENT_ID"
    product-id="ticket-angers-psg-2025"
    product-name="Ticket Angers SCO vs PSG"
    price="50"
    currency="EUR"
    club-id="angers-sco"
    theme="light"
    
    <!-- Branding personnalisé -->
    primary-color="#667eea"
    secondary-color="#764ba2"
    logo-url="https://example.com/logo.png"
    brand-name="Angers SCO Official"
></paiecashfan-payment>

<style>
  paiecashfan-payment {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --border-radius: 16px;
    --font-family: 'Inter', sans-serif;
  }
</style>
```

### React Components

```tsx
import { PaieCashFanPayment } from '@paiecashfan/sdk';

<PaieCashFanPayment
  productId="ticket-angers-psg-2025"
  price={50}
  theme={{
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    borderRadius: '16px',
    fontFamily: 'Inter, sans-serif'
  }}
  branding={{
    logoUrl: 'https://example.com/logo.png',
    brandName: 'Angers SCO Official',
    footer: 'Powered by PaieCashFan'
  }}
  onSuccess={(result) => {
    console.log('Payment successful:', result);
  }}
  onError={(error) => {
    console.error('Payment error:', error);
  }}
/>
```

---

## 📊 MONITORING ET ANALYTICS

### Thirdweb Insight

```typescript
// backend/utils/monitoring.ts
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

const sdk = ThirdwebSDK.fromPrivateKey(
  process.env.BACKEND_WALLET_PRIVATE_KEY!,
  "polygon",
  {
    secretKey: process.env.THIRDWEB_SECRET_KEY
  }
);

// Écouter les événements du contrat
const contract = await sdk.getContract("0xSTABLECOIN_ADDRESS");

contract.events.addEventListener("Transfer", (event) => {
  console.log("Transfer détecté:", {
    from: event.data.from,
    to: event.data.to,
    amount: event.data.value.toString()
  });
  
  // Envoyer à votre système d'analytics
  analytics.track("stablecoin_transfer", {
    from: event.data.from,
    to: event.data.to,
    amount: event.data.value.toString()
  });
});
```

### Dashboard Analytics

```typescript
// backend/routes/analytics.routes.ts
import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

router.get('/analytics/dashboard', async (req, res) => {
  // KPIs globaux
  const totalWallets = await prisma.wallet.count();
  const totalTransactions = await prisma.transaction.count();
  const totalVolume = await prisma.transaction.aggregate({
    _sum: { amount: true }
  });
  const totalTickets = await prisma.ticket.count();
  
  // Revenue par club
  const revenueByClub = await prisma.transaction.groupBy({
    by: ['clubId'],
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } }
  });
  
  // Tickets par événement
  const ticketsByEvent = await prisma.ticket.groupBy({
    by: ['eventId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  
  res.json({
    kpis: {
      totalWallets,
      totalTransactions,
      totalVolume: totalVolume._sum.amount,
      totalTickets
    },
    revenueByClub,
    ticketsByEvent
  });
});

export default router;
```

---

## 🧪 TESTS

### Tests Backend (Jest)

```typescript
// backend/services/__tests__/wallet.service.test.ts
import { walletService } from '../wallet.service';
import { prisma } from '../../lib/prisma';

describe('WalletService', () => {
  beforeEach(async () => {
    // Nettoyer la DB de test
    await prisma.wallet.deleteMany();
  });
  
  it('should create a wallet', async () => {
    const address = await walletService.createWallet({
      userId: 'test-user-1',
      email: 'test@example.com'
    });
    
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId: 'test-user-1' }
    });
    
    expect(wallet).toBeTruthy();
    expect(wallet?.address).toBe(address);
  });
  
  it('should not create duplicate wallet', async () => {
    await walletService.createWallet({
      userId: 'test-user-1',
      email: 'test@example.com'
    });
    
    const address2 = await walletService.createWallet({
      userId: 'test-user-1',
      email: 'test@example.com'
    });
    
    const wallets = await prisma.wallet.findMany({
      where: { userId: 'test-user-1' }
    });
    
    expect(wallets.length).toBe(1);
  });
});
```

### Tests Frontend (React Testing Library)

```tsx
// frontend/__tests__/TicketPurchase.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TicketPurchasePage } from '../pages/tickets/[id]';

describe('TicketPurchasePage', () => {
  it('should display event details', async () => {
    render(<TicketPurchasePage eventId="angers-psg-2025" />);
    
    expect(await screen.findByText(/Angers SCO vs PSG/i)).toBeInTheDocument();
    expect(screen.getByText(/50 EUR/i)).toBeInTheDocument();
  });
  
  it('should require wallet connection to purchase', () => {
    render(<TicketPurchasePage eventId="angers-psg-2025" />);
    
    const buyButton = screen.getByText(/Acheter maintenant/i);
    expect(buyButton).toBeDisabled();
  });
});
```

---

## 📱 MOBILE APP (React Native)

### Installation

```bash
npx react-native init PaieCashFanMobile --template react-native-template-typescript

cd PaieCashFanMobile
npm install thirdweb react-native-svg react-native-qrcode-svg
```

### Configuration

```tsx
// App.tsx
import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react-native';
import { createThirdwebClient } from 'thirdweb';
import { TicketScreen } from './screens/TicketScreen';

const client = createThirdwebClient({
  clientId: 'YOUR_CLIENT_ID'
});

export default function App() {
  return (
    <ThirdwebProvider client={client}>
      <TicketScreen />
    </ThirdwebProvider>
  );
}
```

---

## 🆘 SUPPORT

### Documentation
- **Guide API**: https://docs.paiecashfan.com/api
- **SDK Reference**: https://docs.paiecashfan.com/sdk
- **Thirdweb Docs**: https://portal.thirdweb.com

### Support Technique
- **Email**: support@paiecashfan.com
- **Discord**: https://discord.gg/paiecashfan
- **GitHub Issues**: https://github.com/paiecashfan/sdk/issues

### Exemples
- **Web Components**: https://github.com/paiecashfan/examples/web-components
- **React**: https://github.com/paiecashfan/examples/react
- **React Native**: https://github.com/paiecashfan/examples/react-native
- **Backend API**: https://github.com/paiecashfan/examples/backend

---

## 🎯 CHECKLIST PRÉ-PRODUCTION

- [ ] ✅ Contrats déployés sur Polygon Mainnet
- [ ] ✅ Backend wallet financé avec MATIC pour gas
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Base de données PostgreSQL en production
- [ ] ✅ Redis configuré et sécurisé
- [ ] ✅ RabbitMQ en cluster (haute disponibilité)
- [ ] ✅ SSL/TLS activé (HTTPS)
- [ ] ✅ Rate limiting activé (100 req/min)
- [ ] ✅ Monitoring Datadog/New Relic configuré
- [ ] ✅ Backup automatisé (DB + Redis)
- [ ] ✅ CDN CloudFlare pour frontend
- [ ] ✅ Tests E2E passés avec succès
- [ ] ✅ Audit smart contracts (CertiK/OpenZeppelin)
- [ ] ✅ KYC providers configurés (Sumsub/Onfido)
- [ ] ✅ SEPA/Mobile Money providers testés
- [ ] ✅ Documentation API complète
- [ ] ✅ Support 24/7 opérationnel

---

## 📄 LICENCE

MIT License - © 2025 PaieCashFan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

**🚀 PAIECASHFAN V15 - Guide d'Intégration Complet**  
**📅 Date**: 26 Décembre 2025  
**✅ Statut**: Documentation complète - Prêt pour production
