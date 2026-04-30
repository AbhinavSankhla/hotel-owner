'use strict';

const adminService = require('../services/admin.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats(req.user.hotelId);
  return success(res, 'Dashboard stats fetched', data);
});

exports.updateHotel = asyncHandler(async (req, res) => {
  const data = await adminService.updateHotel(req.user.hotelId, req.body);
  return success(res, 'Hotel updated', data);
});

// ── Bookings Management ───────────────────────────────────────────────────
exports.listBookings = asyncHandler(async (req, res) => {
  const data = await adminService.listBookings(req.user.hotelId, req.query);
  return success(res, 'Bookings fetched', data);
});

exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const data = await adminService.updateBookingStatusAdmin(req.params.id, req.user.hotelId, req.body.status);
  return success(res, 'Booking status updated', data);
});

// ── Offline / Walk-in Booking ─────────────────────────────────────────────
exports.createOfflineBooking = asyncHandler(async (req, res) => {
  const data = await adminService.createOfflineBooking(req.user.hotelId, req.user.id, req.body);
  return success(res, 'Offline booking created', data, 201);
});

// ── Guest Management ──────────────────────────────────────────────────────
exports.listGuests = asyncHandler(async (req, res) => {
  const data = await adminService.listGuests(req.user.hotelId, req.query);
  return success(res, 'Guests fetched', data);
});

exports.getGuestDetail = asyncHandler(async (req, res) => {
  const data = await adminService.getGuestDetail(req.params.id, req.user.hotelId);
  return success(res, 'Guest detail fetched', data);
});

// ── Room Types ────────────────────────────────────────────────────────────
exports.listRoomTypes = asyncHandler(async (req, res) => {
  const data = await adminService.listRoomTypes(req.user.hotelId);
  return success(res, 'Room types fetched', data);
});
exports.createRoomType = asyncHandler(async (req, res) => {
  const data = await adminService.createRoomType(req.user.hotelId, req.body);
  return success(res, 'Room type created', data, 201);
});

exports.updateRoomType = asyncHandler(async (req, res) => {
  const data = await adminService.updateRoomType(req.params.id, req.user.hotelId, req.body);
  return success(res, 'Room type updated', data);
});

exports.deleteRoomType = asyncHandler(async (req, res) => {
  const data = await adminService.deleteRoomType(req.params.id, req.user.hotelId);
  return success(res, data.message, null);
});

// ── Inventory ─────────────────────────────────────────────────────────────
exports.updateInventory = asyncHandler(async (req, res) => {
  const data = await adminService.updateSingleInventory(req.user.hotelId, req.body);
  return success(res, 'Inventory updated', data);
});

exports.bulkUpdateInventory = asyncHandler(async (req, res) => {
  const data = await adminService.bulkUpdateInventory(req.user.hotelId, req.body);
  return success(res, 'Inventory bulk updated', data);
});

// ── SEO ───────────────────────────────────────────────────────────────────
exports.upsertSeo = asyncHandler(async (req, res) => {
  const data = await adminService.upsertSeoMeta(req.user.hotelId, req.body);
  return success(res, 'SEO meta saved', data);
});

// ── Staff ─────────────────────────────────────────────────────────────────
exports.getStaff = asyncHandler(async (req, res) => {
  const data = await adminService.getStaff(req.user.hotelId);
  return success(res, 'Staff fetched', data);
});

exports.createStaff = asyncHandler(async (req, res) => {
  const data = await adminService.createStaff(req.user.hotelId, req.body);
  return success(res, 'Staff member created', data, 201);
});

exports.updateStaff = asyncHandler(async (req, res) => {
  const data = await adminService.updateStaff(req.params.userId, req.user.hotelId, req.body);
  return success(res, 'Staff updated', data);
});

exports.deleteStaff = asyncHandler(async (req, res) => {
  const data = await adminService.deleteStaff(req.params.userId, req.user.hotelId);
  return success(res, data.message, null);
});
