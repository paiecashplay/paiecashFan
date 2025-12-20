/**
 * Gestionnaire d'erreurs avancé avec retry et fallback
 */

const logger = require('./logger');

/**
 * Classe d'erreur personnalisée pour l'application
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreurs spécifiques
 */
class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400);
    this.details = details;
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentification requise') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Accès non autorisé') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(`${resource} non trouvé(e)`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Trop de requêtes, veuillez réessayer plus tard') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Erreur de base de données', originalError = null) {
    super(message, 500, false);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'Service externe indisponible') {
    super(`${service}: ${message}`, 503, false);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

/**
 * Fonction de retry avec backoff exponentiel
 */
async function retryWithBackoff(
  fn,
  options = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry = null
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Ne pas retry si c'est une erreur opérationnelle (400, 401, 403, 404, etc.)
      if (error.isOperational && error.statusCode < 500) {
        throw error;
      }

      // Dernier essai, throw l'erreur
      if (attempt === maxRetries) {
        logger.error(`Échec après ${maxRetries + 1} tentatives: ${error.message}`);
        throw error;
      }

      // Attendre avant le prochain essai
      logger.warn(`Tentative ${attempt + 1}/${maxRetries + 1} échouée, nouvelle tentative dans ${delay}ms: ${error.message}`);
      
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Augmenter le délai pour le prochain essai (backoff exponentiel)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Fonction avec fallback
 */
async function withFallback(
  primaryFn,
  fallbackFn,
  options = {}
) {
  const {
    fallbackOnError = true,
    logFallback = true
  } = options;

  try {
    return await primaryFn();
  } catch (error) {
    if (!fallbackOnError) {
      throw error;
    }

    if (logFallback) {
      logger.warn(`Fonction principale échouée, utilisation du fallback: ${error.message}`);
    }

    try {
      return await fallbackFn(error);
    } catch (fallbackError) {
      logger.error(`Fallback également échoué: ${fallbackError.message}`);
      throw error; // Throw l'erreur originale
    }
  }
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur automatique
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware de gestion d'erreur global
 */
function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Erreur interne du serveur';

  // Logger l'erreur
  if (err.statusCode >= 500) {
    logger.error(`[${err.name}] ${err.message}`, {
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      userId: req.userId,
      stack: err.stack
    });
  } else {
    logger.warn(`[${err.name}] ${err.message}`, {
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      userId: req.userId
    });
  }

  // Réponse selon l'environnement
  const response = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(err.details && { details: err.details })
  };

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.isOperational = err.isOperational;
  }

  res.status(err.statusCode).json(response);
}

/**
 * Gestionnaire pour les 404
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError('Route');
  next(error);
}

/**
 * Convertir les erreurs Sequelize en erreurs de l'application
 */
function handleSequelizeError(error) {
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors.reduce((acc, err) => {
      acc[err.path] = err.message;
      return acc;
    }, {});
    return new ValidationError('Erreur de validation', details);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'champ';
    return new ConflictError(`${field} existe déjà`);
  }

  if (error.name === 'SequelizeDatabaseError') {
    return new DatabaseError('Erreur de base de données', error);
  }

  return new DatabaseError(error.message, error);
}

/**
 * Gestionnaire de promesses non gérées
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
      reason,
      promise
    });
    // En production, on peut décider de terminer le processus
    if (process.env.NODE_ENV === 'production') {
      logger.error('Arrêt du processus suite à une promesse non gérée');
      process.exit(1);
    }
  });
}

/**
 * Gestionnaire d'exceptions non capturées
 */
function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack
    });
    // Toujours terminer le processus pour une exception non capturée
    logger.error('Arrêt du processus suite à une exception non capturée');
    process.exit(1);
  });
}

/**
 * Circuit Breaker simple pour services externes
 */
class CircuitBreaker {
  constructor(fn, options = {}) {
    this.fn = fn;
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 10000;
    this.resetTimeout = options.resetTimeout || 60000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new ExternalServiceError('Service', 'Circuit breaker ouvert');
      }
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await Promise.race([
        this.fn(...args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.timeout)
        )
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        logger.info('Circuit breaker fermé après récupération');
      }
    }
  }

  onFailure() {
    this.failureCount++;
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.warn(`Circuit breaker ouvert après ${this.failureCount} échecs`);
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}

module.exports = {
  // Classes d'erreur
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  
  // Fonctions utilitaires
  retryWithBackoff,
  withFallback,
  asyncHandler,
  
  // Middlewares
  globalErrorHandler,
  notFoundHandler,
  
  // Convertisseurs
  handleSequelizeError,
  
  // Gestionnaires de processus
  handleUnhandledRejection,
  handleUncaughtException,
  
  // Circuit Breaker
  CircuitBreaker
};
