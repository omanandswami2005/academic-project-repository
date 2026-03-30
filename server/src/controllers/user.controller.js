const { eq } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { users } = require('../db/schema');

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
            year: users.year,
            skills: users.skills,
            avatarUrl: users.avatarUrl,
            createdAt: users.createdAt,
        })
            .from(users)
            .where(eq(users.id, req.user.id))
            .limit(1);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/users/me
 */
const updateProfile = async (req, res) => {
    try {
        const db = getDB();
        const { username, mobile, skills, year, prn } = req.body;

        const updateData = { updatedAt: new Date() };
        if (username) updateData.username = username;
        if (mobile !== undefined) updateData.mobile = mobile;
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
                year: users.year,
                skills: users.skills,
                avatarUrl: users.avatarUrl,
            });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updated,
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
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
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get User Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getProfile, updateProfile, getUserById };
