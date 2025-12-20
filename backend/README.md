# 🚀 PaieCashFan Backend API - V4.0.0

Backend Node.js/Express pour l'application PaieCashFan avec PostgreSQL, JWT, AES-256 et WalletConnect.

---

## 📋 CARACTÉRISTIQUES

- ✅ **REST API complète** avec Express.js
- ✅ **Base de données PostgreSQL** avec Sequelize ORM
- ✅ **Authentification JWT** (Access + Refresh Tokens)
- ✅ **Chiffrement AES-256** pour données sensibles
- ✅ **WalletConnect** intégré avec Ethers.js
- ✅ **Sécurité** : Helmet, CORS, Rate Limiting
- ✅ **Logging** avec Winston
- ✅ **Validation** avec express-validator
- ✅ **Production-ready** avec PM2

---

## 🛠️ INSTALLATION

### Prérequis
- Node.js 18+ ([installer avec nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL 14+ ([télécharger](https://www.postgresql.org/download/))

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
```sql
-- Se connecter à PostgreSQL
psql postgres

-- Créer la base de données
CREATE DATABASE paiecashfan_db;

-- Créer l'utilisateur
CREATE USER paiecashfan_user WITH PASSWORD 'votre_mot_de_passe';

-- Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE paiecashfan_db TO paiecashfan_user;
```

### 3. Configurer les variables d'environnement
```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer avec vos valeurs
nano .env
```

**Variables minimum requises** :
```bash
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=paiecashfan_db
DB_USER=paiecashfan_user
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt_32_caracteres
ENCRYPTION_KEY=votre_cle_aes_32_caracteres!
```

### 4. Démarrer le serveur
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur est accessible sur : `http://localhost:5000/api`

---

## 🧪 TESTER L'API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Inscription
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User",
    "club_id": "olympique-marseille"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

---

## 📁 STRUCTURE DU PROJET

```
backend/
├── config/
│   └── database.js          # Configuration Sequelize/PostgreSQL
├── middleware/
│   └── auth.middleware.js   # Middleware JWT
├── models/
│   ├── user.model.js        # Utilisateurs
│   ├── wallet.model.js      # Portefeuilles
│   └── club.model.js        # Clubs et fédérations
├── routes/
│   ├── auth.routes.js       # Authentification
│   ├── user.routes.js       # Utilisateurs
│   └── wallet.routes.js     # Wallets
├── services/
│   └── walletconnect.service.js  # WalletConnect/Ethereum
├── utils/
│   ├── jwt.js               # Gestion JWT
│   ├── encryption.js        # Chiffrement AES-256
│   └── logger.js            # Logger Winston
├── logs/                    # Fichiers de logs
├── .env                     # Variables d'environnement (ne pas commit!)
├── .env.example             # Exemple de configuration
├── package.json
├── server.js                # Point d'entrée
└── README.md                # Ce fichier
```

---

## 📡 ENDPOINTS API

### Authentification (`/api/auth`)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription | Non |
| POST | `/login` | Connexion | Non |
| POST | `/refresh` | Rafraîchir token | Non |
| POST | `/logout` | Déconnexion | Oui |

### Utilisateurs (`/api/users`)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/me` | Profil utilisateur | Oui |
| PUT | `/me` | Modifier profil | Oui |
| POST | `/me/payment-code` | Définir code secret | Oui |
| GET | `/me/wallet` | Wallet de l'utilisateur | Oui |

### Clubs (`/api/clubs`)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste des clubs | Non |
| GET | `/:id` | Détails d'un club | Non |

---

## 🔐 SÉCURITÉ

### Chiffrement AES-256
Les données sensibles sont chiffrées avec AES-256-CBC :
- Code secret de paiement (6 chiffres)
- Numéro de carte Mastercard
- Clé privée Ethereum (si wallet custodial)

### Authentification JWT
- **Access Token** : expire en 1h
- **Refresh Token** : expire en 7 jours
- Format header : `Authorization: Bearer <token>`

### Rate Limiting
- 100 requêtes max par 15 minutes par IP
- Headers : `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### Headers de Sécurité (Helmet)
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options

---

## 🗄️ MODÈLES DE DONNÉES

### User
```javascript
{
  id: UUID,
  email: string (unique),
  password_hash: string,
  first_name: string,
  last_name: string,
  phone: string,
  club_id: string,
  status: "fan" | "licencie",
  referral_code: string (unique),
  payment_code_encrypted: string,
  notification_preferences: object
}
```

### Wallet
```javascript
{
  id: UUID,
  user_id: UUID,
  wallet_id: string (unique),
  balance_paiecash: decimal,
  balance_usdc: decimal,
  balance_usdt: decimal,
  balance_eth: decimal,
  balance_club_coin: integer,
  ethereum_address: string,
  mastercard_number_encrypted: string
}
```

### Club
```javascript
{
  id: string (slug),
  name: string,
  short: string,
  logo: string,
  color1: string,
  color2: string,
  sport: string,
  ligue: string
}
```

---

## 🚀 DÉPLOIEMENT

### Développement
```bash
npm run dev
```

### Production avec PM2
```bash
# Démarrer
pm2 start server.js --name paiecashfan-api

# Sauvegarder
pm2 save

# Logs
pm2 logs paiecashfan-api

# Redémarrer
pm2 restart paiecashfan-api
```

### Documentation complète
Voir `📘_GUIDE_DEPLOIEMENT_PRODUCTION_V4.md` pour le guide complet de déploiement en production.

---

## 📝 SCRIPTS NPM

```bash
npm start          # Démarrer en mode production
npm run dev        # Démarrer en mode développement (nodemon)
npm test           # Lancer les tests
npm run migrate    # Exécuter les migrations
npm audit          # Vérifier les vulnérabilités
```

---

## 🔧 DÉPANNAGE

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Démarrer PostgreSQL
sudo systemctl start postgresql
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :5000

# Changer le port dans .env
PORT=5001
```

### Erreur ENCRYPTION_KEY
```bash
# Générer une nouvelle clé (32 caractères)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Mettre à jour dans .env
ENCRYPTION_KEY=la_cle_generee_32_caracteres
```

---

## 📚 DOCUMENTATION

- **Guide de déploiement** : `../📘_GUIDE_DEPLOIEMENT_PRODUCTION_V4.md`
- **Démarrage rapide** : `../🚀_DEMARRAGE_RAPIDE_BACKEND.md`
- **Version complète** : `../✅_VERSION_4.0_BACKEND_COMPLETE.md`

---

## 🤝 CONTRIBUTION

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 SUPPORT

Pour toute question ou problème :
- Consulter les logs : `logs/combined.log` et `logs/error.log`
- Vérifier la documentation dans le dossier parent
- Ouvrir une issue sur GitHub

---

## 📄 LICENCE

MIT License - Voir le fichier LICENSE pour plus de détails

---

**Développé avec ❤️ pour les fans de sport du monde entier**  
**Version 4.0.0 - Production-Ready Backend**
