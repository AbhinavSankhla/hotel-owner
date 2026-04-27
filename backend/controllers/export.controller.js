'use strict';

const exportService = require('../services/export.service');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.exportBookings = asyncHandler(async (req, res) => {
  const result = await exportService.exportBookings(req.user.hotelId, req.query);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
});

exports.exportRevenue = asyncHandler(async (req, res) => {
  const result = await exportService.exportRevenue(req.user.hotelId, req.query);
  res.setHeader('Content-Type', result.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.send(result.data);
});
