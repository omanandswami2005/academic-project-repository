const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { getR2Client, R2_BUCKET } = require('../config/r2');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
];

/**
 * Upload a buffer to Cloudflare R2.
 */
async function uploadToR2(buffer, originalName, mimeType) {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage is not configured.');
    }

    const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
    const key = `projects/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

    await client.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    }));

    return { key, filename: originalName, fileType: mimeType, fileSize: buffer.length };
}

/**
 * Get a presigned download URL for a file in R2.
 */
async function getDownloadUrl(key, expiresInSeconds = 3600) {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage is not configured.');
    }

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    });

    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from R2.
 */
async function deleteFromR2(key) {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage is not configured.');
    }

    await client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
    }));
}

/**
 * Express middleware to handle multipart file uploads.
 * Parses raw body buffers. Files are stored in req.parsedFiles[].
 */
function parseMultipartFiles(req, res, next) {
    // If content-type is not multipart, skip
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
        return next();
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
        return res.status(400).json({ message: 'Invalid multipart request.' });
    }

    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_FILE_SIZE * MAX_FILES) {
            req.destroy();
            return res.status(400).json({ message: 'Total upload size exceeds limit.' });
        }
        chunks.push(chunk);
    });

    req.on('end', () => {
        try {
            const rawBody = Buffer.concat(chunks);
            const { fields, files } = parseMultipart(rawBody, boundary);

            // Merge fields into req.body
            req.body = { ...req.body, ...fields };
            req.parsedFiles = files;
            next();
        } catch (err) {
            return res.status(400).json({ message: `Upload parsing error: ${err.message}` });
        }
    });

    req.on('error', (err) => {
        return res.status(400).json({ message: `Upload error: ${err.message}` });
    });
}

/**
 * Parse multipart/form-data from buffer.
 */
function parseMultipart(buffer, boundary) {
    const fields = {};
    const files = [];
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = splitBuffer(buffer, boundaryBuffer);

    for (const part of parts) {
        const headerEnd = bufferIndexOf(part, Buffer.from('\r\n\r\n'));
        if (headerEnd === -1) continue;

        const headerStr = part.subarray(0, headerEnd).toString('utf-8');
        const body = part.subarray(headerEnd + 4);
        // Remove trailing \r\n
        const cleanBody = body.length >= 2 && body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a
            ? body.subarray(0, body.length - 2)
            : body;

        const nameMatch = headerStr.match(/name="([^"]+)"/);
        const filenameMatch = headerStr.match(/filename="([^"]+)"/);
        const contentTypeMatch = headerStr.match(/Content-Type:\s*(.+)/i);

        if (!nameMatch) continue;

        if (filenameMatch && filenameMatch[1]) {
            const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

            if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
                throw new Error(`File type '${mimeType}' is not allowed.`);
            }
            if (cleanBody.length > MAX_FILE_SIZE) {
                throw new Error(`File '${filenameMatch[1]}' exceeds the 50MB size limit.`);
            }

            files.push({
                fieldName: nameMatch[1],
                originalName: filenameMatch[1],
                mimeType,
                buffer: cleanBody,
                size: cleanBody.length,
            });
        } else {
            fields[nameMatch[1]] = cleanBody.toString('utf-8');
        }
    }

    if (files.length > MAX_FILES) {
        throw new Error(`Too many files. Maximum is ${MAX_FILES}.`);
    }

    return { fields, files };
}

function splitBuffer(buffer, delimiter) {
    const parts = [];
    let start = 0;
    while (true) {
        const idx = bufferIndexOf(buffer, delimiter, start);
        if (idx === -1) {
            if (start < buffer.length) parts.push(buffer.subarray(start));
            break;
        }
        if (idx > start) parts.push(buffer.subarray(start, idx));
        start = idx + delimiter.length;
    }
    return parts;
}

function bufferIndexOf(buffer, search, fromIndex = 0) {
    for (let i = fromIndex; i <= buffer.length - search.length; i++) {
        let found = true;
        for (let j = 0; j < search.length; j++) {
            if (buffer[i + j] !== search[j]) {
                found = false;
                break;
            }
        }
        if (found) return i;
    }
    return -1;
}

module.exports = {
    uploadToR2,
    getDownloadUrl,
    deleteFromR2,
    parseMultipartFiles,
    MAX_FILE_SIZE,
    MAX_FILES,
    ALLOWED_MIME_TYPES,
};
