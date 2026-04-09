/**
 * Migration: Add phase_id column to project_files table.
 */
require('dotenv/config');
const { neon } = require('@neondatabase/serverless');

async function main() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Adding phase_id column to project_files...');
    await sql`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS phase_id INTEGER`;
    console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
