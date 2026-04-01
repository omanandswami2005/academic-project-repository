require('dotenv').config({ path: __dirname + '/.env' });

// Drizzle Studio requires a direct (non-pooler) Neon connection.
// If DATABASE_DIRECT_URL is set, use it. Otherwise auto-derive it by
// stripping the "-pooler" segment from DATABASE_URL.
const studioUrl =
    process.env.DATABASE_DIRECT_URL ||
    (process.env.DATABASE_URL || '').replace(/-pooler\./, '.');

/** @type { import("drizzle-kit").Config } */
module.exports = {
    schema: './src/db/schema/index.js',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: studioUrl,
    },
};
