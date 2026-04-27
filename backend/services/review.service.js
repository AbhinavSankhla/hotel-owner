'use strict';

const { Op } = require('sequelize');
const { Review, User, Booking, Hotel } = require('../models');
const { createError } = require('../middlewares/errorHandler.middleware');
const { paginate } = require('../utils/pagination');

class ReviewService {
  async createReview(userId, { bookingId, rating, title, comment, photos = [] }) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) throw createError('Booking not found', 404);
    if (booking.guestId !== userId) throw createError('You can only review your own bookings', 403);
    if (booking.status !== 'CHECKED_OUT') throw createError('Can only review completed stays', 400);

    const existing = await Review.findOne({ where: { bookingId } });
    if (existing) throw createError('Review already submitted for this booking', 409);

    const review = await Review.create({
      hotelId: booking.hotelId,
      bookingId,
      guestId: userId,
      rating,
      title,
      comment,
      photos,
      isVerified: true,
      isPublished: false, // Requires moderation
    });

    return review;
  }

  async getHotelReviews(hotelId, { page = 1, limit = 10, sortBy = 'newest', all = false } = {}) {
    const where = { hotelId };
    if (!all) where.isPublished = true;

    const order = sortBy === 'highest' ? [['rating', 'DESC']]
      : sortBy === 'lowest' ? [['rating', 'ASC']]
      : [['createdAt', 'DESC']];

    return paginate(
      Review,
      {
        where,
        include: [{ model: User, as: 'guest', attributes: ['id', 'name', 'avatarUrl'] }],
        order,
      },
      page,
      limit
    );
  }

  async getReviewStats(hotelId) {
    const reviews = await Review.findAll({
      where: { hotelId, isPublished: true },
      attributes: ['rating'],
    });

    if (!reviews.length) {
      return { averageRating: null, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

    const averageRating = parseFloat(
      (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    );

    return { averageRating, totalReviews: reviews.length, distribution };
  }

  async canReview(bookingId, userId) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking || booking.guestId !== userId) return false;
    if (booking.status !== 'CHECKED_OUT') return false;

    const existing = await Review.findOne({ where: { bookingId } });
    return !existing;
  }

  async replyToReview(reviewId, reply, hotelId) {
    const review = await Review.findOne({ where: { id: reviewId, hotelId } });
    if (!review) throw createError('Review not found', 404);

    await review.update({ hotelReply: reply });
    return review;
  }

  async approveReview(reviewId, hotelId) {
    const review = await Review.findOne({ where: { id: reviewId, hotelId } });
    if (!review) throw createError('Review not found', 404);
    await review.update({ isPublished: true });
    return review;
  }

  async rejectReview(reviewId, hotelId) {
    const review = await Review.findOne({ where: { id: reviewId, hotelId } });
    if (!review) throw createError('Review not found', 404);
    await review.update({ isPublished: false });
    return review;
  }

  async deleteReview(reviewId, userId) {
    const review = await Review.findByPk(reviewId);
    if (!review) throw createError('Review not found', 404);
    if (review.guestId !== userId) throw createError('Access denied', 403);
    await review.destroy();
    return { message: 'Review deleted' };
  }
}

module.exports = new ReviewService();
