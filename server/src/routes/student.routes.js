const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { getStudentsByBranch, getAllStudents, getStudentSkills } = require('../controllers/student.controller');

router.get('/', authenticate, authorize('teacher', 'admin', 'expert'), getAllStudents);
router.get('/branch/:branch', authenticate, authorize('teacher', 'admin'), getStudentsByBranch);
router.get('/:id/skills', authenticate, getStudentSkills);

module.exports = router;
