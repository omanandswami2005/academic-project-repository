const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { createCategory, getCategories, deleteCategory } = require('../controllers/category.controller');

// Get all categories (any authenticated user)
router.get('/', authenticate, getCategories);

// Create category (teacher/admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), createCategory);

// Delete category (teacher/admin only)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), deleteCategory);

module.exports = router;
