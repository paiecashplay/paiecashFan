# ⚡ QUICK START V15 - THIRDWEB INTEGRATION
## Démarrez en 5 minutes avec PaieCashFan + Thirdweb

---

## 🎯 OBJECTIF

Intégrer un **wallet invisible** et un **système de paiement stablecoin** dans votre site web ou application en **moins de 5 minutes**.

---

## 📦 OPTION 1 : WEB COMPONENTS (Sans framework)

### Étape 1 : Ajouter les scripts

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma Billetterie</title>
</head>
<body>
    <!-- 1. Widget Wallet -->
    <paiecashfan-wallet
        client-id="demo"
        club-id="angers-sco"
        theme="light"
        language="fr"
        thirdweb-client-id="VOTRE_CLIENT_ID_THIRDWEB"
    ></paiecashfan-wallet>
    
    <!-- 2. Widget Paiement -->
    <paiecashfan-payment
        client-id="demo"
        product-id="ticket-123"
        product-name="Ticket Angers SCO vs PSG"
        product-image="https://example.com/ticket.jpg"
        price="50"
        currency="EUR"
        club-id="angers-sco"
        theme="light"
        thirdweb-client-id="VOTRE_CLIENT_ID_THIRDWEB"
    ></paiecashfan-payment>
    
    <!-- 3. Charger les SDKs -->
    <script src="sdk/paiecashfan-wallet-widget.js"></script>
    <script src="sdk/paiecashfan-payment-widget.js"></script>
    
    <!-- 4. Écouter les événements -->
    <script>
        const wallet = document.querySelector('paiecashfan-wallet');
        const payment = document.querySelector('paiecashfan-payment');
        
        // Connexion wallet
        wallet.addEventListener('wallet-connected', (e) => {
            console.log('Wallet connecté:', e.detail.address);
        });
        
        // Paiement réussi
        payment.addEventListener('payment-success', (e) => {
            console.log('Paiement réussi:', {
                txHash: e.detail.transactionHash,
                nftTokenId: e.detail.nftTokenId
            });
            
            // Rediriger vers la page du ticket
            window.location.href = `/tickets/${e.detail.nftTokenId}`;
        });
        
        // Erreur paiement
        payment.addEventListener('payment-error', (e) => {
            console.error('Erreur paiement:', e.detail.error);
            alert(`Erreur: ${e.detail.error}`);
        });
    </script>
</body>
</html>
```

### ✅ C'est tout ! Votre site est prêt

---

## 📦 OPTION 2 : REACT/NEXT.JS

### Étape 1 : Installation

```bash
npm install thirdweb
```

### Étape 2 : Créer le composant

```tsx
// pages/tickets/[id].tsx
import { useState } from 'react';
import {
  ThirdwebProvider,
  ConnectButton,
  useActiveAccount
} from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: 'VOTRE_CLIENT_ID_THIRDWEB'
});

export default function TicketPage() {
  return (
    <ThirdwebProvider>
      <div className="container">
        <h1>Acheter un billet</h1>
        
        {/* Bouton connexion wallet */}
        <ConnectButton
          client={client}
          theme="light"
          connectButton={{ label: "Se connecter" }}
        />
        
        {/* Composant achat ticket */}
        <TicketPurchase ticketId="123" price={50} />
      </div>
    </ThirdwebProvider>
  );
}

function TicketPurchase({ ticketId, price }: { ticketId: string; price: number }) {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  
  async function handlePurchase() {
    if (!account) {
      alert('Connectez votre wallet');
      return;
    }
    
    setLoading(true);
    
    try {
      // Appeler votre API backend
      const response = await fetch('/api/tickets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          walletAddress: account.address,
          amount: price
        })
      });
      
      const data = await response.json();
      
      alert(`Ticket NFT créé ! Token ID: ${data.nftTokenId}`);
      window.location.href = `/my-tickets/${data.nftTokenId}`;
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'achat');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="ticket-card">
      <h2>Ticket Angers SCO vs PSG</h2>
      <p className="price">{price} EUR</p>
      
      <button
        onClick={handlePurchase}
        disabled={!account || loading}
        className="buy-button"
      >
        {loading ? 'Transaction en cours...' : 'Acheter'}
      </button>
    </div>
  );
}
```

### ✅ Votre app React est prête !

---

## 🔧 OPTION 3 : BACKEND API

### Étape 1 : Installation

```bash
npm install thirdweb express prisma @prisma/client
```

### Étape 2 : Créer l'API

```typescript
// server.ts
import express from 'express';
import { createThirdwebClient, getContract } from 'thirdweb';
import { transfer } from 'thirdweb/extensions/erc20';
import { claimTo } from 'thirdweb/extensions/erc721';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { polygon } from 'thirdweb/chains';

const app = express();
app.use(express.json());

// Configuration Thirdweb
const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!
});

const backendWallet = privateKeyToAccount({
  client,
  privateKey: process.env.BACKEND_WALLET_PRIVATE_KEY!
});

const stablecoinContract = getContract({
  client,
  address: '0xSTABLECOIN_ADDRESS',
  chain: polygon
});

const nftContract = getContract({
  client,
  address: '0xNFT_CONTRACT_ADDRESS',
  chain: polygon
});

// Route: Acheter ticket NFT
app.post('/api/tickets/purchase', async (req, res) => {
  const { ticketId, walletAddress, amount } = req.body;
  
  try {
    // 1. Vérifier le paiement stablecoin (déjà effectué côté client)
    // ...
    
    // 2. Mint le NFT ticket
    const mintTransaction = claimTo({
      contract: nftContract,
      to: walletAddress,
      quantity: 1n
    });
    
    const result = await backendWallet.sendTransaction(mintTransaction);
    
    // 3. Enregistrer en base de données
    // await db.tickets.create({ ... });
    
    res.json({
      success: true,
      nftTokenId: result.tokenId,
      transactionHash: result.transactionHash
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('✅ API backend running on port 3000');
});
```

### ✅ Votre API backend est prête !

---

## 🔑 OBTENIR VOS CLÉS THIRDWEB

### 1. Créer un compte (gratuit)

```
https://thirdweb.com/dashboard
```

### 2. Créer un projet

- Nom : "PaieCashFan Production"
- Blockchain : Polygon

### 3. Copier les clés

- **Client ID** : Utiliser côté frontend
- **Secret Key** : Utiliser UNIQUEMENT côté backend

### 4. Configurer les variables d'environnement

```env
# Frontend (.env.local)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Backend (.env)
THIRDWEB_SECRET_KEY=your_secret_key_here
BACKEND_WALLET_PRIVATE_KEY=0x...
```

---

## 📱 TESTER LOCALEMENT

### 1. Démarrer le backend

```bash
cd backend
npm install
npm run dev
```

### 2. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Ouvrir dans le navigateur

```
http://localhost:3000
```

### 4. Tester le flow complet

1. ✅ Connexion wallet (email)
2. ✅ Recharge stablecoin (test)
3. ✅ Achat ticket NFT
4. ✅ Affichage QR code

---

## 🚀 DÉPLOYER EN PRODUCTION

### Backend (Vercel, Railway, Render)

```bash
# Exemple avec Vercel
vercel deploy --prod

# Variables d'environnement à configurer:
# - THIRDWEB_SECRET_KEY
# - BACKEND_WALLET_PRIVATE_KEY
# - DATABASE_URL
```

### Frontend (Vercel, Netlify)

```bash
# Exemple avec Vercel
vercel deploy --prod

# Variables d'environnement à configurer:
# - NEXT_PUBLIC_THIRDWEB_CLIENT_ID
```

### Smart Contracts (Polygon Mainnet)

```bash
# Via Thirdweb Dashboard:
# 1. Deploy → Token (ERC20)
# 2. Deploy → NFT Collection (ERC721)
# 3. Configurer permissions (MINTER_ROLE)
```

---

## 📊 COÛTS

### Gratuit
- ✅ SDK Thirdweb (frontend + backend)
- ✅ Thirdweb Dashboard
- ✅ Smart contracts ERC20/ERC721

### Payant
- 💰 Gas fees Polygon : ~0.001 $ par transaction
- 💰 Thirdweb Engine (optionnel) : 99 $/mois
- 💰 Infrastructure backend : 20-50 $/mois

### Total estimé
- **MVP** : ~30 $/mois
- **Production (10k users)** : ~200 $/mois

---

## 🆘 BESOIN D'AIDE ?

### Documentation
- 📚 [Architecture V15](🚀_THIRDWEB_ARCHITECTURE_V15.md)
- 📚 [Guide Intégration](📚_GUIDE_INTEGRATION_COMPLET_V15.md)
- 📚 [Résumé Final](✅_RESUME_FINAL_V15_THIRDWEB.md)

### Support
- 💬 Discord : https://discord.gg/paiecashfan
- 📧 Email : support@paiecashfan.com
- 🐛 GitHub Issues : https://github.com/paiecashfan/sdk/issues

### Exemples de code
- 💻 [Web Components](sdk/paiecashfan-wallet-widget.js)
- 💻 [React](examples/react-ticket-purchase-example.tsx)
- 💻 [Backend](backend/services/wallet.service.ts)

---

## ✅ CHECKLIST QUICK START

- [ ] ✅ Compte Thirdweb créé
- [ ] ✅ Client ID copié
- [ ] ✅ Widget ajouté dans HTML/React
- [ ] ✅ Test connexion wallet
- [ ] ✅ Test paiement stablecoin
- [ ] ✅ Backend API configuré
- [ ] ✅ Smart contracts déployés
- [ ] ✅ Test flow complet (end-to-end)
- [ ] ✅ Déployé en production
- [ ] ✅ Monitoring activé

---

**🎉 Félicitations ! Vous avez intégré PaieCashFan + Thirdweb en moins de 5 minutes !**

**🚀 Prochaine étape : Personnalisez le branding et déployez en production**

---

**⚡ PAIECASHFAN V15 - QUICK START**  
**📅 Date** : 26 Décembre 2025  
**⏱️ Temps** : 5 minutes
