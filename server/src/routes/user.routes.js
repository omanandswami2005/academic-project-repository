const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateProfileSchema } = require('../validators/schemas');
const { getProfile, updateProfile, getUserById } = require('../controllers/user.controller');

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, validate({ body: updateProfileSchema }), updateProfile);
router.get('/:id', authenticate, authorize('teacher', 'admin', 'expert'), getUserById);

module.exports = router;
