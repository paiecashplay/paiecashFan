/**
 * Modèle Wallet - Portefeuille de l'utilisateur
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Wallet = sequelize.define('wallets', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    wallet_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'ID unique du wallet (ex: WLT-OM-2025-089374)'
    },
    balance_paiecash: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      comment: 'Solde PaieCash en EUR'
    },
    balance_usdc: {
      type: DataTypes.DECIMAL(15, 6),
      defaultValue: 0.000000,
      comment: 'Solde USDC (stablecoin)'
    },
    balance_usdt: {
      type: DataTypes.DECIMAL(15, 6),
      defaultValue: 0.000000,
      comment: 'Solde USDT (stablecoin)'
    },
    balance_eth: {
      type: DataTypes.DECIMAL(18, 8),
      defaultValue: 0.00000000,
      comment: 'Solde Ethereum (ETH)'
    },
    balance_club_coin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Solde Club Coin (token du club)'
    },
    ethereum_address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Adresse Ethereum (pour WalletConnect)'
    },
    ethereum_address_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Clé privée Ethereum chiffrée (si wallet custodial)'
    },
    mastercard_number_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Numéro de carte Mastercard chiffré'
    },
    mastercard_expiry: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Date d\'expiration carte (MM/YY)'
    },
    mastercard_status: {
      type: DataTypes.ENUM('active', 'blocked', 'expired'),
      defaultValue: 'active'
    },
    mastercard_limits: {
      type: DataTypes.JSONB,
      defaultValue: {
        daily: 1000,
        monthly: 5000,
        per_transaction: 500
      },
      comment: 'Limites de la carte Mastercard en EUR'
    },
    is_frozen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Wallet gelé (sécurité)'
    },
    last_transaction_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      { fields: ['user_id'] },
      { fields: ['wallet_id'] },
      { fields: ['ethereum_address'] }
    ]
  });

  // Méthode pour obtenir le solde total en EUR (conversion approximative)
  Wallet.prototype.getTotalBalanceEUR = function() {
    // Taux de conversion approximatifs (à remplacer par API de prix en temps réel)
    const ETH_TO_EUR = 2000; // 1 ETH = 2000 EUR (exemple)
    const USDC_TO_EUR = 0.92; // 1 USDC = 0.92 EUR
    const USDT_TO_EUR = 0.92; // 1 USDT = 0.92 EUR
    const CLUB_COIN_TO_EUR = 0.01; // 1 Club Coin = 0.01 EUR

    return parseFloat(this.balance_paiecash) +
           parseFloat(this.balance_usdc) * USDC_TO_EUR +
           parseFloat(this.balance_usdt) * USDT_TO_EUR +
           parseFloat(this.balance_eth) * ETH_TO_EUR +
           parseInt(this.balance_club_coin) * CLUB_COIN_TO_EUR;
  };

  return Wallet;
};
