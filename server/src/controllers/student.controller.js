const User = require('../models/User');
const Project = require('../models/Project');

/**
 * GET /api/students/branch/:branch
 * Get students by branch with their latest project info.
 */
const getStudentsByBranch = async (req, res) => {
    try {
        const { branch } = req.params;

        const students = await User.find({
            role: 'student',
            branch: branch,
        }).select('username email branch _id');

        const studentsWithProjects = await Promise.all(
            students.map(async (student) => {
                const projects = await Project.find({ studentId: student._id })
                    .sort({ uploadedAt: -1 })
                    .limit(1);

                const latestProject = projects[0];

                return {
                    id: student._id.toString(),
                    name: student.username,
                    email: student.email,
                    branch: student.branch,
                    roll: student.email.split('@')[0] || student._id.toString(),
                    projectTitle: latestProject ? latestProject.projectName : 'No project uploaded',
                    progress: latestProject ? 50 : 0,
                    status: latestProject ? latestProject.status.replace('_', ' ') : 'No Project',
                    latestUpdate: latestProject
                        ? latestProject.description.substring(0, 50) + '...'
                        : 'No updates',
                    projectId: latestProject ? latestProject._id.toString() : null,
                };
            })
        );

        res.status(200).json({
            message: 'Students retrieved successfully',
            students: studentsWithProjects,
        });
    } catch (error) {
        console.error('Get Students by Branch Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * GET /api/students
 * Get all students.
 */
const getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('username email branch _id');

        res.status(200).json({
            message: 'Students retrieved successfully',
            students,
        });
    } catch (error) {
        console.error('Get Students Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

module.exports = { getStudentsByBranch, getAllStudents };
