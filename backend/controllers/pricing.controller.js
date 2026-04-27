'use strict';

const pricingService = require('../services/pricing.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.getSuggestions = asyncHandler(async (req, res) => {
  const { roomTypeId, startDate, endDate } = req.query;
  const data = await pricingService.getPriceSuggestions(
    req.user.hotelId,
    roomTypeId,
    startDate,
    endDate
  );
  return success(res, 'Price suggestions fetched', data);
});
