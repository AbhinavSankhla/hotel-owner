'use strict';

const apiKeyService = require('../services/apiKey.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.generate = asyncHandler(async (req, res) => {
  const data = await apiKeyService.generateKey(req.user.hotelId, req.body);
  return success(res, data.message, { key: data.key }, 201);
});

exports.list = asyncHandler(async (req, res) => {
  const data = await apiKeyService.listKeys(req.user.hotelId);
  return success(res, 'API keys fetched', data);
});

exports.revoke = asyncHandler(async (req, res) => {
  const data = await apiKeyService.revokeKey(req.params.id, req.user.hotelId);
  return success(res, data.message, null);
});
