'use strict';

const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { BlogPost, User } = require('../models');
const { createError } = require('../middlewares/errorHandler.middleware');
const { paginate } = require('../utils/pagination');

class BlogService {
  async findAll(hotelId, { page = 1, limit = 10, includeUnpublished = false } = {}) {
    const where = { hotelId };
    if (!includeUnpublished) where.isPublished = true;

    return paginate(
      BlogPost,
      {
        where,
        include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] }],
        order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      },
      page,
      limit
    );
  }

  async findBySlug(slug, hotelId) {
    const post = await BlogPost.findOne({
      where: { slug, hotelId, isPublished: true },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatarUrl'] }],
    });
    if (!post) throw createError('Blog post not found', 404);
    return post;
  }

  async create(hotelId, authorId, data) {
    const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await BlogPost.findOne({ where: { hotelId, slug } });
    if (existing) throw createError('Blog post with this slug already exists', 409);

    return BlogPost.create({ ...data, hotelId, authorId, slug });
  }

  async update(postId, hotelId, data) {
    const post = await BlogPost.findOne({ where: { id: postId, hotelId } });
    if (!post) throw createError('Blog post not found', 404);
    await post.update(data);
    return post;
  }

  async publish(postId, hotelId) {
    const post = await BlogPost.findOne({ where: { id: postId, hotelId } });
    if (!post) throw createError('Blog post not found', 404);
    await post.update({ isPublished: true, publishedAt: new Date() });
    return post;
  }

  async archive(postId, hotelId) {
    const post = await BlogPost.findOne({ where: { id: postId, hotelId } });
    if (!post) throw createError('Blog post not found', 404);
    await post.update({ isPublished: false });
    return post;
  }

  async delete(postId, hotelId) {
    const post = await BlogPost.findOne({ where: { id: postId, hotelId } });
    if (!post) throw createError('Blog post not found', 404);
    await post.destroy();
    return { message: 'Blog post deleted' };
  }
}

module.exports = new BlogService();
