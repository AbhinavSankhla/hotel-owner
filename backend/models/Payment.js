'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Bookings', key: 'id' },
      },
      gateway: {
        type: DataTypes.ENUM('RAZORPAY', 'CASH', 'DEMO'),
        allowNull: false,
      },
      gatewayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gatewayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
      },
      status: {
        type: DataTypes.ENUM('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'),
        defaultValue: 'CREATED',
      },
      refundAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      refundId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: 'Payments',
      timestamps: true,
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
  };

  return Payment;
};
