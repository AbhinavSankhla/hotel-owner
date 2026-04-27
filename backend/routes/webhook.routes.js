'use strict';

const { Router } = require('express');
const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

const router = Router();

/**
 * POST /api/webhooks/razorpay
 * Raw body is already parsed in server.js via express.raw({ type: 'application/json' })
 */
router.post('/razorpay', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const data = await paymentService.handleRazorpayWebhook(req.body, signature);
  return success(res, 'Webhook processed', data);
}));

module.exports = router;
