const { z } = require('zod');

const createBookingSchema = z.object({
    body: z.object({
        carId: z.string({ required_error: 'Car ID is required' }).uuid('Invalid Car ID'),
        startDate: z.string().datetime().or(z.date()),
        endDate: z.string().datetime().or(z.date()),
    }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
        message: "End date must be after start date",
        path: ["endDate"],
    }),
});

module.exports = { createBookingSchema };
