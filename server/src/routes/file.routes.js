const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { parseMultipartFiles } = require('../middleware/upload');
const { uploadFile, getFileUrl, getFileUrlById, deleteFile } = require('../controllers/file.controller');

router.post('/upload', authenticate, parseMultipartFiles, uploadFile);
router.get('/by-id/:fileId', authenticate, getFileUrlById);
router.get('/:key', authenticate, getFileUrl);
router.delete('/:key', authenticate, deleteFile);

module.exports = router;
