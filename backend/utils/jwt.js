'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { env } = require('../config/env');

/**
 * Generate access + refresh token pair for a user.
 */
function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user.id);
  return { accessToken, refreshToken };
}

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email || null,
    phone: user.phone || null,
    role: user.role,
    hotelId: user.hotelId || null,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'hotel-api',
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'hotel-api',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'hotel-api' });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: 'hotel-api' });
}

/**
 * Generate a URL-safe reset/verification token (UUID-based).
 */
function generateResetToken() {
  return uuidv4().replace(/-/g, '');
}

module.exports = {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
};
