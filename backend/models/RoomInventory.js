'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomInventory = sequelize.define(
    'RoomInventory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roomTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'RoomTypes', key: 'id' },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      availableCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      priceOverride: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      minStayNights: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'RoomInventories',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['roomTypeId', 'date'] },
      ],
    }
  );

  RoomInventory.associate = (models) => {
    RoomInventory.belongsTo(models.RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  };

  return RoomInventory;
};
