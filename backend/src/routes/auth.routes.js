const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();

const registerSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }).min(2),
        email: z.string({ required_error: 'Email is required' }).email(),
        password: z.string({ required_error: 'Password is required' }).min(6),
        role: z.enum(['USER', 'ADMIN']).optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }).email(),
        password: z.string({ required_error: 'Password is required' }),
    }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
