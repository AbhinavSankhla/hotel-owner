'use strict';

const { Router } = require('express');

const authRoutes = require('./auth.routes');
const hotelRoutes = require('./hotel.routes');
const roomRoutes = require('./room.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const adminRoutes = require('./admin.routes');
const analyticsRoutes = require('./analytics.routes');
const blogRoutes = require('./blog.routes');
const userRoutes = require('./user.routes');
const pricingRoutes = require('./pricing.routes');
const apiKeyRoutes = require('./apiKey.routes');
const uploadRoutes = require('./upload.routes');
const exportRoutes = require('./export.routes');
const webhookRoutes = require('./webhook.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/blog', blogRoutes);
router.use('/user', userRoutes);
router.use('/pricing', pricingRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/uploads', uploadRoutes);
router.use('/export', exportRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;
