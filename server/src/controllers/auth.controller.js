const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendResetEmail } = require('../utils/email');

/**
 * POST /signup
 * Register a new user.
 */
const signup = async (req, res) => {
    try {
        const { username, email, password, role, branch } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            branch: branch || null,
        });

        await newUser.save();

        res.status(201).json({
            message: 'Account created successfully!',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                branch: newUser.branch,
            },
        });
    } catch (error) {
        console.error('Signup Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * POST /login
 * Authenticate a user.
 */
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found. Please check your Email/ID.' });
        }

        if (role && user.role !== role) {
            return res.status(403).json({
                message: `Access denied. This account is registered as ${user.role}, not ${role}.`,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect Password. Please try again.' });
        }

        res.status(200).json({
            message: 'Login Successful!',
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Is MongoDB running?' });
    }
};

/**
 * POST /update-password
 * Update password for an authenticated user.
 */
const updatePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Update Password Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * POST /forgot-password
 * Send a password reset email.
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent.',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const result = await sendResetEmail(user, resetToken);
        if (!result.success) {
            console.error('Email send failed:', result.error);
        }

        res.status(200).json({
            message: 'If an account with that email exists, a password reset link has been sent.',
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * POST /reset-password/:token
 * Reset password using a token from email.
 */
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Please provide a new password.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully!' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

module.exports = { signup, login, updatePassword, forgotPassword, resetPassword };
