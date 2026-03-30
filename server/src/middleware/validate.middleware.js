const { ZodError } = require('zod');

/**
 * Middleware factory for request validation using Zod schemas.
 * @param {Object} schemas - { body?, params?, query? } Zod schemas
 */
function validate(schemas) {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.query = schemas.query.parse(req.query);
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return res.status(400).json({
                    message: 'Validation failed.',
                    errors,
                });
            }
            next(err);
        }
    };
}

module.exports = { validate };
