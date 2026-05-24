const bcrypt = require('bcryptjs');
require('dotenv').config();

const { getDB } = require('../src/config/db');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../src/utils/logger');

async function createAdmin() {
    try {
        logger.info('ADMIN', 'Creating default admin account in Neon PostgreSQL database...');
        const db = getDB();

        const email = 'admin@rscoe.edu';
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existing) {
            logger.warn('ADMIN', `Admin account already exists: ${email} (Skipping creation)`);
            process.exit(0);
        }

        const password = 'Password@123';
        logger.info('ADMIN', `Hashing password "${password}"...`);
        const passwordHash = await bcrypt.hash(password, 12);

        logger.db('Inserting admin account...');
        await db.insert(users).values({
            username: 'System Admin',
            email,
            passwordHash,
            role: 'admin',
            branch: 'GEN',
            bio: 'APRS Platform Administrator for Rajarshi Shahu College of Engineering.',
        });

        logger.success('ADMIN', `Default admin account created successfully!`);
        logger.info('ADMIN', `Email: ${email}`);
        logger.info('ADMIN', `Password: ${password}`);
        logger.info('ADMIN', `Role: admin`);
        process.exit(0);
    } catch (error) {
        logger.error('ADMIN', 'Failed to create admin account', error);
        process.exit(1);
    }
}

createAdmin();
