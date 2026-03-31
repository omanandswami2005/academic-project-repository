require('dotenv').config({ path: __dirname + '/.env' });

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: './src/db/schema/index.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};
