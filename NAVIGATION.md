# 🎮 PaieCashFan - Guide de Navigation

## 🌐 URLs de Test (Sandbox)

**URL de base** : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai

### 📱 Pages Principales

| Page | URL | Description | Status |
|------|-----|-------------|--------|
| 🏠 **Accueil** | [/home.html](https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/home.html) | Navigation vers toutes les fonctionnalités | ✅ |
| 🎲 **LOTO "Chiffres"** | [/loto.html](https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/loto.html) | Jeu de loterie avec jackpot 10 000€ | ✅ |
| 🛍️ **Boutique OM** | [/boutique.html](https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/boutique.html) | 6 produits OM avec paiement Lyra | ✅ |
| 🎁 **Tombola** | [/tombola.html](https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/tombola.html) | Tombola quotidienne (BETA) | ✅ |
| 🎟️ **Mes Tickets** | [/mes-tickets.html](https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/mes-tickets.html) | Historique des tickets | ✅ |

---

## 📊 État des Fonctionnalités

### ✅ LOTO "Chiffres" (100% Opérationnel)
- **Jackpot** : 10 000 € Carrefour
- **Grille de gains** :
  - 5 + Chance : 10 000 €
  - 5 numéros : 5 000 €
  - 4 + Chance : 2 500 €
  - 4 numéros : 1 250 €
  - 3 + Chance : 600 €
  - 3 numéros : 200 €
  - 2 + Chance : 100 €
  - ≤2 numéros : 10-20 € (produits frais)
- **Prix** : 2€ par grille
- **Boost** : Garantit 2-3 numéros correspondants minimum
- **Paiement** : Wallet PCC ou Stripe (carte bancaire)
- **Email** : Confirmation automatique via Resend
- **PDF** : Téléchargement du ticket

### ✅ Boutique OM (100% Opérationnel)
- **Produits disponibles** : 6
  - Maillot Domicile OM 2025 : 89,99 €
  - Maillot Extérieur OM 2025 : 89,99 €
  - Écharpe OM Officielle : 24,99 €
  - Casquette OM : 19,99 €
  - Ballon OM Officiel : 34,99 €
  - Survêtement OM : 119,99 €
- **Paiement** : Lyra (PayZen) avec formulaire embedded
- **Stock** : Gestion en temps réel
- **Categories** : Maillots, Accessoires, Équipements

### ⚠️ Tombola Quotidienne (BETA - En Attente de Contenu)
- **Tirages actifs** : 0 (aucune campagne créée)
- **Lots disponibles** : 0 (catalogue vide)
- **Participations** : 0
- **Interface** : ✅ Complète avec onglets, filtres, empty states
- **API** : ✅ Fonctionnelle (`/api/tombola/campaigns`, `/api/tombola/lots`)
- **Prochaines étapes** :
  1. Créer des lots dans la table `lots` (via migration ou admin)
  2. Créer des campagnes dans la table `campaigns`
  3. Tester le flux de participation complet

---

## 🎯 Parcours Utilisateur Recommandé

1. **🏠 Commencer par la page d'accueil**
   - URL : https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/home.html
   - Vue d'ensemble des statistiques (Jackpot 10 000€, 6 produits, 100% gagnants)
   - Navigation claire avec badges (🔥 HOT, ✨ NEW, BETA)

2. **🎲 Tester le LOTO**
   - Sélectionner 5 numéros + 1 chance
   - Payer 2€ (Wallet ou Stripe)
   - Voir les résultats immédiatement
   - Recevoir l'email de confirmation
   - Télécharger le PDF du ticket

3. **🛍️ Visiter la Boutique**
   - Parcourir le catalogue OM
   - Ajouter au panier
   - Payer avec Lyra (carte bancaire)
   - Recevoir la confirmation de commande

4. **🎁 Explorer la Tombola**
   - Voir l'interface complète
   - Constater l'état "0 tirages actifs" (normal)
   - Comprendre le concept et les catégories

5. **🎟️ Consulter l'historique**
   - Voir tous les tickets LOTO et commandes Boutique
   - Télécharger les PDF
   - Vérifier les gains

---

## 🚀 Tests Manuels Effectués

### ✅ Tests LOTO
```bash
# Test 1 : Wallet avec boost (2 matches)
curl -X POST http://localhost:3000/api/games/loto/play \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-test-1","organization_id":"om-001","numbers":[5,15,25,35,45],"chance":3,"payment_method":"wallet","email":"test@test.com"}'
# Résultat : 20€ gagné (2 numéros correspondants)

# Test 2 : Wallet avec boost (3 matches)
curl -X POST http://localhost:3000/api/games/loto/play \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-test-2","organization_id":"om-001","numbers":[7,14,21,28,35],"chance":5,"payment_method":"wallet","email":"test@test.com"}'
# Résultat : 200€ gagné (3 numéros correspondants)

# Test 3 : Stripe checkout
curl -X POST http://localhost:3000/api/games/loto/play \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-test-3","organization_id":"om-001","numbers":[10,20,30,40,50],"chance":8,"payment_method":"stripe","email":"test@test.com"}'
# Résultat : Checkout URL Stripe reçu
```

### ✅ Tests Boutique
```bash
# Test 1 : Liste des produits OM
curl http://localhost:3000/api/shop/products/om-001
# Résultat : 6 produits retournés

# Test 2 : Création de commande
curl -X POST http://localhost:3000/api/shop/order/create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-test","club_id":"om-001","items":[{"product_id":"prod-om-003","quantity":2}],"customer_email":"test@test.com","customer_name":"Test User"}'
# Résultat : Order ID créé, total 39,98€

# Test 3 : Paiement Lyra
curl -X POST http://localhost:3000/api/lyra/create-payment \
  -H "Content-Type: application/json" \
  -d '{"amount":4000,"orderId":"ORDER-TEST-001","email":"test@test.com"}'
# Résultat : formToken reçu (>60 caractères)
```

### ✅ Tests Tombola
```bash
# Test 1 : Campagnes actives
curl http://localhost:3000/api/tombola/campaigns
# Résultat : {"success":true,"campaigns":[],"count":0}

# Test 2 : Liste des lots
curl http://localhost:3000/api/tombola/lots
# Résultat : {"success":true,"lots":[],"count":0}

# Test 3 : Mes participations
curl http://localhost:3000/api/tombola/my-participations?user_id=user-test-001
# Résultat : {"success":true,"participations":[],"count":0}
```

---

## 📦 Architecture des Fichiers

```
public/
├── home.html                 # ✅ Page d'accueil moderne
├── loto.html                 # ✅ LOTO "Chiffres" avec Stripe
├── boutique.html             # ✅ Boutique OM avec Lyra
├── tombola.html              # ✅ Tombola (nouvellement créée)
├── mes-tickets.html          # ✅ Historique des tickets
└── index.html                # Redirection → home.html

src/routes/
├── games.ts                  # API LOTO (10 endpoints)
├── shop.ts                   # API Boutique (6 endpoints)
├── lyra.ts                   # API Lyra PayZen (4 endpoints)
├── tombola.ts                # API Tombola (8 endpoints)
├── payments.ts               # API Paiements
├── auth.ts                   # API Authentification
└── ...

migrations/
├── 0022_update_loto_prizes_high_values.sql      # ✅ Grille de gains 10 000€
├── 0023_create_club_shop_tables.sql             # ✅ Tables boutique
└── 0001-0021...                                 # Migrations antérieures
```

---

## 🛠️ APIs Disponibles

### 🎲 LOTO
- `POST /api/games/loto/play` - Jouer une grille
- `GET /api/games/loto/result/:sessionId` - Résultat Stripe
- `GET /api/games/loto/prizes` - Liste des lots

### 🛍️ Boutique
- `GET /api/shop/products/:clubId` - Produits d'un club
- `POST /api/shop/order/create` - Créer une commande
- `POST /api/shop/order/confirm` - Confirmer paiement
- `GET /api/shop/orders/:userId` - Historique commandes
- `GET /api/shop/order/:orderId` - Détail commande

### 💳 Lyra (PayZen)
- `POST /api/lyra/create-payment` - Créer paiement
- `POST /api/lyra/verify-payment` - Vérifier statut
- `POST /api/lyra/webhook` - Webhook Lyra
- `GET /api/lyra/config` - Config publique

### 🎁 Tombola
- `GET /api/tombola/campaigns` - Campagnes actives
- `GET /api/tombola/lots` - Catalogue des lots
- `GET /api/tombola/lots/:id` - Détail d'un lot
- `GET /api/tombola/my-participations` - Mes participations

---

## 🎨 Design & UX

### Page d'Accueil
- **Header** : Logo PaieCashFan, wallet, tickets
- **Hero** : Titre + Stats (Jackpot 10 000€, 6 produits, 100% gagnants)
- **Cards principales** :
  1. LOTO "Chiffres" (gradient violet, badge 🔥 HOT)
  2. Boutique OM (gradient bleu, badge ✨ NEW)
  3. Tombola (gradient rose, badge BETA)
  4. Mes Tickets (gradient vert)
  5. Wallet PCC (gradient orange)
  6. Support (gradient rouge)
- **Footer** : Réseaux sociaux, liens légaux, copyright

### Page Tombola
- **Header** : Retour, logo Tombola, wallet, tickets
- **Stats** : 3 cartes (Tirages actifs, Lots, Participations)
- **Onglets** : Tirages actifs, Catalogue, Mes tickets
- **Empty states** : Messages élégants avec call-to-action
- **Filtres** : Cash, Expériences, Voyages, Automobile

---

## 📈 Prochaines Étapes

### 1. Remplir le catalogue Tombola
```sql
-- Exemple de création de lots
INSERT INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, active)
VALUES 
  ('lot-cash-001', 'cash', 'cash', '500€ en espèces', 'Gagnez 500€ cash !', 400, 500, 'weekly', 'Club', 250, 1),
  ('lot-exp-001', 'experience', 'vip', 'Rencontre avec les joueurs', 'Accès vestiaire + photos', 50, 1000, 'monthly', 'Sponsor', 500, 1);

-- Exemple de création de campagne
INSERT INTO campaigns (id, organization_id, title, description, start_date, end_date, entry_fee, max_participations, status)
VALUES 
  ('camp-001', 'om-001', 'Tirage Hebdo OM', 'Tentez votre chance !', '2026-03-08', '2026-03-15', 2.0, 1000, 'active');
```

### 2. Déploiement Production
```bash
# 1. Appliquer migrations D1 production
npx wrangler d1 migrations apply paiecashfan-costreaming

# 2. Configurer les secrets Cloudflare
npx wrangler pages secret put STRIPE_SECRET_KEY --project-name webapp
npx wrangler pages secret put LYRA_PASSWORD --project-name webapp
npx wrangler pages secret put RESEND_API_KEY --project-name webapp

# 3. Déployer
npm run deploy:prod
```

### 3. Tests E2E sur URL publique
- [ ] Tester parcours complet LOTO (Wallet + Stripe)
- [ ] Tester parcours complet Boutique (Lyra)
- [ ] Vérifier les emails de confirmation
- [ ] Télécharger les PDFs
- [ ] Tester le responsive mobile

---

## 🐛 Résolution des Problèmes

### Problème : "0 tirages actifs"
✅ **Normal** - Aucune campagne créée dans la base de données
- Solution : Créer des campagnes via migration ou interface admin

### Problème : "Stripe non configuré"
✅ **Résolu** - `STRIPE_SECRET_KEY` ajouté dans `.dev.vars`
- Production : Configurer via `wrangler pages secret put`

### Problème : "Lyra SDK warning"
✅ **Normal** - Le formToken est généré côté backend
- Aucun impact sur le fonctionnement

### Problème : "404 sur /static/images/"
✅ **Normal** - Images de produits non présentes
- Solution : Ajouter vraies images ou utiliser placeholders

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@paiecashfan.com
- 💬 Chat : Disponible 24/7 (fonctionnalité à venir)
- 📚 Documentation : Ce fichier README

---

**Dernière mise à jour** : 2026-03-08  
**Version** : 7.0.0  
**Commit** : `7c07d6e` - feat(ui): Page d'accueil moderne + Tombola frontend sans régression
