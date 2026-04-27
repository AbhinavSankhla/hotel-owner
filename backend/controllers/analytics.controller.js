'use strict';

const analyticsService = require('../services/analytics.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.getBookingTrends = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBookingTrends(req.user.hotelId, req.query);
  return success(res, 'Booking trends fetched', data);
});

exports.getRevenueReport = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRevenueReport(req.user.hotelId, req.query);
  return success(res, 'Revenue report fetched', data);
});

exports.getOccupancy = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOccupancyMetrics(req.user.hotelId, req.query);
  return success(res, 'Occupancy metrics fetched', data);
});

exports.getBookingsBySource = asyncHandler(async (req, res) => {
  const data = await analyticsService.getBookingsBySource(req.user.hotelId);
  return success(res, 'Bookings by source fetched', data);
});
