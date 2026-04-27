'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const { uploadLimiter } = require('../middlewares/rateLimiter.middleware');
const uploadService = require('../services/upload.service');

const router = Router();
const upload = uploadService.getMulterConfig();

router.use(authenticate, uploadLimiter);

router.post('/single', upload.single('file'), ctrl.uploadSingle);
router.post('/multiple', upload.array('files', 10), ctrl.uploadMultiple);
router.delete('/:filename', requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'), ctrl.deleteFile);

module.exports = router;
