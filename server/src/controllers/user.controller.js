const { eq, ilike, or } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { users } = require('../db/schema');
const logger = require('../utils/logger');

/**
 * GET /api/users/me
 */
const getProfile = async (req, res) => {
    try {
        const db = getDB();
        const [user] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
            prn: users.prn,
            mobile: users.mobile,
            bio: users.bio,
            year: users.year,
            skills: users.skills,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.id, req.user.id))
            .limit(1);

        if (!user) {
            logger.warn('USER', `Profile not found for id=${req.user.id}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        logger.error('USER', 'Get profile failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/users/me
 */
const updateProfile = async (req, res) => {
    try {
        const db = getDB();
        const { username, mobile, bio, skills, year, prn } = req.body;


        const updateData = { updatedAt: new Date() };
        if (username) updateData.username = username;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (bio !== undefined) updateData.bio = bio;
        if (skills !== undefined) updateData.skills = skills;
        if (year !== undefined) updateData.year = year;
        if (prn !== undefined) updateData.prn = prn;


        const [updated] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, req.user.id))
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                role: users.role,
                branch: users.branch,
                prn: users.prn,
                mobile: users.mobile,
                bio: users.bio,
                year: users.year,
                skills: users.skills,
                avatarUrl: users.avatarUrl,
            });

        logger.success('USER', `Profile updated for id=${req.user.id}`);
        res.status(200).json({
            message: 'Profile updated successfully',
            user: updated,
        });
    } catch (error) {
        logger.error('USER', 'Profile update failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const db = getDB();
        const userId = parseInt(req.params.id);

        const [user] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
            prn: users.prn,
            year: users.year,
            skills: users.skills,
            avatarUrl: users.avatarUrl,
        })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            logger.warn('USER', `User not found for id=${userId}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        logger.error('USER', `Get user by id failed for id=${req.params.id}`, error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/users/search
 */
const searchUsers = async (req, res) => {
    try {
        const db = getDB();
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Query parameter q is required.' });
        }

        const searchTerm = `%${q}%`;

        const result = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
        })
        .from(users)
        .where(
            or(
                ilike(users.username, searchTerm),
                ilike(users.email, searchTerm)
            )
        )
        .limit(20);

        res.status(200).json({ users: result });
    } catch (error) {
        logger.error('USER', 'Search users failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getProfile, updateProfile, getUserById, searchUsers };
