const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { prisma } = require('../config/db');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next({ statusCode: 401, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            return next({ statusCode: 401, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        next({ statusCode: 401, message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };
