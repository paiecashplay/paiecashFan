/**
 * Utilitaire JWT pour authentification sécurisée
 * Implémente Access Token + Refresh Token
 */

const jwt = require('jsonwebtoken');
const { generateToken } = require('./encryption');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Génère un Access Token JWT
 * @param {Object} payload - Données à inclure dans le token (user id, email, etc.)
 * @returns {string} - Access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'paiecashfan-api',
    audience: 'paiecashfan-client'
  });
};

/**
 * Génère un Refresh Token JWT
 * @param {Object} payload - Données à inclure dans le token (user id)
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'paiecashfan-api',
    audience: 'paiecashfan-client'
  });
};

/**
 * Vérifie et décode un Access Token
 * @param {string} token - Access token à vérifier
 * @returns {Object} - Payload décodé
 * @throws {Error} - Si le token est invalide ou expiré
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'paiecashfan-api',
      audience: 'paiecashfan-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Access token invalide');
    }
    throw error;
  }
};

/**
 * Vérifie et décode un Refresh Token
 * @param {string} token - Refresh token à vérifier
 * @returns {Object} - Payload décodé
 * @throws {Error} - Si le token est invalide ou expiré
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'paiecashfan-api',
      audience: 'paiecashfan-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token invalide');
    }
    throw error;
  }
};

/**
 * Génère une paire de tokens (access + refresh)
 * @param {Object} user - Objet utilisateur
 * @returns {Object} - { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    clubId: user.club_id,
    status: user.status
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return { accessToken, refreshToken };
};

/**
 * Génère un token de vérification email (expire en 24h)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @returns {string} - Token de vérification
 */
const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Vérifie un token de vérification email
 * @param {string} token - Token à vérifier
 * @returns {Object} - Payload décodé
 */
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'email_verification') {
      throw new Error('Type de token invalide');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Token de vérification invalide: ${error.message}`);
  }
};

/**
 * Génère un token de réinitialisation de mot de passe (expire en 1h)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @returns {string} - Token de réinitialisation
 */
const generatePasswordResetToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Vérifie un token de réinitialisation de mot de passe
 * @param {string} token - Token à vérifier
 * @returns {Object} - Payload décodé
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      throw new Error('Type de token invalide');
    }
    return decoded;
  } catch (error) {
    throw new Error(`Token de réinitialisation invalide: ${error.message}`);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
};
