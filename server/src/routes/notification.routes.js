const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');

router.get('/', authenticate, getNotifications);
router.patch('/read-all', authenticate, markAllAsRead);
router.patch('/:id/read', authenticate, markAsRead);

module.exports = router;
