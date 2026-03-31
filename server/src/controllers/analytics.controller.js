const { eq, desc, count, avg, sql, inArray } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { users, projects, projectPhases, feedback } = require('../db/schema');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/skills/:userId
 */
const getSkillRadar = async (req, res) => {
    try {
        const db = getDB();
        const userId = parseInt(req.params.userId);

        const studentProjects = await db.select()
            .from(projects)
            .where(eq(projects.studentId, userId));

        const skillMap = {};
        for (const project of studentProjects) {
            if (Array.isArray(project.domainTags)) {
                for (const tag of project.domainTags) {
                    skillMap[tag] = (skillMap[tag] || 0) + 1;
                }
            }
            skillMap['Project Completion'] = (skillMap['Project Completion'] || 0) + project.stars;
        }

        // Get feedback
        for (const project of studentProjects) {
            const fb = await db.select().from(feedback).where(eq(feedback.projectId, project.id));
            for (const f of fb) {
                skillMap['Reviews Received'] = (skillMap['Reviews Received'] || 0) + 1;
                if (f.rubricScores && typeof f.rubricScores === 'object') {
                    for (const [key, value] of Object.entries(f.rubricScores)) {
                        skillMap[key] = (skillMap[key] || 0) + value;
                    }
                }
            }
        }

        const maxVal = Math.max(...Object.values(skillMap), 1);
        const radarData = Object.entries(skillMap).map(([skill, value]) => ({
            skill,
            value: Math.round((value / maxVal) * 100),
            rawValue: value,
        }));

        res.status(200).json({
            skills: radarData,
            totalProjects: studentProjects.length,
        });
    } catch (error) {
        logger.error('ANALYTICS', `Skill radar failed for user id=${req.params.userId}`, error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/analytics/department/:branch
 */
const getDepartmentStats = async (req, res) => {
    try {
        const db = getDB();
        const { branch } = req.params;

        // Total students in branch
        const [studentCount] = await db.select({ total: count() })
            .from(users)
            .where(sql`${users.role} = 'student' AND ${users.branch} = ${branch}`);

        // Total projects from students in branch
        const branchStudents = await db.select({ id: users.id })
            .from(users)
            .where(sql`${users.role} = 'student' AND ${users.branch} = ${branch}`);

        const studentIds = branchStudents.map((s) => s.id);

        let totalProjects = 0;
        let approvedProjects = 0;
        let pendingProjects = 0;
        let averageStars = 0;
        const domainCounts = {};

        if (studentIds.length > 0) {
            const branchProjects = await db.select()
                .from(projects)
                .where(inArray(projects.studentId, studentIds));

            totalProjects = branchProjects.length;
            approvedProjects = branchProjects.filter((p) => p.status === 'approved').length;
            pendingProjects = branchProjects.filter((p) => p.status === 'pending').length;
            averageStars = totalProjects > 0
                ? Math.round(branchProjects.reduce((sum, p) => sum + p.stars, 0) / totalProjects * 10) / 10
                : 0;

            for (const p of branchProjects) {
                if (Array.isArray(p.domainTags)) {
                    for (const tag of p.domainTags) {
                        domainCounts[tag] = (domainCounts[tag] || 0) + 1;
                    }
                }
            }
        }

        res.status(200).json({
            branch,
            totalStudents: studentCount?.total || 0,
            totalProjects,
            approvedProjects,
            pendingProjects,
            averageStars,
            domainDistribution: Object.entries(domainCounts).map(([domain, count]) => ({
                domain,
                count,
            })),
        });
    } catch (error) {
        logger.error('ANALYTICS', `Department stats failed for branch=${req.params.branch}`, error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/analytics/top-students
 */
const getTopStudents = async (req, res) => {
    try {
        const db = getDB();
        const { domain, limit: queryLimit } = req.query;
        const limitNum = Math.min(100, Math.max(1, parseInt(queryLimit) || 50));

        const allProjects = await db.select({
            id: projects.id,
            title: projects.title,
            domainTags: projects.domainTags,
            stars: projects.stars,
            status: projects.status,
            studentId: projects.studentId,
            studentName: users.username,
            studentEmail: users.email,
            studentBranch: users.branch,
        })
            .from(projects)
            .leftJoin(users, eq(projects.studentId, users.id))
            .orderBy(desc(projects.stars));

        // Filter by domain if provided
        let filtered = allProjects;
        if (domain) {
            filtered = allProjects.filter((p) =>
                Array.isArray(p.domainTags) && p.domainTags.some((tag) =>
                    tag.toLowerCase().includes(domain.toLowerCase())
                )
            );
        }

        // Group by student and calculate aggregate
        const studentMap = {};
        for (const p of filtered) {
            if (!studentMap[p.studentId]) {
                studentMap[p.studentId] = {
                    studentId: p.studentId,
                    studentName: p.studentName,
                    studentEmail: p.studentEmail,
                    branch: p.studentBranch,
                    totalStars: 0,
                    projectCount: 0,
                    domains: new Set(),
                };
            }
            studentMap[p.studentId].totalStars += p.stars;
            studentMap[p.studentId].projectCount += 1;
            if (Array.isArray(p.domainTags)) {
                p.domainTags.forEach((t) => studentMap[p.studentId].domains.add(t));
            }
        }

        const ranked = Object.values(studentMap)
            .map((s) => ({
                ...s,
                domains: Array.from(s.domains),
                averageStars: Math.round((s.totalStars / s.projectCount) * 10) / 10,
            }))
            .sort((a, b) => b.totalStars - a.totalStars)
            .slice(0, limitNum);

        res.status(200).json({
            message: 'Top students retrieved',
            students: ranked,
            domain: domain || 'all',
        });
    } catch (error) {
        logger.error('ANALYTICS', 'Get top students failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = { getSkillRadar, getDepartmentStats, getTopStudents };
