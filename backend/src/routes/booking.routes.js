const express = require('express');
const { createBooking, getMyBookings, getAllBookings } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const validate = require('../middleware/validate');
const { createBookingSchema } = require('../validations/booking.schema');

const router = express.Router();

router.post('/', protect, validate(createBookingSchema), createBooking);
router.get('/my-bookings', protect, getMyBookings);

// Admin Routes
router.get('/', protect, admin, getAllBookings);

module.exports = router;
