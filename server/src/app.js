const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const studentRoutes = require('./routes/student.routes');

// Import middleware
const { uploadsDir } = require('./middleware/upload');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// --------------- Health Check ---------------
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'Server is running',
        database: dbStatus,
        timestamp: new Date().toISOString(),
    });
});

// --------------- Routes ---------------
app.use('/', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/students', studentRoutes);

module.exports = app;
