# 🛍️ PaieCashFan V6.0 - Agentic Commerce Protocol (ACP)

## 🎯 **VISION COMPLÈTE**

Transformer PaieCashFan en un **super agent personnalisé** où l'IA peut :
- ✅ Répondre aux questions sur les clubs/fédérations
- ✅ Donner les résultats des matchs en temps réel
- ✅ Proposer les promos de la boutique
- ✅ Vendre des billets directement dans le chat
- ✅ **ACHETER des produits sans quitter le chat**
- ✅ Payer par QR Code ou SMS au moment de l'achat
- ✅ Connexion avec WordPress WooCommerce

---

## 🚨 **PROBLÈMES ACTUELS À CORRIGER**

### 1️⃣ **IA trop limitée**
- ❌ Ne connaît PAS les résultats des matchs
- ❌ Ne connaît PAS les promos de la boutique
- ❌ Ne peut PAS vendre directement
- ❌ Pas personnalisée par club

### 2️⃣ **Voice AI invisible**
- ❌ Bouton micro pas visible dans `chat-ia.html`
- ❌ Pas de lien vers `chat-ia-voice.html`

### 3️⃣ **Paiement SMS/QR Code incomplet**
- ❌ SMS juste pour envoyer un code
- ❌ Pas de QR Code généré
- ❌ Pas intégré dans le processus d'achat

### 4️⃣ **Boutique non connectée**
- ❌ WordPress store.paiecashplay.com pas intégré
- ❌ Pas d'API WooCommerce
- ❌ Pas de catalogue produits dans le chat

---

## 🎯 **OBJECTIFS V6.0**

### **Architecture Agentic Commerce Protocol (ACP)**

```
┌─────────────────────────────────────────────────────┐
│         Agent IA Conversationnel (Frontend)         │
│  - Comprend les demandes en langage naturel         │
│  - Propose produits, billets, infos club            │
│  - Gère le panier d'achat                           │
└─────────────────────────────────────────────────────┘
                        ↓ ↑
┌─────────────────────────────────────────────────────┐
│       Agentic Commerce Protocol (ACP) - API         │
│  - Connecte IA ↔ WooCommerce ↔ Paiement            │
│  - Gestion catalogue produits                       │
│  - Gestion commandes                                │
│  - Webhooks temps réel                              │
└─────────────────────────────────────────────────────┘
                        ↓ ↑
┌──────────────────┬──────────────────┬───────────────┐
│  WordPress       │  Paiement        │  Données Club │
│  WooCommerce     │  SMS / QR Code   │  Matchs API   │
│  store.paie...   │  Stripe          │  Résultats    │
└──────────────────┴──────────────────┴───────────────┘
```

---

## 🛠️ **PLAN DE DÉVELOPPEMENT**

### **PHASE 1 : Connexion WordPress WooCommerce** 🔗

#### **Objectif** :
Connecter la boutique WordPress `store.paiecashplay.com` via l'API WooCommerce

#### **Actions** :

1. **Activer l'API REST WooCommerce** :
```
WordPress Admin → WooCommerce → Settings → Advanced → REST API
→ Add Key
→ Description: "PaieCashFan AI Agent"
→ User: admin
→ Permissions: Read/Write
→ Generate API Key
```

2. **Créer le connecteur WooCommerce** :
```javascript
// js/woocommerce-connector.js
class WooCommerceConnector {
    constructor() {
        this.baseURL = 'https://store.paiecashplay.com/wp-json/wc/v3';
        this.consumerKey = 'ck_XXXXXXXXXXXXXXXX'; // À générer
        this.consumerSecret = 'cs_XXXXXXXXXXXXXXXX'; // À générer
    }
    
    async getProducts(params = {}) {
        // Récupérer catalogue produits
    }
    
    async getProduct(productId) {
        // Détails produit
    }
    
    async createOrder(orderData) {
        // Créer commande
    }
    
    async getOrders(customerId) {
        // Historique commandes
    }
}
```

3. **Enrichir l'IA avec les produits** :
- Synchroniser catalogue WordPress → Base de connaissances IA
- L'IA peut proposer des produits selon le club
- L'IA connaît les prix, promos, stocks

---

### **PHASE 2 : Agentic Commerce Protocol (ACP)** 🤖

#### **Objectif** :
Permettre l'achat DIRECT depuis le chat IA

#### **Flux utilisateur** :

```
User: "Je veux le maillot domicile de l'OM"
  ↓
IA: "🛍️ Maillot OM Domicile 2025
     Taille: S, M, L, XL
     Prix: 89.99€
     [Ajouter au panier] [Voir détails]"
  ↓
User: clique "Ajouter au panier"
  ↓
IA: "✅ Ajouté au panier !
     Total: 89.99€
     [Continuer] [Passer commande]"
  ↓
User: "Passer commande"
  ↓
IA: "📱 Mode de paiement :
     [SMS - 50€ max]
     [QR Code]
     [Crypto USDT/USDC]
     [Carte bancaire]"
  ↓
User: choisit SMS
  ↓
IA: "📱 Entrez votre numéro de téléphone"
  ↓
User: +33612345678
  ↓
IA: "📲 Code envoyé !
     Entrez le code reçu par SMS :"
  ↓
User: 123456
  ↓
IA: "✅ Paiement validé !
     🎉 Commande #12345 confirmée
     📦 Livraison estimée : 3-5 jours
     📧 Reçu envoyé par email"
```

#### **Implémentation** :

```javascript
// js/agentic-commerce.js
class AgenticCommerce {
    constructor() {
        this.cart = [];
        this.woocommerce = new WooCommerceConnector();
        this.smsPayment = window.smsPayment;
        this.qrPayment = new QRCodePayment();
    }
    
    async searchProduct(query, clubId) {
        // Rechercher produits selon requête + club
        const products = await this.woocommerce.getProducts({
            search: query,
            category: clubId,
            per_page: 5
        });
        return products;
    }
    
    addToCart(product, quantity = 1, size = null) {
        // Ajouter au panier
        this.cart.push({ product, quantity, size });
        return this.getCartTotal();
    }
    
    async checkout(paymentMethod, paymentData) {
        // 1. Créer commande WooCommerce
        const order = await this.woocommerce.createOrder({
            line_items: this.cart,
            customer: paymentData.customer,
            payment_method: paymentMethod
        });
        
        // 2. Traiter paiement
        let paymentResult;
        if (paymentMethod === 'sms') {
            paymentResult = await this.smsPayment.initiatePayment({
                phoneNumber: paymentData.phone,
                amount: order.total,
                description: `Commande #${order.id}`,
                type: 'purchase'
            });
        } else if (paymentMethod === 'qrcode') {
            paymentResult = await this.qrPayment.generate({
                amount: order.total,
                orderId: order.id
            });
        }
        
        return { order, paymentResult };
    }
}
```

---

### **PHASE 3 : Paiement QR Code** 📱

#### **Objectif** :
Générer QR Code pour paiement instantané

#### **Implémentation** :

```javascript
// js/qr-payment.js
class QRCodePayment {
    async generate(paymentData) {
        const { amount, orderId, description } = paymentData;
        
        // 1. Générer payload paiement
        const payload = {
            type: 'payment',
            merchant: 'PaieCashFan',
            orderId: orderId,
            amount: amount,
            currency: 'EUR',
            timestamp: Date.now()
        };
        
        // 2. Encoder en QR Code (utiliser library qrcode.js)
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(payload));
        
        // 3. Retourner QR Code + instructions
        return {
            qrCode: qrCodeDataURL,
            instructions: "Scannez ce QR Code avec votre app bancaire ou crypto wallet",
            expiresIn: 5 * 60 // 5 minutes
        };
    }
    
    async verify(qrCodeData) {
        // Vérifier que le paiement a été effectué
        // (webhook depuis banque ou blockchain)
    }
}
```

**Affichage dans le chat** :
```html
<div class="qr-payment">
    <img src="data:image/png;base64,..." alt="QR Code">
    <p>📱 Scannez pour payer 89.99€</p>
    <p>⏱️ Expire dans 4:58</p>
</div>
```

---

### **PHASE 4 : Données Clubs en Temps Réel** ⚽

#### **Objectif** :
L'IA connaît les résultats, classements, promos de chaque club

#### **Sources de données** :

1. **Résultats matchs** :
   - API Football-Data.org
   - API SofaScore
   - API ESPN

2. **Classements** :
   - API Ligue 1
   - API UEFA

3. **Promos boutique** :
   - WooCommerce API (produits en promotion)
   - Coupons actifs

#### **Enrichissement IA** :

```javascript
// js/club-data-connector.js
class ClubDataConnector {
    async getMatchResults(clubId, last = 5) {
        // Récupérer derniers résultats
        const results = await fetch(`https://api.football-data.org/v4/teams/${clubId}/matches?limit=${last}`);
        return results.json();
    }
    
    async getNextMatch(clubId) {
        // Prochain match
    }
    
    async getStanding(clubId) {
        // Classement actuel
    }
    
    async getPromotions(clubId) {
        // Promos boutique actives
    }
}
```

**L'IA peut maintenant répondre** :

```
User: "Résultat du dernier match de l'OM ?"
IA: "⚽ OM 3 - 1 Nice (27/11/2025)
     Buts: Aubameyang 12', 45'+2', Harit 78'
     Classement: 2ème (38 pts)"

User: "Des promos sur la boutique OM ?"
IA: "🎁 Promos en cours :
     • Maillot domicile : -20% (89.99€ → 71.99€)
     • Écharpe officielle : -30% (19.99€ → 13.99€)
     • Pack supporter : -25%
     [Voir toutes les promos]"
```

---

### **PHASE 5 : IA Intégrée dans app.html** 🤖

#### **Objectif** :
Sidebar IA toujours accessible depuis n'importe quelle page du club

#### **Implémentation** :

```html
<!-- Dans app.html -->
<div class="ai-sidebar" id="aiSidebar">
    <button class="ai-toggle" onclick="toggleAI()">
        🤖
    </button>
    <div class="ai-chat-container">
        <!-- Chat IA ici -->
    </div>
</div>

<style>
.ai-sidebar {
    position: fixed;
    right: -400px;
    top: 0;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -5px 0 20px rgba(0,0,0,0.2);
    transition: right 0.3s ease;
    z-index: 1000;
}

.ai-sidebar.open {
    right: 0;
}

.ai-toggle {
    position: absolute;
    left: -60px;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50% 0 0 50%;
    font-size: 30px;
    cursor: pointer;
}
</style>
```

---

## 📋 **FICHIERS À CRÉER**

### **Backend/API** :
- `api/acp/products.php` - Endpoint produits
- `api/acp/orders.php` - Endpoint commandes
- `api/acp/payment.php` - Endpoint paiement
- `api/acp/webhook.php` - Webhooks WooCommerce

### **Frontend** :
- `js/woocommerce-connector.js` - Connecteur WooCommerce
- `js/agentic-commerce.js` - ACP principal
- `js/qr-payment.js` - Paiement QR Code
- `js/club-data-connector.js` - Données clubs temps réel
- `chat-ia-commerce.html` - Chat IA avec e-commerce

### **Documentation** :
- `📘_ACP_IMPLEMENTATION.md` - Guide implémentation
- `🔌_WOOCOMMERCE_SETUP.md` - Configuration WordPress
- `💳_PAYMENT_METHODS.md` - Méthodes de paiement

---

## 🎯 **PRIORITÉS IMMÉDIATES**

### **✅ À FAIRE MAINTENANT** :

1. **Accès WordPress** :
   - URL: https://store.paiecashplay.com/
   - Login: admin
   - MDP: JuCps+237
   - → Générer clés API WooCommerce

2. **Créer connecteur WooCommerce**

3. **Ajouter QR Code payment**

4. **Enrichir IA avec données clubs**

5. **Intégrer sidebar IA dans app.html**

---

## 💡 **EXEMPLE COMPLET**

```
User (dans app.html#olympique-marseille):
  Ouvre sidebar IA 🤖

User: "Résultat dernier match ?"
IA: "⚽ OM 3-1 Nice (27/11)
     Classement: 2ème (38 pts)"

User: "Je veux un maillot"
IA: "🛍️ Maillots disponibles :
     1. Domicile 2025 - 71.99€ (-20% 🎁)
     2. Extérieur 2025 - 89.99€
     3. Third 2025 - 89.99€
     [Voir tout]"

User: "Le domicile en L"
IA: "✅ Maillot OM Domicile - Taille L
     Prix: 71.99€ (promo -20%)
     [Ajouter au panier]"

User: clique "Ajouter au panier"
IA: "✅ Panier : 1 article (71.99€)
     [Continuer] [Commander]"

User: "Commander"
IA: "📱 Paiement :
     [QR Code] [SMS] [Crypto] [Carte]"

User: clique "QR Code"
IA: "📱 Scannez ce QR Code :
     [QR CODE AFFICHÉ]
     Montant: 71.99€
     Expire dans 4:58"

User: scanne le QR Code avec son app bancaire
IA: "✅ Paiement reçu !
     🎉 Commande #12345 validée
     📦 Livraison 3-5 jours
     📧 Reçu envoyé"
```

---

## ✅ **RÉSUMÉ**

**PaieCashFan V6.0 - Agentic Commerce** :

✅ IA connectée à WooCommerce  
✅ Achat direct dans le chat  
✅ Paiement QR Code + SMS  
✅ Données clubs en temps réel  
✅ Sidebar IA intégrée  
✅ Super agent personnalisé par club  

---

**Prêt à implémenter ?** Je peux créer tous ces fichiers maintenant ! 🚀
