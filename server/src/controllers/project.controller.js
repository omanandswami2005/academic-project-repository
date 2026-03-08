const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');

/**
 * POST /api/projects
 * Upload a new project.
 */
const createProject = async (req, res) => {
    try {
        const { studentId, studentName, studentEmail, projectName, description } = req.body;

        console.log('Project Upload Request:', {
            studentId,
            studentName,
            studentEmail,
            projectName,
            description,
            filesCount: req.files ? req.files.length : 0,
        });

        if (!studentId || !studentName || !studentEmail || !projectName || !description) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        const user = await User.findById(studentId);
        if (!user) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const files =
            req.files && Array.isArray(req.files) && req.files.length > 0
                ? req.files.map((file) => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    filePath: `/uploads/${file.filename}`,
                    fileSize: file.size,
                    fileType: file.mimetype,
                }))
                : [];

        const newProject = new Project({
            studentId: mongoose.Types.ObjectId.isValid(studentId)
                ? studentId
                : new mongoose.Types.ObjectId(studentId),
            studentName,
            studentEmail,
            projectName,
            description,
            files,
            status: 'pending',
        });

        await newProject.save();

        res.status(201).json({
            message: 'Project uploaded successfully!',
            project: newProject,
        });
    } catch (error) {
        console.error('Project Upload Error:', error);

        let errorMessage = 'Internal Server Error. Please try again.';
        if (error.name === 'ValidationError') {
            errorMessage = `Validation Error: ${error.message}`;
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid student ID format.';
        } else if (error.code === 11000) {
            errorMessage = 'Project with this name already exists.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * GET /api/projects
 * Get all projects (for teachers).
 */
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('studentId', 'username email')
            .sort({ uploadedAt: -1 });

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects,
        });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * GET /api/projects/student/:studentId
 * Get all projects for a specific student.
 */
const getProjectsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const projects = await Project.find({ studentId }).sort({ uploadedAt: -1 });

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects,
        });
    } catch (error) {
        console.error('Get Student Projects Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * GET /api/projects/:projectId
 * Get a single project by ID.
 */
const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate('studentId', 'username email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            message: 'Project retrieved successfully',
            project,
        });
    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * PATCH /api/projects/:projectId/status
 * Update project status (for teachers).
 */
const updateProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'under_review', 'approved', 'needs_revision'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const project = await Project.findByIdAndUpdate(
            projectId,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            message: 'Project status updated successfully',
            project,
        });
    } catch (error) {
        console.error('Update Project Status Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * PATCH /api/projects/:projectId/phase
 * Update a single project phase.
 */
const updateProjectPhase = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { phase, completed, description } = req.body;

        const validPhases = [
            'phase1_idea',
            'phase2_research_paper',
            'phase3_building_prototype',
            'phase4_completing_prototype',
            'phase5_completing_model',
            'phase6_final_submission',
        ];

        if (!phase || !validPhases.includes(phase)) {
            return res.status(400).json({
                message: `Invalid phase. Must be one of: ${validPhases.join(', ')}`,
            });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        project.phases[phase].completed =
            completed !== undefined ? completed : project.phases[phase].completed;
        if (completed) {
            project.phases[phase].completedAt = new Date();
        }
        if (description !== undefined) {
            project.phases[phase].description = description;
        }

        await project.save();

        res.status(200).json({
            message: 'Project phase updated successfully',
            project,
        });
    } catch (error) {
        console.error('Update Project Phase Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * PATCH /api/projects/:projectId/phases
 * Update multiple project phases at once.
 */
const updateProjectPhases = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { phases } = req.body;

        if (!phases || typeof phases !== 'object') {
            return res.status(400).json({ message: 'Invalid phases data.' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        Object.keys(phases).forEach((phaseKey) => {
            if (project.phases[phaseKey]) {
                if (phases[phaseKey].completed !== undefined) {
                    project.phases[phaseKey].completed = phases[phaseKey].completed;
                    if (phases[phaseKey].completed) {
                        project.phases[phaseKey].completedAt = new Date();
                    }
                }
                if (phases[phaseKey].description !== undefined) {
                    project.phases[phaseKey].description = phases[phaseKey].description;
                }
            }
        });

        await project.save();

        res.status(200).json({
            message: 'Project phases updated successfully',
            project,
        });
    } catch (error) {
        console.error('Update Project Phases Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectsByStudent,
    getProjectById,
    updateProjectStatus,
    updateProjectPhase,
    updateProjectPhases,
};
