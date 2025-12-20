# 🚀 DÉMARRAGE RAPIDE - Backend PaieCashFan V4.0

**Pour développeurs** - Guide rapide pour démarrer le backend en local

---

## ⚡ INSTALLATION RAPIDE (5 minutes)

### Prérequis
- Node.js 18+ (vérifier: `node --version`)
- PostgreSQL 14+ installé et démarré
- Git

### 1. Cloner et installer
```bash
# Cloner le repo (ou utiliser les fichiers existants)
cd backend

# Installer les dépendances
npm install
```

### 2. Créer la base de données
```bash
# Se connecter à PostgreSQL
psql postgres

# Créer la DB et l'utilisateur
CREATE DATABASE paiecashfan_db;
CREATE USER paiecashfan_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE paiecashfan_db TO paiecashfan_user;
\q
```

### 3. Configurer les variables d'environnement
```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier
nano .env  # ou votre éditeur préféré
```

**Minimum requis pour développement** :
```bash
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=paiecashfan_db
DB_USER=paiecashfan_user
DB_PASSWORD=dev_password

JWT_SECRET=dev_jwt_secret_minimum_32_caracteres_pour_securite
JWT_REFRESH_SECRET=dev_refresh_secret_minimum_32_caracteres_securite
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=dev_encryption_key_32_chars!
ENCRYPTION_IV=dev_iv_16_chars!

FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 4. Démarrer le serveur
```bash
# Mode développement (avec auto-reload)
npm run dev

# Ou mode normal
npm start
```

Le serveur est maintenant accessible sur : **http://localhost:5000/api**

---

## 🧪 TESTER L'API

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Réponse attendue :
```json
{
  "success": true,
  "message": "PaieCashFan API v4.0 - Running",
  "timestamp": "2025-12-09T...",
  "environment": "development",
  "database": "Connected"
}
```

### 2. Inscription d'un utilisateur
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+33612345678",
    "club_id": "olympique-marseille",
    "status": "fan"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "message": "Inscription réussie !",
  "data": {
    "user": {
      "id": "uuid...",
      "email": "test@example.com",
      "referral_code": "TEST1234"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

### 3. Connexion
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### 4. Appel authentifié
```bash
# Remplacer YOUR_ACCESS_TOKEN par le token reçu
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🛠️ SCRIPTS UTILES

```bash
# Démarrer en mode développement (avec nodemon)
npm run dev

# Démarrer en mode production
npm start

# Exécuter les migrations
npm run migrate

# Lancer les tests
npm test

# Vérifier les dépendances vulnérables
npm audit
```

---

## 📁 STRUCTURE DU PROJET

```
backend/
├── config/
│   └── database.js          # Configuration Sequelize
├── middleware/
│   └── auth.middleware.js   # Middleware JWT
├── models/
│   ├── user.model.js        # Modèle User
│   ├── wallet.model.js      # Modèle Wallet
│   └── club.model.js        # Modèle Club
├── routes/
│   ├── auth.routes.js       # Routes authentification
│   ├── user.routes.js       # Routes utilisateur
│   └── wallet.routes.js     # Routes wallet
├── services/
│   └── walletconnect.service.js  # Service WalletConnect
├── utils/
│   ├── jwt.js               # Utilitaires JWT
│   ├── encryption.js        # Chiffrement AES-256
│   └── logger.js            # Logger Winston
├── logs/                    # Fichiers de logs
├── .env                     # Variables d'environnement (ne pas commit !)
├── .env.example             # Exemple de .env
├── package.json
└── server.js                # Point d'entrée
```

---

## 🔐 SÉCURITÉ

### Données chiffrées avec AES-256
- Code secret de paiement (6 chiffres)
- Numéro de carte Mastercard
- Clé privée Ethereum (si wallet custodial)

### Authentification JWT
- Access Token : expire en 1h
- Refresh Token : expire en 7 jours
- Headers requis : `Authorization: Bearer <token>`

### Rate Limiting
- 100 requêtes par 15 minutes par IP
- Headers : `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 📊 ENDPOINTS API PRINCIPAUX

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs (authentification requise)
- `GET /api/users/me` - Profil utilisateur
- `PUT /api/users/me` - Modifier le profil
- `POST /api/users/me/payment-code` - Définir le code secret
- `GET /api/users/me/wallet` - Wallet de l'utilisateur

### Clubs
- `GET /api/clubs` - Liste des clubs
- `GET /api/clubs/:id` - Détails d'un club

### Paiements (authentification requise)
- `POST /api/payments/stripe` - Paiement Stripe
- `POST /api/payments/crypto` - Paiement crypto
- `GET /api/payments/history` - Historique

### Fidélité (authentification requise)
- `GET /api/loyalty/points` - Points de fidélité
- `GET /api/loyalty/level` - Niveau actuel
- `POST /api/loyalty/redeem` - Utiliser les points

### Parrainage (authentification requise)
- `GET /api/referrals/code` - Code de parrainage
- `GET /api/referrals/list` - Liste des filleuls
- `POST /api/referrals/share` - Partager le code

---

## 🐛 DÉPANNAGE

### Erreur de connexion à PostgreSQL
```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Démarrer PostgreSQL
sudo systemctl start postgresql

# Vérifier la connexion
psql -U paiecashfan_user -d paiecashfan_db -h localhost
```

### Port 5000 déjà utilisé
```bash
# Trouver le processus
lsof -i :5000

# Tuer le processus
kill -9 PID

# Ou changer le port dans .env
PORT=5001
```

### Erreur "ENCRYPTION_KEY doit faire 32 caractères"
```bash
# Générer une nouvelle clé
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Copier dans .env
ENCRYPTION_KEY=la_cle_generee_fait_exactement_32_caracteres
```

---

## 📚 RESSOURCES

- **Documentation Sequelize** : https://sequelize.org/docs/v6/
- **Documentation Express** : https://expressjs.com/
- **Documentation JWT** : https://jwt.io/
- **WalletConnect Best Practices** : https://docs.walletconnect.network/wallet-sdk/best-practices
- **Node.js Security Best Practices** : https://nodejs.org/en/docs/guides/security/

---

## ✅ CHECKLIST AVANT DÉVELOPPEMENT

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `paiecashfan_db` créée
- [ ] Fichier `.env` configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Tests de health check réussis
- [ ] Inscription test réussie
- [ ] Connexion test réussie

---

**🎉 Vous êtes prêt à développer !**

Pour toute question, consultez :
- `📘_GUIDE_DEPLOIEMENT_PRODUCTION_V4.md` pour le déploiement complet
- Les commentaires dans le code source
- Les logs dans `backend/logs/`

**Bon développement ! 🚀**
