'use strict';

const { Parser } = require('json2csv');
const dayjs = require('dayjs');
const { Booking, User, RoomType, Hotel, Payment } = require('../models');
const { createError } = require('../middlewares/errorHandler.middleware');

class ExportService {
  async exportBookings(hotelId, { startDate, endDate, format = 'csv' } = {}) {
    const where = { hotelId };
    if (startDate) where.checkInDate = { $gte: startDate };
    if (endDate) where.checkOutDate = { $lte: endDate };

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: 'guest', attributes: ['name', 'email', 'phone'] },
        { model: RoomType, as: 'roomType', attributes: ['name'] },
      ],
      order: [['createdAt', 'DESC']],
      raw: false,
    });

    const rows = bookings.map((b) => ({
      bookingNumber: b.bookingNumber,
      guestName: b.guestName || b.guest?.name || '',
      guestEmail: b.guestEmail || b.guest?.email || '',
      guestPhone: b.guestPhone || b.guest?.phone || '',
      roomType: b.roomType?.name || '',
      bookingType: b.bookingType,
      checkInDate: b.checkInDate || b.checkInTime?.slice(0, 10),
      checkOutDate: b.checkOutDate || b.checkOutTime?.slice(0, 10),
      numRooms: b.numRooms,
      numGuests: b.numGuests,
      totalAmount: b.totalAmount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: dayjs(b.createdAt).format('YYYY-MM-DD HH:mm'),
    }));

    if (format === 'csv') {
      const fields = Object.keys(rows[0] || {});
      const parser = new Parser({ fields });
      const csv = parser.parse(rows);
      return { data: csv, contentType: 'text/csv', filename: `bookings-${Date.now()}.csv` };
    }

    return { data: JSON.stringify(rows, null, 2), contentType: 'application/json', filename: `bookings-${Date.now()}.json` };
  }

  async exportRevenue(hotelId, { startDate, endDate } = {}) {
    const where = { hotelId, paymentStatus: 'PAID' };
    if (startDate && endDate) where.createdAt = { $between: [startDate, endDate] };

    const payments = await Payment.findAll({
      include: [
        {
          model: Booking,
          as: 'booking',
          where,
          include: [{ model: RoomType, as: 'roomType', attributes: ['name'] }],
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const rows = payments.map((p) => ({
      paymentId: p.id,
      bookingNumber: p.booking?.bookingNumber || '',
      roomType: p.booking?.roomType?.name || '',
      gateway: p.gateway,
      amount: p.amount,
      status: p.status,
      capturedAt: dayjs(p.updatedAt).format('YYYY-MM-DD HH:mm'),
    }));

    const parser = new Parser({ fields: Object.keys(rows[0] || {}) });
    const csv = parser.parse(rows);
    return { data: csv, contentType: 'text/csv', filename: `revenue-${Date.now()}.csv` };
  }
}

module.exports = new ExportService();
