'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { unauthorized } = require('../utils/response');

/**
 * Verifies Bearer JWT and attaches the full user to req.user.
 * Returns 401 if token is missing, invalid, or user not found / inactive.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      return unauthorized(res, 'User not found or account deactivated');
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Invalid token');
    }
    return next(err);
  }
}

/**
 * Same as authenticate but does NOT fail if no token is present.
 * Attaches user if token is valid; continues without user if absent.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await User.findByPk(payload.id, {
      attributes: { exclude: ['password'] },
    });

    if (user && user.isActive) {
      req.user = user;
    }
    return next();
  } catch {
    // Token invalid — proceed without user
    return next();
  }
}

module.exports = { authenticate, optionalAuth };
