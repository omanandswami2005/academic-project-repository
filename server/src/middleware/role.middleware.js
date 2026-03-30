/**
 * Middleware factory for role-based access control.
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
            });
        }

        next();
    };
}

module.exports = { authorize };
