const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { eq, and, gt } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { users, refreshTokens } = require('../db/schema');
const { sendResetEmail } = require('../utils/email');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../middleware/auth.middleware');
const logger = require('../utils/logger');

/**
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        const db = getDB();
        const { username, email, password, role, branch, prn, mobile, year } = req.body;

        const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existing.length > 0) {
            logger.warn('AUTH', `Signup rejected — email already exists: ${email}`);
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        if (prn) {
            const existingPrn = await db.select({ id: users.id }).from(users).where(eq(users.prn, prn)).limit(1);
            if (existingPrn.length > 0) {
                logger.warn('AUTH', `Signup rejected — PRN already exists: ${prn}`);
                return res.status(400).json({ message: 'User with this PRN already exists.' });
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [newUser] = await db.insert(users).values({
            username,
            email,
            passwordHash,
            role: role || 'student',
            branch: branch || null,
            prn: prn || null,
            mobile: mobile || null,
            bio: '',
            year: year || null,
        }).returning({
            id: users.id,
            username: users.username,
            email: users.email,
            role: users.role,
            branch: users.branch,
        });

        logger.auth(`New user registered: ${newUser.email} (${newUser.role})`, `id=${newUser.id}`);
        res.status(201).json({
            message: 'Account created successfully!',
            user: newUser,
        });
    } catch (error) {
        logger.error('AUTH', 'Signup failed', error);
        if (error.code === '23505') {
            if (error.detail && error.detail.includes('prn')) {
                return res.status(400).json({ message: 'User with this PRN already exists.' });
            }
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const db = getDB();
        const { email, password, role } = req.body;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            logger.warn('AUTH', `Login failed — user not found: ${email}`);
            return res.status(400).json({ message: 'User not found. Please check your email.' });
        }

        if (role && user.role !== role) {
            logger.warn('AUTH', `Login denied — role mismatch for ${email}: expected ${role}, got ${user.role}`);
            return res.status(403).json({
                message: `Access denied. This account is registered as ${user.role}, not ${role}.`,
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            logger.warn('AUTH', `Login failed — wrong password for ${email}`);
            return res.status(400).json({ message: 'Incorrect password. Please try again.' });
        }

        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshTokenValue = generateRefreshToken(tokenPayload);

        // Store hashed refresh token
        const tokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');
        await db.insert(refreshTokens).values({
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        logger.auth(`User logged in: ${user.email} (${user.role})`, `id=${user.id}`);
        res.status(200).json({
            message: 'Login Successful!',
            accessToken,
            refreshToken: refreshTokenValue,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                branch: user.branch,
            },
        });
    } catch (error) {
        logger.error('AUTH', 'Login failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
    try {
        const db = getDB();
        const { refreshToken: tokenValue } = req.body;

        let decoded;
        try {
            decoded = verifyRefreshToken(tokenValue);
        } catch (err) {
            logger.warn('AUTH', `Refresh token invalid or expired — ${err.message}`);
            return res.status(401).json({ message: 'Invalid or expired refresh token.' });
        }

        const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
        const [stored] = await db.select()
            .from(refreshTokens)
            .where(and(
                eq(refreshTokens.tokenHash, tokenHash),
                gt(refreshTokens.expiresAt, new Date())
            ))
            .limit(1);

        if (!stored) {
            logger.warn('AUTH', `Refresh token not found in DB for user id=${decoded.id}`);
            return res.status(401).json({ message: 'Refresh token not found or expired.' });
        }

        // Delete old token
        await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));

        // Issue new tokens
        const tokenPayload = { id: decoded.id, email: decoded.email, role: decoded.role };
        const newAccessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        await db.insert(refreshTokens).values({
            userId: decoded.id,
            tokenHash: newTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        logger.auth(`Tokens refreshed for user id=${decoded.id}`);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        logger.error('AUTH', 'Token refresh failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const db = getDB();
        const { refreshToken: tokenValue } = req.body;

        if (tokenValue) {
            const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
            await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
        }

        logger.auth(`User logged out`, req.user ? `id=${req.user.id}` : 'anonymous');
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        logger.error('AUTH', 'Logout failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/auth/update-password
 */
const updatePassword = async (req, res) => {
    try {
        const db = getDB();
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            logger.warn('AUTH', `Password update rejected — wrong current password for id=${userId}`);
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

        // Invalidate all refresh tokens for this user
        await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));

        logger.auth(`Password updated for user id=${userId}`);
        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        logger.error('AUTH', 'Password update failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
    try {
        const db = getDB();
        const { email } = req.body;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            // Return same response to prevent email enumeration
            return res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await db.update(users).set({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
            updatedAt: new Date(),
        }).where(eq(users.id, user.id));

        const result = await sendResetEmail({ username: user.username, email: user.email }, resetToken);
        if (!result.success) {
            logger.error('MAIL', `Password reset email failed for ${user.email}`, result.error);
        } else {
            logger.mail(`Password reset email sent to ${user.email}`);
        }

        res.status(200).json({
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        logger.error('AUTH', 'Forgot password request failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * POST /api/auth/reset-password/:token
 */
const resetPassword = async (req, res) => {
    try {
        const db = getDB();
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const [user] = await db.select()
            .from(users)
            .where(and(
                eq(users.resetPasswordToken, hashedToken),
                gt(users.resetPasswordExpires, new Date())
            ))
            .limit(1);

        if (!user) {
            logger.warn('AUTH', 'Password reset attempted with invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.update(users).set({
            passwordHash,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id));

        // Invalidate all refresh tokens
        await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.id));

        logger.auth(`Password reset successful for user id=${user.id}`);
        res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (error) {
        logger.error('AUTH', 'Password reset failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { signup, login, refresh, logout, updatePassword, forgotPassword, resetPassword };
