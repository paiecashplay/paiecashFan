# 🏪 Boutique Clubs PaieCashFan - Documentation Complète

## 📋 Vue d'ensemble

Système complet de boutique en ligne pour les clubs de football avec paiement sécurisé via **Lyra (PayZen)**.

---

## 🎯 Fonctionnalités

### ✅ Frontend (`/boutique.html`)
- **Design Premium** : Couleurs OM (bleu #2faee0 / blanc)
- **Grille Produits Responsive** : 1/2/3 colonnes selon écran
- **Filtres Catégories** : Tous / Maillots / Accessoires / Équipement
- **Panier Dynamique** : 
  - Ajout/suppression produits
  - Modification quantités
  - Calcul total automatique
  - Badge compteur
- **Paiement Lyra** :
  - Formulaire embedded sécurisé
  - Support CB, Visa, Mastercard, etc.
  - Validation 3D Secure
- **Confirmation** : Modal de succès avec numéro commande

### ✅ Backend API

#### **GET** `/api/shop/products/:clubId`
Liste des produits d'un club
```bash
curl https://3000-.../api/shop/products/om-001
```
**Réponse :**
```json
{
  "success": true,
  "clubId": "om-001",
  "products": [
    {
      "id": "prod-om-001",
      "name": "Maillot Domicile OM 2025",
      "price": 89.99,
      "stock": 150,
      "category": "jersey"
    }
  ],
  "total": 6
}
```

#### **POST** `/api/shop/order/create`
Créer une commande
```bash
curl -X POST https://3000-.../api/shop/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "club_id": "om-001",
    "products": [
      {
        "product_id": "prod-om-001",
        "name": "Maillot Domicile OM 2025",
        "price": 89.99,
        "quantity": 1
      }
    ],
    "customer_email": "client@example.com",
    "customer_name": "Jean Dupont"
  }'
```

#### **POST** `/api/shop/order/confirm`
Confirmer paiement
```bash
curl -X POST https://3000-.../api/shop/order/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order-123",
    "lyra_transaction_uuid": "uuid-from-lyra"
  }'
```

#### **GET** `/api/shop/orders/:userId`
Historique commandes utilisateur
```bash
curl https://3000-.../api/shop/orders/user-123
```

---

## 🗄️ Base de Données

### Table `club_products`
```sql
CREATE TABLE club_products (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table `club_orders`
```sql
CREATE TABLE club_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  club_id TEXT NOT NULL,
  products JSON NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'lyra',
  payment_id TEXT,
  lyra_transaction_uuid TEXT,
  status TEXT DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  shipping_address JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  invoice_number TEXT
);
```

### Produits Exemple (OM)
| ID | Nom | Prix | Stock | Catégorie |
|----|-----|------|-------|-----------|
| prod-om-001 | Maillot Domicile OM 2025 | 89,99€ | 150 | jersey |
| prod-om-002 | Maillot Extérieur OM 2025 | 89,99€ | 120 | jersey |
| prod-om-003 | Écharpe OM Officielle | 24,99€ | 300 | accessories |
| prod-om-004 | Casquette OM | 19,99€ | 200 | accessories |
| prod-om-005 | Ballon OM Officiel | 34,99€ | 80 | equipment |
| prod-om-006 | Survêtement OM | 119,99€ | 60 | equipment |

---

## 💳 Intégration Lyra (PayZen)

### Configuration
```env
LYRA_API_URL=https://api.payzen.eu
LYRA_USERNAME=64359324
LYRA_PASSWORD=testpassword_...
```

### Flow de Paiement
```
1. User ajoute produits au panier
2. User clique "Payer avec Lyra"
3. Frontend → POST /api/shop/order/create (commande)
4. Frontend → POST /api/lyra/create-payment (formToken)
5. Frontend → Affiche formulaire Lyra embedded
6. User → Saisit CB et valide
7. Lyra → Callback sur paiement réussi
8. Frontend → POST /api/shop/order/confirm
9. Frontend → Modal succès avec n° commande
```

### SDK Lyra Frontend
```html
<!-- Lyra Embedded Form SDK -->
<script src="https://static.payzen.eu/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"></script>
<link rel="stylesheet" href="https://static.payzen.eu/static/js/krypton-client/V4.0/ext/classic-reset.css">
<script src="https://static.payzen.eu/static/js/krypton-client/V4.0/ext/classic.js"></script>
```

```javascript
// Initialiser formulaire
KR.setFormConfig({
  formToken: 'token-from-api',
  'kr-language': 'fr-FR'
})

KR.attachForm('#lyraForm')

// Events
KR.onSubmit(function(paymentData) {
  // Paiement réussi
  console.log('Payé !', paymentData)
  return true
})

KR.onError(function(error) {
  // Erreur paiement
  console.error('Erreur', error)
})
```

---

## 🚀 Utilisation

### 1. Accéder à la boutique
```
https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/boutique.html
```

### 2. Navigation
- **Filtrer** : Cliquer sur les boutons de catégorie
- **Ajouter au panier** : Cliquer sur l'icône panier d'un produit
- **Voir panier** : Cliquer sur "Panier" en haut à droite

### 3. Passer commande
1. Ouvrir le panier
2. Ajuster les quantités si besoin
3. Saisir email (et nom optionnel)
4. Cliquer "Payer avec Lyra"
5. Remplir le formulaire de paiement
6. Valider

### 4. Après paiement
- Modal de confirmation s'affiche
- Numéro de commande visible
- Email de confirmation envoyé (si configuré)

---

## 🧪 Tests

### Test API Produits
```bash
curl -s http://localhost:3000/api/shop/products/om-001 | jq '.products | length'
# Retour: 6
```

### Test Création Commande
```bash
curl -X POST http://localhost:3000/api/shop/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-test",
    "club_id": "om-001",
    "products": [{"product_id":"prod-om-003","name":"Écharpe OM","price":24.99,"quantity":2}],
    "customer_email": "test@test.com"
  }' | jq '.success'
# Retour: true
```

### Test Paiement Lyra
```bash
curl -X POST http://localhost:3000/api/lyra/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 4998,
    "currency": "EUR",
    "orderId": "order-test-001"
  }' | jq '.success'
# Retour: true
```

---

## 📊 Schéma Flow Complet

```
┌─────────────┐
│   Boutique  │ /boutique.html
│   Frontend  │
└──────┬──────┘
       │
       │ 1. Charger produits
       ▼
┌─────────────────────┐
│  GET /api/shop/     │
│  products/:clubId   │
└──────┬──────────────┘
       │
       │ 2. Afficher grille
       ▼
┌─────────────┐
│   Panier    │ (localStorage)
│   Utilisateur│
└──────┬──────┘
       │
       │ 3. Checkout
       ▼
┌─────────────────────┐
│ POST /api/shop/     │
│ order/create        │
└──────┬──────────────┘
       │
       │ 4. Créer paiement
       ▼
┌─────────────────────┐
│ POST /api/lyra/     │
│ create-payment      │
└──────┬──────────────┘
       │
       │ 5. formToken
       ▼
┌─────────────┐
│  Formulaire │ Lyra SDK
│    Lyra     │
└──────┬──────┘
       │
       │ 6. User paie
       ▼
┌─────────────────────┐
│   Lyra API          │
│   (PayZen)          │
└──────┬──────────────┘
       │
       │ 7. Callback success
       ▼
┌─────────────────────┐
│ POST /api/shop/     │
│ order/confirm       │
└──────┬──────────────┘
       │
       │ 8. Update DB
       ▼
┌─────────────┐
│  Commande   │ status='paid'
│    Payée    │
└─────────────┘
```

---

## 🎨 Personnalisation par Club

Pour créer une boutique pour un autre club (ex: PSG) :

### 1. Ajouter produits en DB
```sql
INSERT INTO club_products (id, club_id, name, price, stock, category) VALUES
  ('prod-psg-001', 'psg-001', 'Maillot PSG 2025', 89.99, 150, 'jersey'),
  ('prod-psg-002', 'psg-001', 'Écharpe PSG', 24.99, 300, 'accessories');
```

### 2. Créer page boutique
Copier `/boutique.html` → `/boutique-psg.html`

Modifier les constantes :
```javascript
const CLUB_ID = 'psg-001'
const CLUB_NAME = 'Paris Saint-Germain'
const CLUB_COLOR = '#004170' // Bleu PSG
```

Modifier les styles CSS :
```css
:root {
  --club-primary: #004170;
  --club-secondary: #DA020E;
}
```

---

## 🔐 Sécurité

### Best Practices
✅ Credentials Lyra en `.dev.vars` (non commités)  
✅ Validation côté serveur (montants, stock)  
✅ HTTPS obligatoire en production  
✅ CORS configuré  
✅ Tokens Lyra temporaires (formToken)  
✅ Logs des transactions  

---

## 📈 Métriques & Analytics

### Requêtes SQL utiles

**Top produits vendus :**
```sql
SELECT 
  json_extract(value, '$.name') as product,
  SUM(json_extract(value, '$.quantity')) as total_sold
FROM club_orders, json_each(products)
WHERE status = 'paid'
GROUP BY product
ORDER BY total_sold DESC;
```

**Chiffre d'affaires par club :**
```sql
SELECT 
  club_id,
  SUM(total_amount) as revenue,
  COUNT(*) as orders
FROM club_orders
WHERE status = 'paid'
GROUP BY club_id;
```

**Commandes en attente :**
```sql
SELECT COUNT(*) FROM club_orders WHERE status = 'pending';
```

---

## 🚀 Déploiement Production

### 1. Configurer secrets Cloudflare
```bash
npx wrangler pages secret put LYRA_PASSWORD --project-name webapp
```

### 2. Appliquer migrations
```bash
npx wrangler d1 migrations apply paiecashfan-costreaming --remote
```

### 3. Déployer
```bash
npm run deploy:prod
```

### 4. Tester
```bash
curl https://webapp.pages.dev/api/shop/products/om-001
```

---

## 📞 Support

**Documentation Lyra :**  
https://docs.lyra.com/fr/rest/V4.0/api/

**API Endpoints :**  
- Shop: `/api/shop/*`
- Lyra: `/api/lyra/*`

**Fichiers clés :**
- Frontend: `/public/boutique.html`
- Backend: `/src/routes/shop.ts`, `/src/routes/lyra.ts`
- Migration: `/migrations/0023_create_club_shop_tables.sql`

---

✅ **Boutique clubs 100% fonctionnelle avec Lyra !**
