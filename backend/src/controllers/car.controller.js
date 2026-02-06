const { prisma } = require('../config/db');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Helper to upload to Cloudinary from buffer
const uploadFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            { folder: 'rideflow/cars' },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const getCars = async (req, res, next) => {
    try {
        const { startDate, endDate, type, brand } = req.query;

        let whereClause = {};

        if (type) whereClause.type = type;
        if (brand) whereClause.brand = { contains: brand, mode: 'insensitive' };

        // Availability Filter (Computed)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Find cars that have overlapping confirmed bookings
            const bookedCars = await prisma.booking.findMany({
                where: {
                    status: 'CONFIRMED',
                    OR: [
                        { startDate: { lte: end }, endDate: { gte: start } }
                    ]
                },
                select: { carId: true }
            });

            const bookedCarIds = bookedCars.map(b => b.carId);

            whereClause.id = { notIn: bookedCarIds };
        }

        const cars = await prisma.car.findMany({
            where: whereClause,
            orderBy: { pricePerDay: 'asc' }
        });

        res.json({ success: true, count: cars.length, data: cars });
    } catch (error) {
        next(error);
    }
};

const getCarById = async (req, res, next) => {
    try {
        const car = await prisma.car.findUnique({
            where: { id: req.params.id }
        });
        if (!car) return next({ statusCode: 404, message: 'Car not found' });
        res.json({ success: true, data: car });
    } catch (error) {
        next(error);
    }
};

const createCar = async (req, res, next) => {
    try {
        const { name, brand, pricePerDay, type } = req.body;

        if (!req.file) {
            return next({ statusCode: 400, message: 'Image is required' });
        }

        // Upload image
        const result = await uploadFromBuffer(req.file.buffer);

        const car = await prisma.car.create({
            data: {
                name,
                brand,
                pricePerDay: parseFloat(pricePerDay),
                type,
                imageUrl: result.secure_url,
            }
        });

        res.status(201).json({ success: true, data: car });
    } catch (error) {
        next(error);
    }
};

const updateCar = async (req, res, next) => {
    try {
        const { name, brand, pricePerDay, type } = req.body;
        let imageUrl;

        if (req.file) {
            const result = await uploadFromBuffer(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const car = await prisma.car.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name }),
                ...(brand && { brand }),
                ...(pricePerDay && { pricePerDay: parseFloat(pricePerDay) }),
                ...(type && { type }),
                ...(imageUrl && { imageUrl }),
            }
        });

        res.json({ success: true, data: car });
    } catch (error) {
        if (error.code === 'P2025') return next({ statusCode: 404, message: 'Car not found' });
        next(error);
    }
};

const deleteCar = async (req, res, next) => {
    try {
        await prisma.car.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Car deleted' });
    } catch (error) {
        if (error.code === 'P2025') return next({ statusCode: 404, message: 'Car not found' });
        next(error);
    }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar };
