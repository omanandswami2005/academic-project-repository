const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getSkillRadar, getDepartmentStats, getTopStudents } = require('../controllers/analytics.controller');

router.get('/skills/:userId', authenticate, getSkillRadar);
router.get('/department/:branch', authenticate, getDepartmentStats);
router.get('/top-students', authenticate, getTopStudents);

module.exports = router;
