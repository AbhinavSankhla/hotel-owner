'use strict';

const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { Booking, RoomType, sequelize } = require('../models');

class AnalyticsService {
  async getBookingTrends(hotelId, { year = dayjs().year(), months = 12 } = {}) {
    const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
    const endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');

    const bookings = await Booking.findAll({
      where: {
        hotelId,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
      ],
      group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    return bookings.map((row) => ({
      month: dayjs(row.month).format('YYYY-MM'),
      bookings: parseInt(row.count, 10),
      revenue: parseFloat(row.revenue || 0),
    }));
  }

  async getRevenueReport(hotelId, { startDate, endDate } = {}) {
    const start = startDate || dayjs().startOf('month').format('YYYY-MM-DD');
    const end = endDate || dayjs().endOf('month').format('YYYY-MM-DD');

    const result = await Booking.findAll({
      where: {
        hotelId,
        paymentStatus: 'PAID',
        createdAt: { [Op.between]: [start, end] },
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('roomTotal')), 'roomRevenue'],
        [sequelize.fn('SUM', sequelize.col('taxes')), 'totalTaxes'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'paidBookings'],
        [sequelize.fn('AVG', sequelize.col('totalAmount')), 'avgBookingValue'],
      ],
      raw: true,
    });

    return {
      period: { startDate: start, endDate: end },
      ...result[0],
      totalRevenue: parseFloat(result[0]?.totalRevenue || 0),
      roomRevenue: parseFloat(result[0]?.roomRevenue || 0),
      totalTaxes: parseFloat(result[0]?.totalTaxes || 0),
      paidBookings: parseInt(result[0]?.paidBookings || 0, 10),
      avgBookingValue: parseFloat(result[0]?.avgBookingValue || 0).toFixed(2),
    };
  }

  async getOccupancyMetrics(hotelId, { month } = {}) {
    const targetMonth = month || dayjs().format('YYYY-MM');
    const startDate = dayjs(`${targetMonth}-01`).format('YYYY-MM-DD');
    const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
    const daysInMonth = dayjs(startDate).daysInMonth();

    const roomTypes = await RoomType.findAll({ where: { hotelId, isActive: true } });
    const totalCapacity = roomTypes.reduce((sum, rt) => sum + rt.totalRooms * daysInMonth, 0);

    const bookedRoomNights = await Booking.sum('numRooms', {
      where: {
        hotelId,
        bookingType: 'DAILY',
        status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
        checkInDate: { [Op.lte]: endDate },
        checkOutDate: { [Op.gte]: startDate },
      },
    }) || 0;

    const occupancyRate = totalCapacity > 0
      ? parseFloat(((bookedRoomNights / totalCapacity) * 100).toFixed(1))
      : 0;

    const byRoomType = await Promise.all(
      roomTypes.map(async (rt) => {
        const booked = (await Booking.sum('numRooms', {
          where: {
            hotelId,
            roomTypeId: rt.id,
            bookingType: 'DAILY',
            status: { [Op.in]: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] },
            checkInDate: { [Op.lte]: endDate },
            checkOutDate: { [Op.gte]: startDate },
          },
        })) || 0;

        return {
          roomTypeId: rt.id,
          name: rt.name,
          totalRooms: rt.totalRooms,
          bookedNights: booked,
          capacityNights: rt.totalRooms * daysInMonth,
          occupancyRate: rt.totalRooms > 0
            ? parseFloat(((booked / (rt.totalRooms * daysInMonth)) * 100).toFixed(1))
            : 0,
        };
      })
    );

    return { month: targetMonth, occupancyRate, totalCapacity, bookedRoomNights, byRoomType };
  }

  async getBookingsBySource(hotelId) {
    const results = await Booking.findAll({
      where: { hotelId },
      attributes: ['source', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['source'],
      raw: true,
    });
    return results.map((r) => ({ source: r.source, count: parseInt(r.count, 10) }));
  }
}

module.exports = new AnalyticsService();
