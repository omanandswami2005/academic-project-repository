const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { parseMultipartFiles } = require('../middleware/upload');
const {
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
    updatePhaseSchema,
    updatePhasesSchema,
} = require('../validators/schemas');
const {
    createProject,
    getAllProjects,
    getProjectsByStudent,
    getProjectById,
    updateProject,
    deleteProject,
    updateProjectStatus,
    updateProjectPhase,
    updateProjectPhases,
    searchProjects,
} = require('../controllers/project.controller');

// Search must come before :id to avoid conflict
router.get('/search', authenticate, searchProjects);

router.post('/', authenticate, authorize('student'), parseMultipartFiles, createProject);
router.get('/', authenticate, getAllProjects);
router.get('/student/:studentId', authenticate, getProjectsByStudent);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id', authenticate, validate({ body: updateProjectSchema }), updateProject);
router.delete('/:id', authenticate, deleteProject);
router.patch('/:id/status', authenticate, authorize('teacher', 'admin'), validate({ body: updateProjectStatusSchema }), updateProjectStatus);
router.patch('/:id/phase', authenticate, validate({ body: updatePhaseSchema }), updateProjectPhase);
router.patch('/:id/phases', authenticate, validate({ body: updatePhasesSchema }), updateProjectPhases);

module.exports = router;
