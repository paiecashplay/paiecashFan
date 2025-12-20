/**
 * Routes d'authentification
 * POST /api/auth/register - Inscription
 * POST /api/auth/login - Connexion
 * POST /api/auth/refresh - Rafraîchir le token
 * POST /api/auth/logout - Déconnexion
 * POST /api/auth/verify-email - Vérifier l'email
 * POST /api/auth/forgot-password - Mot de passe oublié
 * POST /api/auth/reset-password - Réinitialiser le mot de passe
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { 
  generateTokenPair, 
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken
} = require('../utils/jwt');
const { encryptPaymentCode } = require('../utils/encryption');
const logger = require('../utils/logger');

// ========== INSCRIPTION ==========
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('first_name').trim().isLength({ min: 2, max: 50 }),
  body('last_name').trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/),
  body('club_id').notEmpty().withMessage('Veuillez choisir un club ou une fédération')
], async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password, first_name, last_name, phone, club_id, status, referred_by_code } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Générer un code de parrainage unique
    const referralCode = `${first_name.substring(0, 4).toUpperCase()}${Math.floor(Math.random() * 10000)}`;

    // Vérifier si quelqu'un a parrainé cet utilisateur
    let referredBy = null;
    if (referred_by_code) {
      const referrer = await db.User.findOne({ where: { referral_code: referred_by_code } });
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    // Création de l'utilisateur
    const user = await db.User.create({
      email,
      password_hash: password, // Sera hashé automatiquement par le hook
      first_name,
      last_name,
      phone,
      club_id,
      status: status || 'fan',
      referral_code: referralCode,
      referred_by: referredBy
    });

    // Création du wallet
    const walletId = `WLT-${club_id.substring(0, 5).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
    await db.Wallet.create({
      user_id: user.id,
      wallet_id: walletId,
      balance_paiecash: 0
    });

    // Création du profil de fidélité
    await db.Loyalty.create({
      user_id: user.id,
      points: referredBy ? 500 : 0, // 500 points si parrainé
      level: 'bronze'
    });

    // Si parrainé, ajouter une entrée referral et récompenser le parrain
    if (referredBy) {
      await db.Referral.create({
        referrer_id: referredBy,
        referred_id: user.id,
        reward_points: 500,
        status: 'completed'
      });

      // Ajouter 500 points au parrain
      const referrerLoyalty = await db.Loyalty.findOne({ where: { user_id: referredBy } });
      if (referrerLoyalty) {
        await referrerLoyalty.increment('points', { by: 500 });
      }
    }

    // Génération des tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Génération du token de vérification email (à envoyer par email)
    const emailVerificationToken = generateEmailVerificationToken(user.id, user.email);
    // TODO: Envoyer l'email avec le lien de vérification

    logger.info(`Nouvel utilisateur inscrit: ${user.email} (${user.id})`);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Un email de vérification vous a été envoyé.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          club_id: user.club_id,
          status: user.status,
          referral_code: user.referral_code
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de l'inscription: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ========== CONNEXION ==========
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Recherche de l'utilisateur
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérification du compte actif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Mise à jour de la date de dernière connexion
    await user.update({ last_login: new Date() });

    // Génération des tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    logger.info(`Connexion réussie: ${user.email}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          club_id: user.club_id,
          status: user.status,
          referral_code: user.referral_code,
          email_verified: user.email_verified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la connexion: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ========== RAFRAÎCHIR LE TOKEN ==========
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token manquant'
      });
    }

    // Vérification du refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Récupération de l'utilisateur
    const user = await db.User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif'
      });
    }

    // Génération d'une nouvelle paire de tokens
    const tokens = generateTokenPair(user);

    res.json({
      success: true,
      message: 'Tokens rafraîchis avec succès',
      data: {
        tokens
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Refresh token invalide'
    });
  }
});

// ========== DÉCONNEXION ==========
router.post('/logout', (req, res) => {
  // Pour JWT, la déconnexion est gérée côté client (suppression des tokens)
  // On peut aussi implémenter une blacklist de tokens côté serveur si nécessaire
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

module.exports = router;
