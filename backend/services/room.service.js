'use strict';

const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { RoomType, Room, RoomInventory, HourlySlot, Hotel } = require('../models');
const { redis } = require('../config/redis');
const { createError } = require('../middlewares/errorHandler.middleware');

const AVAILABILITY_CACHE_TTL = 60; // 1 minute

class RoomService {
  async getRoomTypes(hotelId, filters = {}) {
    const where = { hotelId, isActive: true };
    if (filters.bookingModel) {
      where[Op.or] = [
        { bookingModelOverride: filters.bookingModel },
        { bookingModelOverride: 'BOTH' },
        { bookingModelOverride: null },
      ];
    }

    const roomTypes = await RoomType.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return roomTypes;
  }

  async getRoomTypeById(id) {
    const roomType = await RoomType.findOne({
      where: { id, isActive: true },
      include: [{ model: Hotel, as: 'hotel', attributes: ['id', 'name', 'slug', 'bookingModel'] }],
    });
    if (!roomType) throw createError('Room type not found', 404);
    return roomType;
  }

  // ── Check daily availability ─────────────────────────────────────────────
  async checkDailyAvailability({ roomTypeId, checkInDate, checkOutDate, numRooms = 1 }) {
    const cacheKey = `avail:daily:${roomTypeId}:${checkInDate}:${checkOutDate}:${numRooms}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) throw createError('Room type not found', 404);

    const dates = this._getDateRange(checkInDate, checkOutDate);
    const nights = dates.length;

    // Fetch or create inventory records for each date
    const inventory = await RoomInventory.findAll({
      where: { roomTypeId, date: { [Op.between]: [checkInDate, checkOutDate] } },
    });

    const inventoryMap = {};
    inventory.forEach((inv) => { inventoryMap[inv.date] = inv; });

    // Check availability for each date
    let minAvailable = roomType.totalRooms;
    const dailyPrices = [];
    let isClosed = false;

    for (const date of dates) {
      const inv = inventoryMap[date];
      if (inv) {
        if (inv.isClosed) { isClosed = true; break; }
        minAvailable = Math.min(minAvailable, inv.availableCount);
        dailyPrices.push({ date, price: inv.priceOverride || roomType.basePriceDaily });
      } else {
        // No override — use base availability
        dailyPrices.push({ date, price: roomType.basePriceDaily });
      }
    }

    const isAvailable = !isClosed && minAvailable >= numRooms;
    const pricePerNight = this._getEffectivePrice(dailyPrices, roomType.basePriceDaily);
    const subtotal = pricePerNight * nights * numRooms;

    // Fetch hotel gstRate for tax breakdown
    const hotel = await Hotel.findByPk(roomType.hotelId, { attributes: ['gstRate'] }).catch(() => null);
    const taxRate = hotel?.gstRate ?? 0.12;
    const taxAmount = Math.round(subtotal * taxRate);
    const totalPrice = subtotal + taxAmount;

    const result = {
      isAvailable,
      availableRooms: minAvailable,
      nights,
      pricePerNight,
      subtotal,
      taxRate,
      taxAmount,
      totalPrice,
      currency: 'INR',
      dailyPrices,
      isClosed,
    };

    await redis.set(cacheKey, JSON.stringify(result), 'EX', AVAILABILITY_CACHE_TTL).catch(() => {});
    return result;
  }

  // ── Check hourly availability ────────────────────────────────────────────
  async checkHourlyAvailability({ roomTypeId, date, numHours = 1, numRooms = 1 }) {
    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) throw createError('Room type not found', 404);

    const slots = await HourlySlot.findAll({
      where: { roomTypeId, date, isClosed: false },
      order: [['slotStart', 'ASC']],
    });

    const availableSlots = slots
      .filter((s) => s.availableCount >= numRooms)
      .map((s) => ({
        slotStart: s.slotStart,
        slotEnd: s.slotEnd,
        availableCount: s.availableCount,
        price: s.priceOverride || roomType.basePriceHourly,
      }));

    return {
      date,
      availableSlots,
      currency: 'INR',
      basePriceHourly: roomType.basePriceHourly,
    };
  }

  // ── Inventory calendar (admin) ───────────────────────────────────────────
  async getInventoryCalendar(roomTypeId, startDate, endDate) {
    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) throw createError('Room type not found', 404);

    const inventory = await RoomInventory.findAll({
      where: { roomTypeId, date: { [Op.between]: [startDate, endDate] } },
      order: [['date', 'ASC']],
    });

    const inventoryMap = {};
    inventory.forEach((inv) => { inventoryMap[inv.date] = inv; });

    // Fill all dates in range with defaults
    const dates = this._getDateRange(startDate, endDate);
    const calendar = dates.map((date) => {
      const inv = inventoryMap[date];
      return {
        date,
        availableCount: inv ? inv.availableCount : roomType.totalRooms,
        priceOverride: inv ? inv.priceOverride : null,
        effectivePrice: inv?.priceOverride || roomType.basePriceDaily,
        isClosed: inv ? inv.isClosed : false,
        minStayNights: inv ? inv.minStayNights : 1,
      };
    });

    return { roomType, calendar };
  }

  // ── Get or create inventory record ──────────────────────────────────────
  async getOrCreateInventory(roomTypeId, date, roomType) {
    const [inv] = await RoomInventory.findOrCreate({
      where: { roomTypeId, date },
      defaults: {
        roomTypeId,
        date,
        availableCount: roomType.totalRooms,
        isClosed: false,
      },
    });
    return inv;
  }

  // ── Decrement availability ───────────────────────────────────────────────
  async decrementAvailability(roomTypeId, dates, numRooms) {
    for (const date of dates) {
      await RoomInventory.decrement('availableCount', {
        by: numRooms,
        where: { roomTypeId, date },
      });
    }
  }

  // ── Restore availability (on cancel) ────────────────────────────────────
  async restoreAvailability(roomTypeId, dates, numRooms) {
    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) return;

    for (const date of dates) {
      await RoomInventory.increment('availableCount', {
        by: numRooms,
        where: {
          roomTypeId,
          date,
          availableCount: { [Op.lt]: roomType.totalRooms },
        },
      });
    }
  }

  _getDateRange(startDate, endDate) {
    const dates = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    while (current.isBefore(end)) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }
    return dates;
  }

  _getEffectivePrice(dailyPrices, basePrice) {
    if (!dailyPrices.length) return basePrice;
    const sum = dailyPrices.reduce((acc, dp) => acc + dp.price, 0);
    return Math.round(sum / dailyPrices.length);
  }
}

module.exports = new RoomService();
