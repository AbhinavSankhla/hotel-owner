'use strict';

const { body } = require('express-validator');

const register = [
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional({ nullable: true })
    .isMobilePhone().withMessage('Valid phone number required'),
  body('password')
    .optional({ nullable: true })
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 255 }).withMessage('Name too long'),
];

const login = [
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('phone')
    .optional({ nullable: true })
    .isMobilePhone().withMessage('Valid phone required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const requestOTP = [
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Valid phone number required'),
];

const verifyOTP = [
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Valid phone number required'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
];

const changePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
];

const requestPasswordReset = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email required')
    .normalizeEmail(),
];

const resetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
];

const verifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

const refreshToken = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

module.exports = {
  register,
  login,
  requestOTP,
  verifyOTP,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
};
