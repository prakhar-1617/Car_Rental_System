const express = require('express');
const { createPaymentIntent, stripeWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create-payment-intent', protect, createPaymentIntent);

// Webhook requires raw body parsing, separate from main json middleware
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
