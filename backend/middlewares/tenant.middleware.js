'use strict';

const { forbidden } = require('../utils/response');

/**
 * Ensures hotel staff can only access their own hotel's resources.
 * Compares req.user.hotelId with the hotelId in:
 *   1. req.params.hotelId
 *   2. req.body.hotelId
 *   3. req.query.hotelId
 *   4. req.headers['x-hotel-id']
 *
 * HOTEL_ADMIN always passes; GUEST always passes (guest access checked separately).
 * Only restricts HOTEL_STAFF.
 */
function requireHotelAccess(req, res, next) {
  if (!req.user) return forbidden(res, 'Authentication required');

  // HOTEL_ADMIN has unrestricted access
  if (req.user.role === 'HOTEL_ADMIN') return next();

  // For HOTEL_STAFF — verify they belong to the requested hotel
  if (req.user.role === 'HOTEL_STAFF') {
    const requestedHotelId =
      req.params.hotelId ||
      req.body.hotelId ||
      req.query.hotelId ||
      req.headers['x-hotel-id'];

    if (requestedHotelId && req.user.hotelId !== requestedHotelId) {
      return forbidden(res, 'Access denied — you do not belong to this hotel');
    }
  }

  return next();
}

module.exports = { requireHotelAccess };
