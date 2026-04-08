const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { getDepartmentReport, getStudentReport } = require('../controllers/project.controller');

router.get('/department/:branch', authenticate, authorize('teacher', 'admin'), getDepartmentReport);
router.get('/student/:id', authenticate, authorize('teacher', 'admin'), getStudentReport);

module.exports = router;
