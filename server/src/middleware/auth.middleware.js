const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('AUTH', `Missing or malformed token — ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ message: 'Authentication required. Please provide a valid token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyAccessToken(token);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        logger.debug('AUTH', `Token verified for ${decoded.email} (${decoded.role})`);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            logger.warn('AUTH', `Expired token used by — ${req.originalUrl}`);
            return res.status(401).json({ message: 'Token expired. Please refresh your token.' });
        }
        logger.warn('AUTH', `Invalid token on ${req.method} ${req.originalUrl} — ${err.message}`);
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

module.exports = {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    authenticate,
};
