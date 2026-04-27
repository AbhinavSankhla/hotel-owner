'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('GUEST', 'HOTEL_ADMIN', 'HOTEL_STAFF'),
        defaultValue: 'GUEST',
      },
      hotelId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Hotels', key: 'id' },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      phoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    User.hasMany(models.Booking, { foreignKey: 'guestId', as: 'bookings' });
    User.hasMany(models.Review, { foreignKey: 'guestId', as: 'reviews' });
    User.hasOne(models.StaffPermission, { foreignKey: 'userId', as: 'staffPermission', onDelete: 'CASCADE' });
    User.hasMany(models.BlogPost, { foreignKey: 'authorId', as: 'blogPosts' });
  };

  return User;
};
