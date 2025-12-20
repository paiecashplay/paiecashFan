# 🏟️ ARCHITECTURE MICROSERVICES MULTICLUB - PaieCashPlay

## 📋 Vue d'Ensemble

PaieCashPlay utilise une architecture **microservices scalable** permettant de déployer la solution pour tous les clubs de Ligue 1 France de manière indépendante et évolutive.

---

## 🎯 Clubs Actuellement Déployés

### ✅ 1. Olympique de Marseille (OM)
- **URL:** `clubs/olympique-marseille/`
- **Stade:** Stade Vélodrome
- **Couleurs:** Bleu ciel (#2FAEE0) & Blanc
- **Port Backend:** 3000
- **Statut:** ✅ Opérationnel

### ✅ 2. Paris FC (PFC)
- **URL:** `clubs/paris-fc/`
- **Stade:** Stade Jean Bouin
- **Couleurs:** Bleu marine (#1e3a8a) & Bleu (#3b82f6)
- **Port Backend:** 3001
- **Statut:** ✅ Opérationnel

---

## 📁 Structure des Dossiers

```
paiecashplay/
│
├── ligue1-hub.html              # Hub central Ligue 1
│
├── clubs/
│   │
│   ├── olympique-marseille/     # Microservice OM
│   │   ├── index.html           # Page d'accueil OM
│   │   ├── connexion.html       # Connexion OM
│   │   ├── app.html             # Application OM
│   │   └── server.js            # Backend OM (port 3000)
│   │
│   ├── paris-fc/                # Microservice Paris FC
│   │   ├── index.html           # Page d'accueil PFC
│   │   ├── connexion.html       # Connexion PFC
│   │   ├── app.html             # Application PFC
│   │   └── server.js            # Backend PFC (port 3001)
│   │
│   └── [autres-clubs]/          # Futurs clubs...
│
├── shared/                      # Ressources partagées
│   ├── auth_ameliore.js         # Authentification commune
│   ├── paiement_ameliore.js     # Système paiement
│   └── styles/                  # Styles communs
│
└── docs/
    └── ARCHITECTURE_MULTICLUB_SCALABLE.md
```

---

## 🔧 Principe des Microservices

### Indépendance
Chaque club dispose de :
- ✅ Son propre frontend (HTML/CSS/JS)
- ✅ Son propre backend (Node.js + Express)
- ✅ Son propre port serveur
- ✅ Sa propre base de données localStorage
- ✅ Ses propres couleurs et branding

### Isolation
- Les données sont **isolées par club**
- Aucune interférence entre les clubs
- Déploiement indépendant possible
- Maintenance simplifiée

### Réutilisation
- Modules d'authentification partagés (`auth_ameliore.js`)
- Système de paiement commun
- API Stripe/Alipay/Mobile Money centralisée
- Documentation technique commune

---

## 🌍 Moyens de Paiement Globaux

Tous les clubs bénéficient de :

### 1. 🇨🇳 Alipay (Chine)
- Paiement en **Yuan (CNY)**
- 1+ milliard d'utilisateurs potentiels
- Conversion automatique EUR ↔ CNY
- Intégration via Stripe

### 2. 💎 Stablecoin (Crypto)
- **USDC** & **USDT** acceptés
- Frais réduits : **0.5%** (vs 3% CB)
- Cashback : **5%** sur tous les achats
- Technologie LYF

### 3. 🌍 Mobile Money (Afrique)
- **Orange Money** (Afrique Ouest)
- **M-Pesa** (Afrique Est)
- **MTN Mobile Money**
- 400M+ utilisateurs
- 25+ pays couverts

### 4. 💳 Carte Bancaire
- Visa, Mastercard
- Paiement classique
- Sécurisé par Stripe

---

## 🚀 Comment Ajouter un Nouveau Club ?

### Étape 1 : Créer la structure
```bash
mkdir clubs/nouveau-club
cd clubs/nouveau-club
```

### Étape 2 : Copier les fichiers templates
```bash
cp ../paris-fc/index.html ./
cp ../paris-fc/connexion.html ./
cp ../paris-fc/app.html ./
cp ../paris-fc/server.js ./
```

### Étape 3 : Personnaliser
1. **Remplacer le logo du club** dans les 3 fichiers HTML
2. **Modifier les couleurs** (CSS `--club-color-1`, `--club-color-2`)
3. **Changer le nom du stade**
4. **Adapter la configuration** dans `server.js` :

```javascript
const CLUB_CONFIG = {
    id: 'nouveau-club',
    nom: 'Nom du Club',
    stade: 'Nom du Stade',
    couleurs: {
        primaire: '#HEXCODE1',
        secondaire: '#HEXCODE2'
    },
    capacite: 50000,
    tribunes: [...]
};
```

### Étape 4 : Configurer le port
```javascript
const PORT = process.env.PORT || 3002; // Port unique !
```

### Étape 5 : Ajouter au Hub
Dans `ligue1-hub.html`, ajouter une nouvelle carte :

```html
<div class="club-card" onclick="goToClub('nouveau-club')">
    <div class="club-header">
        <img src="LOGO_URL" alt="Nouveau Club" class="club-logo">
        <div class="club-info">
            <div class="club-name">Nouveau Club</div>
            <div class="club-stadium">
                <i class="fas fa-map-marker-alt"></i> Nom du Stade
            </div>
        </div>
    </div>
    <!-- ... features ... -->
</div>
```

### Étape 6 : Démarrer le serveur
```bash
cd clubs/nouveau-club
npm install
node server.js
```

✅ Le nouveau club est maintenant opérationnel !

---

## 🔐 Authentification Multi-Club

### localStorage par Club
Chaque club utilise une clé unique :
```javascript
// Club OM
localStorage.setItem('clubActuel', 'olympique-marseille');

// Club Paris FC
localStorage.setItem('clubActuel', 'paris-fc');
```

### Utilisateurs
Les utilisateurs peuvent avoir des comptes sur plusieurs clubs :
```javascript
{
    id: 12345,
    email: "fan@example.com",
    clubs: {
        'olympique-marseille': {
            solde: 500,
            omcCoins: 1000
        },
        'paris-fc': {
            solde: 200,
            pfcCoins: 500
        }
    }
}
```

---

## 💰 Système de Paiement Unifié

### API Communes
Tous les clubs utilisent les mêmes endpoints :

```javascript
// Alipay
POST /api/payment/alipay/create-session

// Stablecoin
POST /api/payment/stablecoin/create-session

// Mobile Money
POST /api/payment/mobilemoney/create-session
```

### Webhooks Centralisés
Un seul webhook Stripe pour tous les clubs :
```javascript
POST /webhook/stripe

// Le club est identifié via metadata
session.metadata.club // 'olympique-marseille', 'paris-fc', etc.
```

---

## 📊 Tableau de Bord Multi-Club

### Métriques par Club
- Nombre de transactions
- Volume de paiements (EUR, CNY, USDC)
- Cashback distribué
- Utilisateurs actifs
- Moyens de paiement utilisés

### Métriques Globales
- Total tous clubs confondus
- Comparaison entre clubs
- Performance par moyen de paiement
- Géolocalisation des paiements

---

## 🔒 Sécurité

### Isolation des Données
- Chaque club = Base de données séparée
- Aucun accès croisé
- Logs séparés par club

### Authentification
- JWT tokens avec `clubId`
- Vérification du club à chaque requête
- Session timeout par club

### Paiements
- Stripe Connect pour isolation comptable
- Webhooks signés et vérifiés
- Retry logic en cas d'échec

---

## 🌐 Déploiement Production

### Option 1 : Sous-domaines
```
https://om.paiecashplay.com      → Olympique de Marseille
https://pfc.paiecashplay.com     → Paris FC
https://psg.paiecashplay.com     → Paris Saint-Germain
```

### Option 2 : Chemins
```
https://paiecashplay.com/clubs/om
https://paiecashplay.com/clubs/paris-fc
https://paiecashplay.com/clubs/psg
```

### Option 3 : Ports (Développement)
```
http://localhost:3000  → OM
http://localhost:3001  → Paris FC
http://localhost:3002  → PSG
```

---

## 📈 Roadmap Clubs

### Phase 1 : Déployé ✅
- ✅ Olympique de Marseille
- ✅ Paris FC

### Phase 2 : Prochainement 🚀
- ⏳ Paris Saint-Germain
- ⏳ Olympique Lyonnais
- ⏳ AS Monaco

### Phase 3 : À venir 📅
- ⏳ LOSC Lille
- ⏳ Stade Rennais
- ⏳ RC Lens
- ⏳ OGC Nice
- ⏳ RC Strasbourg
- ⏳ Montpellier HSC
- ⏳ FC Nantes
- ⏳ Stade Brestois
- ⏳ Stade de Reims
- ⏳ Le Havre AC
- ⏳ Toulouse FC
- ⏳ AJ Auxerre
- ⏳ SCO Angers
- ⏳ AS Saint-Étienne

**Total Ligue 1 : 18 clubs**

---

## 🛠️ Technologies Utilisées

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Font Awesome (icônes)
- LocalStorage API
- Fetch API

### Backend
- Node.js v16+
- Express.js
- Stripe API (Alipay)
- CORS middleware
- dotenv (configuration)

### Paiements
- **Stripe** : Alipay, Cartes bancaires
- **LYF Technology** : Stablecoin (USDC/USDT)
- **Orange Money API** : Mobile Money Afrique
- **M-Pesa API** : Mobile Money Kenya/Tanzanie

---

## 📞 Support

### Documentation
- `README_MULTICLUB.md` : Guide utilisateur
- `GUIDE_DEPLOIEMENT_MULTICLUB.md` : Guide déploiement
- `architecture_microservices.md` : Architecture technique

### Contact
- Email : support@paiecashplay.com
- Discord : PaieCashPlay Community
- GitHub : github.com/paiecashplay

---

## 🎉 Avantages de l'Architecture Microservices

### Pour les Clubs
✅ **Indépendance** : Chaque club maîtrise son instance  
✅ **Personnalisation** : Branding 100% adapté  
✅ **Évolutivité** : Ajout de fonctionnalités spécifiques  
✅ **Performance** : Pas d'impact entre clubs

### Pour les Développeurs
✅ **Maintenance** : Isolation des bugs  
✅ **Déploiement** : Releases indépendantes  
✅ **Tests** : Environnements séparés  
✅ **Scalabilité** : Ajout de clubs simplifié

### Pour les Utilisateurs
✅ **Rapidité** : Serveurs dédiés  
✅ **Fiabilité** : Pas d'effet domino  
✅ **Sécurité** : Données isolées  
✅ **Expérience** : UX optimisée par club

---

## 📝 Licence

© 2024 PaieCashPlay - Tous droits réservés

---

**🚀 PaieCashPlay : La solution de paiement global pour tous les clubs de Ligue 1 !**
