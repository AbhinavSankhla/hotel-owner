'use strict';

const { body } = require('express-validator');

const createBlogPost = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 500 }).withMessage('Title too long'),
  body('content')
    .notEmpty().withMessage('Content is required'),
  body('excerpt').optional().isLength({ max: 1000 }),
  body('coverImageUrl').optional().isURL().withMessage('Cover image must be a valid URL'),
  body('tags').optional().isArray(),
  body('tags.*').optional().isString().isLength({ max: 50 }),
];

const updateBlogPost = [
  body('title').optional().isLength({ max: 500 }),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('excerpt').optional().isLength({ max: 1000 }),
  body('coverImageUrl').optional().isURL(),
  body('tags').optional().isArray(),
];

module.exports = { createBlogPost, updateBlogPost };
