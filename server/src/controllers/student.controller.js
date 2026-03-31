const { eq, and, desc, count } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { users, projects, projectPhases, feedback } = require('../db/schema');
const logger = require('../utils/logger');

/**
 * GET /api/students/branch/:branch
 */
const getStudentsByBranch = async (req, res) => {
    try {
        const db = getDB();
        const { branch } = req.params;

        const students = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            branch: users.branch,
            prn: users.prn,
            year: users.year,
        })
            .from(users)
            .where(and(eq(users.role, 'student'), eq(users.branch, branch)));

        const studentsWithProjects = await Promise.all(
            students.map(async (student) => {
                const studentProjects = await db.select()
                    .from(projects)
                    .where(eq(projects.studentId, student.id))
                    .orderBy(desc(projects.createdAt))
                    .limit(1);

                const latestProject = studentProjects[0];

                let progress = 0;
                if (latestProject) {
                    const phases = await db.select()
                        .from(projectPhases)
                        .where(eq(projectPhases.projectId, latestProject.id));
                    const completedPhases = phases.filter((p) => p.completed).length;
                    progress = Math.round((completedPhases / 6) * 100);
                }

                return {
                    id: student.id,
                    name: student.username,
                    email: student.email,
                    branch: student.branch,
                    prn: student.prn || student.email.split('@')[0],
                    year: student.year,
                    projectTitle: latestProject ? latestProject.title : 'No project uploaded',
                    progress,
                    status: latestProject ? latestProject.status.replace('_', ' ') : 'No Project',
                    latestUpdate: latestProject
                        ? latestProject.description.substring(0, 50) + '...'
                        : 'No updates',
                    projectId: latestProject ? latestProject.id : null,
                };
            })
        );

        res.status(200).json({
            message: 'Students retrieved successfully',
            students: studentsWithProjects,
        });
    } catch (error) {
        logger.error('STUDENT', `Get students by branch=${req.params.branch} failed`, error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/students
 */
const getAllStudents = async (req, res) => {
    try {
        const db = getDB();

        const students = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            branch: users.branch,
            prn: users.prn,
            year: users.year,
            skills: users.skills,
        })
            .from(users)
            .where(eq(users.role, 'student'));

        res.status(200).json({
            message: 'Students retrieved successfully',
            students,
        });
    } catch (error) {
        logger.error('STUDENT', 'Get all students failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/students/:id/skills
 * Generate skill radar data based on project domain tags and feedback.
 */
const getStudentSkills = async (req, res) => {
    try {
        const db = getDB();
        const studentId = parseInt(req.params.id);

        const studentProjects = await db.select()
            .from(projects)
            .where(eq(projects.studentId, studentId));

        // Aggregate domain tags
        const skillMap = {};
        for (const project of studentProjects) {
            if (Array.isArray(project.domainTags)) {
                for (const tag of project.domainTags) {
                    skillMap[tag] = (skillMap[tag] || 0) + 1;
                }
            }
            // Add stars as a general metric
            skillMap['Project Completion'] = (skillMap['Project Completion'] || 0) + project.stars;
        }

        // Get feedback ratings
        for (const project of studentProjects) {
            const projectFeedback = await db.select()
                .from(feedback)
                .where(eq(feedback.projectId, project.id));

            for (const fb of projectFeedback) {
                skillMap['Peer Rating'] = (skillMap['Peer Rating'] || 0) + fb.rating;
                if (fb.rubricScores && typeof fb.rubricScores === 'object') {
                    for (const [key, value] of Object.entries(fb.rubricScores)) {
                        skillMap[key] = (skillMap[key] || 0) + value;
                    }
                }
            }
        }

        // Normalize to 0-100 scale
        const maxVal = Math.max(...Object.values(skillMap), 1);
        const radarData = Object.entries(skillMap).map(([skill, value]) => ({
            skill,
            value: Math.round((value / maxVal) * 100),
        }));

        res.status(200).json({
            message: 'Student skills retrieved',
            skills: radarData,
            totalProjects: studentProjects.length,
        });
    } catch (error) {
        logger.error('STUDENT', `Get skills failed for student id=${req.params.id}`, error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getStudentsByBranch, getAllStudents, getStudentSkills };
