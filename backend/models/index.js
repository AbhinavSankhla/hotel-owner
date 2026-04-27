'use strict';

const { sequelize } = require('../config/database');

// ── Import all models ────────────────────────────────────────────────────────
const Hotel = require('./Hotel')(sequelize);
const User = require('./User')(sequelize);
const RoomType = require('./RoomType')(sequelize);
const Room = require('./Room')(sequelize);
const RoomInventory = require('./RoomInventory')(sequelize);
const HourlySlot = require('./HourlySlot')(sequelize);
const Booking = require('./Booking')(sequelize);
const Payment = require('./Payment')(sequelize);
const Review = require('./Review')(sequelize);
const StaffPermission = require('./StaffPermission')(sequelize);
const SeoMeta = require('./SeoMeta')(sequelize);
const Media = require('./Media')(sequelize);
const BlogPost = require('./BlogPost')(sequelize);
const ApiKey = require('./ApiKey')(sequelize);

// ── Collect all models ───────────────────────────────────────────────────────
const models = {
  Hotel,
  User,
  RoomType,
  Room,
  RoomInventory,
  HourlySlot,
  Booking,
  Payment,
  Review,
  StaffPermission,
  SeoMeta,
  Media,
  BlogPost,
  ApiKey,
};

// ── Run associations ─────────────────────────────────────────────────────────
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
