'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/room.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

// Public
router.get('/hotel/:hotelId', ctrl.getRoomTypes);
router.get('/types/:id', ctrl.getRoomTypeById);
router.get('/availability/daily', ctrl.checkDailyAvailability);
router.get('/availability/hourly', ctrl.checkHourlyAvailability);

// Admin only
router.get('/inventory/:roomTypeId/calendar', authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), ctrl.getInventoryCalendar);

module.exports = router;
