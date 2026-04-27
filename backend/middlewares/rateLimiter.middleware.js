'use strict';

const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

/** General API rate limiter: 200 req/min */
const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later.',
    data: null,
  },
  skip: (req) => env.NODE_ENV === 'test',
});

/** Auth limiter: 5 attempts per 15 minutes (prevents brute force) */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts — try again in 15 minutes.',
    data: null,
  },
  skip: (req) => env.NODE_ENV === 'test',
});

/** Upload limiter: 10 uploads/min */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload requests.',
    data: null,
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
