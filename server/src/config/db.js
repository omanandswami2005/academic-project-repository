const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../db/schema');
const logger = require('../utils/logger');

let db = null;

function getDB() {
    if (!db) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        const sql = neon(databaseUrl);
        db = drizzle(sql, { schema });
    }
    return db;
}

async function testConnection() {
    try {
        const database = getDB();
        await database.execute('SELECT 1 as connected');
        logger.db('Connected to Neon PostgreSQL database — ready');
        return true;
    } catch (err) {
        logger.error('DB', 'Database connection failed', err);
        return false;
    }
}

module.exports = { getDB, testConnection };
