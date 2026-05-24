const bcrypt = require('bcryptjs');
require('dotenv').config();

const { getDB } = require('../src/config/db');
const { users } = require('../src/db/schema');
const { eq } = require('drizzle-orm');
const logger = require('../src/utils/logger');

async function createExpert() {
    try {
        logger.info('EXPERT', 'Creating default expert account in Neon PostgreSQL database...');
        const db = getDB();

        const email = 'expert@rscoe.edu';
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existing) {
            logger.warn('EXPERT', `Expert account already exists: ${email} (Skipping creation)`);
            process.exit(0);
        }

        const password = 'Password@123';
        logger.info('EXPERT', `Hashing password "${password}"...`);
        const passwordHash = await bcrypt.hash(password, 12);

        logger.db('Inserting expert account...');
        await db.insert(users).values({
            username: 'Industry Expert',
            email,
            passwordHash,
            role: 'expert',
            branch: 'GEN',
            bio: 'Industry Expert reviewer for Rajarshi Shahu College of Engineering portfolios.',
        });

        logger.success('EXPERT', `Default expert account created successfully!`);
        logger.info('EXPERT', `Email: ${email}`);
        logger.info('EXPERT', `Password: ${password}`);
        logger.info('EXPERT', `Role: expert`);
        process.exit(0);
    } catch (error) {
        logger.error('EXPERT', 'Failed to create expert account', error);
        process.exit(1);
    }
}

createExpert();
