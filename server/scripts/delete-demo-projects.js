require('dotenv').config();
const { getDB } = require('../src/config/db');
const { projects } = require('../src/db/schema');
const { eq, inArray } = require('drizzle-orm');

async function deleteDemoProjects() {
    try {
        const db = getDB();
        const allProj = await db.select().from(projects);
        
        // Filter demo projects
        // A project is considered a demo/old project if it does NOT match our standard pattern: BRANCH-S7-2026-SEQ
        const demoPattern = /^(CIVIL|CSBS|ETC|IT|MECH)-S7-2026-\d{3}$/i;
        const demoProjects = allProj.filter(p => !demoPattern.test(p.uniqueProjectId));
        
        if (demoProjects.length === 0) {
            console.log("\n✅ No old demo/test projects found to delete!");
            process.exit(0);
        }
        
        console.log(`\nFound ${demoProjects.length} old demo/test projects to delete.`);
        const demoIds = demoProjects.map(p => p.id);
        
        // 1. Clear forked_from_id self-references first to avoid foreign key violations during deletion
        console.log("Clearing fork self-references...");
        for (const id of demoIds) {
            await db.update(projects)
                .set({ forkedFromId: null })
                .where(eq(projects.id, id));
        }
        
        // 2. Delete the projects (cascading deletes will handle phases, members, files, and feedback)
        console.log("Deleting demo projects...");
        await db.delete(projects).where(inArray(projects.id, demoIds));
        
        console.log(`\n======================================================`);
        console.log(`✅ SUCCESS: Deleted ${demoProjects.length} old demo/test projects!`);
        console.log(`======================================================`);
        for (const p of demoProjects) {
            console.log(`  ✓ Removed [ID: ${p.uniqueProjectId}] "${p.title}"`);
        }
        console.log(`======================================================\n`);
        
        process.exit(0);
    } catch (e) {
        console.error("❌ Error deleting demo projects:", e);
        process.exit(1);
    }
}

deleteDemoProjects();
