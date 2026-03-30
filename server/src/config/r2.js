const { S3Client } = require('@aws-sdk/client-s3');

let r2Client = null;

function getR2Client() {
    if (!r2Client) {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

        if (!accountId || !accessKeyId || !secretAccessKey) {
            console.warn('⚠️  R2 credentials not configured. File uploads will be disabled.');
            return null;
        }

        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return r2Client;
}

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'aprs-uploads';

module.exports = { getR2Client, R2_BUCKET };
