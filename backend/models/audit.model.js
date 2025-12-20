/**
 * Modèle Audit - Système d'audit pour toutes les actions critiques
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Audit = sequelize.define('audit_logs', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID de l\'utilisateur qui a effectué l\'action (null si système)'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Type d\'action (ex: USER_LOGIN, PAYMENT_CREATED, DATA_EXPORT)'
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type de ressource affectée (user, wallet, payment, etc.)'
    },
    resource_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID de la ressource affectée'
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'warning'),
      defaultValue: 'success'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'Adresse IP de l\'utilisateur (IPv4 ou IPv6)'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent du navigateur'
    },
    request_method: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Méthode HTTP (GET, POST, PUT, DELETE, etc.)'
    },
    request_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de la requête'
    },
    changes_before: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'État de la ressource avant modification'
    },
    changes_after: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'État de la ressource après modification'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Métadonnées supplémentaires (erreur, message, etc.)'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium',
      comment: 'Niveau de criticité de l\'action'
    },
    duration_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Durée de l\'opération en millisecondes'
    }
  }, {
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['resource_type'] },
      { fields: ['status'] },
      { fields: ['severity'] },
      { fields: ['created_at'] },
      { fields: ['ip_address'] }
    ],
    // Désactiver les mises à jour (audit logs sont immuables)
    updatedAt: false
  });

  return Audit;
};
