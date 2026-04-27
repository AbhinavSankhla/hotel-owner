'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/analytics.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'));

router.get('/trends', ctrl.getBookingTrends);
router.get('/revenue', ctrl.getRevenueReport);
router.get('/occupancy', ctrl.getOccupancy);
router.get('/sources', ctrl.getBookingsBySource);

module.exports = router;
