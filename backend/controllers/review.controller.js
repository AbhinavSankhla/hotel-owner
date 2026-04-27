'use strict';

const reviewService = require('../services/review.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.create = asyncHandler(async (req, res) => {
  const data = await reviewService.createReview(req.user.id, req.body);
  return success(res, 'Review submitted', data, 201);
});

exports.getHotelReviews = asyncHandler(async (req, res) => {
  const { page, limit, sortBy } = req.query;
  const data = await reviewService.getHotelReviews(
    req.params.hotelId,
    { page: parseInt(page) || 1, limit: parseInt(limit) || 10, sortBy }
  );
  return success(res, 'Reviews fetched', data);
});

exports.getStats = asyncHandler(async (req, res) => {
  const data = await reviewService.getReviewStats(req.params.hotelId);
  return success(res, 'Review stats fetched', data);
});

exports.canReview = asyncHandler(async (req, res) => {
  const canReview = await reviewService.canReview(req.params.bookingId, req.user.id);
  return success(res, 'Checked review eligibility', { canReview });
});

exports.reply = asyncHandler(async (req, res) => {
  const data = await reviewService.replyToReview(req.params.id, req.body.reply, req.hotel?.id);
  return success(res, 'Reply posted', data);
});

exports.approve = asyncHandler(async (req, res) => {
  const data = await reviewService.approveReview(req.params.id, req.hotel?.id);
  return success(res, 'Review approved', data);
});

exports.reject = asyncHandler(async (req, res) => {
  const data = await reviewService.rejectReview(req.params.id, req.hotel?.id);
  return success(res, 'Review rejected', data);
});

exports.delete = asyncHandler(async (req, res) => {
  const data = await reviewService.deleteReview(req.params.id, req.user.id);
  return success(res, data.message, null);
});
