'use strict';

const { Op } = require('sequelize');
const { Booking, RoomType } = require('../models');
const { createError } = require('../middlewares/errorHandler.middleware');

class PricingService {
  /**
   * Demand-based price suggestions for a room type across a date range.
   * Uses occupancy as the primary signal.
   */
  async getPriceSuggestions(hotelId, roomTypeId, startDate, endDate) {
    const roomType = await RoomType.findOne({ where: { id: roomTypeId, hotelId } });
    if (!roomType) throw createError('Room type not found', 404);

    const roomService = require('./room.service');
    const dates = roomService._getDateRange(startDate, endDate);

    const suggestions = await Promise.all(
      dates.map(async (date) => {
        const bookedCount = await Booking.sum('numRooms', {
          where: {
            roomTypeId,
            bookingType: 'DAILY',
            status: { [Op.in]: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
            checkInDate: { [Op.lte]: date },
            checkOutDate: { [Op.gt]: date },
          },
        }) || 0;

        const occupancyRate = roomType.totalRooms > 0 ? bookedCount / roomType.totalRooms : 0;
        const suggestedPrice = this._calculateSuggestedPrice(roomType.basePriceDaily, occupancyRate, date);

        return {
          date,
          currentBasePrice: roomType.basePriceDaily,
          occupancyRate: parseFloat((occupancyRate * 100).toFixed(1)),
          suggestedPrice,
          demand: occupancyRate >= 0.8 ? 'HIGH' : occupancyRate >= 0.5 ? 'MEDIUM' : 'LOW',
        };
      })
    );

    return { roomType: { id: roomType.id, name: roomType.name }, suggestions };
  }

  _calculateSuggestedPrice(basePrice, occupancyRate, date) {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let multiplier = 1;
    if (occupancyRate >= 0.9) multiplier = 1.5;
    else if (occupancyRate >= 0.8) multiplier = 1.3;
    else if (occupancyRate >= 0.6) multiplier = 1.15;
    else if (occupancyRate <= 0.2) multiplier = 0.85;

    if (isWeekend) multiplier *= 1.1;

    return Math.round(basePrice * multiplier);
  }
}

module.exports = new PricingService();
