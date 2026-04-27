'use strict';

const bcrypt = require('bcryptjs');

/** Fixed UUIDs so the seed is idempotent */
const HOTEL_ID  = '11111111-1111-1111-1111-111111111111';
const ADMIN_ID  = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const GUEST_ID  = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const DELUXE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const SUITE_ID  = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ── 1. Hotel ───────────────────────────────────────────────────────────
    await queryInterface.bulkInsert('Hotels', [{
      id:           HOTEL_ID,
      name:         'Grand Horizon Hotel',
      slug:         'grand-horizon-hotel',
      description:  'A luxury hotel in the heart of the city offering world-class amenities and impeccable service.',
      address:      '42 MG Road',
      city:         'Bangalore',
      state:        'Karnataka',
      country:      'India',
      pincode:      '560001',
      phone:        '+919876543210',
      email:        'info@grandhorizon.com',
      starRating:   4,
      bookingModel: 'DAILY',
      isActive:     true,
      createdAt:    now,
      updatedAt:    now,
    }], { ignoreDuplicates: true });

    // ── 2. Users ───────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin@123', 12);
    const guestHash = await bcrypt.hash('Guest@123', 12);

    await queryInterface.bulkInsert('Users', [
      {
        id:            ADMIN_ID,
        name:          'Hotel Admin',
        email:         'admin@grandhorizon.com',
        phone:         '+911111111111',
        password:      adminHash,
        role:          'HOTEL_ADMIN',
        hotelId:       HOTEL_ID,
        isActive:      true,
        emailVerified: true,
        phoneVerified: true,
        createdAt:     now,
        updatedAt:     now,
      },
      {
        id:            GUEST_ID,
        name:          'Test Guest',
        email:         'guest@example.com',
        phone:         '+912222222222',
        password:      guestHash,
        role:          'GUEST',
        hotelId:       null,
        isActive:      true,
        emailVerified: true,
        phoneVerified: false,
        createdAt:     now,
        updatedAt:     now,
      },
    ], { ignoreDuplicates: true });

    // ── 3. Room Types ──────────────────────────────────────────────────────
    await queryInterface.bulkInsert('RoomTypes', [
      {
        id:           DELUXE_ID,
        hotelId:      HOTEL_ID,
        name:         'Deluxe Room',
        slug:         'deluxe-room',
        description:  'Comfortable deluxe room with city view, king-size bed, and modern amenities.',
        basePrice:    2500,
        weekendPrice: 3000,
        maxGuests:    2,
        extraGuestCharge: 500,
        totalRooms:   10,
        amenities:    JSON.stringify(['Free WiFi', 'AC', 'TV', 'Room Service', 'Mini Bar']),
        isActive:     true,
        createdAt:    now,
        updatedAt:    now,
      },
      {
        id:           SUITE_ID,
        hotelId:      HOTEL_ID,
        name:         'Executive Suite',
        slug:         'executive-suite',
        description:  'Spacious executive suite with separate living area, king-size bed, and panoramic city views.',
        basePrice:    5500,
        weekendPrice: 6500,
        maxGuests:    3,
        extraGuestCharge: 800,
        totalRooms:   5,
        amenities:    JSON.stringify(['Free WiFi', 'AC', 'Smart TV', 'Jacuzzi', 'Butler Service', 'Lounge Access']),
        isActive:     true,
        createdAt:    now,
        updatedAt:    now,
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('RoomTypes', { hotelId: HOTEL_ID }, {});
    await queryInterface.bulkDelete('Users', { id: [ADMIN_ID, GUEST_ID] }, {});
    await queryInterface.bulkDelete('Hotels', { id: HOTEL_ID }, {});
  },
};
