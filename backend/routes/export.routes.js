'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/export.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'));

router.get('/bookings', ctrl.exportBookings);
router.get('/revenue', ctrl.exportRevenue);

module.exports = router;
