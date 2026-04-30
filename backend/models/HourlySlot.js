'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HourlySlot = sequelize.define(
    'HourlySlot',
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
      slotStart: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'e.g. "08:00"',
      },
      slotEnd: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'e.g. "11:00"',
      },
      availableCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      priceOverride: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'HourlySlots',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['roomTypeId', 'date', 'slotStart', 'slotEnd'] },
      ],
    }
  );

  HourlySlot.associate = (models) => {
    HourlySlot.belongsTo(models.RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
  };

  return HourlySlot;
};
