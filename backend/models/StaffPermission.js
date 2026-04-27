'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaffPermission = sequelize.define(
    'StaffPermission',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'Users', key: 'id' },
      },
      canManageBookings: { type: DataTypes.BOOLEAN, defaultValue: true },
      canManageRooms: { type: DataTypes.BOOLEAN, defaultValue: false },
      canManagePricing: { type: DataTypes.BOOLEAN, defaultValue: false },
      canManageReviews: { type: DataTypes.BOOLEAN, defaultValue: false },
      canManageContent: { type: DataTypes.BOOLEAN, defaultValue: false },
      canViewAnalytics: { type: DataTypes.BOOLEAN, defaultValue: false },
      canManageStaff: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: 'StaffPermissions',
      timestamps: true,
    }
  );

  StaffPermission.associate = (models) => {
    StaffPermission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return StaffPermission;
};
