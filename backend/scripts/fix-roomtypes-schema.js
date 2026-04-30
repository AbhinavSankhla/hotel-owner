'use strict';
// Migration: fix RoomTypes unique constraint corruption + seed all room types
// Run: node scripts/fix-roomtypes-schema.js
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const sqlitePath = path.resolve(__dirname, '../data/dev.sqlite');
if (!fs.existsSync(sqlitePath)) {
  console.error('SQLite database not found at', sqlitePath);
  process.exit(1);
}

const HOTEL_ID = '11111111-1111-1111-1111-111111111111';

const ROOM_TYPES = [
  {
    id: '00000001-0000-4000-8000-000000000001',
    name: 'Deluxe Room', slug: 'deluxe-room',
    description: 'Elegant 32 sqm room with a plush king-size bed, city views, rain shower, and complimentary high-speed Wi-Fi.',
    basePriceDaily: 3500, basePriceHourly: 500, maxGuests: 2, maxExtraGuests: 1, extraGuestCharge: 700, totalRooms: 20, sortOrder: 1,
    amenities: '["King Bed","Free WiFi","AC","55\\" Smart TV","Mini Fridge","Tea/Coffee Maker","Rain Shower","City View","Daily Housekeeping","Room Service"]',
    images: '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80"]',
  },
  {
    id: '00000002-0000-4000-8000-000000000002',
    name: 'Superior Room', slug: 'superior-room',
    description: 'Spacious 42 sqm Superior Room featuring a living area, work desk, premium bedding, and stunning panoramic city views.',
    basePriceDaily: 5500, basePriceHourly: 800, maxGuests: 2, maxExtraGuests: 2, extraGuestCharge: 900, totalRooms: 15, sortOrder: 2,
    amenities: '["King Bed","Free WiFi","AC","65\\" Smart TV","Mini Bar","Sofa Area","Bathtub + Shower","City View","Welcome Drink","Daily Housekeeping","Room Service"]',
    images: '["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80","https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"]',
  },
  {
    id: '00000003-0000-4000-8000-000000000003',
    name: 'Executive Suite', slug: 'executive-suite',
    description: 'Our 75 sqm Executive Suite offers a separate bedroom and living room, private jacuzzi, walk-in wardrobe, and dedicated butler service.',
    basePriceDaily: 9500, basePriceHourly: 1500, maxGuests: 3, maxExtraGuests: 2, extraGuestCharge: 1200, totalRooms: 8, sortOrder: 3,
    amenities: '["Super King Bed","Free WiFi","AC","75\\" Smart TV","Full Mini Bar","Jacuzzi","Separate Living Room","Balcony","Butler Service","Airport Transfer","Complimentary Breakfast"]',
    images: '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80","https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"]',
  },
  {
    id: '00000004-0000-4000-8000-000000000004',
    name: 'Presidential Suite', slug: 'presidential-suite',
    description: 'The crown jewel of Grand Horizon. Our 150 sqm Presidential Suite features two bedrooms, a private dining room, rooftop terrace, personal chef, and unparalleled panoramic views.',
    basePriceDaily: 22000, basePriceHourly: 3500, maxGuests: 4, maxExtraGuests: 2, extraGuestCharge: 2000, totalRooms: 2, sortOrder: 4,
    amenities: '["2 Bedrooms","Private Terrace","Private Pool","Personal Chef","Dedicated Butler","Luxury Spa Access","Private Dining Room","Home Theater","Limousine Service","Complimentary All Meals"]',
    images: '["https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80","https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80"]',
  },
];

const db = new Database(sqlitePath);
const now = new Date().toISOString();

console.log('Connected:', sqlitePath);

db.transaction(() => {
  // 1. Save existing rows
  const existing = db.prepare('SELECT * FROM RoomTypes').all();
  console.log(`Backing up ${existing.length} existing row(s)...`);

  // 2. Drop old (corrupted) table
  db.prepare('DROP TABLE IF EXISTS RoomTypes_old').run();
  db.prepare('ALTER TABLE RoomTypes RENAME TO RoomTypes_old').run();
  console.log('Renamed RoomTypes → RoomTypes_old');

  // 3. Create correct table (only composite unique on hotelId+slug)
  db.prepare(`
    CREATE TABLE RoomTypes (
      id TEXT PRIMARY KEY,
      hotelId TEXT NOT NULL REFERENCES Hotels(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      basePriceDaily REAL NOT NULL DEFAULT 0,
      basePriceHourly REAL,
      maxGuests INTEGER DEFAULT 2,
      maxExtraGuests INTEGER DEFAULT 0,
      extraGuestCharge REAL DEFAULT 0,
      totalRooms INTEGER DEFAULT 1,
      amenities TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      bookingModelOverride TEXT,
      minHours INTEGER,
      maxHours INTEGER,
      isActive INTEGER DEFAULT 1,
      sortOrder INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(hotelId, slug)
    )
  `).run();
  console.log('Created RoomTypes with correct schema');

  // 4. Restore backed-up rows (preserve existing bookings, etc.)
  if (existing.length > 0) {
    const insertOld = db.prepare(
      `INSERT OR IGNORE INTO RoomTypes
        (id,hotelId,name,slug,description,basePriceDaily,basePriceHourly,maxGuests,maxExtraGuests,extraGuestCharge,totalRooms,amenities,images,bookingModelOverride,minHours,maxHours,isActive,sortOrder,createdAt,updatedAt)
       VALUES
        (@id,@hotelId,@name,@slug,@description,@basePriceDaily,@basePriceHourly,@maxGuests,@maxExtraGuests,@extraGuestCharge,@totalRooms,@amenities,@images,@bookingModelOverride,@minHours,@maxHours,@isActive,@sortOrder,@createdAt,@updatedAt)`
    );
    for (const row of existing) {
      insertOld.run(row);
      console.log(`  restored  ${row.name}`);
    }
  }

  // 5. Insert missing seed room types
  const insert = db.prepare(
    `INSERT OR IGNORE INTO RoomTypes
      (id,hotelId,name,slug,description,basePriceDaily,basePriceHourly,maxGuests,maxExtraGuests,extraGuestCharge,totalRooms,amenities,images,isActive,sortOrder,createdAt,updatedAt)
     VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?)`
  );
  let added = 0;
  for (const rt of ROOM_TYPES) {
    const exists = db.prepare('SELECT id FROM RoomTypes WHERE id = ?').get(rt.id);
    if (exists) { console.log(`  skip  ${rt.name}`); continue; }
    insert.run(rt.id, HOTEL_ID, rt.name, rt.slug, rt.description, rt.basePriceDaily, rt.basePriceHourly, rt.maxGuests, rt.maxExtraGuests, rt.extraGuestCharge, rt.totalRooms, rt.amenities, rt.images, rt.sortOrder, now, now);
    console.log(`  added ${rt.name}`);
    added++;
  }

  // 6. Drop old table
  db.prepare('DROP TABLE RoomTypes_old').run();

  const { c } = db.prepare('SELECT COUNT(*) as c FROM RoomTypes').get();
  console.log(`\nMigration complete — added: ${added}, total RoomTypes: ${c}`);
})();

db.close();
