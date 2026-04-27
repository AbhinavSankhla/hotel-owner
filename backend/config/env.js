'use strict';

/**
 * Validates that all required environment variables are present at startup.
 * Throws immediately if any required var is missing so the process fails fast.
 */
const required = [
  'PORT',
  'NODE_ENV',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env and fill in all values before starting.'
    );
  }
}

module.exports = {
  validateEnv,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 4000,
    HOTEL_ID: process.env.HOTEL_ID || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Database
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_SSL: process.env.DB_SSL === 'true',

    // Redis
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || null,
    REDIS_DB: parseInt(process.env.REDIS_DB, 10) || 0,

    // JWT
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Upload
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,

    // Razorpay
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

    // Email
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@hotel.com',
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Hotel',

    // MSG91
    MSG91_API_KEY: process.env.MSG91_API_KEY || '',
    MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || '',
    MSG91_SENDER_ID: process.env.MSG91_SENDER_ID || '',

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
  },
};
