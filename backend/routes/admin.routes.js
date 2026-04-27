'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  updateHotel: updateHotelValidator,
  createRoomType: createRoomTypeValidator,
  updateRoomType: updateRoomTypeValidator,
  bulkUpdateInventory: bulkUpdateInventoryValidator,
  createStaff: createStaffValidator,
} = require('../validators/admin.validator');

const router = Router();

router.use(authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'));

router.get('/dashboard', ctrl.getDashboard);

// Bookings management
router.get('/bookings', ctrl.listBookings);
router.put('/bookings/:id/status', ctrl.updateBookingStatus);

// Hotel settings (admin only)
router.put('/hotel', requireRoles('HOTEL_ADMIN'), updateHotelValidator, validate, ctrl.updateHotel);

// Room types
router.get('/room-types', ctrl.listRoomTypes);
router.post('/room-types', requireRoles('HOTEL_ADMIN'), createRoomTypeValidator, validate, ctrl.createRoomType);
router.put('/room-types/:id', requireRoles('HOTEL_ADMIN'), updateRoomTypeValidator, validate, ctrl.updateRoomType);
router.delete('/room-types/:id', requireRoles('HOTEL_ADMIN'), ctrl.deleteRoomType);

// Inventory
router.put('/inventory', bulkUpdateInventoryValidator, validate, ctrl.updateInventory);
router.put('/inventory/bulk', bulkUpdateInventoryValidator, validate, ctrl.bulkUpdateInventory);

// SEO
router.put('/seo', requireRoles('HOTEL_ADMIN'), ctrl.upsertSeo);

// Staff
router.get('/staff', ctrl.getStaff);
router.post('/staff', requireRoles('HOTEL_ADMIN'), createStaffValidator, validate, ctrl.createStaff);
router.put('/staff/:userId', requireRoles('HOTEL_ADMIN'), ctrl.updateStaff);
router.delete('/staff/:userId', requireRoles('HOTEL_ADMIN'), ctrl.deleteStaff);

module.exports = router;
