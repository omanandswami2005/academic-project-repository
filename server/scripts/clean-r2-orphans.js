require('dotenv').config();
const { getDB } = require('../src/config/db');
const { projectFiles } = require('../src/db/schema');
const { getR2Client, R2_BUCKET } = require('../src/config/r2');
const { ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

async function cleanOrphanR2Files() {
    try {
        const db = getDB();
        const client = getR2Client();
        if (!client) {
            console.log("R2 Client is not configured. Skipping cloud cleanup.");
            process.exit(0);
        }

        // 1. Get all file keys registered in the database
        const dbFiles = await db.select().from(projectFiles);
        const activeKeys = new Set(dbFiles.map(f => f.r2Key.trim()));
        console.log(`Active file keys in DB: ${activeKeys.size}`);

        // 2. Get all objects in the R2 bucket
        console.log(`Listing files in R2 bucket: ${R2_BUCKET}...`);
        const r2Data = await client.send(new ListObjectsV2Command({
            Bucket: R2_BUCKET,
        }));

        if (!r2Data.Contents || r2Data.Contents.length === 0) {
            console.log("R2 bucket is empty. No files to clean.");
            process.exit(0);
        }

        const allR2Objects = r2Data.Contents;
        console.log(`Total objects in R2: ${allR2Objects.length}`);

        // 3. Find orphans (objects in R2 that are NOT in the database active list)
        const orphans = [];
        for (const obj of allR2Objects) {
            const key = obj.Key;
            // Ensure we are cleaning our project uploads (prefix projects/)
            if (key.startsWith('projects/') && !activeKeys.has(key)) {
                orphans.push(obj);
            }
        }

        if (orphans.length === 0) {
            console.log("✨ No orphaned R2 cloud files found. All cloud storage matches the database!");
            process.exit(0);
        }

        console.log(`\n======================================================`);
        console.log(`🔍 FOUND ${orphans.length} ORPHANED CLOUD ARTIFACTS IN R2:`);
        console.log(`======================================================`);
        for (const orphan of orphans) {
            console.log(`  • Key: ${orphan.Key} (${orphan.Size} bytes)`);
        }
        console.log(`======================================================\n`);

        // 4. Delete the orphans from R2
        console.log(`Deleting ${orphans.length} orphaned files from Cloudflare R2...`);
        for (const orphan of orphans) {
            await client.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: orphan.Key,
            }));
            console.log(`  ✓ Deleted: ${orphan.Key}`);
        }

        console.log("\n✅ Success: All orphaned cloud artifacts deleted successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error cleaning R2 files:", e);
        process.exit(1);
    }
}

cleanOrphanR2Files();
