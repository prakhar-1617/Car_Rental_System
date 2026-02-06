const Stripe = require('stripe');
const { prisma } = require('../config/db');
const env = require('../config/env');

const stripe = Stripe(env.STRIPE_SECRET_KEY);

// Create Payment Intent
const createPaymentIntent = async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { car: true }
        });

        if (!booking) {
            return next({ statusCode: 404, message: 'Booking not found' });
        }

        if (booking.status !== 'PENDING') {
            return next({ statusCode: 400, message: 'Booking is not pending' });
        }

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(booking.totalPrice * 100), // USD cents
            currency: 'usd',
            metadata: { bookingId: booking.id }
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });

    } catch (error) {
        next(error);
    }
};

// Webhook Handler
const stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { bookingId } = paymentIntent.metadata;

        try {
            // 1. Update Booking to CONFIRMED
            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' }
            });

            // 2. Create Payment Record
            await prisma.payment.create({
                data: {
                    bookingId,
                    amount: paymentIntent.amount / 100,
                    stripePaymentId: paymentIntent.id,
                    status: 'Success'
                }
            });

            console.log(`✅ Booking ${bookingId} CONFIRMED via Webhook`);

        } catch (error) {
            console.error('Error updating booking via webhook:', error);
            // Don't return error to Stripe, just log it
        }
    }

    res.json({ received: true });
};

module.exports = { createPaymentIntent, stripeWebhook };
