const mongoose = require('mongoose');

/**
 * Middleware to check if MongoDB is connected before processing requests.
 */
const checkDBConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database not connected. Please ensure MongoDB is running on port 27017.',
        });
    }
    next();
};

module.exports = checkDBConnection;
