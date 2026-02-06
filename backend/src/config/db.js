const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ PostgreSQL Connected via Prisma');
    } catch (error) {
        console.error('❌ Database Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { prisma, connectDB };
