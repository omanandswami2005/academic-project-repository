require('dotenv').config();
const { getDB } = require('../src/config/db');
const { projects } = require('../src/db/schema');
const logger = require('../src/utils/logger');

async function checkProjects() {
    try {
        const db = getDB();
        const allProj = await db.select().from(projects);
        console.log(`\nFound ${allProj.length} total projects in database:`);
        for (const p of allProj) {
            console.log(`  - [ID: ${p.uniqueProjectId}] "${p.title}" (Db ID: ${p.id})`);
        }
        process.exit(0);
    } catch (e) {
        console.error("Error reading projects:", e);
        process.exit(1);
    }
}

checkProjects();
