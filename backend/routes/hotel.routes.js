'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/hotel.controller');

const router = Router();

router.get('/', ctrl.list);
router.get('/featured', ctrl.getFeatured);
router.get('/search', ctrl.search);
router.get('/cities', ctrl.getPopularCities);
router.get('/id/:id', ctrl.getById);
router.get('/:slug', ctrl.getBySlug);

module.exports = router;
