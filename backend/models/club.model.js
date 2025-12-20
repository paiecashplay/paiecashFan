/**
 * Modèle Club - Clubs et Fédérations
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Club = sequelize.define('clubs', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      comment: 'Slug du club (ex: olympique-marseille, fed-france)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    short: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Nom court (ex: OM, PSG)'
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL ou base64 du logo'
    },
    color1: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: 'Couleur principale (hex)'
    },
    color2: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: 'Couleur secondaire (hex)'
    },
    stade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coin: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Nom de la crypto du club (ex: OM Coin)'
    },
    sport: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type: football, rugby, basketball, handball, volleyball, federation'
    },
    ligue: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Ligue: Ligue 1, Top 14, etc.'
    },
    zone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Pour les fédérations: Europe, Afrique, etc.'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    indexes: [
      { fields: ['sport'] },
      { fields: ['ligue'] },
      { fields: ['zone'] }
    ]
  });

  return Club;
};
