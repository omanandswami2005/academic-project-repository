const { eq } = require('drizzle-orm');
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

        logger.info('USER', `Received update: username=${username}, mobile=${mobile}, bio="${bio}", skills=${JSON.stringify(skills)}, year=${year}, prn=${prn}`);

        const updateData = { updatedAt: new Date() };
        if (username) updateData.username = username;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (bio !== undefined) updateData.bio = bio;
        if (skills !== undefined) updateData.skills = skills;
        if (year !== undefined) updateData.year = year;
        if (prn !== undefined) updateData.prn = prn;

        logger.info('USER', `Update data to be saved: ${JSON.stringify(updateData)}`);

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

        logger.info('USER', `Updated user bio in DB: "${updated.bio}"`);
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

module.exports = { getProfile, updateProfile, getUserById };
