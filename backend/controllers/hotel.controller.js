'use strict';

const hotelService = require('../services/hotel.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, city, country, bookingModel, starRating } = req.query;
  const data = await hotelService.findMany(
    { city, country, bookingModel, starRating },
    { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
  );
  return success(res, 'Hotels fetched', data);
});

exports.getById = asyncHandler(async (req, res) => {
  const hotel = await hotelService.findById(req.params.id);
  return success(res, 'Hotel fetched', hotel);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const hotel = await hotelService.findBySlug(req.params.slug);
  return success(res, 'Hotel fetched', hotel);
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const data = await hotelService.getFeatured(parseInt(req.query.limit) || 6);
  return success(res, 'Featured hotels fetched', data);
});

exports.search = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  const data = await hotelService.search(q || '', parseInt(limit) || 10);
  return success(res, 'Search results', data);
});

exports.getPopularCities = asyncHandler(async (req, res) => {
  const data = await hotelService.getPopularCities(parseInt(req.query.limit) || 10);
  return success(res, 'Popular cities fetched', data);
});
