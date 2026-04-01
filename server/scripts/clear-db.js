/**
 * clear-db.js
 * Truncates every application table in dependency order (children first),
 * then resets all serial sequences back to 1.
 *
 * Usage:  node scripts/clear-db.js
 */

require('dotenv').config({ path: __dirname + '/../.env' });

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Tables in order: dependants first, so FK constraints are satisfied.
const TABLES = [
    'refresh_tokens',
    'notifications',
    'feedback',
    'project_members',
    'project_files',
    'project_phases',
    'projects',
    'users',
];

async function clearDatabase() {
    const client = await pool.connect();
    try {
        console.log('⚠️  Clearing database — all data will be deleted.\n');

        await client.query('BEGIN');

        for (const table of TABLES) {
            await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
            console.log(`  ✓  Truncated  ${table}`);
        }

        await client.query('COMMIT');

        console.log('\n✅  Database cleared successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('\n❌  Failed to clear database:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

clearDatabase();
