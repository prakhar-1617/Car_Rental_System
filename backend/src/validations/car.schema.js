const { z } = require('zod');

const createCarSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2),
        brand: z.string({ required_error: 'Brand is required' }),
        pricePerDay: z.string({ required_error: 'Price is required' }).transform((val) => parseFloat(val)).or(z.number()),
        type: z.string({ required_error: 'Type is required' }),
    }),
});

const updateCarSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        brand: z.string().optional(),
        pricePerDay: z.string().transform((val) => parseFloat(val)).or(z.number()).optional(),
        type: z.string().optional(),
    }),
});

module.exports = { createCarSchema, updateCarSchema };
