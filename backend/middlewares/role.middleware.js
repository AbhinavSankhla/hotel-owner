'use strict';

const { forbidden } = require('../utils/response');

/**
 * Factory that creates a middleware requiring one of the given roles.
 * Must be used AFTER authenticate middleware.
 *
 * Usage: router.get('/admin', authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), handler)
 */
function requireRoles(...roles) {
  return function (req, res, next) {
    if (!req.user) {
      return forbidden(res, 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
    }
    return next();
  };
}

module.exports = { requireRoles };
