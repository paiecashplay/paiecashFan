# 📘 GUIDE DE DÉPLOIEMENT EN PRODUCTION - PaieCashFan V4.0

**Date** : 9 décembre 2025  
**Version** : 4.0.0 - Backend Node.js + PostgreSQL + JWT + AES-256 + WalletConnect

---

## 🎯 ARCHITECTURE COMPLÈTE

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Static)                        │
│  • HTML/CSS/JS                                              │
│  • API Client (fetch)                                       │
│  • WalletConnect Integration                               │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Node.js)                      │
│  • Express.js                                               │
│  • JWT Authentication (Access + Refresh Tokens)            │
│  • AES-256 Encryption                                       │
│  • Rate Limiting + Helmet + CORS                           │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL)                    │
│  • Tables: users, wallets, clubs, payments, etc.           │
│  • Chiffrement des données sensibles                       │
│  • Backups automatiques                                     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                 SERVICES EXTERNES                            │
│  • Ethereum/Polygon (via Infura)                           │
│  • WalletConnect                                            │
│  • Stripe/PayPal (Paiements)                               │
│  • Twilio (SMS)                                             │
│  • Nodemailer (Emails)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 ÉTAPE 1 : CONFIGURATION DU SERVEUR

### Prérequis
- **Serveur** : VPS Linux (Ubuntu 22.04 LTS recommandé) avec minimum 2GB RAM
- **Node.js** : Version 18.0+ (installer avec nvm)
- **PostgreSQL** : Version 14+
- **nginx** : Pour reverse proxy et HTTPS
- **PM2** : Pour gestion de processus Node.js

### Installation Node.js avec NVM
```bash
# Installer NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc

# Installer Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Vérifier
node --version  # devrait afficher v18.x.x
npm --version
```

### Installation PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données et l'utilisateur
sudo -u postgres psql

postgres=# CREATE DATABASE paiecashfan_db;
postgres=# CREATE USER paiecashfan_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_ultra_securise';
postgres=# GRANT ALL PRIVILEGES ON DATABASE paiecashfan_db TO paiecashfan_user;
postgres=# \q
```

### Installation nginx
```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Installation PM2
```bash
npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées
```

---

## 🔐 ÉTAPE 2 : SÉCURISATION

### 1. Générer les clés de chiffrement
```bash
# Générer une clé AES-256 (32 caractères)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Générer un JWT secret (64 caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configurer le fichier .env
```bash
cd /var/www/paiecashfan/backend
cp .env.example .env
nano .env
```

**Contenu du .env (PRODUCTION)** :
```bash
NODE_ENV=production
PORT=5000

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paiecashfan_db
DB_USER=paiecashfan_user
DB_PASSWORD=votre_mot_de_passe_ultra_securise

# JWT (GÉNÉRER DE NOUVELLES CLÉS)
JWT_SECRET=votre_jwt_secret_genere_64_caracteres
JWT_REFRESH_SECRET=votre_refresh_secret_genere_64_caracteres
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Chiffrement AES-256 (GÉNÉRER UNE NOUVELLE CLÉ)
ENCRYPTION_KEY=votre_cle_aes_256_32_caracteres_exactement
ENCRYPTION_IV=votre_iv_16_car

# WalletConnect
WALLETCONNECT_PROJECT_ID=votre_project_id_walletconnect
INFURA_API_KEY=votre_cle_infura

# Email (Gmail ou SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application
EMAIL_FROM=noreply@paiecashfan.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=votre_account_sid
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_PHONE_NUMBER=+33123456789

# URLs Frontend
FRONTEND_URL=https://paiecashfan.com
ALLOWED_ORIGINS=https://paiecashfan.com,https://www.paiecashfan.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_stripe

# PayPal
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_SECRET=votre_secret_paypal
PAYPAL_MODE=live
```

**⚠️ SÉCURITÉ CRITIQUE** :
- Ne JAMAIS commit le fichier `.env`
- Utiliser des clés différentes pour chaque environnement (dev, staging, prod)
- Changer régulièrement les secrets (tous les 90 jours recommandé)

---

## 📦 ÉTAPE 3 : DÉPLOIEMENT DU BACKEND

### 1. Cloner/Uploader le code
```bash
# Créer le dossier
sudo mkdir -p /var/www/paiecashfan
sudo chown -R $USER:$USER /var/www/paiecashfan

# Uploader le code (via Git ou SCP)
cd /var/www/paiecashfan
# git clone votre_repo.git .

# Ou via SCP depuis votre machine locale
scp -r backend/ user@votre_serveur:/var/www/paiecashfan/
```

### 2. Installer les dépendances
```bash
cd /var/www/paiecashfan/backend
npm install --production
```

### 3. Initialiser la base de données
```bash
# Créer les tables
npm run migrate

# Optionnel: Insérer les données des clubs
node scripts/seed-clubs.js
```

### 4. Démarrer avec PM2
```bash
cd /var/www/paiecashfan/backend

# Démarrer l'application
pm2 start server.js --name paiecashfan-api

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs paiecashfan-api

# Redémarrer si nécessaire
pm2 restart paiecashfan-api

# Arrêter
pm2 stop paiecashfan-api
```

---

## 🌐 ÉTAPE 4 : CONFIGURATION NGINX (REVERSE PROXY + HTTPS)

### 1. Créer la configuration nginx
```bash
sudo nano /etc/nginx/sites-available/paiecashfan
```

**Contenu** :
```nginx
# API Backend (api.paiecashfan.com)
server {
    listen 80;
    server_name api.paiecashfan.com;
    
    # Redirection HTTPS (ajouté après Certbot)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.paiecashfan.com;

    # Certificat SSL (généré par Certbot)
    ssl_certificate /etc/letsencrypt/live/api.paiecashfan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.paiecashfan.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Logs
    access_log /var/log/nginx/paiecashfan-api-access.log;
    error_log /var/log/nginx/paiecashfan-api-error.log;

    # Proxy vers le backend Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend Static (www.paiecashfan.com)
server {
    listen 80;
    server_name paiecashfan.com www.paiecashfan.com;
    
    return 301 https://www.paiecashfan.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.paiecashfan.com paiecashfan.com;

    ssl_certificate /etc/letsencrypt/live/www.paiecashfan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.paiecashfan.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/paiecashfan/frontend;
    index index.html;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Activer la configuration
```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/paiecashfan /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Si OK, redémarrer nginx
sudo systemctl restart nginx
```

### 3. Installer Certbot (Let's Encrypt) pour HTTPS
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir les certificats SSL (automatique)
sudo certbot --nginx -d api.paiecashfan.com
sudo certbot --nginx -d www.paiecashfan.com -d paiecashfan.com

# Renouvellement automatique (cron)
sudo certbot renew --dry-run

# Configurer le renouvellement automatique
sudo crontab -e
# Ajouter cette ligne :
0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

---

## 🌍 ÉTAPE 5 : DÉPLOIEMENT DU FRONTEND

### 1. Uploader les fichiers frontend
```bash
# Créer le dossier
sudo mkdir -p /var/www/paiecashfan/frontend
sudo chown -R $USER:$USER /var/www/paiecashfan/frontend

# Uploader les fichiers
cd /var/www/paiecashfan/frontend
# Copier: index.html, app.html, app-federation.html, inscription.html, connexion.html, etc.
```

### 2. Mettre à jour l'URL de l'API
Dans tous les fichiers frontend, remplacer `localhost:5000` par `https://api.paiecashfan.com` :

```javascript
// Ancien (développement)
const API_URL = 'http://localhost:5000/api';

// Nouveau (production)
const API_URL = 'https://api.paiecashfan.com/api';
```

---

## 📊 ÉTAPE 6 : MONITORING ET MAINTENANCE

### 1. Configurer PM2 Monitoring
```bash
# Voir les logs en temps réel
pm2 logs paiecashfan-api

# Voir les métriques
pm2 monit

# Dashboard web (optionnel)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Backups PostgreSQL automatiques
```bash
# Créer un script de backup
sudo nano /usr/local/bin/backup-paiecashfan.sh
```

**Contenu** :
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="paiecashfan_db"
DB_USER="paiecashfan_user"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/paiecashfan_$DATE.sql.gz

# Garder seulement les 30 derniers backups
find $BACKUP_DIR -name "paiecashfan_*.sql.gz" -mtime +30 -delete
```

```bash
# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-paiecashfan.sh

# Ajouter au cron (tous les jours à 2h du matin)
sudo crontab -e
# Ajouter :
0 2 * * * /usr/local/bin/backup-paiecashfan.sh
```

### 3. Monitoring avec Winston Logs
Les logs sont automatiquement créés dans `/var/www/paiecashfan/backend/logs/` :
- `error.log` : Erreurs uniquement
- `combined.log` : Tous les logs

```bash
# Voir les dernières erreurs
tail -f /var/www/paiecashfan/backend/logs/error.log

# Voir tous les logs
tail -f /var/www/paiecashfan/backend/logs/combined.log
```

---

## 🔒 ÉTAPE 7 : SÉCURITÉ AVANCÉE

### 1. Firewall (UFW)
```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquer l'accès direct au port Node.js
sudo ufw deny 5000/tcp

# Vérifier le statut
sudo ufw status
```

### 2. Fail2Ban (Protection brute-force)
```bash
# Installer Fail2Ban
sudo apt install fail2ban

# Créer une configuration pour nginx
sudo nano /etc/fail2ban/jail.local
```

**Contenu** :
```ini
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/*-error.log
maxretry = 5
bantime = 3600
```

```bash
# Redémarrer Fail2Ban
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 3. Audits de sécurité
```bash
# Scanner les dépendances npm
cd /var/www/paiecashfan/backend
npm audit

# Corriger les vulnérabilités
npm audit fix

# Mettre à jour régulièrement
npm update
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Serveur configuré (Node.js, PostgreSQL, nginx)
- [ ] Base de données créée et migrée
- [ ] Fichier `.env` configuré avec clés de production
- [ ] Backend déployé et démarré avec PM2
- [ ] nginx configuré en reverse proxy
- [ ] Certificats SSL installés (HTTPS)
- [ ] Frontend déployé avec URL API mise à jour
- [ ] Firewall activé (UFW)
- [ ] Fail2Ban configuré
- [ ] Backups PostgreSQL automatiques
- [ ] Monitoring PM2 activé
- [ ] DNS configurés (api.paiecashfan.com, www.paiecashfan.com)
- [ ] Tests de charge effectués
- [ ] Documentation API créée
- [ ] Tests E2E réussis

---

## 🚨 DÉPANNAGE

### Backend ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs paiecashfan-api --lines 50

# Vérifier la connexion PostgreSQL
psql -U paiecashfan_user -d paiecashfan_db -h localhost

# Vérifier les variables d'environnement
cat /var/www/paiecashfan/backend/.env
```

### Erreurs 502 Bad Gateway
```bash
# Vérifier que le backend tourne
pm2 status

# Vérifier la configuration nginx
sudo nginx -t

# Vérifier les logs nginx
tail -f /var/log/nginx/paiecashfan-api-error.log
```

### Problèmes de certificat SSL
```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew --force-renewal

# Vérifier l'expiration
sudo certbot certificates
```

---

## 📞 SUPPORT

Pour toute question ou problème :
1. Consulter les logs : `pm2 logs` et `/var/log/nginx/`
2. Vérifier la documentation API : https://api.paiecashfan.com/docs
3. Contacter le support technique

---

**Développé avec ❤️ pour les fans de sport du monde entier**  
**Version 4.0.0 - Backend Production-Ready**
