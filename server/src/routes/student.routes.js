const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const { getStudentsByBranch, getAllStudents } = require('../controllers/student.controller');

router.get('/', checkDBConnection, getAllStudents);
router.get('/branch/:branch', checkDBConnection, getStudentsByBranch);

module.exports = router;
