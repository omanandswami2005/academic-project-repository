require('dotenv').config();
const { getDB } = require('../src/config/db');
const { projects } = require('../src/db/schema');
const { notLike, or, and } = require('drizzle-orm');

async function findDemoProjects() {
    try {
        const db = getDB();
        const allProj = await db.select().from(projects);
        
        // Filter demo projects
        // A project is considered a demo/old project if it does NOT match our standard pattern: BRANCH-S7-2026-SEQ
        const demoPattern = /^(CIVIL|CSBS|ETC|IT|MECH)-S7-2026-\d{3}$/i;
        
        const demoProjects = allProj.filter(p => !demoPattern.test(p.uniqueProjectId));
        
        console.log(`\n======================================================`);
        console.log(`🔍 FOUND ${demoProjects.length} OLD DEMO/TEST PROJECTS IN DATABASE:`);
        console.log(`======================================================`);
        for (const p of demoProjects) {
            console.log(`  • ID: ${p.uniqueProjectId.padEnd(25)} | DB ID: ${String(p.id).padEnd(4)} | "${p.title}"`);
        }
        console.log(`======================================================\n`);
        
        process.exit(0);
    } catch (e) {
        console.error("Error finding demo projects:", e);
        process.exit(1);
    }
}

findDemoProjects();
