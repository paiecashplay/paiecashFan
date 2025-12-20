/**
 * PaieCashFan Backend API - v4.0.0
 * Backend Node.js avec Express, PostgreSQL, JWT, AES-256
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import des routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const clubRoutes = require('./routes/club.routes');
const paymentRoutes = require('./routes/payment.routes');
const loyaltyRoutes = require('./routes/loyalty.routes');
const referralRoutes = require('./routes/referral.routes');
const nftRoutes = require('./routes/nft.routes');
const notificationRoutes = require('./routes/notification.routes');
const walletRoutes = require('./routes/wallet.routes');

// Import de la connexion DB
const db = require('./config/database');
const logger = require('./utils/logger');

// Initialisation de l'app
const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// MIDDLEWARES DE SÉCURITÉ
// ==============================

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuré pour autoriser uniquement les origines spécifiques
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting pour prévenir les attaques DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes max
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Compression des réponses
app.use(compression());

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging HTTP avec Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { 
    stream: { write: (message) => logger.info(message.trim()) } 
  }));
}

// ==============================
// ROUTES API
// ==============================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PaieCashFan API v4.0 - Running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: db.sequelize ? 'Connected' : 'Disconnected'
  });
});

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/nft', nftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// ==============================
// GESTION DES ERREURS GLOBALE
// ==============================

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur est survenue' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==============================
// DÉMARRAGE DU SERVEUR
// ==============================

const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await db.sequelize.authenticate();
    logger.info('✅ Connexion à PostgreSQL réussie');

    // Synchronisation des modèles (en développement seulement)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('✅ Modèles Sequelize synchronisés');
    }

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`🚀 Serveur PaieCashFan démarré sur le port ${PORT}`);
      logger.info(`📍 Environnement: ${process.env.NODE_ENV}`);
      logger.info(`🌍 API disponible sur: http://localhost:${PORT}/api`);
      logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu. Fermeture gracieuse du serveur...');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT reçu. Fermeture gracieuse du serveur...');
  await db.sequelize.close();
  process.exit(0);
});

// Démarrage
startServer();

module.exports = app;
