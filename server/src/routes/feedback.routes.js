const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createFeedbackSchema } = require('../validators/schemas');
const { createFeedback, getFeedbackByProject } = require('../controllers/feedback.controller');

router.post('/', authenticate, authorize('teacher', 'admin', 'expert'), validate({ body: createFeedbackSchema }), createFeedback);
router.get('/project/:projectId', authenticate, getFeedbackByProject);

module.exports = router;
