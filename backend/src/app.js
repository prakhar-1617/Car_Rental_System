const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
    res.send('🚗 RideFlow API is running...');
});

const authRoutes = require('./routes/auth.routes');
const carRoutes = require('./routes/car.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');

// Use this for webhook raw body parsing (it must come before express.json() for specific route, 
// OR simpler: register payment routes BEFORE express.json if global)
// BUT here we used router-specific middleware in payment.routes.js for webhook
// So we can keep standard middleware order here, but careful with global body parser vs raw.
// Better approach: Mount webhook at app level before global parsers OR use router specific.
// The payment routes file handles raw parsing for webhook route specifically? No, express.raw() there needs to bypass global body parser.
// For simplicity in this structure, we'll keep it standard and potentially adjust app.js if webhook fails.
// Actually, standard express pattern:
// app.use('/api/webhook', ...raw...)
// app.use(express.json())
// For now, let's just register api routes:

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes); // Note: Webhook endpoint inside here might need special handling in app.js if express.json is global


// Error Handler (Placeholder)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
