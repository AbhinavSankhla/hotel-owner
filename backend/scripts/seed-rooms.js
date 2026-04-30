'use strict';
// One-shot script to seed RoomTypes into the existing SQLite dev database.
// Run: node scripts/seed-rooms.js
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const sqlitePath = path.resolve(__dirname, '../data/dev.sqlite');

if (!fs.existsSync(sqlitePath)) {
  console.error('SQLite database not found at', sqlitePath);
  console.error('Start the backend server once first so it creates the schema.');
  process.exit(1);
}

const HOTEL_ID = '11111111-1111-1111-1111-111111111111';

const ROOM_TYPES = [
  {
    id: '00000001-0000-4000-8000-000000000001',
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
    amenities: JSON.stringify(['King Bed', 'Free WiFi', 'AC', '55" Smart TV', 'Mini Fridge', 'Tea/Coffee Maker', 'Rain Shower', 'City View', 'Daily Housekeeping', 'Room Service']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    ]),
  },
  {
    id: '00000002-0000-4000-8000-000000000002',
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
    amenities: JSON.stringify(['King Bed', 'Free WiFi', 'AC', '65" Smart TV', 'Mini Bar', 'Sofa Area', 'Bathtub + Shower', 'City View', 'Welcome Drink', 'Daily Housekeeping', 'Room Service']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ]),
  },
  {
    id: '00000003-0000-4000-8000-000000000003',
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
    amenities: JSON.stringify(['Super King Bed', 'Free WiFi', 'AC', '75" Smart TV', 'Full Mini Bar', 'Jacuzzi', 'Separate Living Room', 'Balcony', 'Butler Service', 'Airport Transfer', 'Complimentary Breakfast']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
    ]),
  },
  {
    id: '00000004-0000-4000-8000-000000000004',
    name: 'Presidential Suite',
    slug: 'presidential-suite',
    description: 'The crown jewel of Grand Horizon. Our 150 sqm Presidential Suite features two bedrooms, a private dining room, rooftop terrace, personal chef, and unparalleled panoramic views.',
    basePriceDaily: 22000,
    basePriceHourly: 3500,
    maxGuests: 4,
    maxExtraGuests: 2,
    extraGuestCharge: 2000,
    totalRooms: 2,
    sortOrder: 4,
    amenities: JSON.stringify(['2 Bedrooms', 'Private Terrace', 'Private Pool', 'Personal Chef', 'Dedicated Butler', 'Luxury Spa Access', 'Private Dining Room', 'Home Theater', 'Limousine Service', 'Complimentary All Meals']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    ]),
  },
];

async function run() {
  const db = new Database(sqlitePath);
  console.log('Connected to SQLite:', sqlitePath);

  // Ensure RoomTypes table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='RoomTypes'").all();
  if (tables.length === 0) {
    console.error('RoomTypes table does not exist. Start the backend server once first to create the schema, then run this script.');
    db.close();
    process.exit(1);
  }

  const now = new Date().toISOString();
  let inserted = 0;
  let skipped = 0;

  const insertStmt = db.prepare(
    `INSERT OR IGNORE INTO RoomTypes
      (id, hotelId, name, slug, description, basePriceDaily, basePriceHourly,
       maxGuests, maxExtraGuests, extraGuestCharge, totalRooms, sortOrder,
       amenities, images, isActive, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`
  );

  for (const rt of ROOM_TYPES) {
    const exists = db.prepare('SELECT id FROM RoomTypes WHERE id = ?').get(rt.id);
    if (exists) {
      console.log(`  skip  ${rt.name} (already exists)`);
      skipped++;
      continue;
    }
    insertStmt.run(
      rt.id, HOTEL_ID, rt.name, rt.slug, rt.description,
      rt.basePriceDaily, rt.basePriceHourly,
      rt.maxGuests, rt.maxExtraGuests, rt.extraGuestCharge,
      rt.totalRooms, rt.sortOrder,
      rt.amenities, rt.images,
      now, now
    );
    console.log(`  added ${rt.name}`);
    inserted++;
  }

  const { c } = db.prepare('SELECT COUNT(*) as c FROM RoomTypes').get();
  console.log(`\nDone — inserted: ${inserted}, skipped: ${skipped}, total RoomTypes: ${c}`);
  db.close();
}

run().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
