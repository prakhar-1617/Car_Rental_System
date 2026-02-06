const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        next({ statusCode: 403, message: 'Not authorized as an admin' });
    }
};

module.exports = { admin };
