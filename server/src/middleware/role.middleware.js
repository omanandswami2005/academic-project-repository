const logger = require('../utils/logger');

/**
 * Middleware factory for role-based access control.
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            logger.warn('AUTH', `Authorization failed — no authenticated user on ${req.method} ${req.originalUrl}`);
            return res.status(401).json({ message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('AUTH', `Access denied for ${req.user.email} (${req.user.role}) — required: ${allowedRoles.join(' or ')}`, req.originalUrl);
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
            });
        }

        next();
    };
}

module.exports = { authorize };
