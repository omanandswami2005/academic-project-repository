require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_prn_idx ON users(prn) WHERE prn IS NOT NULL`;
        console.log('Index created successfully');
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

main();
