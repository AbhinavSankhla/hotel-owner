'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/pricing.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'));

router.get('/suggestions', ctrl.getSuggestions);

module.exports = router;
