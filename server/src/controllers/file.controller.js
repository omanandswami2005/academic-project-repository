const { eq } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { projectFiles, projects } = require('../db/schema');
const { uploadToR2, getDownloadUrl, deleteFromR2 } = require('../middleware/upload');
const logger = require('../utils/logger');

/**
 * POST /api/files/upload
 */
const uploadFile = async (req, res) => {
    try {
        const db = getDB();
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        const pid = parseInt(projectId);
        const [project] = await db.select().from(projects).where(eq(projects.id, pid)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (req.user.role === 'student' && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only upload files to your own projects.' });
        }

        if (!req.parsedFiles || req.parsedFiles.length === 0) {
            return res.status(400).json({ message: 'No files provided.' });
        }

        const uploaded = [];
        for (const file of req.parsedFiles) {
            const result = await uploadToR2(file.buffer, file.originalName, file.mimeType);
            const [fileRecord] = await db.insert(projectFiles).values({
                projectId: pid,
                filename: result.key.split('/').pop(),
                originalName: file.originalName,
                r2Key: result.key,
                fileSize: file.size,
                fileType: file.mimeType,
            }).returning();
            uploaded.push(fileRecord);
        }

        logger.file(`${uploaded.length} file(s) uploaded to project id=${pid}`, `user=${req.user.id}`);
        res.status(201).json({
            message: 'Files uploaded successfully',
            files: uploaded,
        });
    } catch (error) {
        logger.error('FILE', 'Upload failed', error);
        res.status(500).json({ message: error.message || 'Internal Server Error.' });
    }
};

/**
 * GET /api/files/:key
 */
const getFileUrl = async (req, res) => {
    try {
        const db = getDB();
        const r2Key = req.params.key;

        // Find file record by matching key (use last part of key as lookup)
        const [file] = await db.select()
            .from(projectFiles)
            .where(eq(projectFiles.r2Key, `projects/${r2Key}`))
            .limit(1);

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        const url = await getDownloadUrl(file.r2Key);

        res.status(200).json({
            message: 'Download URL generated',
            url,
            file: {
                originalName: file.originalName,
                fileSize: file.fileSize,
                fileType: file.fileType,
            },
        });
    } catch (error) {
        logger.error('FILE', `Get download URL failed for key=${req.params.key}`, error);
        res.status(500).json({ message: error.message || 'Internal Server Error.' });
    }
};

/**
 * DELETE /api/files/:key
 */
const deleteFile = async (req, res) => {
    try {
        const db = getDB();
        const r2Key = req.params.key;
        const fullKey = `projects/${r2Key}`;

        const [file] = await db.select()
            .from(projectFiles)
            .where(eq(projectFiles.r2Key, fullKey))
            .limit(1);

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        // Check ownership
        const [project] = await db.select().from(projects).where(eq(projects.id, file.projectId)).limit(1);
        if (req.user.role === 'student' && project && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own files.' });
        }

        await deleteFromR2(fullKey);
        await db.delete(projectFiles).where(eq(projectFiles.id, file.id));

        logger.file(`File deleted: ${r2Key}`, `user=${req.user.id}`);
        res.status(200).json({ message: 'File deleted successfully.' });
    } catch (error) {
        logger.error('FILE', `Delete failed for key=${req.params.key}`, error);
        res.status(500).json({ message: error.message || 'Internal Server Error.' });
    }
};

module.exports = { uploadFile, getFileUrl, deleteFile };
