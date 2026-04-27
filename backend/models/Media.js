'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Media = sequelize.define(
    'Media',
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
      url: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      thumbnailUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('IMAGE', 'VIDEO'),
        defaultValue: 'IMAGE',
      },
      category: {
        type: DataTypes.ENUM('HOTEL', 'ROOM', 'AMENITY', 'GALLERY'),
        defaultValue: 'HOTEL',
      },
      altText: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sizeBytes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'Media',
      timestamps: true,
    }
  );

  Media.associate = (models) => {
    Media.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
  };

  return Media;
};
