const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('../db/schema');

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
        console.log('✅ Database connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

module.exports = { getDB, testConnection };
