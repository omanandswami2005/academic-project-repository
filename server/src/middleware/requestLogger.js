const logger = require('../utils/logger');

/**
 * HTTP request/response logging middleware.
 * Logs every incoming request and its completed response with timing and user info.
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    // Log incoming request
    const user = req.user ? `${req.user.email} (${req.user.role})` : null;

    // Override res.end to capture the response status after it's written
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
        const ms = Date.now() - start;
        logger.http(req.method, req.originalUrl, res.statusCode, ms, user);
        return originalEnd(...args);
    };

    next();
}

module.exports = requestLogger;
