const express = require('express');
const router = express.Router();
const { getPortfolio } = require('../controllers/project.controller');

// Public portfolio endpoint — no auth required
router.get('/:userId', getPortfolio);

module.exports = router;
