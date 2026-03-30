/**
 * Run DB migrations via Neon HTTP (HTTPS port 443).
 * Works on ANY network — doesn't need TCP port 5432.
 *
 * Usage: node scripts/migrate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ DATABASE_URL not set in .env');
        process.exit(1);
    }

    const sql = neon(url);
    console.log('🔌 Connecting to Neon via HTTPS...');

    // Test connection
    try {
        const [row] = await sql`SELECT 1 as ok`;
        console.log('✅ Connection OK');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }

    // Read the migration SQL file
    const drizzleDir = path.join(__dirname, '..', 'drizzle');
    const files = fs.readdirSync(drizzleDir).filter(f => f.endsWith('.sql')).sort();

    if (files.length === 0) {
        console.error('❌ No migration SQL files found in drizzle/');
        process.exit(1);
    }

    for (const file of files) {
        console.log(`\n📄 Running: ${file}`);
        const content = fs.readFileSync(path.join(drizzleDir, file), 'utf8');

        // Split on drizzle-kit's statement separator
        const statements = content
            .split('--> statement-breakpoint')
            .map(s => s.trim())
            .filter(Boolean);

        console.log(`   ${statements.length} statements to execute`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
            try {
                await sql.query(stmt);
                console.log(`   ✅ [${i + 1}/${statements.length}] ${preview}...`);
            } catch (err) {
                if (err.message?.includes('already exists')) {
                    console.log(`   ⏭️  [${i + 1}/${statements.length}] Already exists — skipped`);
                } else {
                    console.error(`   ❌ [${i + 1}/${statements.length}] FAILED: ${err.message}`);
                    console.error(`      Statement: ${preview}...`);
                }
            }
        }
    }

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' ORDER BY table_name
    `;
    console.log(`\n✅ ${tables.length} tables in database:`);
    tables.forEach(t => console.log(`   • ${t.table_name}`));
    console.log('\n🎉 Migration complete!');
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
