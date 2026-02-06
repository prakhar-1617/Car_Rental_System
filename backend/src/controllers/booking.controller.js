const { prisma } = require('../config/db');

// Helper to calculate price
const calculatePrice = (startDate, endDate, pricePerDay) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * pricePerDay;
};

// Create Booking
const createBooking = async (req, res, next) => {
    try {
        const { carId, startDate, endDate } = req.body;
        const userId = req.user.id; // From Auth Middleware

        // 1. Check if car exists
        const car = await prisma.car.findUnique({ where: { id: carId } });
        if (!car) {
            return next({ statusCode: 404, message: 'Car not found' });
        }

        // 2. Check for Overlaps (Concurrency Safe: ideally use transactions or constraints, but this is app logic level)
        const existingBooking = await prisma.booking.findFirst({
            where: {
                carId,
                status: 'CONFIRMED', // Only check confirmed bookings
                OR: [
                    { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
                ]
            }
        });

        if (existingBooking) {
            return next({ statusCode: 400, message: 'Car is already booked for these dates' });
        }

        // 3. Calculate Total Price
        const totalPrice = calculatePrice(startDate, endDate, car.pricePerDay);

        // 4. Create PENDING Booking
        const booking = await prisma.booking.create({
            data: {
                userId,
                carId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalPrice,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            data: booking,
            clientSecret: 'TODO_STRIPE_CLIENT_SECRET' // Placeholder for next step
        });

    } catch (error) {
        next(error);
    }
};

// Get User Bookings
const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: { car: true },
            orderBy: { startDate: 'desc' }
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

// Admin: Get All Bookings
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: true, car: true },
            orderBy: { startDate: 'desc' }
        });
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

module.exports = { createBooking, getMyBookings, getAllBookings };
