'use strict';

const { body } = require('express-validator');

const updateProfile = [
  body('name').optional().isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('phone')
    .optional({ nullable: true })
    .isMobilePhone().withMessage('Valid phone number required'),
  body('avatarUrl')
    .optional({ nullable: true })
    .isURL().withMessage('Avatar URL must be a valid URL'),
];

module.exports = { updateProfile };
