'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/review.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createReview: createReviewValidator, replyToReview: replyToReviewValidator } = require('../validators/review.validator');

const router = Router();

// Public
router.get('/hotel/:hotelId', optionalAuth, ctrl.getHotelReviews);
router.get('/hotel/:hotelId/stats', ctrl.getStats);

// Authenticated guest
router.use(authenticate);
router.post('/', createReviewValidator, validate, ctrl.create);
router.get('/can-review/:bookingId', ctrl.canReview);
router.delete('/:id', ctrl.delete);

// Hotel admin/staff
router.post('/:id/reply', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), replyToReviewValidator, validate, ctrl.reply);
router.put('/:id/approve', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), ctrl.approve);
router.put('/:id/reject', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), ctrl.reject);

module.exports = router;
