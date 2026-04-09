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
    forkProject,
    inviteMember,
    respondToInvite,
    getMyInvitations,
    requestMentor,
    respondMentorRequest,
    setPhaseDeadlines,
    getOverduePhases,
    createPhase,
    renamePhase,
    deletePhase,
    uploadPhaseFile,
} = require('../controllers/project.controller');

// Search must come before :id to avoid conflict
router.get('/search', authenticate, searchProjects);

// FR15: Overdue phases
router.get('/overdue', authenticate, getOverduePhases);

// FR7: Group invitations
router.get('/invitations/me', authenticate, getMyInvitations);
router.patch('/invitations/:id', authenticate, respondToInvite);

router.post('/', authenticate, authorize('student'), parseMultipartFiles, createProject);
router.get('/', authenticate, getAllProjects);
router.get('/student/:studentId', authenticate, getProjectsByStudent);
router.get('/:id', authenticate, getProjectById);
router.patch('/:id', authenticate, validate({ body: updateProjectSchema }), updateProject);
router.delete('/:id', authenticate, deleteProject);
router.patch('/:id/status', authenticate, authorize('teacher', 'admin'), validate({ body: updateProjectStatusSchema }), updateProjectStatus);
router.patch('/:id/phase', authenticate, validate({ body: updatePhaseSchema }), updateProjectPhase);
router.patch('/:id/phases', authenticate, validate({ body: updatePhasesSchema }), updateProjectPhases);

// FR3/33: Fork
router.post('/:id/fork', authenticate, authorize('student'), forkProject);

// FR7: Invite member
router.post('/:id/invite', authenticate, authorize('student'), inviteMember);

// FR9: Mentor request / respond
router.patch('/:id/mentor', authenticate, authorize('student'), requestMentor);
router.patch('/:id/mentor/respond', authenticate, authorize('teacher'), respondMentorRequest);

// FR13: Teacher-set deadlines
router.patch('/:id/deadlines', authenticate, authorize('teacher', 'admin'), setPhaseDeadlines);

// Custom phase CRUD
router.post('/:id/phases/custom', authenticate, authorize('student'), createPhase);
router.patch('/:id/phases/:phaseId/rename', authenticate, authorize('student'), renamePhase);
router.delete('/:id/phases/:phaseId', authenticate, authorize('student'), deletePhase);

// Phase file upload (student owner or teacher mentor)
router.post('/:id/phases/:phaseId/files', authenticate, parseMultipartFiles, uploadPhaseFile);

module.exports = router;
