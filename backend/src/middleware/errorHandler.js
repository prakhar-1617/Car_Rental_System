const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle Zod Validation Errors
    if (err.name === 'ZodError') {
        statusCode = 400;
        message = 'Validation Error';
        return res.status(statusCode).json({
            success: false,
            message,
            errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        });
    }

    // Handle Prisma Errors (Optional refinement)
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'Duplicate field value entered';
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
