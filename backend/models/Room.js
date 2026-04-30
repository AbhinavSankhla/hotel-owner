'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define(
    'Room',
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
      roomTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'RoomTypes', key: 'id' },
      },
      roomNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('AVAILABLE', 'MAINTENANCE', 'BLOCKED'),
        defaultValue: 'AVAILABLE',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Rooms',
      timestamps: true,
      indexes: [
        { unique: true, fields: ['hotelId', 'roomNumber'] },
      ],
    }
  );

  Room.associate = (models) => {
    Room.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    Room.belongsTo(models.RoomType, { foreignKey: 'roomTypeId', as: 'roomType' });
    Room.hasMany(models.Booking, { foreignKey: 'assignedRoomId', as: 'bookings' });
  };

  return Room;
};
