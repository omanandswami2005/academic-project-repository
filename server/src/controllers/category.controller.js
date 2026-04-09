const { eq, and, desc, ilike } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { projectCategories, users } = require('../db/schema');
const logger = require('../utils/logger');

/**
 * POST /api/categories
 * Teacher creates a new project category.
 */
const createCategory = async (req, res) => {
    try {
        const db = getDB();
        const { name, branch } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required.' });
        }
        if (name.trim().length > 100) {
            return res.status(400).json({ message: 'Category name must be 100 characters or less.' });
        }

        // Check for duplicate in same branch
        const existing = await db.select().from(projectCategories)
            .where(and(
                ilike(projectCategories.name, name.trim()),
                branch ? eq(projectCategories.branch, branch) : undefined
            )).limit(1);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'A category with this name already exists for this branch.' });
        }

        const [category] = await db.insert(projectCategories).values({
            name: name.trim(),
            branch: branch || null,
            createdBy: req.user.id,
        }).returning();

        logger.success('CATEGORY', `Created category "${name}" by user=${req.user.id}`);
        res.status(201).json({ message: 'Category created.', category });
    } catch (error) {
        logger.error('CATEGORY', 'Create category failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/categories
 * Get all categories, optionally filtered by branch.
 */
const getCategories = async (req, res) => {
    try {
        const db = getDB();
        const { branch } = req.query;

        let conditions = [];
        if (branch) {
            conditions.push(eq(projectCategories.branch, branch));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const categories = await db.select({
            id: projectCategories.id,
            name: projectCategories.name,
            branch: projectCategories.branch,
            createdBy: projectCategories.createdBy,
            creatorName: users.username,
            createdAt: projectCategories.createdAt,
        })
            .from(projectCategories)
            .leftJoin(users, eq(projectCategories.createdBy, users.id))
            .where(whereClause)
            .orderBy(desc(projectCategories.createdAt));

        res.status(200).json({ categories });
    } catch (error) {
        logger.error('CATEGORY', 'Get categories failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * DELETE /api/categories/:id
 * Teacher deletes a category they created.
 */
const deleteCategory = async (req, res) => {
    try {
        const db = getDB();
        const categoryId = parseInt(req.params.id);

        const [category] = await db.select().from(projectCategories)
            .where(eq(projectCategories.id, categoryId)).limit(1);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        // Only the creator or admin can delete
        if (req.user.role !== 'admin' && category.createdBy !== req.user.id) {
            return res.status(403).json({ message: 'Only the creator can delete this category.' });
        }

        await db.delete(projectCategories).where(eq(projectCategories.id, categoryId));

        logger.success('CATEGORY', `Deleted category id=${categoryId} by user=${req.user.id}`);
        res.status(200).json({ message: 'Category deleted.' });
    } catch (error) {
        logger.error('CATEGORY', 'Delete category failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = {
    createCategory,
    getCategories,
    deleteCategory,
};
