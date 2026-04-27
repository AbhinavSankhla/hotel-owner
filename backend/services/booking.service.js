'use strict';

const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Booking, User, RoomType, Room, Hotel, Payment } = require('../models');
const roomService = require('./room.service');
const { redis } = require('../config/redis');
const { acquireLock, releaseLock } = require('../utils/redisLock');
const { generate: generateBookingNumber } = require('../utils/bookingNumber');
const { createError } = require('../middlewares/errorHandler.middleware');
const { paginate } = require('../utils/pagination');

const TAX_RATE = 0.12; // 12% GST

class BookingService {
  // ── Create Daily Booking ────────────────────────────────────────────────
  async createDailyBooking(input, userId) {
    const { hotelId, roomTypeId, checkInDate, checkOutDate, numRooms = 1, numGuests = 1, numExtraGuests = 0, guestName, guestEmail, guestPhone, specialRequests } = input;

    const lockKey = `booking_lock:${hotelId}:${roomTypeId}`;
    const lockValue = await acquireLock(redis, lockKey);
    if (!lockValue) throw createError('Room is currently being booked — please try again', 409);

    try {
      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) throw createError('Room type not found', 404);

      const dates = roomService._getDateRange(checkInDate, checkOutDate);
      const nights = dates.length;
      if (nights < 1) throw createError('Check-out must be after check-in', 400);

      // Check availability
      const availability = await roomService.checkDailyAvailability({ roomTypeId, checkInDate, checkOutDate, numRooms });
      if (!availability.isAvailable) throw createError('Rooms not available for selected dates', 409);

      const pricing = this._calculateDailyTotal(roomType, nights, numRooms, numExtraGuests, availability.pricePerNight);

      const booking = await Booking.create({
        bookingNumber: generateBookingNumber(),
        hotelId,
        guestId: userId,
        roomTypeId,
        bookingType: 'DAILY',
        checkInDate,
        checkOutDate,
        numRooms,
        numGuests,
        numExtraGuests,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        ...pricing,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      });

      // Decrement inventory
      await roomService.decrementAvailability(roomTypeId, dates, numRooms);

      return this._getBookingById(booking.id);
    } finally {
      await releaseLock(redis, lockKey, lockValue);
    }
  }

  // ── Create Hourly Booking ────────────────────────────────────────────────
  async createHourlyBooking(input, userId) {
    const { hotelId, roomTypeId, date, slotStart, numHours, numRooms = 1, numGuests = 1, guestName, guestEmail, guestPhone, specialRequests } = input;

    const lockKey = `booking_lock:hourly:${hotelId}:${roomTypeId}:${date}:${slotStart}`;
    const lockValue = await acquireLock(redis, lockKey);
    if (!lockValue) throw createError('Slot is being booked — please try again', 409);

    try {
      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) throw createError('Room type not found', 404);

      const slotEndTime = dayjs(`${date} ${slotStart}`).add(numHours, 'hour').format('HH:mm');
      const pricePerHour = roomType.basePriceHourly || 0;
      const roomTotal = pricePerHour * numHours * numRooms;
      const taxes = Math.round(roomTotal * TAX_RATE);
      const totalAmount = roomTotal + taxes;

      const booking = await Booking.create({
        bookingNumber: generateBookingNumber(),
        hotelId,
        guestId: userId,
        roomTypeId,
        bookingType: 'HOURLY',
        checkInTime: `${date}T${slotStart}:00`,
        checkOutTime: `${date}T${slotEndTime}:00`,
        numHours,
        numRooms,
        numGuests,
        numExtraGuests: 0,
        guestName,
        guestEmail,
        guestPhone,
        specialRequests,
        roomTotal,
        extraGuestTotal: 0,
        taxes,
        discountAmount: 0,
        totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      });

      return this._getBookingById(booking.id);
    } finally {
      await releaseLock(redis, lockKey, lockValue);
    }
  }

  // ── Get booking ─────────────────────────────────────────────────────────
  async getById(id, userId = null) {
    const booking = await this._getBookingById(id);
    if (!booking) throw createError('Booking not found', 404);

    // Guests can only see their own bookings
    if (userId && booking.guestId !== userId) {
      const user = await User.findByPk(userId);
      if (!user || !['HOTEL_ADMIN', 'HOTEL_STAFF'].includes(user.role)) {
        throw createError('Access denied', 403);
      }
    }

    return booking;
  }

  async getByNumber(bookingNumber, userId = null) {
    const booking = await Booking.findOne({
      where: { bookingNumber },
      include: this._getBookingIncludes(),
    });
    if (!booking) throw createError('Booking not found', 404);
    return booking;
  }

  // ── List bookings (admin/staff) ──────────────────────────────────────────
  async list(filters = {}, { page = 1, limit = 20 } = {}, hotelId = null) {
    const where = {};
    if (hotelId) where.hotelId = hotelId;
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.bookingType) where.bookingType = filters.bookingType;
    if (filters.guestName) where.guestName = { [Op.iLike]: `%${filters.guestName}%` };
    if (filters.checkInDate) where.checkInDate = { [Op.gte]: filters.checkInDate };
    if (filters.checkOutDate) where.checkOutDate = { [Op.lte]: filters.checkOutDate };
    if (filters.search) {
      where[Op.or] = [
        { bookingNumber: { [Op.iLike]: `%${filters.search}%` } },
        { guestName: { [Op.iLike]: `%${filters.search}%` } },
        { guestEmail: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return paginate(
      Booking,
      {
        where,
        include: this._getBookingIncludes(true),
        order: [['createdAt', 'DESC']],
      },
      page,
      limit
    );
  }

  // ── Cancel Booking ───────────────────────────────────────────────────────
  async cancel(bookingId, userId, { reason } = {}) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw createError('Booking not found', 404);

    // Only guest who made the booking or hotel staff can cancel
    if (booking.guestId !== userId) {
      const user = await User.findByPk(userId);
      if (!user || !['HOTEL_ADMIN', 'HOTEL_STAFF'].includes(user.role)) {
        throw createError('Access denied', 403);
      }
    }

    if (['CANCELLED', 'CHECKED_OUT'].includes(booking.status)) {
      throw createError(`Cannot cancel a booking with status: ${booking.status}`, 400);
    }

    await booking.update({
      status: 'CANCELLED',
      cancellationReason: reason || null,
      cancelledAt: new Date(),
    });

    // Restore inventory
    if (booking.bookingType === 'DAILY' && booking.checkInDate && booking.checkOutDate) {
      const dates = roomService._getDateRange(booking.checkInDate, booking.checkOutDate);
      await roomService.restoreAvailability(booking.roomTypeId, dates, booking.numRooms);
    }

    return this._getBookingById(bookingId);
  }

  // ── Update Status (admin/staff) ──────────────────────────────────────────
  async updateStatus(bookingId, { status }, staffUserId) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw createError('Booking not found', 404);

    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
      CHECKED_IN: ['CHECKED_OUT'],
      CHECKED_OUT: [],
      CANCELLED: [],
      NO_SHOW: [],
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw createError(`Cannot transition from ${booking.status} to ${status}`, 400);
    }

    await booking.update({ status });
    return this._getBookingById(bookingId);
  }

  // ── Modify Booking ───────────────────────────────────────────────────────
  async modify(bookingId, updates, userId) {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: RoomType, as: 'roomType' }],
    });
    if (!booking) throw createError('Booking not found', 404);

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw createError('Can only modify pending or confirmed bookings', 400);
    }

    const allowedFields = ['checkInDate', 'checkOutDate', 'numRooms', 'numGuests', 'numExtraGuests', 'specialRequests'];
    const updateData = {};
    allowedFields.forEach((f) => { if (updates[f] !== undefined) updateData[f] = updates[f]; });

    // Recalculate pricing if dates/rooms changed
    if (updateData.checkInDate || updateData.checkOutDate || updateData.numRooms) {
      const checkIn = updateData.checkInDate || booking.checkInDate;
      const checkOut = updateData.checkOutDate || booking.checkOutDate;
      const rooms = updateData.numRooms || booking.numRooms;
      const extraGuests = updateData.numExtraGuests ?? booking.numExtraGuests;
      const nights = roomService._getDateRange(checkIn, checkOut).length;
      const pricing = this._calculateDailyTotal(booking.roomType, nights, rooms, extraGuests, booking.roomType.basePriceDaily);
      Object.assign(updateData, pricing);
    }

    await booking.update(updateData);
    return this._getBookingById(bookingId);
  }

  // ── Private helpers ──────────────────────────────────────────────────────
  _calculateDailyTotal(roomType, nights, numRooms, numExtraGuests, pricePerNight) {
    const roomTotal = pricePerNight * nights * numRooms;
    const extraGuestTotal = (roomType.extraGuestCharge || 0) * numExtraGuests * nights;
    const subtotal = roomTotal + extraGuestTotal;
    const taxes = Math.round(subtotal * TAX_RATE);
    const totalAmount = subtotal + taxes;
    return { roomTotal, extraGuestTotal, taxes, discountAmount: 0, totalAmount };
  }

  async _getBookingById(id) {
    return Booking.findByPk(id, { include: this._getBookingIncludes() });
  }

  _getBookingIncludes(minimal = false) {
    if (minimal) {
      return [
        { model: User, as: 'guest', attributes: ['id', 'name', 'email', 'phone'] },
        { model: RoomType, as: 'roomType', attributes: ['id', 'name', 'images'] },
      ];
    }
    return [
      { model: Hotel, as: 'hotel', attributes: ['id', 'name', 'slug', 'phone', 'email'] },
      { model: User, as: 'guest', attributes: ['id', 'name', 'email', 'phone', 'avatarUrl'] },
      { model: RoomType, as: 'roomType' },
      { model: Room, as: 'assignedRoom', required: false },
      { model: Payment, as: 'payments' },
    ];
  }
}

module.exports = new BookingService();
