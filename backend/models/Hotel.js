'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hotel = sequelize.define(
    'Hotel',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING(100),
        defaultValue: 'India',
      },
      pincode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      whatsapp: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      logoUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      heroImageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      coverImageUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      amenities: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      starRating: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
        validate: { min: 1, max: 5 },
      },
      bookingModel: {
        type: DataTypes.ENUM('DAILY', 'HOURLY', 'BOTH'),
        defaultValue: 'DAILY',
      },
      checkInTime: {
        type: DataTypes.STRING(10),
        defaultValue: '14:00',
      },
      checkOutTime: {
        type: DataTypes.STRING(10),
        defaultValue: '12:00',
      },
      hourlyMinHours: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      hourlyMaxHours: {
        type: DataTypes.INTEGER,
        defaultValue: 12,
      },
      themeConfig: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      template: {
        type: DataTypes.ENUM('CLASSIC', 'MODERN', 'LUXURY', 'BUDGET', 'BOUTIQUE'),
        defaultValue: 'CLASSIC',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      setupCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      gstRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0.12,
        comment: 'GST/tax rate as a decimal (e.g. 0.12 = 12%)',
      },
    },
    {
      tableName: 'Hotels',
      timestamps: true,
    }
  );

  Hotel.associate = (models) => {
    Hotel.hasMany(models.RoomType, { foreignKey: 'hotelId', as: 'roomTypes', onDelete: 'CASCADE' });
    Hotel.hasMany(models.Room, { foreignKey: 'hotelId', as: 'rooms', onDelete: 'CASCADE' });
    Hotel.hasMany(models.Booking, { foreignKey: 'hotelId', as: 'bookings' });
    Hotel.hasMany(models.User, { foreignKey: 'hotelId', as: 'staff' });
    Hotel.hasMany(models.Review, { foreignKey: 'hotelId', as: 'reviews' });
    Hotel.hasMany(models.Media, { foreignKey: 'hotelId', as: 'media', onDelete: 'CASCADE' });
    Hotel.hasMany(models.SeoMeta, { foreignKey: 'hotelId', as: 'seoMetas', onDelete: 'CASCADE' });
    Hotel.hasMany(models.ApiKey, { foreignKey: 'hotelId', as: 'apiKeys', onDelete: 'CASCADE' });
    Hotel.hasMany(models.BlogPost, { foreignKey: 'hotelId', as: 'blogPosts', onDelete: 'CASCADE' });
  };

  return Hotel;
};
