'use strict';

const roomService = require('../services/room.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.getRoomTypes = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const data = await roomService.getRoomTypes(hotelId, req.query);
  return success(res, 'Room types fetched', data);
});

exports.getRoomTypeById = asyncHandler(async (req, res) => {
  const data = await roomService.getRoomTypeById(req.params.id);
  return success(res, 'Room type fetched', data);
});

exports.checkDailyAvailability = asyncHandler(async (req, res) => {
  const { roomTypeId, checkInDate, checkOutDate, numRooms } = req.query;
  const data = await roomService.checkDailyAvailability({
    roomTypeId,
    checkInDate,
    checkOutDate,
    numRooms: parseInt(numRooms) || 1,
  });
  return success(res, 'Availability checked', data);
});

exports.checkHourlyAvailability = asyncHandler(async (req, res) => {
  const { roomTypeId, date, numHours, numRooms } = req.query;
  const data = await roomService.checkHourlyAvailability({
    roomTypeId,
    date,
    numHours: parseInt(numHours) || 1,
    numRooms: parseInt(numRooms) || 1,
  });
  return success(res, 'Hourly availability checked', data);
});

exports.getInventoryCalendar = asyncHandler(async (req, res) => {
  const { roomTypeId } = req.params;
  const { startDate, endDate } = req.query;
  const data = await roomService.getInventoryCalendar(roomTypeId, startDate, endDate);
  return success(res, 'Inventory calendar fetched', data);
});
