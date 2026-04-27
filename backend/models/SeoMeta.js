'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SeoMeta = sequelize.define(
    'SeoMeta',
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
      pageSlug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'e.g. "homepage", "rooms", "rooms/deluxe"',
      },
      metaTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      metaDescription: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ogImageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      customJsonLd: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      canonicalUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
    },
    {
      tableName: 'SeoMetas',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['hotelId', 'pageSlug'] },
      ],
    }
  );

  SeoMeta.associate = (models) => {
    SeoMeta.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
  };

  return SeoMeta;
};
