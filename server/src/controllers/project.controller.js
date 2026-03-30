const { eq, and, desc, ilike, or, sql, count } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { projects, projectPhases, projectFiles, projectMembers, users } = require('../db/schema');
const { uploadToR2, deleteFromR2 } = require('../middleware/upload');

const PHASE_NAMES = [
    'Idea & Proposal',
    'Research Paper',
    'Building Prototype',
    'Completing Prototype',
    'Completing Model',
    'Final Submission',
];

/**
 * Generate a unique project ID: BRANCH_YEAR_SEQ
 */
async function generateProjectId(db, branch, year) {
    const prefix = `${(branch || 'GEN').toUpperCase()}_${year || new Date().getFullYear()}`;
    const existing = await db.select({ id: projects.id })
        .from(projects)
        .where(ilike(projects.uniqueProjectId, `${prefix}_%`));
    const seq = String(existing.length + 1).padStart(3, '0');
    return `${prefix}_${seq}`;
}

/**
 * POST /api/projects
 */
const createProject = async (req, res) => {
    try {
        const db = getDB();
        const userId = req.user.id;
        const { title, description, domainTags, visibility, groupMembers } = req.body;

        // Get user info for branch/year
        const [student] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!student) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const uniqueProjectId = await generateProjectId(db, student.branch, student.year);

        const [newProject] = await db.insert(projects).values({
            uniqueProjectId,
            title,
            description,
            domainTags: domainTags || [],
            studentId: userId,
            visibility: visibility || 'private',
            status: 'pending',
        }).returning();

        // Create 6 default phases
        const phaseValues = PHASE_NAMES.map((name, i) => ({
            projectId: newProject.id,
            phaseNumber: i + 1,
            phaseName: name,
        }));
        await db.insert(projectPhases).values(phaseValues);

        // Add the creator as group leader
        await db.insert(projectMembers).values({
            projectId: newProject.id,
            userId,
            roleInGroup: 'leader',
        });

        // Add group members if any
        if (groupMembers && groupMembers.length > 0) {
            const memberValues = groupMembers
                .filter((memberId) => memberId !== userId)
                .slice(0, 2) // max 3 members total (1 leader + 2 members)
                .map((memberId) => ({
                    projectId: newProject.id,
                    userId: memberId,
                    roleInGroup: 'member',
                }));
            if (memberValues.length > 0) {
                await db.insert(projectMembers).values(memberValues);
            }
        }

        // Upload files to R2 if any
        const uploadedFiles = [];
        if (req.parsedFiles && req.parsedFiles.length > 0) {
            for (const file of req.parsedFiles) {
                const result = await uploadToR2(file.buffer, file.originalName, file.mimeType);
                const [fileRecord] = await db.insert(projectFiles).values({
                    projectId: newProject.id,
                    filename: result.key.split('/').pop(),
                    originalName: file.originalName,
                    r2Key: result.key,
                    fileSize: file.size,
                    fileType: file.mimeType,
                }).returning();
                uploadedFiles.push(fileRecord);
            }
        }

        res.status(201).json({
            message: 'Project uploaded successfully!',
            project: { ...newProject, files: uploadedFiles },
        });
    } catch (error) {
        console.error('Project Upload Error:', error);
        res.status(500).json({ message: 'Internal Server Error. Please try again.' });
    }
};

/**
 * GET /api/projects
 */
const getAllProjects = async (req, res) => {
    try {
        const db = getDB();
        const { page, limit, status, branch, domain, visibility, search } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;

        let conditions = [];

        if (status) {
            conditions.push(eq(projects.status, status));
        }
        if (visibility) {
            conditions.push(eq(projects.visibility, visibility));
        }
        if (search) {
            conditions.push(or(
                ilike(projects.title, `%${search}%`),
                ilike(projects.description, `%${search}%`)
            ));
        }

        // If the user is not teacher/admin/expert, only show public or their own
        if (req.user && req.user.role === 'student') {
            conditions.push(or(
                eq(projects.visibility, 'public'),
                eq(projects.studentId, req.user.id)
            ));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const projectList = await db.select({
            id: projects.id,
            uniqueProjectId: projects.uniqueProjectId,
            title: projects.title,
            description: projects.description,
            domainTags: projects.domainTags,
            status: projects.status,
            visibility: projects.visibility,
            stars: projects.stars,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            studentId: projects.studentId,
            studentName: users.username,
            studentEmail: users.email,
            studentBranch: users.branch,
        })
            .from(projects)
            .leftJoin(users, eq(projects.studentId, users.id))
            .where(whereClause)
            .orderBy(desc(projects.createdAt))
            .limit(limitNum)
            .offset(offset);

        // Filter by branch (via student's branch)
        let filtered = projectList;
        if (branch) {
            filtered = projectList.filter((p) => p.studentBranch === branch);
        }
        if (domain) {
            filtered = filtered.filter((p) =>
                Array.isArray(p.domainTags) && p.domainTags.some((tag) =>
                    tag.toLowerCase().includes(domain.toLowerCase())
                )
            );
        }

        const [totalResult] = await db.select({ total: count() })
            .from(projects)
            .where(whereClause);

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: filtered,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalResult?.total || 0,
                totalPages: Math.ceil((totalResult?.total || 0) / limitNum),
            },
        });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/projects/student/:studentId
 */
const getProjectsByStudent = async (req, res) => {
    try {
        const db = getDB();
        const studentId = parseInt(req.params.studentId);

        const projectList = await db.select()
            .from(projects)
            .where(eq(projects.studentId, studentId))
            .orderBy(desc(projects.createdAt));

        // Get phases for each project
        const projectsWithPhases = await Promise.all(
            projectList.map(async (project) => {
                const phases = await db.select()
                    .from(projectPhases)
                    .where(eq(projectPhases.projectId, project.id))
                    .orderBy(projectPhases.phaseNumber);
                const files = await db.select()
                    .from(projectFiles)
                    .where(eq(projectFiles.projectId, project.id));
                return { ...project, phases, files };
            })
        );

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: projectsWithPhases,
        });
    } catch (error) {
        console.error('Get Student Projects Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/projects/:id
 */
const getProjectById = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);

        const [project] = await db.select({
            id: projects.id,
            uniqueProjectId: projects.uniqueProjectId,
            title: projects.title,
            description: projects.description,
            domainTags: projects.domainTags,
            status: projects.status,
            visibility: projects.visibility,
            stars: projects.stars,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            studentId: projects.studentId,
            studentName: users.username,
            studentEmail: users.email,
            studentBranch: users.branch,
        })
            .from(projects)
            .leftJoin(users, eq(projects.studentId, users.id))
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const phases = await db.select()
            .from(projectPhases)
            .where(eq(projectPhases.projectId, projectId))
            .orderBy(projectPhases.phaseNumber);

        const files = await db.select()
            .from(projectFiles)
            .where(eq(projectFiles.projectId, projectId));

        const members = await db.select({
            id: projectMembers.id,
            userId: projectMembers.userId,
            roleInGroup: projectMembers.roleInGroup,
            username: users.username,
            email: users.email,
        })
            .from(projectMembers)
            .leftJoin(users, eq(projectMembers.userId, users.id))
            .where(eq(projectMembers.projectId, projectId));

        res.status(200).json({
            message: 'Project retrieved successfully',
            project: { ...project, phases, files, members },
        });
    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/projects/:id
 */
const updateProject = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { title, description, domainTags, visibility } = req.body;

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        // Only owner or teacher can update
        if (req.user.role === 'student' && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own projects.' });
        }

        const updateData = { updatedAt: new Date() };
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (domainTags) updateData.domainTags = domainTags;
        if (visibility) updateData.visibility = visibility;

        const [updated] = await db.update(projects)
            .set(updateData)
            .where(eq(projects.id, projectId))
            .returning();

        res.status(200).json({
            message: 'Project updated successfully',
            project: updated,
        });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (req.user.role === 'student' && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own projects.' });
        }

        // Delete files from R2
        const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId));
        for (const file of files) {
            try {
                await deleteFromR2(file.r2Key);
            } catch (err) {
                console.error(`Failed to delete R2 file ${file.r2Key}:`, err.message);
            }
        }

        // Cascade delete handled by DB constraints
        await db.delete(projects).where(eq(projects.id, projectId));

        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/projects/:id/status
 */
const updateProjectStatus = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { status } = req.body;

        const [updated] = await db.update(projects)
            .set({ status, updatedAt: new Date() })
            .where(eq(projects.id, projectId))
            .returning();

        if (!updated) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            message: 'Project status updated successfully',
            project: updated,
        });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/projects/:id/phase
 */
const updateProjectPhase = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { phase, completed, description } = req.body;

        // Verify ownership
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (req.user.role === 'student' && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own project phases.' });
        }

        const phaseNumber = parseInt(phase);
        if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
            return res.status(400).json({ message: 'Invalid phase number. Must be 1-6.' });
        }

        const updateData = {};
        if (completed !== undefined) {
            updateData.completed = completed;
            if (completed) updateData.completedAt = new Date();
            else updateData.completedAt = null;
        }
        if (description !== undefined) {
            updateData.description = description;
        }

        const [updatedPhase] = await db.update(projectPhases)
            .set(updateData)
            .where(and(
                eq(projectPhases.projectId, projectId),
                eq(projectPhases.phaseNumber, phaseNumber)
            ))
            .returning();

        // Recalculate stars
        const allPhases = await db.select()
            .from(projectPhases)
            .where(eq(projectPhases.projectId, projectId));
        const completedCount = allPhases.filter((p) => p.completed).length;
        await db.update(projects)
            .set({ stars: completedCount, updatedAt: new Date() })
            .where(eq(projects.id, projectId));

        res.status(200).json({
            message: 'Phase updated successfully',
            phase: updatedPhase,
            stars: completedCount,
        });
    } catch (error) {
        console.error('Update Phase Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * PATCH /api/projects/:id/phases
 */
const updateProjectPhases = async (req, res) => {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { phases } = req.body;

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        if (req.user.role === 'student' && project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own project phases.' });
        }

        for (const phaseData of phases) {
            const updateData = {};
            if (phaseData.completed !== undefined) {
                updateData.completed = phaseData.completed;
                if (phaseData.completed) updateData.completedAt = new Date();
                else updateData.completedAt = null;
            }
            if (phaseData.description !== undefined) {
                updateData.description = phaseData.description;
            }
            await db.update(projectPhases)
                .set(updateData)
                .where(and(
                    eq(projectPhases.projectId, projectId),
                    eq(projectPhases.phaseNumber, phaseData.phaseNumber)
                ));
        }

        // Recalculate stars
        const allPhases = await db.select()
            .from(projectPhases)
            .where(eq(projectPhases.projectId, projectId));
        const completedCount = allPhases.filter((p) => p.completed).length;
        await db.update(projects)
            .set({ stars: completedCount, updatedAt: new Date() })
            .where(eq(projects.id, projectId));

        res.status(200).json({
            message: 'Phases updated successfully',
            phases: allPhases,
            stars: completedCount,
        });
    } catch (error) {
        console.error('Update Phases Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/projects/search
 */
const searchProjects = async (req, res) => {
    try {
        const db = getDB();
        const { q, branch, domain } = req.query;

        if (!q && !branch && !domain) {
            return res.status(400).json({ message: 'Please provide at least one search parameter.' });
        }

        const conditions = [eq(projects.visibility, 'public')];

        if (q) {
            conditions.push(or(
                ilike(projects.title, `%${q}%`),
                ilike(projects.description, `%${q}%`),
                ilike(projects.uniqueProjectId, `%${q}%`)
            ));
        }

        const results = await db.select({
            id: projects.id,
            uniqueProjectId: projects.uniqueProjectId,
            title: projects.title,
            description: projects.description,
            domainTags: projects.domainTags,
            status: projects.status,
            stars: projects.stars,
            studentName: users.username,
            studentBranch: users.branch,
            createdAt: projects.createdAt,
        })
            .from(projects)
            .leftJoin(users, eq(projects.studentId, users.id))
            .where(and(...conditions))
            .orderBy(desc(projects.stars))
            .limit(50);

        let filtered = results;
        if (branch) {
            filtered = filtered.filter((p) => p.studentBranch === branch);
        }
        if (domain) {
            filtered = filtered.filter((p) =>
                Array.isArray(p.domainTags) && p.domainTags.some((tag) =>
                    tag.toLowerCase().includes(domain.toLowerCase())
                )
            );
        }

        res.status(200).json({
            message: 'Search results',
            projects: filtered,
        });
    } catch (error) {
        console.error('Search Projects Error:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectsByStudent,
    getProjectById,
    updateProject,
    deleteProject,
    updateProjectStatus,
    updateProjectPhase,
    updateProjectPhases,
    searchProjects,
};
