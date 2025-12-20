# 📦 WOOCOMMERCE MARKETPLACE - GUIDE COMPLET

**Vision** : Transformer PaieCashFan en marketplace internationale où **chaque club vend ses produits** de manière autonome.

**Date** : 14 Décembre 2025  
**Version** : 1.0.0

---

## 🎯 VISION MARKETPLACE

### Architecture :
```
PaieCashFan (Plateforme)
    ├── Club 1 (Olympique de Marseille) = Vendeur 1
    │   ├── Maillots OM
    │   ├── Accessoires OM
    │   └── NFT OM
    ├── Club 2 (Paris Saint-Germain) = Vendeur 2
    │   ├── Maillots PSG
    │   ├── Accessoires PSG
    │   └── NFT PSG
    ├── Club 3 (Arsenal FC) = Vendeur 3
    └── ... (353 clubs au total)
```

### Modèle économique :
- **Club** : 70-80% du prix
- **PaieCashFan** : 20-30% commission
- **Paiements** : Stripe, PayPal, PaieCashFan Wallet, Crypto

---

## 🏗️ ÉTAPE 1 : Installation WordPress + WooCommerce

### 1.1 Prérequis

**Hébergement requis** :
- PHP 7.4+
- MySQL 5.6+ ou MariaDB 10.1+
- HTTPS (SSL) obligatoire
- 256 MB RAM minimum (512 MB recommandé)

**Hébergeurs recommandés** :
- SiteGround : https://siteground.com (15€/mois)
- Kinsta : https://kinsta.com (35€/mois) - Premium
- Hostinger : https://hostinger.com (5€/mois) - Budget

### 1.2 Installer WordPress

1. **Via hébergeur** (méthode automatique) :
   - Panneau de contrôle → WordPress → Installer
   - Choisir domaine : `store.paiecashfan.com`
   - Créer admin : Username, Password, Email

2. **Ou manuellement** :
   - Télécharger : https://wordpress.org/download/
   - Upload via FTP
   - Créer base de données MySQL
   - Lancer installation : `https://store.paiecashfan.com/wp-admin/install.php`

### 1.3 Installer WooCommerce

1. Dashboard WordPress → **Plugins** → **Add New**
2. Rechercher : **"WooCommerce"**
3. Cliquer **"Install Now"** puis **"Activate"**
4. Suivre le wizard :
   - Pays : France (ou votre pays principal)
   - Devise : EUR (€)
   - Type de produits : **Physical products + Digital products**
   - Thème : **Astra** (recommandé) ou Storefront

---

## 🏪 ÉTAPE 2 : Installer Dokan (Marketplace)

### 2.1 Pourquoi Dokan ?

✅ **Avantages** :
- Interface simple pour débutants
- Tableau de bord vendeur intuitif
- Gestion commissions automatique
- Support multilingue
- Compatible avec 99% des thèmes WooCommerce

### 2.2 Installation Dokan

1. Dashboard → **Plugins** → **Add New**
2. Rechercher : **"Dokan"**
3. Installer **"Dokan – Best WooCommerce Multivendor Marketplace Solution"**
4. Cliquer **"Activate"**

### 2.3 Configuration Dokan

#### A. Paramètres généraux

Dashboard → **Dokan** → **Settings** → **General**

```
✅ Store URL Type: Custom
   Format: https://store.paiecashfan.com/club/nom-du-club

✅ Enable Selling: Yes

✅ New Vendor Registration: Needs Admin Approval
   (Important pour valider chaque club avant qu'il vende)

✅ Commission Type: Percentage
   Admin Commission: 25% (vous ajustez selon votre modèle)
```

#### B. Paramètres vendeurs

Dashboard → **Dokan** → **Settings** → **Selling Options**

```
✅ Product Management Permission: Vendor (clubs gèrent leurs produits)

✅ Order Management: Vendor (clubs gèrent leurs commandes)

✅ Shipping: Vendor can configure (clubs définissent leurs frais de port)

✅ Tax: Admin controlled (vous gérez la TVA)
```

#### C. Paramètres de retrait

Dashboard → **Dokan** → **Settings** → **Withdraw**

```
✅ Withdraw Methods:
   - Bank Transfer (virement bancaire)
   - PayPal
   - Stripe Connect (recommandé pour automatisation)

✅ Minimum Withdraw Amount: 50€

✅ Withdraw Threshold: Every 7 days (ou 30 days)
```

---

## 👥 ÉTAPE 3 : Créer les comptes vendeurs (Clubs)

### 3.1 Structure des vendeurs

Chaque club = 1 compte vendeur avec :
- **Username** : `club-olympique-marseille`
- **Store Name** : `Boutique Officielle OM`
- **Email** : `boutique@om.fr`
- **Commission** : 25% (ou personnalisée par club)

### 3.2 Création manuelle (Admin)

Dashboard → **Dokan** → **Vendors** → **Add New**

**Exemple pour l'OM** :
```
Username: club-olympique-marseille
Email: boutique@om.fr
First Name: Boutique
Last Name: Olympique de Marseille
Role: Seller (Dokan Vendor)
Store Name: OM Official Store
Store URL: om-official-store
Phone: +33 4 91 76 56 00
Address: Orange Vélodrome, Marseille, France
Commission: 25%
```

**Répéter** pour chaque club (Arsenal, PSG, Liverpool, etc.)

### 3.3 Création automatique via CSV

Créer un fichier `clubs-vendors.csv` :

```csv
username,email,first_name,last_name,store_name,store_url,commission
club-om,boutique@om.fr,Boutique,Olympique Marseille,OM Store,om-store,25
club-psg,boutique@psg.fr,Boutique,Paris SG,PSG Store,psg-store,25
club-arsenal,shop@arsenal.com,Arsenal,FC,Arsenal Store,arsenal-store,25
```

**Importer** : Dashboard → **Dokan** → **Tools** → **Import Vendors**

---

## 💳 ÉTAPE 4 : Configuration des paiements

### 4.1 Stripe Connect (Recommandé)

**Pourquoi Stripe Connect ?**
- Paiements directs aux clubs
- Commission automatique déduite
- Support 135+ devises
- Paiements internationaux faciles

**Installation** :

1. Dashboard → **Plugins** → **Add New**
2. Rechercher : **"Dokan Stripe Connect"** (extension premium Dokan)
3. Ou utiliser : **WooCommerce Stripe Gateway** (gratuit)

**Configuration** :
```
Dashboard → WooCommerce → Settings → Payments → Stripe

✅ Enable Stripe: Yes
✅ Test Mode: Yes (pour commencer)

Test Publishable Key: pk_test_VOTRE_CLE
Test Secret Key: sk_test_VOTRE_CLE

(Obtenir sur https://dashboard.stripe.com/test/apikeys)
```

### 4.2 PayPal (Alternative)

Dashboard → **WooCommerce** → **Settings** → **Payments** → **PayPal**

```
✅ Enable PayPal: Yes
PayPal Email: votre@email.com
```

### 4.3 PaieCashFan Wallet (Custom)

Créer un **plugin WooCommerce personnalisé** pour intégrer votre wallet :

Fichier : `wp-content/plugins/paiecashfan-gateway/paiecashfan-gateway.php`

(Je vais créer ce fichier dans les prochaines étapes)

---

## 🎨 ÉTAPE 5 : Configuration du thème

### 5.1 Installer Astra Theme (Recommandé)

1. Dashboard → **Appearance** → **Themes** → **Add New**
2. Rechercher : **"Astra"**
3. Installer et activer
4. Installer **Astra Pro** (optionnel, 59$/an) pour plus de features

### 5.2 Installer Astra Starter Templates

1. Dashboard → **Plugins** → **Add New**
2. Rechercher : **"Starter Templates"**
3. Installer et activer
4. **Appearance** → **Starter Templates**
5. Choisir un template **WooCommerce + Dokan**
6. Importer (en 1 clic)

### 5.3 Personnalisation

Dashboard → **Appearance** → **Customize**

```
✅ Logo: Upload logo PaieCashFan
✅ Colors:
   - Primary: #10b981 (vert PaieCashFan)
   - Secondary: #667eea
✅ Typography:
   - Font: Inter (Google Fonts)
✅ Header:
   - Style: Transparent
   - Show Search: Yes
   - Show Cart: Yes
```

---

## 🌍 ÉTAPE 6 : Configuration internationale

### 6.1 Multilingue (WPML ou Polylang)

**Option A : WPML** (Premium, 39€/an)
- Dashboard → Plugins → Installer WPML
- Ajouter langues : Français, English, Español, Deutsch, Italiano, Português

**Option B : Polylang** (Gratuit)
- Dashboard → Plugins → Installer Polylang
- Settings → Languages → Ajouter langues

### 6.2 Multi-devises (WooCommerce Currency Switcher)

1. Dashboard → **Plugins** → **Add New**
2. Rechercher : **"WOOCS - Currency Switcher"**
3. Installer et activer
4. Configuration :
```
Currencies:
✅ EUR - Euro (default)
✅ USD - US Dollar
✅ GBP - British Pound
✅ JPY - Japanese Yen
✅ CNY - Chinese Yuan

Auto-detect currency: Yes (par IP géographique)
```

### 6.3 Frais de port internationaux

Dashboard → **WooCommerce** → **Settings** → **Shipping**

**Créer des zones** :
```
Zone 1: France
  - Flat Rate: 5€
  - Free Shipping: > 50€

Zone 2: Europe
  - Flat Rate: 10€
  - Free Shipping: > 100€

Zone 3: International
  - Flat Rate: 25€
  - Free Shipping: > 200€
```

---

## 🔗 ÉTAPE 7 : Intégration avec PaieCashFan (Frontend)

### 7.1 API REST WooCommerce

Générer les clés API :

Dashboard → **WooCommerce** → **Settings** → **Advanced** → **REST API** → **Add Key**

```
Description: PaieCashFan Integration
User: admin
Permissions: Read/Write

✅ Consumer Key: ck_abc123...
✅ Consumer Secret: cs_xyz789...
```

**Copier** ces clés dans `woocommerce-integration.js` :

```javascript
const CONFIG = {
    WOOCOMMERCE: {
        STORE_URL: 'https://store.paiecashfan.com',
        CONSUMER_KEY: 'ck_abc123...',
        CONSUMER_SECRET: 'cs_xyz789...',
        VERSION: 'wc/v3'
    }
};
```

### 7.2 CORS (Important !)

Ajouter dans `wp-config.php` (ou via plugin) :

```php
// Allow CORS for PaieCashFan
header('Access-Control-Allow-Origin: https://paiecashfan.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Ou via plugin** : Install **"WP CORS"**

---

## 📊 ÉTAPE 8 : Gestion des commissions

### 8.1 Configuration par défaut

Dashboard → **Dokan** → **Settings** → **Selling Options** → **Commission**

```
Commission Type: Percentage
Admin Commission: 25%

Ou créer des taux personnalisés par club :
- OM: 20% (club partenaire)
- PSG: 25% (standard)
- Petit club: 15% (encouragement)
```

### 8.2 Commissions personnalisées par vendeur

Dashboard → **Dokan** → **Vendors** → **Edit Vendor**

```
Commission:
Type: Percentage
Rate: 20% (pour ce club spécifique)
```

### 8.3 Exemple de calcul

```
Produit vendu: Maillot OM - 89.99€

Commission PaieCashFan (25%): 22.50€
Revenus Club OM (75%): 67.49€

Commission déduite automatiquement par Stripe Connect
```

---

## 🛠️ ÉTAPE 9 : Plugins essentiels supplémentaires

### Sécurité
- **Wordfence Security** (gratuit) - Firewall + scan malware
- **iThemes Security** (gratuit) - Protection brute-force

### Performance
- **WP Rocket** (59$/an) - Cache + optimisation
- **Smush** (gratuit) - Compression images

### SEO
- **Yoast SEO** (gratuit) - Optimisation référencement
- **Rank Math** (gratuit) - Alternative Yoast

### Marketing
- **MailChimp for WooCommerce** (gratuit) - Email marketing
- **Google Analytics for WordPress** (gratuit) - Tracking

---

## 📱 ÉTAPE 10 : Connexion avec l'app mobile PaieCashFan

### 10.1 API REST endpoints personnalisés

Créer plugin custom : `paiecashfan-api-extension.php`

(Je vais créer ce fichier séparément)

### 10.2 Webhooks pour synchronisation

Dashboard → **WooCommerce** → **Settings** → **Advanced** → **Webhooks** → **Add Webhook**

```
Name: New Order Notification
Status: Active
Topic: Order Created
Delivery URL: https://api.paiecashfan.com/webhooks/woocommerce/order-created
Secret: votre_secret_webhook
```

Créer webhooks pour :
- Order created
- Order completed
- Product updated
- Product deleted

---

## 📋 CHECKLIST COMPLÈTE

### Installation de base
- [ ] WordPress installé
- [ ] WooCommerce installé et configuré
- [ ] Dokan installé et configuré
- [ ] Thème Astra installé

### Configuration Marketplace
- [ ] Commission définie (25%)
- [ ] Validation vendeurs activée
- [ ] Méthodes de retrait configurées

### Paiements
- [ ] Stripe Connect configuré
- [ ] PayPal configuré
- [ ] PaieCashFan Gateway créé (custom)

### International
- [ ] Multilingue installé (WPML/Polylang)
- [ ] Multi-devises installé (WOOCS)
- [ ] Zones de livraison configurées

### Vendeurs (Clubs)
- [ ] Comptes créés pour clubs principaux
- [ ] Commissions personnalisées définies
- [ ] Emails de bienvenue envoyés

### Intégration PaieCashFan
- [ ] Clés API WooCommerce générées
- [ ] CORS activé
- [ ] Webhooks configurés
- [ ] Frontend connecté (`woocommerce-integration.js`)

### Sécurité & Performance
- [ ] SSL/HTTPS activé
- [ ] Plugins sécurité installés
- [ ] Cache configuré
- [ ] Sauvegardes automatiques activées

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester la marketplace** avec 2-3 clubs pilotes (OM, PSG, Arsenal)
2. **Former les clubs** à utiliser leur tableau de bord vendeur
3. **Lancer une campagne** de promotion
4. **Monitorer** les ventes et ajuster les commissions
5. **Développer** le plugin PaieCashFan Gateway pour paiements crypto

---

## 💡 CONSEILS PRO

### Démarrage progressif :
1. **Mois 1** : Lancer avec 5 clubs pilotes
2. **Mois 2** : Ajouter 20 clubs si succès
3. **Mois 3** : Ouvrir à tous (353 clubs)

### Support clubs :
- Créer **guides vendeurs** (PDF + vidéos)
- Offrir **support prioritaire** aux gros clubs
- Organiser **webinaires** de formation

### Marketing :
- **Newsletter** hebdomadaire avec produits vedettes
- **Réseaux sociaux** : Partager produits de différents clubs
- **Influenceurs** : Partenariats avec supporters célèbres

---

## 📞 RESSOURCES

- **Documentation Dokan** : https://dokan.co/docs/
- **WooCommerce Docs** : https://woocommerce.com/documentation/
- **Stripe Connect** : https://stripe.com/docs/connect
- **Support** : support@paiecashfan.com

---

**Version** : 1.0.0  
**Date** : 14 Décembre 2025  
**Auteur** : Équipe PaieCashFan
