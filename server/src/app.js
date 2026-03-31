const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const studentRoutes = require('./routes/student.routes');
const userRoutes = require('./routes/user.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const notificationRoutes = require('./routes/notification.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const fileRoutes = require('./routes/file.routes');

const app = express();

// ─── Request Logging ───
app.use(requestLogger);

// ─── Security Middleware ───
app.use(helmet());

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        logger.warn('CORS', `Blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 100 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again later.' },
});

// File upload rate limit
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many upload requests, please try again later.' },
});

// Body parsing (JSON only, multipart handled by custom middleware)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── Health Check ───
app.get('/health', (req, res) => {
    logger.info('HEALTH', 'Health check ping');
    res.status(200).json({
        status: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// ─── Routes ───
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/files', uploadLimiter, fileRoutes);

// ─── 404 Handler ───
app.use((req, res) => {
    logger.warn('ROUTER', `Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found.' });
});

// ─── Error Handler ───
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        logger.warn('CORS', `Policy violation — ${req.method} ${req.originalUrl}`);
        return res.status(403).json({ message: 'CORS policy violation.' });
    }
    logger.error('SERVER', `Unhandled error on ${req.method} ${req.originalUrl}`, err);
    res.status(500).json({ message: 'Internal Server Error.' });
});

module.exports = app;
