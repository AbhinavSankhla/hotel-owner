'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define(
    'Review',
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
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'Bookings', key: 'id' },
      },
      guestId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      photos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      hotelReply: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'Reviews',
      timestamps: true,
      indexes: [
        { fields: ['hotelId', 'isPublished'] },
      ],
    }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    Review.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
    Review.belongsTo(models.User, { foreignKey: 'guestId', as: 'guest' });
  };

  return Review;
};
