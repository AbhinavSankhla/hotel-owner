'use strict';

const { body } = require('express-validator');

const createReview = [
  body('bookingId').notEmpty().isUUID().withMessage('Valid bookingId required'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 3000 }).withMessage('Comment must be 10-3000 characters'),
  body('title')
    .optional()
    .isLength({ max: 255 }).withMessage('Title too long'),
  body('photos')
    .optional()
    .isArray({ max: 10 }).withMessage('Maximum 10 photos allowed'),
  body('photos.*')
    .optional()
    .isURL().withMessage('Each photo must be a valid URL'),
];

const replyToReview = [
  body('reply')
    .notEmpty().withMessage('Reply text is required')
    .isLength({ min: 5, max: 2000 }).withMessage('Reply must be 5-2000 characters'),
];

module.exports = { createReview, replyToReview };
