'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/blog.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRoles } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBlogPost: createBlogPostValidator, updateBlogPost: updateBlogPostValidator } = require('../validators/blog.validator');

const router = Router();

// Public
router.get('/hotel/:hotelId', ctrl.list);
router.get('/hotel/:hotelId/:slug', ctrl.getBySlug);

// Admin routes
router.use(authenticate, requireRoles('HOTEL_ADMIN', 'HOTEL_STAFF'));
router.get('/manage', ctrl.listAdmin);
router.post('/', createBlogPostValidator, validate, ctrl.create);
router.put('/:id', updateBlogPostValidator, validate, ctrl.update);
router.put('/:id/publish', ctrl.publish);
router.put('/:id/archive', ctrl.archive);
router.delete('/:id', requireRoles('HOTEL_ADMIN'), ctrl.delete);

module.exports = router;
