'use strict';

const { Op } = require('sequelize');
const { Hotel, RoomType, Review, sequelize } = require('../models');
const { redis } = require('../config/redis');
const { createError } = require('../middlewares/errorHandler.middleware');
const { paginate, getPaginationParams } = require('../utils/pagination');

const HOTEL_CACHE_TTL = 300; // 5 minutes
const FEATURED_CACHE_TTL = 600; // 10 minutes

class HotelService {
  async findMany(filters = {}, { page = 1, limit = 20 } = {}) {
    const cacheKey = `hotels:list:${JSON.stringify({ filters, page, limit })}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const where = { isActive: true };
    if (filters.city) where.city = { [Op.iLike]: `%${filters.city}%` };
    if (filters.country) where.country = filters.country;
    if (filters.bookingModel) where.bookingModel = { [Op.in]: [filters.bookingModel, 'BOTH'] };
    if (filters.starRating) where.starRating = { [Op.gte]: parseInt(filters.starRating, 10) };

    const result = await paginate(
      Hotel,
      {
        where,
        include: [
          { model: RoomType, as: 'roomTypes', where: { isActive: true }, required: false, attributes: ['id', 'name', 'basePriceDaily'] },
        ],
        order: [['createdAt', 'DESC']],
      },
      page,
      limit
    );

    // Compute derived fields
    result.data = result.data.map((hotel) => this._computeHotelFields(hotel));

    await redis.set(cacheKey, JSON.stringify(result), 'EX', HOTEL_CACHE_TTL).catch(() => {});
    return result;
  }

  async findById(id) {
    const cacheKey = `hotel:id:${id}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const hotel = await Hotel.findOne({
      where: { id, isActive: true },
      include: [
        { model: RoomType, as: 'roomTypes', where: { isActive: true }, required: false, order: [['sortOrder', 'ASC']] },
        { model: Review, as: 'reviews', where: { isPublished: true }, required: false, attributes: ['rating'] },
      ],
    });

    if (!hotel) throw createError('Hotel not found', 404);

    const result = this._computeHotelFields(hotel);
    await redis.set(cacheKey, JSON.stringify(result), 'EX', HOTEL_CACHE_TTL).catch(() => {});
    return result;
  }

  async findBySlug(slug) {
    const cacheKey = `hotel:slug:${slug}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const hotel = await Hotel.findOne({
      where: { slug, isActive: true },
      include: [
        { model: RoomType, as: 'roomTypes', where: { isActive: true }, required: false, order: [['sortOrder', 'ASC']] },
        { model: Review, as: 'reviews', where: { isPublished: true }, required: false, attributes: ['rating'] },
      ],
    });

    if (!hotel) throw createError('Hotel not found', 404);

    const result = this._computeHotelFields(hotel);
    await redis.set(cacheKey, JSON.stringify(result), 'EX', HOTEL_CACHE_TTL).catch(() => {});
    return result;
  }

  async getFeatured(limit = 6) {
    const cacheKey = `hotels:featured:${limit}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const hotels = await Hotel.findAll({
      where: { isActive: true },
      include: [
        { model: RoomType, as: 'roomTypes', where: { isActive: true }, required: false, attributes: ['id', 'name', 'description', 'basePriceDaily', 'maxGuests', 'images'] },
        { model: Review, as: 'reviews', where: { isPublished: true }, required: false, attributes: ['rating'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    const result = hotels.map((h) => this._computeHotelFields(h));
    await redis.set(cacheKey, JSON.stringify(result), 'EX', FEATURED_CACHE_TTL).catch(() => {});
    return result;
  }

  async search(query, limit = 10) {
    const hotels = await Hotel.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { city: { [Op.iLike]: `%${query}%` } },
          { slug: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: ['id', 'name', 'slug', 'city', 'state', 'logoUrl', 'starRating'],
      limit,
    });
    return hotels;
  }

  async getPopularCities(limit = 10) {
    const results = await Hotel.findAll({
      where: { isActive: true },
      attributes: ['city', 'country', [sequelize.fn('COUNT', sequelize.col('id')), 'hotelCount']],
      group: ['city', 'country'],
      order: [[sequelize.literal('hotelCount'), 'DESC']],
      limit,
      raw: true,
    });
    return results;
  }

  async invalidateCache(hotelId) {
    const keys = await redis.keys(`hotel:*`).catch(() => []);
    const listKeys = await redis.keys(`hotels:*`).catch(() => []);
    const allKeys = [...keys, ...listKeys];
    if (allKeys.length > 0) await redis.del(...allKeys).catch(() => {});
  }

  _computeHotelFields(hotel) {
    const plain = hotel.toJSON ? hotel.toJSON() : hotel;
    const reviews = plain.reviews || [];
    const roomTypes = plain.roomTypes || [];

    plain.avgRating = reviews.length
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : null;
    plain.reviewCount = reviews.length;
    plain.startingPrice = roomTypes.length
      ? Math.min(...roomTypes.map((rt) => rt.basePriceDaily || Infinity))
      : null;

    // Alias heroImageUrl → coverImageUrl for frontend compatibility
    if (!plain.coverImageUrl && plain.heroImageUrl) {
      plain.coverImageUrl = plain.heroImageUrl;
    }
    // Also set heroImageUrl from coverImageUrl if missing
    if (!plain.heroImageUrl && plain.coverImageUrl) {
      plain.heroImageUrl = plain.coverImageUrl;
    }

    delete plain.reviews; // Don't expose all reviews in list
    return plain;
  }
}

module.exports = new HotelService();
