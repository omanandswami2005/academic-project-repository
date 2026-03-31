require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const result = await sql`SELECT COUNT(*) as count FROM projects`;
        console.log('Projects in DB:', result[0].count);
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

main();
