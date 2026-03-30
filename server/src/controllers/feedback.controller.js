const { eq, desc } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { feedback, users, projects, notifications } = require('../db/schema');

/**
 * POST /api/feedback
 */
const createFeedback = async (req, res) => {
    try {
        const db = getDB();
        const { projectId, rating, comment, rubricScores } = req.body;
        const reviewerId = req.user.id;

        // Verify project exists
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const [newFeedback] = await db.insert(feedback).values({
            projectId,
            reviewerId,
            rating,
            comment: comment || null,
            rubricScores: rubricScores || {},
        }).returning();

        // Create notification for project owner
        await db.insert(notifications).values({
            userId: project.studentId,
            title: 'New Feedback',
            message: `Your project "${project.title}" received new feedback with a rating of ${rating}/5.`,
            type: 'info',
        });

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: newFeedback,
        });
    } catch (error) {
        console.error('Create Feedback Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/feedback/project/:projectId
 */
const getFeedbackByProject = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.projectId);

        const feedbackList = await db.select({
            id: feedback.id,
            rating: feedback.rating,
            comment: feedback.comment,
            rubricScores: feedback.rubricScores,
            createdAt: feedback.createdAt,
            reviewerName: users.username,
            reviewerRole: users.role,
        })
            .from(feedback)
            .leftJoin(users, eq(feedback.reviewerId, users.id))
            .where(eq(feedback.projectId, projectId))
            .orderBy(desc(feedback.createdAt));

        res.status(200).json({
            message: 'Feedback retrieved successfully',
            feedback: feedbackList,
        });
    } catch (error) {
        console.error('Get Feedback Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { createFeedback, getFeedbackByProject };
