'use strict';

const bookingService = require('../services/booking.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.createDaily = asyncHandler(async (req, res) => {
  const data = await bookingService.createDailyBooking(req.body, req.user.id);
  return success(res, 'Booking created', data, 201);
});

exports.createHourly = asyncHandler(async (req, res) => {
  const data = await bookingService.createHourlyBooking(req.body, req.user.id);
  return success(res, 'Booking created', data, 201);
});

exports.getById = asyncHandler(async (req, res) => {
  const data = await bookingService.getById(req.params.id, req.user.id);
  return success(res, 'Booking fetched', data);
});

exports.getByNumber = asyncHandler(async (req, res) => {
  const data = await bookingService.getByNumber(req.params.bookingNumber);
  return success(res, 'Booking fetched', data);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const hotelId = req.hotel?.id || null;
  const data = await bookingService.list(filters, { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }, hotelId);
  return success(res, 'Bookings fetched', data);
});

exports.myBookings = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await bookingService.list(
    { guestId: req.user.id },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 10 }
  );
  return success(res, 'Your bookings fetched', data);
});

exports.cancel = asyncHandler(async (req, res) => {
  const data = await bookingService.cancel(req.params.id, req.user.id, req.body);
  return success(res, 'Booking cancelled', data);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const data = await bookingService.updateStatus(req.params.id, req.body, req.user.id);
  return success(res, 'Booking status updated', data);
});

exports.modify = asyncHandler(async (req, res) => {
  const data = await bookingService.modify(req.params.id, req.body, req.user.id);
  return success(res, 'Booking modified', data);
});
