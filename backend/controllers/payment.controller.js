'use strict';

const paymentService = require('../services/payment.service');
const { success } = require('../utils/response');
const asyncHandler = require('../middlewares/asyncHandler.middleware');

exports.initiate = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;
  const data = await paymentService.initiatePayment(bookingId, method);
  return success(res, 'Payment initiated', data);
});

exports.confirm = asyncHandler(async (req, res) => {
  const data = await paymentService.confirmPayment(req.params.paymentId, req.body);
  return success(res, 'Payment confirmed', data);
});

exports.refund = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const data = await paymentService.refundPayment(req.params.paymentId, amount);
  return success(res, 'Refund initiated', data);
});

exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const data = await paymentService.handleRazorpayWebhook(req.rawBody, signature);
  return success(res, 'Webhook processed', data);
});
