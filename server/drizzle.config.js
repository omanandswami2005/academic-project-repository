require('dotenv').config({ path: __dirname + '/.env' });

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: './src/db/schema/index.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        // Uses DIRECT_URL (non-pooler, direct TCP) for migrations
        // Falls back to DATABASE_URL if DIRECT_URL not set
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
};
