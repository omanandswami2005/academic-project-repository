require('dotenv').config();
const { getR2Client, R2_BUCKET } = require('../src/config/r2');
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function checkR2() {
    try {
        const client = getR2Client();
        if (!client) {
            console.log("R2 Client is not configured (missing credentials).");
            process.exit(0);
        }
        
        console.log(`Listing files in R2 bucket: ${R2_BUCKET}...`);
        const data = await client.send(new ListObjectsV2Command({
            Bucket: R2_BUCKET,
        }));
        
        if (!data.Contents || data.Contents.length === 0) {
            console.log("R2 bucket is empty! No files found.");
        } else {
            console.log(`Found ${data.Contents.length} files in R2:`);
            for (const file of data.Contents) {
                console.log(`  - Key: ${file.Key} (${file.Size} bytes)`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error("Error listing R2 bucket:", e.message);
        process.exit(1);
    }
}

checkR2();
