'use strict';

const blogService = require('../services/blog.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.list = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { page, limit } = req.query;
  const data = await blogService.findAll(hotelId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
  return success(res, 'Blog posts fetched', data);
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await blogService.findAll(req.user.hotelId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    includeUnpublished: true,
  });
  return success(res, 'Blog posts fetched', data);
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const data = await blogService.findBySlug(req.params.slug, req.params.hotelId);
  return success(res, 'Blog post fetched', data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await blogService.create(req.user.hotelId, req.user.id, req.body);
  return success(res, 'Blog post created', data, 201);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await blogService.update(req.params.id, req.user.hotelId, req.body);
  return success(res, 'Blog post updated', data);
});

exports.publish = asyncHandler(async (req, res) => {
  const data = await blogService.publish(req.params.id, req.user.hotelId);
  return success(res, 'Blog post published', data);
});

exports.archive = asyncHandler(async (req, res) => {
  const data = await blogService.archive(req.params.id, req.user.hotelId);
  return success(res, 'Blog post archived', data);
});

exports.delete = asyncHandler(async (req, res) => {
  const data = await blogService.delete(req.params.id, req.user.hotelId);
  return success(res, data.message, null);
});
