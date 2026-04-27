'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

// Protected routes
router.use(authenticate);
router.post('/initiate', ctrl.initiate);
router.post('/:paymentId/confirm', ctrl.confirm);
router.post('/:paymentId/refund', requireRoles('HOTEL_ADMIN'), ctrl.refund);

module.exports = router;
