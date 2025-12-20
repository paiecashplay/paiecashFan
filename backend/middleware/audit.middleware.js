/**
 * Middleware d'audit pour enregistrer automatiquement les requêtes critiques
 */

const auditService = require('../utils/audit.service');

/**
 * Extraire l'adresse IP réelle (même derrière un proxy)
 */
const getIpAddress = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
};

/**
 * Extraire le user agent
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Middleware pour auditer automatiquement les requêtes
 */
const auditRequest = (action, resourceType, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Capturer l'ancienne fonction res.json pour intercepter la réponse
    const originalJson = res.json.bind(res);
    
    res.json = function(body) {
      const durationMs = Date.now() - startTime;
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';
      const severity = options.severity || (status === 'failure' ? 'high' : 'medium');
      
      // Enregistrer l'audit de manière asynchrone (ne pas bloquer la réponse)
      setImmediate(async () => {
        try {
          await auditService.log({
            userId: req.userId || req.user?.id || null,
            action,
            resourceType,
            resourceId: options.getResourceId ? options.getResourceId(req, body) : req.params.id,
            status,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
            requestMethod: req.method,
            requestUrl: req.originalUrl,
            changesBefore: options.captureChanges ? req.auditBefore : null,
            changesAfter: options.captureChanges ? req.auditAfter : null,
            metadata: {
              responseStatus: res.statusCode,
              ...options.metadata,
              ...(status === 'failure' && body.message ? { error: body.message } : {})
            },
            severity,
            durationMs
          });
        } catch (error) {
          console.error('Erreur lors de l\'audit:', error);
        }
      });
      
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * Middleware pour capturer l'état avant modification (pour audit des changements)
 */
const captureBeforeState = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam] || req.body[idParam];
      if (resourceId) {
        const resource = await Model.findByPk(resourceId);
        if (resource) {
          req.auditBefore = resource.toJSON();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la capture de l\'état avant:', error);
    }
    next();
  };
};

/**
 * Middleware pour capturer l'état après modification
 */
const captureAfterState = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    // Capturer l'ancienne fonction res.json
    const originalJson = res.json.bind(res);
    
    res.json = async function(body) {
      try {
        const resourceId = req.params[idParam] || body.data?.id;
        if (resourceId) {
          const resource = await Model.findByPk(resourceId);
          if (resource) {
            req.auditAfter = resource.toJSON();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la capture de l\'état après:', error);
      }
      
      return originalJson(body);
    };
    
    next();
  };
};

/**
 * Middleware spécifique pour auditer les tentatives de connexion
 */
const auditLogin = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = async function(body) {
    const success = body.success === true;
    const userId = body.data?.user?.id;
    
    setImmediate(async () => {
      try {
        await auditService.logLogin(
          userId,
          getIpAddress(req),
          getUserAgent(req),
          success,
          { 
            email: req.body.email,
            ...(body.message ? { message: body.message } : {})
          }
        );
      } catch (error) {
        console.error('Erreur lors de l\'audit de connexion:', error);
      }
    });
    
    return originalJson(body);
  };
  
  next();
};

/**
 * Middleware spécifique pour auditer les inscriptions
 */
const auditRegistration = async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = async function(body) {
    if (body.success === true && body.data?.user) {
      const user = body.data.user;
      
      setImmediate(async () => {
        try {
          await auditService.logRegistration(
            user.id,
            getIpAddress(req),
            getUserAgent(req),
            user.email,
            user.club_id
          );
        } catch (error) {
          console.error('Erreur lors de l\'audit d\'inscription:', error);
        }
      });
    }
    
    return originalJson(body);
  };
  
  next();
};

/**
 * Middleware pour auditer les requêtes échouées (erreurs 400+)
 */
const auditFailures = async (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  
  // Enregistrer l'erreur dans l'audit
  setImmediate(async () => {
    try {
      await auditService.log({
        userId: req.userId || req.user?.id || null,
        action: 'REQUEST_FAILURE',
        resourceType: 'request',
        resourceId: null,
        status: 'failure',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        metadata: {
          error: err.message,
          statusCode,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        },
        severity: statusCode >= 500 ? 'critical' : 'high'
      });
    } catch (error) {
      console.error('Erreur lors de l\'audit d\'échec:', error);
    }
  });
  
  next(err);
};

module.exports = {
  auditRequest,
  captureBeforeState,
  captureAfterState,
  auditLogin,
  auditRegistration,
  auditFailures,
  getIpAddress,
  getUserAgent
};
