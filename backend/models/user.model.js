/**
 * Modèle User - Utilisateurs de PaieCashFan
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
      }
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    club_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID du club ou fédération (ex: olympique-marseille, fed-france)'
    },
    status: {
      type: DataTypes.ENUM('fan', 'licencie'),
      defaultValue: 'fan',
      comment: 'Statut: fan (supporter occasionnel) ou licencié (membre officiel)'
    },
    payment_code_encrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Code secret de paiement (6 chiffres) chiffré avec AES-256'
    },
    referral_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Code de parrainage unique (ex: ETOT2024)'
    },
    referred_by: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID du parrain qui a référé cet utilisateur'
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notification_preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        match_results: true,
        promotions: true,
        club_news: true,
        cashback: true,
        geolocation: true
      },
      comment: 'Préférences de notifications'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Métadonnées supplémentaires (adresse, ville, etc.)'
    }
  }, {
    indexes: [
      { fields: ['email'] },
      { fields: ['referral_code'] },
      { fields: ['club_id'] },
      { fields: ['referred_by'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        // Hash du mot de passe avant création
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Rehash du mot de passe si modifié
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });

  // Méthode pour comparer les mots de passe
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  };

  // Méthode pour masquer les données sensibles
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.payment_code_encrypted;
    return values;
  };

  return User;
};
