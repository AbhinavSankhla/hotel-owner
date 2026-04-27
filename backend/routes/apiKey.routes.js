'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/apiKey.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');

const router = Router();

router.use(authenticate, requireRoles('HOTEL_ADMIN'));

router.post('/', ctrl.generate);
router.get('/', ctrl.list);
router.delete('/:id', ctrl.revoke);

module.exports = router;
