'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createDailyBooking: createDailyBookingValidator,
  createHourlyBooking: createHourlyBookingValidator,
  cancelBooking: cancelBookingValidator,
  updateStatus: updateStatusValidator,
  modifyBooking: modifyBookingValidator,
} = require('../validators/booking.validator');

const router = Router();

router.use(authenticate);

// Guest routes
router.post('/daily', createDailyBookingValidator, validate, ctrl.createDaily);
router.post('/hourly', createHourlyBookingValidator, validate, ctrl.createHourly);
router.get('/my', ctrl.myBookings);
router.get('/number/:bookingNumber', ctrl.getByNumber);
router.get('/:id', ctrl.getById);
router.post('/:id/cancel', cancelBookingValidator, validate, ctrl.cancel);

// Admin/Staff routes
router.get('/', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), ctrl.list);
router.put('/:id/status', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), updateStatusValidator, validate, ctrl.updateStatus);
router.put('/:id/modify', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), modifyBookingValidator, validate, ctrl.modify);

module.exports = router;
