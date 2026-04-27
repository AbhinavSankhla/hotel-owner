'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApiKey = sequelize.define(
    'ApiKey',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      hotelId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Hotels', key: 'id' },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      keyHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'SHA-256 hash of the API key — plaintext never stored',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      allowedOrigins: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      permissions: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: 'ApiKeys',
      timestamps: true,
    }
  );

  ApiKey.associate = (models) => {
    ApiKey.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
  };

  return ApiKey;
};
