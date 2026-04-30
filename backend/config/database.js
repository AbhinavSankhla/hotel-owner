'use strict';

const { Sequelize } = require('sequelize');
const { spawnSync } = require('child_process');
const { env } = require('./env');

const sharedDefine = {
  underscored: false,
  freezeTableName: false,
  timestamps: true,
};

// ── Sync TCP probe: check if PostgreSQL port is open ─────────────────────────
// Runs a child Node.js process (1.5s timeout) — executes synchronously so that
// models/index.js can destructure `sequelize` at load time with the right instance.
function isPgAvailable() {
  if (env.NODE_ENV === 'production') return true; // always real in production
  try {
    const result = spawnSync(
      process.execPath,
      ['-e', `
        const s=require('net').connect(${env.DB_PORT},'${env.DB_HOST}');
        s.on('connect',()=>process.exit(0));
        s.on('error',()=>process.exit(1));
        setTimeout(()=>process.exit(1),1500);
      `],
      { timeout: 2000, windowsHide: true }
    );
    return result.status === 0;
  } catch {
    return false;
  }
}

// ── Choose DB backend at load time ───────────────────────────────────────────
const pgAvailable = isPgAvailable();

let sequelize;
let usingMemDb = false;
let usingSqlite = false;

if (pgAvailable) {
  sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    pool: { max: 10, min: 0, acquire: 10000, idle: 5000 },
    define: sharedDefine,
  });
} else {
  // Try SQLite (persistent) first, fall back to pg-mem (ephemeral)
  let sqliteAvailable = false;
  try {
    require('sqlite3');
    sqliteAvailable = true;
  } catch { /* not installed */ }

  if (sqliteAvailable) {
    const path = require('path');
    const fs = require('fs');
    const { DataTypes } = require('sequelize');
    usingSqlite = true;
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const sqlitePath = path.join(dataDir, 'dev.sqlite');
    console.warn(`[DB] PostgreSQL not reachable — using SQLite (persistent) at ${sqlitePath}`);
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: sqlitePath,
      logging: false,
      define: sharedDefine,
    });
    // SQLite does not support PostgreSQL ARRAY type.
    // Override DataTypes.ARRAY to use JSON (stored as text) for dev compatibility.
    const _origArray = DataTypes.ARRAY;
    DataTypes.ARRAY = function patchedArray() { return DataTypes.JSON; };
    DataTypes.ARRAY.prototype = _origArray.prototype;
  } else {
    usingMemDb = true;
    console.warn('[DB] PostgreSQL not reachable — using pg-mem (in-memory) for development');
    console.warn('[DB] Install better-sqlite3 for persistent dev storage: npm install --save-dev better-sqlite3');
    const { newDb } = require('pg-mem');
    const { v4: uuidv4 } = require('uuid');
    const db = newDb();
    db.public.registerFunction({ name: 'gen_random_uuid', returns: 'text', implementation: uuidv4 });
    db.public.registerFunction({ name: 'uuid_generate_v4', returns: 'text', implementation: uuidv4 });
    const pgAdapter = db.adapters.createPg();
    sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
      dialect: 'postgres',
      dialectModule: pgAdapter,
      logging: false,
      define: sharedDefine,
    });
    // pg-mem does not support pg_catalog.pg_enum queries that Sequelize uses in
    // ensureEnums(). Override to CREATE TYPE directly (pg-mem supports this DDL).
    const { DataTypes } = require('sequelize');
    const qi = sequelize.dialect.queryInterface;
    qi.ensureEnums = async function (tableName, attributes) {
      const tblName = typeof tableName === 'string' ? tableName : tableName.tableName;
      for (const [key, attribute] of Object.entries(attributes)) {
        const type = attribute.type;
        const isEnum = type instanceof DataTypes.ENUM;
        const isArrayEnum = type instanceof DataTypes.ARRAY && type.type instanceof DataTypes.ENUM;
        if (!isEnum && !isArrayEnum) continue;
        const enumType = isArrayEnum ? type.type : type;
        const values = attribute.values || enumType.values || [];
        const fieldName = attribute.field || key;
        const typeName = `enum_${tblName}_${fieldName}`;
        const valsSql = values.map((v) => `'${v.replace(/'/g, "''")}'`).join(', ');
        try {
          await sequelize.query(`CREATE TYPE "${typeName}" AS ENUM (${valsSql});`);
        } catch (e) {
          if (!e.message.toLowerCase().includes('already exists') &&
              !e.message.toLowerCase().includes('duplicate')) {
            // Ignore — likely already exists
          }
        }
      }
    };
  }
}

// ── connectDatabase — called in bootstrap() ──────────────────────────────────
async function connectDatabase() {
  await sequelize.authenticate();

  if (usingMemDb) {
    console.log('[DB] pg-mem authenticated — syncing tables...');
    await sequelize.sync({ force: true });
    console.log('[DB] Tables created in pg-mem');
    await _seedDevDb();
  } else if (usingSqlite) {
    console.log('[DB] SQLite authenticated — syncing schema...');
    // alter:true adds new columns without dropping existing data
    await sequelize.sync({ alter: true });
    console.log('[DB] SQLite schema up-to-date');
    // Only seed if the Hotel table is empty
    const models = require('../models');
    const count = await models.Hotel.count().catch(() => 0);
    if (count === 0) {
      console.log('[DB] SQLite is empty — seeding demo data...');
      await _seedDevDb();
    } else {
      console.log(`[DB] SQLite has ${count} hotel record(s) — skipping seed`);
    }
  } else {
    console.log('[DB] PostgreSQL connected successfully');
  }
}

async function _seedDevDb() {
  try {
    const models = require('../models');
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const HOTEL_ID = env.HOTEL_ID || '11111111-1111-1111-1111-111111111111';

    // Use findOne + create instead of findOrCreate (pg-mem has no PL/pgSQL)
    const upsert = async (Model, where, defaults) => {
      const existing = await Model.findOne({ where });
      if (!existing) await Model.create({ ...where, ...defaults });
    };

    await upsert(models.Hotel, { id: HOTEL_ID }, {
      name: 'Grand Horizon Hotel',
      slug: 'grand-horizon-hotel',
      description: 'Grand Horizon Hotel is a premier luxury property nestled in the heart of Bangalore. Offering breathtaking city views, world-class dining, a rooftop infinity pool, and impeccable service — every stay is an unforgettable experience.',
      address: '42 MG Road, Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      phone: '+919876543210',
      email: 'info@grandhorizon.com',
      website: 'https://grandhorizonhotel.com',
      starRating: 5,
      coverImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&q=80',
      amenities: ['Free WiFi', 'Rooftop Pool', 'Spa & Wellness', 'Fine Dining', 'Fitness Center', 'Business Center', 'Conference Rooms', 'Valet Parking', 'Airport Transfer', '24h Room Service', 'Bar & Lounge', 'Kids Play Area'],
      bookingModel: 'DAILY',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      isActive: true,
      setupCompleted: true,
      template: 'LUXURY',
    });

    const [adminHash, guestHash, staffHash] = await Promise.all([
      bcrypt.hash('Admin@123', 12),
      bcrypt.hash('Guest@123', 12),
      bcrypt.hash('Staff@123', 12),
    ]);

    await upsert(models.User, { email: 'admin@grandhorizon.com' }, {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Hotel Admin', phone: '+911111111111', password: adminHash,
      role: 'HOTEL_ADMIN', hotelId: HOTEL_ID,
      isActive: true, emailVerified: true, phoneVerified: true,
    });

    await upsert(models.User, { email: 'guest@example.com' }, {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Rahul Sharma', phone: '+912222222222', password: guestHash,
      role: 'GUEST', hotelId: null,
      isActive: true, emailVerified: true, phoneVerified: true,
    });

    await upsert(models.User, { email: 'staff@grandhorizon.com' }, {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'Front Desk Staff', phone: '+913333333333', password: staffHash,
      role: 'HOTEL_STAFF', hotelId: HOTEL_ID,
      isActive: true, emailVerified: true, phoneVerified: true,
    });

    // ── Room Types ──────────────────────────────────────────────────────────
    const RT_DELUXE_ID   = '00000001-0000-4000-8000-000000000001';
    const RT_SUPERIOR_ID = '00000002-0000-4000-8000-000000000002';
    const RT_SUITE_ID    = '00000003-0000-4000-8000-000000000003';
    const RT_PRES_ID     = '00000004-0000-4000-8000-000000000004';

    await upsert(models.RoomType, { id: RT_DELUXE_ID }, {
      hotelId: HOTEL_ID,
      name: 'Deluxe Room',
      slug: 'deluxe-room',
      description: 'Elegant 32 sqm room with a plush king-size bed, city views, rain shower, and complimentary high-speed Wi-Fi. Perfect for business and leisure travelers.',
      basePriceDaily: 3500,
      basePriceHourly: 500,
      maxGuests: 2,
      maxExtraGuests: 1,
      extraGuestCharge: 700,
      totalRooms: 20,
      sortOrder: 1,
      amenities: ['King Bed', 'Free WiFi', 'AC', '55" Smart TV', 'Mini Fridge', 'Tea/Coffee Maker', 'Rain Shower', 'City View', 'Daily Housekeeping', 'Room Service'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
      ],
      isActive: true,
    });

    await upsert(models.RoomType, { id: RT_SUPERIOR_ID }, {
      hotelId: HOTEL_ID,
      name: 'Superior Room',
      slug: 'superior-room',
      description: 'Spacious 42 sqm Superior Room featuring a living area, work desk, premium bedding, and stunning panoramic city views. Ideal for extended stays.',
      basePriceDaily: 5500,
      basePriceHourly: 800,
      maxGuests: 2,
      maxExtraGuests: 2,
      extraGuestCharge: 900,
      totalRooms: 15,
      sortOrder: 2,
      amenities: ['King Bed', 'Free WiFi', 'AC', '65" Smart TV', 'Mini Bar', 'Sofa Area', 'Bathtub + Shower', 'City View', 'Welcome Drink', 'Daily Housekeeping', 'Room Service', 'Pillow Menu'],
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      ],
      isActive: true,
    });

    await upsert(models.RoomType, { id: RT_SUITE_ID }, {
      hotelId: HOTEL_ID,
      name: 'Executive Suite',
      slug: 'executive-suite',
      description: 'Our 75 sqm Executive Suite offers a separate bedroom and living room, private jacuzzi, walk-in wardrobe, and dedicated butler service. Experience true luxury.',
      basePriceDaily: 9500,
      basePriceHourly: 1500,
      maxGuests: 3,
      maxExtraGuests: 2,
      extraGuestCharge: 1200,
      totalRooms: 8,
      sortOrder: 3,
      amenities: ['Super King Bed', 'Free WiFi', 'AC', '75" Smart TV', 'Full Mini Bar', 'Jacuzzi', 'Separate Living Room', 'Balcony', 'Butler Service', 'Airport Transfer', 'Complimentary Breakfast', 'Evening Turndown', 'Luxury Toiletries'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      ],
      isActive: true,
    });

    await upsert(models.RoomType, { id: RT_PRES_ID }, {
      hotelId: HOTEL_ID,
      name: 'Presidential Suite',
      slug: 'presidential-suite',
      description: 'The crown jewel of Grand Horizon. Our 150 sqm Presidential Suite features two bedrooms, a private dining room, rooftop terrace, personal chef, and unparalleled panoramic views of Bangalore.',
      basePriceDaily: 22000,
      basePriceHourly: 3500,
      maxGuests: 4,
      maxExtraGuests: 2,
      extraGuestCharge: 2000,
      totalRooms: 2,
      sortOrder: 4,
      amenities: ['2 Bedrooms', 'Private Terrace', 'Private Pool', 'Personal Chef', 'Dedicated Butler', 'Luxury Spa Access', 'Private Dining Room', 'Home Theater', 'Free WiFi', 'Limousine Service', 'Complimentary All Meals', 'Premium Bar'],
      images: [
        'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      ],
      isActive: true,
    });

    // ── RoomInventory — seed next 60 days for all room types ────────────────
    if (models.RoomInventory) {
      const dayjs = require('dayjs');
      const rtInventory = [
        { id: RT_DELUXE_ID,   total: 20 },
        { id: RT_SUPERIOR_ID, total: 15 },
        { id: RT_SUITE_ID,    total: 8  },
        { id: RT_PRES_ID,     total: 2  },
      ];
      const today = dayjs();
      for (const rt of rtInventory) {
        for (let d = 0; d < 60; d++) {
          const date = today.add(d, 'day').format('YYYY-MM-DD');
          const existing = await models.RoomInventory.findOne({ where: { roomTypeId: rt.id, date } });
          if (!existing) {
            await models.RoomInventory.create({
              roomTypeId: rt.id,
              date,
              availableCount: rt.total,
              isClosed: false,
            });
          }
        }
      }
    }

    // ── Demo Reviews ────────────────────────────────────────────────────────
    // Note: Reviews require a valid bookingId so they are not seeded here.
    // Reviews will be created naturally through the booking flow.

    // ── Demo Blog Posts ─────────────────────────────────────────────────────
    if (models.BlogPost) {
      const ADMIN_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const posts = [
        {
          title: 'Top 5 Things to Do in Bangalore Near MG Road',
          slug: 'top-5-things-bangalore-mg-road',
          excerpt: 'Discover the best experiences just steps away from Grand Horizon Hotel — from bustling markets to fine dining.',
          content: '<p>Bangalore\'s MG Road is a vibrant hub of culture, shopping, and cuisine. Here are the top 5 activities for guests staying at Grand Horizon Hotel.</p><h2>1. Brigade Road Shopping</h2><p>Just a short walk away, Brigade Road offers everything from international brands to local boutiques.</p><h2>2. Cubbon Park</h2><p>A serene escape in the middle of the city, perfect for morning jogs or relaxing afternoons.</p><h2>3. UB City Mall</h2><p>Luxury shopping and fine dining all under one roof, just 10 minutes away.</p>',
          coverImageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
          isPublished: true,
          publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          tags: ['Bangalore', 'Travel', 'Sightseeing'],
        },
        {
          title: 'A Guide to Grand Horizon\'s Spa & Wellness Centre',
          slug: 'guide-to-grand-horizon-spa-wellness',
          excerpt: 'Our world-class spa offers over 30 treatments. Here\'s everything you need to know to plan your perfect wellness retreat.',
          content: '<p>The Grand Horizon Spa & Wellness Centre spans 2,000 sqft and offers a comprehensive range of treatments designed to rejuvenate mind, body, and spirit.</p><h2>Signature Treatments</h2><p>Our signature Himalayan Salt Stone Massage uses heated salt stones to deeply relax muscles and restore energy balance.</p><h2>Yoga & Meditation</h2><p>Daily morning yoga sessions are available for hotel guests free of charge.</p>',
          coverImageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
          isPublished: true,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          tags: ['Spa', 'Wellness', 'Relaxation'],
        },
        {
          title: 'Planning the Perfect Corporate Event at Grand Horizon',
          slug: 'corporate-event-planning-grand-horizon',
          excerpt: 'With 5 state-of-the-art conference halls and a dedicated events team, Grand Horizon is the ideal venue for your next corporate gathering.',
          content: '<p>Grand Horizon Hotel offers unmatched facilities for corporate events, product launches, and business conferences. Our events team ensures every detail is perfect.</p><h2>Conference Facilities</h2><p>Five fully-equipped conference halls with capacities ranging from 20 to 500 guests.</p>',
          coverImageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
          isPublished: true,
          publishedAt: new Date(),
          tags: ['Corporate', 'Events', 'Conferences'],
        },
      ];
      for (const post of posts) {
        const existing = await models.BlogPost.findOne({ where: { slug: post.slug } });
        if (!existing) {
          await models.BlogPost.create({ ...post, authorId: ADMIN_ID, hotelId: HOTEL_ID });
        }
      }
    }

    console.log('[DB] Demo data seeded — admin@grandhorizon.com / Admin@123 | guest@example.com / Guest@123');
  } catch (e) {
    console.warn('[DB] Seed warning:', e.message);
  }
}

module.exports = { sequelize, usingMemDb, usingSqlite, connectDatabase };


