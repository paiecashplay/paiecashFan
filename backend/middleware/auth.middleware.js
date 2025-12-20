/**
 * Middleware d'authentification JWT
 */

const { verifyAccessToken } = require('../utils/jwt');
const db = require('../config/database');

/**
 * Middleware pour protéger les routes (authentification requise)
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérification du token
    const decoded = verifyAccessToken(token);

    // Récupération de l'utilisateur depuis la DB
    const user = await db.User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash', 'payment_code_encrypted'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Ajout de l'utilisateur dans la requête
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token invalide'
    });
  }
};

/**
 * Middleware optionnel (authentification si token présent)
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Pas de token, on continue sans authentification
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const user = await db.User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash', 'payment_code_encrypted'] }
    });

    if (user && user.is_active) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

/**
 * Middleware pour vérifier le rôle admin (à implémenter si nécessaire)
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifier si l'utilisateur a le rôle admin (à ajouter dans le modèle User)
  if (req.user.metadata && req.user.metadata.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Accès réservé aux administrateurs'
  });
};

/**
 * Middleware pour vérifier que l'utilisateur accède à ses propres données
 */
const requireOwnership = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    const targetUserId = req.params[paramName] || req.body[paramName];

    if (req.user.id !== targetUserId && req.user.metadata?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  requireOwnership
};
