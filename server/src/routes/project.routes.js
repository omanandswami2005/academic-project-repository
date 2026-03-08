const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const { multerUpload } = require('../middleware/upload');
const {
    createProject,
    getAllProjects,
    getProjectsByStudent,
    getProjectById,
    updateProjectStatus,
    updateProjectPhase,
    updateProjectPhases,
} = require('../controllers/project.controller');

router.post('/', checkDBConnection, multerUpload, createProject);
router.get('/', checkDBConnection, getAllProjects);
router.get('/student/:studentId', checkDBConnection, getProjectsByStudent);
router.get('/:projectId', checkDBConnection, getProjectById);
router.patch('/:projectId/status', checkDBConnection, updateProjectStatus);
router.patch('/:projectId/phase', checkDBConnection, updateProjectPhase);
router.patch('/:projectId/phases', checkDBConnection, updateProjectPhases);

module.exports = router;
