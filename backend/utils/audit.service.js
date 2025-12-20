/**
 * Service d'audit pour tracer toutes les actions critiques
 */

const logger = require('./logger');

class AuditService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialiser le service avec la connexion DB
   */
  init(db) {
    this.db = db;
  }

  /**
   * Enregistrer une action dans les logs d'audit
   * @param {Object} auditData - Données de l'audit
   */
  async log(auditData) {
    try {
      if (!this.db || !this.db.Audit) {
        logger.error('Service d\'audit non initialisé');
        return null;
      }

      const {
        userId,
        action,
        resourceType,
        resourceId,
        status = 'success',
        ipAddress,
        userAgent,
        requestMethod,
        requestUrl,
        changesBefore,
        changesAfter,
        metadata = {},
        severity = 'medium',
        durationMs
      } = auditData;

      // Créer l'entrée d'audit
      const auditLog = await this.db.Audit.create({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        status,
        ip_address: ipAddress,
        user_agent: userAgent,
        request_method: requestMethod,
        request_url: requestUrl,
        changes_before: changesBefore,
        changes_after: changesAfter,
        metadata,
        severity,
        duration_ms: durationMs
      });

      // Logger les actions critiques
      if (severity === 'critical' || severity === 'high' || status === 'failure') {
        logger.warn(`[AUDIT ${severity.toUpperCase()}] ${action} - User: ${userId} - Status: ${status}`, {
          resourceType,
          resourceId,
          metadata
        });
      }

      return auditLog;
    } catch (error) {
      logger.error(`Erreur lors de la création de l'audit log: ${error.message}`);
      return null;
    }
  }

  /**
   * Enregistrer une connexion utilisateur
   */
  async logLogin(userId, ipAddress, userAgent, success = true, metadata = {}) {
    return await this.log({
      userId,
      action: success ? 'USER_LOGIN_SUCCESS' : 'USER_LOGIN_FAILURE',
      resourceType: 'user',
      resourceId: userId,
      status: success ? 'success' : 'failure',
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'medium',
      metadata
    });
  }

  /**
   * Enregistrer une inscription
   */
  async logRegistration(userId, ipAddress, userAgent, email, clubId) {
    return await this.log({
      userId,
      action: 'USER_REGISTRATION',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'medium',
      metadata: { email, clubId }
    });
  }

  /**
   * Enregistrer une déconnexion
   */
  async logLogout(userId, ipAddress, userAgent) {
    return await this.log({
      userId,
      action: 'USER_LOGOUT',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'low'
    });
  }

  /**
   * Enregistrer une modification de profil
   */
  async logProfileUpdate(userId, ipAddress, userAgent, changesBefore, changesAfter) {
    return await this.log({
      userId,
      action: 'PROFILE_UPDATE',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      changesBefore,
      changesAfter,
      severity: 'medium'
    });
  }

  /**
   * Enregistrer une définition/modification de code secret
   */
  async logPaymentCodeSet(userId, ipAddress, userAgent, isNew = true) {
    return await this.log({
      userId,
      action: isNew ? 'PAYMENT_CODE_SET' : 'PAYMENT_CODE_UPDATE',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'high',
      metadata: { action: isNew ? 'Création' : 'Modification' }
    });
  }

  /**
   * Enregistrer une tentative de vérification de code secret
   */
  async logPaymentCodeVerification(userId, ipAddress, userAgent, success = true) {
    return await this.log({
      userId,
      action: 'PAYMENT_CODE_VERIFICATION',
      resourceType: 'user',
      resourceId: userId,
      status: success ? 'success' : 'failure',
      ipAddress,
      userAgent,
      severity: success ? 'low' : 'high',
      metadata: { attempts: success ? null : 'Failed verification' }
    });
  }

  /**
   * Enregistrer une création de paiement
   */
  async logPaymentCreated(userId, paymentId, ipAddress, userAgent, amount, currency, method) {
    return await this.log({
      userId,
      action: 'PAYMENT_CREATED',
      resourceType: 'payment',
      resourceId: paymentId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'high',
      metadata: { amount, currency, method }
    });
  }

  /**
   * Enregistrer un paiement réussi
   */
  async logPaymentSuccess(userId, paymentId, ipAddress, userAgent, amount, currency) {
    return await this.log({
      userId,
      action: 'PAYMENT_SUCCESS',
      resourceType: 'payment',
      resourceId: paymentId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'critical',
      metadata: { amount, currency }
    });
  }

  /**
   * Enregistrer un paiement échoué
   */
  async logPaymentFailure(userId, paymentId, ipAddress, userAgent, amount, currency, error) {
    return await this.log({
      userId,
      action: 'PAYMENT_FAILURE',
      resourceType: 'payment',
      resourceId: paymentId,
      status: 'failure',
      ipAddress,
      userAgent,
      severity: 'critical',
      metadata: { amount, currency, error }
    });
  }

  /**
   * Enregistrer une connexion de wallet
   */
  async logWalletConnect(userId, ipAddress, userAgent, ethereumAddress) {
    return await this.log({
      userId,
      action: 'WALLET_CONNECT',
      resourceType: 'wallet',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'high',
      metadata: { ethereumAddress }
    });
  }

  /**
   * Enregistrer une transaction crypto
   */
  async logCryptoTransaction(userId, transactionId, ipAddress, userAgent, amount, cryptocurrency, type) {
    return await this.log({
      userId,
      action: `CRYPTO_${type.toUpperCase()}`,
      resourceType: 'transaction',
      resourceId: transactionId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'critical',
      metadata: { amount, cryptocurrency, type }
    });
  }

  /**
   * Enregistrer une exportation de données (RGPD)
   */
  async logDataExport(userId, ipAddress, userAgent, dataType) {
    return await this.log({
      userId,
      action: 'DATA_EXPORT_REQUESTED',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'high',
      metadata: { dataType, gdprRequest: true }
    });
  }

  /**
   * Enregistrer une suppression de compte (RGPD)
   */
  async logAccountDeletion(userId, ipAddress, userAgent, reason) {
    return await this.log({
      userId,
      action: 'ACCOUNT_DELETION_REQUESTED',
      resourceType: 'user',
      resourceId: userId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'critical',
      metadata: { reason, gdprRequest: true }
    });
  }

  /**
   * Enregistrer un accès admin
   */
  async logAdminAccess(adminId, ipAddress, userAgent, targetUserId, action) {
    return await this.log({
      userId: adminId,
      action: 'ADMIN_ACCESS',
      resourceType: 'user',
      resourceId: targetUserId,
      status: 'success',
      ipAddress,
      userAgent,
      severity: 'critical',
      metadata: { action, adminId }
    });
  }

  /**
   * Enregistrer une erreur système
   */
  async logSystemError(error, userId = null, ipAddress = null, metadata = {}) {
    return await this.log({
      userId,
      action: 'SYSTEM_ERROR',
      resourceType: 'system',
      resourceId: null,
      status: 'failure',
      ipAddress,
      userAgent: null,
      severity: 'critical',
      metadata: {
        error: error.message,
        stack: error.stack,
        ...metadata
      }
    });
  }

  /**
   * Récupérer les logs d'audit avec filtres
   */
  async getAuditLogs(filters = {}, page = 1, limit = 50) {
    try {
      const {
        userId,
        action,
        resourceType,
        status,
        severity,
        startDate,
        endDate
      } = filters;

      const where = {};
      
      if (userId) where.user_id = userId;
      if (action) where.action = action;
      if (resourceType) where.resource_type = resourceType;
      if (status) where.status = status;
      if (severity) where.severity = severity;
      if (startDate) where.created_at = { ...where.created_at, [this.db.Sequelize.Op.gte]: startDate };
      if (endDate) where.created_at = { ...where.created_at, [this.db.Sequelize.Op.lte]: endDate };

      const { rows, count } = await this.db.Audit.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      return {
        logs: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error(`Erreur lors de la récupération des audit logs: ${error.message}`);
      return { logs: [], total: 0, page, totalPages: 0 };
    }
  }
}

// Exporter une instance singleton
module.exports = new AuditService();
