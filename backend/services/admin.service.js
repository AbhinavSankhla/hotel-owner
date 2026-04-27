'use strict';

const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Hotel, RoomType, Room, RoomInventory, HourlySlot, Booking, User, SeoMeta, StaffPermission, sequelize } = require('../models');
const { createError } = require('../middlewares/errorHandler.middleware');
const { hashPassword } = require('../utils/bcrypt');
const hotelService = require('./hotel.service');

class AdminService {
  // ── Dashboard Stats ──────────────────────────────────────────────────────
  async getDashboardStats(hotelId) {
    const today = dayjs().format('YYYY-MM-DD');
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');

    const [
      totalBookings,
      monthBookings,
      todayCheckIns,
      todayCheckOuts,
      revenueResult,
      pendingBookings,
      recentBookings,
    ] = await Promise.all([
      Booking.count({ where: { hotelId } }),
      Booking.count({ where: { hotelId, createdAt: { [Op.between]: [monthStart, monthEnd] } } }),
      Booking.count({ where: { hotelId, checkInDate: today, status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN'] } } }),
      Booking.count({ where: { hotelId, checkOutDate: today, status: 'CHECKED_IN' } }),
      Booking.findAll({
        where: { hotelId, paymentStatus: 'PAID', createdAt: { [Op.between]: [monthStart, monthEnd] } },
        attributes: [[sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue']],
        raw: true,
      }),
      Booking.count({ where: { hotelId, status: 'PENDING' } }),
      Booking.findAll({
        where: { hotelId },
        include: [{ model: User, as: 'guest', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
    ]);

    // Occupancy rate for current month
    const allRoomTypes = await RoomType.findAll({ where: { hotelId, isActive: true } });
    const totalRoomNights = allRoomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0) * dayjs().daysInMonth();
    const bookedNights = await Booking.sum('numRooms', {
      where: {
        hotelId,
        bookingType: 'DAILY',
        status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        checkInDate: { [Op.lte]: monthEnd },
        checkOutDate: { [Op.gte]: monthStart },
      },
    });
    const occupancyRate = totalRoomNights > 0 ? Math.round((bookedNights / totalRoomNights) * 100) : 0;

    return {
      totalBookings,
      monthBookings,
      pendingBookings,
      todayCheckIns,
      todayCheckOuts,
      monthRevenue: parseFloat(revenueResult[0]?.revenue || 0),
      occupancyRate,
      recentBookings,
    };
  }

  // ── Update Hotel ─────────────────────────────────────────────────────────
  async updateHotel(hotelId, updates) {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) throw createError('Hotel not found', 404);

    await hotel.update(updates);
    await hotelService.invalidateCache(hotelId);
    return hotel;
  }

  // ── Room Types ───────────────────────────────────────────────────────────
  async createRoomType(hotelId, data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await RoomType.findOne({ where: { hotelId, slug } });
    if (existing) throw createError('Room type slug already exists', 409);

    const roomType = await RoomType.create({ ...data, hotelId, slug });
    return roomType;
  }

  async updateRoomType(roomTypeId, hotelId, updates) {
    const roomType = await RoomType.findOne({ where: { id: roomTypeId, hotelId } });
    if (!roomType) throw createError('Room type not found', 404);
    await roomType.update(updates);
    return roomType;
  }

  async deleteRoomType(roomTypeId, hotelId) {
    const roomType = await RoomType.findOne({ where: { id: roomTypeId, hotelId } });
    if (!roomType) throw createError('Room type not found', 404);

    const activeBookings = await Booking.count({
      where: { roomTypeId, status: { [Op.in]: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] } },
    });
    if (activeBookings > 0) throw createError('Cannot delete room type with active bookings', 400);

    await roomType.destroy();
    return { message: 'Room type deleted' };
  }

  // ── Inventory ────────────────────────────────────────────────────────────
  async updateSingleInventory(hotelId, { roomTypeId, date, availableCount, priceOverride, isClosed }) {
    const roomType = await RoomType.findOne({ where: { id: roomTypeId, hotelId } });
    if (!roomType) throw createError('Room type not found', 404);

    const [inv] = await RoomInventory.findOrCreate({
      where: { roomTypeId, date },
      defaults: { roomTypeId, date, availableCount: roomType.totalRooms },
    });

    const updates = {};
    if (availableCount !== undefined) updates.availableCount = availableCount;
    if (priceOverride !== undefined) updates.priceOverride = priceOverride;
    if (isClosed !== undefined) updates.isClosed = isClosed;

    await inv.update(updates);
    return inv;
  }

  async bulkUpdateInventory(hotelId, { roomTypeId, startDate, endDate, availableCount, priceOverride, isClosed, minStayNights }) {
    const roomType = await RoomType.findOne({ where: { id: roomTypeId, hotelId } });
    if (!roomType) throw createError('Room type not found', 404);

    const roomService = require('./room.service');
    const dates = roomService._getDateRange(startDate, endDate);
    const updates = [];

    for (const date of dates) {
      const [inv] = await RoomInventory.findOrCreate({
        where: { roomTypeId, date },
        defaults: { roomTypeId, date, availableCount: roomType.totalRooms },
      });

      const updateData = {};
      if (availableCount !== undefined) updateData.availableCount = availableCount;
      if (priceOverride !== undefined) updateData.priceOverride = priceOverride;
      if (isClosed !== undefined) updateData.isClosed = isClosed;
      if (minStayNights !== undefined) updateData.minStayNights = minStayNights;

      await inv.update(updateData);
      updates.push({ date, ...updateData });
    }

    return { updatedDates: updates.length, dates: updates };
  }

  // ── SEO ──────────────────────────────────────────────────────────────────
  async upsertSeoMeta(hotelId, data) {
    const [seo] = await SeoMeta.findOrCreate({
      where: { hotelId, pageSlug: data.pageSlug },
      defaults: { hotelId, ...data },
    });

    if (!seo.isNewRecord) {
      await seo.update(data);
    }

    return seo;
  }

  // ── Staff ─────────────────────────────────────────────────────────────────
  async createStaff(hotelId, { name, email, password, permissions = {} }) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw createError('Email already registered', 409);

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: 'HOTEL_STAFF',
      hotelId,
    });

    await StaffPermission.create({ userId: user.id, ...permissions });

    return this._getStaffWithPermissions(user.id);
  }

  async updateStaff(userId, hotelId, permissions) {
    const user = await User.findOne({ where: { id: userId, hotelId, role: 'HOTEL_STAFF' } });
    if (!user) throw createError('Staff member not found', 404);

    await StaffPermission.update(permissions, { where: { userId } });
    return this._getStaffWithPermissions(userId);
  }

  async deleteStaff(userId, hotelId) {
    const user = await User.findOne({ where: { id: userId, hotelId, role: 'HOTEL_STAFF' } });
    if (!user) throw createError('Staff member not found', 404);
    await user.destroy();
    return { message: 'Staff member removed' };
  }

  async getStaff(hotelId) {
    const staff = await User.findAll({
      where: { hotelId, role: 'HOTEL_STAFF', isActive: true },
      include: [{ model: StaffPermission, as: 'staffPermission' }],
      attributes: { exclude: ['password'] },
    });
    return staff;
  }

  async _getStaffWithPermissions(userId) {
    return User.findByPk(userId, {
      include: [{ model: StaffPermission, as: 'staffPermission' }],
      attributes: { exclude: ['password'] },
    });
  }

  // ── Booking Management (Admin) ────────────────────────────────────────────
  async listBookings(hotelId, { page = 1, limit = 20, status } = {}) {
    const where = { hotelId };
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        { model: User, as: 'guest', attributes: ['id', 'name', 'email', 'phone'] },
        { model: RoomType, as: 'roomType', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return { data: rows, total: count, pages: Math.ceil(count / parseInt(limit)), page: parseInt(page) };
  }

  async updateBookingStatusAdmin(bookingId, hotelId, status) {
    const booking = await Booking.findOne({ where: { id: bookingId, hotelId } });
    if (!booking) throw createError('Booking not found', 404);

    const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];
    if (!VALID_STATUSES.includes(status)) throw createError('Invalid status', 400);

    await booking.update({ status });
    return booking;
  }

  async listRoomTypes(hotelId) {
    return RoomType.findAll({ where: { hotelId }, order: [['createdAt', 'ASC']] });
  }
}

module.exports = new AdminService();
