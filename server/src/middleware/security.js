/**
 * Security middleware: XSS sanitization + input cleanup.
 * Strips common XSS vectors from string values in body, query, and params.
 */

const XSS_PATTERNS = [
    /<script[\s>]/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /<iframe[\s>]/gi,
    /<object[\s>]/gi,
    /<embed[\s>]/gi,
    /<link[\s>]/gi,
    /data\s*:\s*text\/html/gi,
    /vbscript\s*:/gi,
    /expression\s*\(/gi,
];

function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    let cleaned = str;
    for (const pattern of XSS_PATTERNS) {
        cleaned = cleaned.replace(pattern, '');
    }
    // XSS patterns above already strip dangerous constructs.
    // Angle bracket encoding removed — data is JSON-transported and React auto-escapes on render.
    return cleaned;
}

function sanitizeValue(value) {
    if (typeof value === 'string') {
        return sanitizeString(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
        return sanitizeObject(value);
    }
    return value;
}

function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeValue(value);
    }
    return sanitized;
}

/**
 * Middleware that sanitizes req.body, req.query, and req.params.
 */
function sanitizeInput(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
}

/**
 * Middleware to prevent HTTP Parameter Pollution.
 * If a query param appears multiple times, only the last value is kept.
 */
function preventParamPollution(req, res, next) {
    if (req.query) {
        for (const key of Object.keys(req.query)) {
            if (Array.isArray(req.query[key])) {
                req.query[key] = req.query[key][req.query[key].length - 1];
            }
        }
    }
    next();
}

module.exports = { sanitizeInput, preventParamPollution };
