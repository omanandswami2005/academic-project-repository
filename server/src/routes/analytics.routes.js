const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getSkillRadar, getDepartmentStats, getTopStudents, getProjectStatusDistribution, getMonthlyProjectTrend, getStudentAnalyticsSummary } = require('../controllers/analytics.controller');

router.get('/skills/:userId', authenticate, getSkillRadar);
router.get('/department/:branch', authenticate, getDepartmentStats);
router.get('/top-students', authenticate, getTopStudents);
router.get('/status-distribution', authenticate, getProjectStatusDistribution);
router.get('/monthly-trend', authenticate, getMonthlyProjectTrend);
router.get('/student-summary/:userId', authenticate, getStudentAnalyticsSummary);

module.exports = router;
