/**
 * Configuration de la base de données PostgreSQL avec Sequelize
 */

const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuration de la connexion
const sequelize = new Sequelize(
  process.env.DB_NAME || 'paiecashfan_db',
  process.env.DB_USER || 'paiecashfan_user',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' 
      ? (msg) => logger.debug(msg) 
      : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' 
        ? { require: true, rejectUnauthorized: false } 
        : false
    }
  }
);

// Import des modèles
const User = require('../models/user.model')(sequelize);
const Club = require('../models/club.model')(sequelize);
const Payment = require('../models/payment.model')(sequelize);
const Loyalty = require('../models/loyalty.model')(sequelize);
const Referral = require('../models/referral.model')(sequelize);
const NFT = require('../models/nft.model')(sequelize);
const Notification = require('../models/notification.model')(sequelize);
const Wallet = require('../models/wallet.model')(sequelize);
const Transaction = require('../models/transaction.model')(sequelize);

// Associations entre modèles
const setupAssociations = () => {
  // User <-> Club
  User.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
  Club.hasMany(User, { foreignKey: 'club_id', as: 'users' });

  // User <-> Wallet
  User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
  Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Loyalty
  User.hasOne(Loyalty, { foreignKey: 'user_id', as: 'loyalty' });
  Loyalty.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> Referral (parrain et filleuls)
  User.hasMany(Referral, { foreignKey: 'referrer_id', as: 'referrals' });
  Referral.belongsTo(User, { foreignKey: 'referrer_id', as: 'referrer' });
  Referral.belongsTo(User, { foreignKey: 'referred_id', as: 'referred' });

  // User <-> Payment
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User <-> NFT
  User.hasMany(NFT, { foreignKey: 'owner_id', as: 'nfts' });
  NFT.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  // Club <-> NFT
  Club.hasMany(NFT, { foreignKey: 'club_id', as: 'nfts' });
  NFT.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

  // User <-> Notification
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Wallet <-> Transaction
  Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });
  Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
};

setupAssociations();

// Export de l'instance Sequelize et des modèles
const db = {
  sequelize,
  Sequelize,
  User,
  Club,
  Payment,
  Loyalty,
  Referral,
  NFT,
  Notification,
  Wallet,
  Transaction
};

module.exports = db;
