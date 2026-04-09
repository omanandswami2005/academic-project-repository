/**
 * Migration: Add project_categories table, categoryId + semester to projects, uploadedBy to project_files.
 * Run: node -r ./scripts/dns-fix.js scripts/migrate-categories.js
 */
require('dotenv').config();
require('./dns-fix');
const { neon } = require('@neondatabase/serverless');

async function migrate() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Creating project_categories table...');
    await sql`
        CREATE TABLE IF NOT EXISTS project_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            branch VARCHAR(50),
            created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
    `;
    await sql`CREATE INDEX IF NOT EXISTS categories_branch_idx ON project_categories(branch)`;
    await sql`CREATE INDEX IF NOT EXISTS categories_created_by_idx ON project_categories(created_by)`;

    console.log('Adding category_id and semester columns to projects...');
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES project_categories(id)`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS semester INTEGER`;
    await sql`CREATE INDEX IF NOT EXISTS projects_category_idx ON projects(category_id)`;

    console.log('Adding uploaded_by column to project_files...');
    await sql`ALTER TABLE project_files ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id)`;
    await sql`CREATE INDEX IF NOT EXISTS files_uploaded_by_idx ON project_files(uploaded_by)`;

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
