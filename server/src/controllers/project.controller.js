const { eq, and, desc, ilike, or, sql, count, lt, isNull, inArray } = require('drizzle-orm');
const { getDB } = require('../config/db');
const { projects, projectPhases, projectFiles, projectMembers, users, notifications } = require('../db/schema');
const { uploadToR2, deleteFromR2 } = require('../middleware/upload');
const logger = require('../utils/logger');

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

        logger.success('PROJECT', `Project created: "${newProject.title}" [${uniqueProjectId}]`, `id=${newProject.id} user=${req.user.id}`);
        res.status(201).json({
            message: 'Project uploaded successfully!',
            project: { ...newProject, files: uploadedFiles },
        });
    } catch (error) {
        logger.error('PROJECT', 'Create project failed', error);
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
        logger.error('PROJECT', 'Get all projects failed', error);
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
        logger.error('PROJECT', `Get projects for student id=${req.params.studentId} failed`, error);
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
        logger.error('PROJECT', `Get project id=${req.params.id} failed`, error);
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

        logger.success('PROJECT', `Project id=${projectId} updated`, `user=${req.user.id}`);
        res.status(200).json({
            message: 'Project updated successfully',
            project: updated,
        });
    } catch (error) {
        logger.error('PROJECT', `Update project id=${req.params.id} failed`, error);
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
                logger.warn('FILE', `Failed to delete R2 object: ${file.r2Key}`, err.message);
            }
        }

        // Cascade delete handled by DB constraints
        await db.delete(projects).where(eq(projects.id, projectId));

        logger.success('PROJECT', `Project id=${projectId} deleted`, `user=${req.user.id}`);
        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (error) {
        logger.error('PROJECT', `Delete project id=${req.params.id} failed`, error);
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

        logger.success('PROJECT', `Status of project id=${projectId} changed to "${status}"`);
        res.status(200).json({
            message: 'Project status updated successfully',
            project: updated,
        });
    } catch (error) {
        logger.error('PROJECT', `Update status for project id=${req.params.id} failed`, error);
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

        logger.success('PROJECT', `Phase ${phaseNumber} of project id=${projectId} updated`, `stars=${completedCount}`);
        res.status(200).json({
            message: 'Phase updated successfully',
            phase: updatedPhase,
            stars: completedCount,
        });
    } catch (error) {
        logger.error('PROJECT', `Update phase for project id=${req.params.id} failed`, error);
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

        logger.success('PROJECT', `Bulk phases updated for project id=${projectId}`, `stars=${completedCount}`);
        res.status(200).json({
            message: 'Phases updated successfully',
            phases: allPhases,
            stars: completedCount,
        });
    } catch (error) {
        logger.error('PROJECT', `Bulk update phases for project id=${req.params.id} failed`, error);
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
        logger.error('PROJECT', 'Search projects failed', error);
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
    forkProject,
    inviteMember,
    respondToInvite,
    getMyInvitations,
    requestMentor,
    respondMentorRequest,
    setPhaseDeadlines,
    getOverduePhases,
    getPortfolio,
    getDepartmentReport,
    getStudentReport,
};

// ═══════════════════════════════════════════
// FR3/FR33: Fork / Carry-Forward a Project
// ═══════════════════════════════════════════

/**
 * POST /api/projects/:id/fork
 * Fork an approved/archived project to create a new one under the current student.
 */
async function forkProject(req, res) {
    try {
        const db = getDB();
        const sourceId = parseInt(req.params.id);
        const userId = req.user.id;

        // Get source project
        const [source] = await db.select().from(projects).where(eq(projects.id, sourceId)).limit(1);
        if (!source) return res.status(404).json({ message: 'Source project not found.' });
        if (!['approved', 'archived'].includes(source.status)) {
            return res.status(400).json({ message: 'Only approved or archived projects can be forked.' });
        }

        // Get user info for branch/year
        const [student] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const uniqueProjectId = await generateProjectId(db, student.branch, student.year);

        const [forked] = await db.insert(projects).values({
            uniqueProjectId,
            title: `${source.title} (Fork)`,
            description: source.description,
            domainTags: source.domainTags || [],
            studentId: userId,
            visibility: 'private',
            status: 'pending',
            forkedFromId: sourceId,
        }).returning();

        // Create 6 default phases
        const phaseValues = PHASE_NAMES.map((name, i) => ({
            projectId: forked.id,
            phaseNumber: i + 1,
            phaseName: name,
        }));
        await db.insert(projectPhases).values(phaseValues);

        // Add as leader
        await db.insert(projectMembers).values({
            projectId: forked.id,
            userId,
            roleInGroup: 'leader',
            status: 'accepted',
        });

        logger.success('PROJECT', `Forked project id=${sourceId} → id=${forked.id}`, `user=${userId}`);
        res.status(201).json({ message: 'Project forked successfully!', project: forked });
    } catch (error) {
        logger.error('PROJECT', 'Fork project failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR7: Group Invitations
// ═══════════════════════════════════════════

/**
 * POST /api/projects/:id/invite
 * Invite a student to join the project group.
 * Body: { userId } or { email }
 */
async function inviteMember(req, res) {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { userId: targetUserId, email } = req.body;

        // Verify caller is the project owner/leader
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        if (project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'Only the project owner can invite members.' });
        }

        // Resolve target user
        let inviteeId = targetUserId;
        if (!inviteeId && email) {
            const [found] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
            if (!found) return res.status(404).json({ message: 'User not found with that email.' });
            inviteeId = found.id;
        }
        if (!inviteeId) return res.status(400).json({ message: 'Provide userId or email.' });

        // Check not already a member
        const [existing] = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, inviteeId)))
            .limit(1);
        if (existing) {
            return res.status(409).json({ message: 'User is already a member or has a pending invite.' });
        }

        // Check group size (max 3 total)
        const currentMembers = await db.select({ id: projectMembers.id })
            .from(projectMembers)
            .where(and(eq(projectMembers.projectId, projectId), or(eq(projectMembers.status, 'accepted'), eq(projectMembers.status, 'invited'))));
        if (currentMembers.length >= 3) {
            return res.status(400).json({ message: 'Group already has maximum 3 members.' });
        }

        // Create the invite
        const [invite] = await db.insert(projectMembers).values({
            projectId,
            userId: inviteeId,
            roleInGroup: 'member',
            status: 'invited',
        }).returning();

        // Send notification to invitee
        await db.insert(notifications).values({
            userId: inviteeId,
            title: 'Group Invitation',
            message: `You have been invited to join project "${project.title}".`,
            type: 'info',
        });

        logger.success('PROJECT', `Invited user id=${inviteeId} to project id=${projectId}`);
        res.status(201).json({ message: 'Invitation sent!', invite });
    } catch (error) {
        logger.error('PROJECT', 'Invite member failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

/**
 * PATCH /api/projects/invitations/:id
 * Accept or decline a group invitation.
 * Body: { action: 'accept' | 'decline' }
 */
async function respondToInvite(req, res) {
    try {
        const db = getDB();
        const memberId = parseInt(req.params.id);
        const { action } = req.body;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "accept" or "decline".' });
        }

        const [member] = await db.select().from(projectMembers)
            .where(and(eq(projectMembers.id, memberId), eq(projectMembers.userId, req.user.id)))
            .limit(1);
        if (!member) return res.status(404).json({ message: 'Invitation not found.' });
        if (member.status !== 'invited') {
            return res.status(400).json({ message: 'This invitation has already been responded to.' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        await db.update(projectMembers).set({ status: newStatus }).where(eq(projectMembers.id, memberId));

        // Notify project owner
        const [project] = await db.select().from(projects).where(eq(projects.id, member.projectId)).limit(1);
        if (project) {
            await db.insert(notifications).values({
                userId: project.studentId,
                title: 'Invitation Response',
                message: `${req.user.username || 'A student'} has ${newStatus} your invitation to "${project.title}".`,
                type: action === 'accept' ? 'success' : 'info',
            });
        }

        logger.success('PROJECT', `Invitation id=${memberId} ${newStatus} by user id=${req.user.id}`);
        res.status(200).json({ message: `Invitation ${newStatus}.` });
    } catch (error) {
        logger.error('PROJECT', 'Respond to invite failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

/**
 * GET /api/projects/invitations/me
 * Get all pending invitations for the current user.
 */
async function getMyInvitations(req, res) {
    try {
        const db = getDB();
        const invitations = await db.select({
            id: projectMembers.id,
            projectId: projectMembers.projectId,
            status: projectMembers.status,
            joinedAt: projectMembers.joinedAt,
            projectTitle: projects.title,
            projectDescription: projects.description,
            ownerName: users.username,
        })
            .from(projectMembers)
            .leftJoin(projects, eq(projectMembers.projectId, projects.id))
            .leftJoin(users, eq(projects.studentId, users.id))
            .where(and(eq(projectMembers.userId, req.user.id), eq(projectMembers.status, 'invited')))
            .orderBy(desc(projectMembers.joinedAt));

        res.status(200).json({ invitations });
    } catch (error) {
        logger.error('PROJECT', 'Get invitations failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR9: Mentor Request
// ═══════════════════════════════════════════

/**
 * PATCH /api/projects/:id/mentor
 * Student requests a teacher as mentor. Body: { mentorId }
 */
async function requestMentor(req, res) {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { mentorId } = req.body;

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        if (project.studentId !== req.user.id) {
            return res.status(403).json({ message: 'Only the project owner can request a mentor.' });
        }
        if (project.mentorStatus === 'accepted') {
            return res.status(400).json({ message: 'Project already has an accepted mentor.' });
        }

        // Validate mentor is a teacher
        const [teacher] = await db.select().from(users)
            .where(and(eq(users.id, mentorId), eq(users.role, 'teacher')))
            .limit(1);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found.' });

        await db.update(projects)
            .set({ mentorId, mentorStatus: 'requested', updatedAt: new Date() })
            .where(eq(projects.id, projectId));

        // Notify the teacher
        await db.insert(notifications).values({
            userId: mentorId,
            title: 'Mentor Request',
            message: `${req.user.username || 'A student'} has requested you as mentor for "${project.title}".`,
            type: 'info',
        });

        logger.success('PROJECT', `Mentor request: project id=${projectId} → teacher id=${mentorId}`);
        res.status(200).json({ message: 'Mentor request sent!' });
    } catch (error) {
        logger.error('PROJECT', 'Request mentor failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

/**
 * PATCH /api/projects/:id/mentor/respond
 * Teacher accepts or declines a mentor request. Body: { action: 'accept' | 'decline' }
 */
async function respondMentorRequest(req, res) {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { action } = req.body;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ message: 'Action must be "accept" or "decline".' });
        }

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        if (project.mentorId !== req.user.id) {
            return res.status(403).json({ message: 'This mentor request is not for you.' });
        }
        if (project.mentorStatus !== 'requested') {
            return res.status(400).json({ message: 'No pending mentor request for this project.' });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'none';
        const updateData = { mentorStatus: newStatus, updatedAt: new Date() };
        if (action === 'decline') updateData.mentorId = null;

        await db.update(projects).set(updateData).where(eq(projects.id, projectId));

        // Notify the student
        await db.insert(notifications).values({
            userId: project.studentId,
            title: 'Mentor Response',
            message: `Your mentor request for "${project.title}" has been ${action === 'accept' ? 'accepted' : 'declined'}.`,
            type: action === 'accept' ? 'success' : 'warning',
        });

        logger.success('PROJECT', `Mentor request for project id=${projectId} ${action}ed by teacher id=${req.user.id}`);
        res.status(200).json({ message: `Mentor request ${action}ed.` });
    } catch (error) {
        logger.error('PROJECT', 'Respond mentor request failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR13: Teacher-Set Deadlines
// ═══════════════════════════════════════════

/**
 * PATCH /api/projects/:id/deadlines
 * Teacher sets deadlines for project phases.
 * Body: { deadlines: [{ phaseNumber, deadline }] }
 */
async function setPhaseDeadlines(req, res) {
    try {
        const db = getDB();
        const projectId = parseInt(req.params.id);
        const { deadlines } = req.body;

        if (!Array.isArray(deadlines) || deadlines.length === 0) {
            return res.status(400).json({ message: 'Provide an array of deadlines.' });
        }

        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!project) return res.status(404).json({ message: 'Project not found.' });

        for (const { phaseNumber, deadline } of deadlines) {
            if (phaseNumber < 1 || phaseNumber > 6) continue;
            await db.update(projectPhases)
                .set({ deadline: new Date(deadline) })
                .where(and(
                    eq(projectPhases.projectId, projectId),
                    eq(projectPhases.phaseNumber, phaseNumber)
                ));
        }

        // Notify student
        await db.insert(notifications).values({
            userId: project.studentId,
            title: 'Deadlines Set',
            message: `Deadlines have been set for your project "${project.title}".`,
            type: 'info',
        });

        const updatedPhases = await db.select()
            .from(projectPhases)
            .where(eq(projectPhases.projectId, projectId))
            .orderBy(projectPhases.phaseNumber);

        logger.success('PROJECT', `Deadlines set for project id=${projectId}`);
        res.status(200).json({ message: 'Deadlines set successfully.', phases: updatedPhases });
    } catch (error) {
        logger.error('PROJECT', 'Set deadlines failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR15: Overdue Phase Alerts
// ═══════════════════════════════════════════

/**
 * GET /api/projects/overdue
 * Returns all phases that are past their deadline and not completed.
 * Optional query: ?studentId=X to filter by student.
 */
async function getOverduePhases(req, res) {
    try {
        const db = getDB();
        const now = new Date();

        let conditions = [
            eq(projectPhases.completed, false),
            lt(projectPhases.deadline, now),
        ];

        // Build query
        const overdue = await db.select({
            phaseId: projectPhases.id,
            projectId: projectPhases.projectId,
            phaseNumber: projectPhases.phaseNumber,
            phaseName: projectPhases.phaseName,
            deadline: projectPhases.deadline,
            projectTitle: projects.title,
            studentId: projects.studentId,
            studentName: users.username,
        })
            .from(projectPhases)
            .innerJoin(projects, eq(projectPhases.projectId, projects.id))
            .leftJoin(users, eq(projects.studentId, users.id))
            .where(and(...conditions))
            .orderBy(projectPhases.deadline);

        let result = overdue;
        const { studentId } = req.query;
        if (studentId) {
            result = overdue.filter((o) => o.studentId === parseInt(studentId));
        }

        res.status(200).json({ overdue: result });
    } catch (error) {
        logger.error('PROJECT', 'Get overdue phases failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR27: Student Portfolio View
// ═══════════════════════════════════════════

/**
 * GET /api/portfolio/:userId
 * Public shareable portfolio for a student.
 */
async function getPortfolio(req, res) {
    try {
        const db = getDB();
        const userId = parseInt(req.params.userId);

        const [user] = await db.select({
            id: users.id,
            username: users.username,
            bio: users.bio,
            branch: users.branch,
            year: users.year,
            skills: users.skills,
            avatarUrl: users.avatarUrl,
        }).from(users).where(eq(users.id, userId)).limit(1);

        if (!user) return res.status(404).json({ message: 'User not found.' });

        // Get public/approved projects
        const userProjects = await db.select({
            id: projects.id,
            uniqueProjectId: projects.uniqueProjectId,
            title: projects.title,
            description: projects.description,
            domainTags: projects.domainTags,
            status: projects.status,
            stars: projects.stars,
            createdAt: projects.createdAt,
        })
            .from(projects)
            .where(and(
                eq(projects.studentId, userId),
                or(eq(projects.visibility, 'public'), eq(projects.status, 'approved'))
            ))
            .orderBy(desc(projects.createdAt));

        // Get phases for each project
        const projectsWithPhases = await Promise.all(
            userProjects.map(async (p) => {
                const phases = await db.select()
                    .from(projectPhases)
                    .where(eq(projectPhases.projectId, p.id))
                    .orderBy(projectPhases.phaseNumber);
                return { ...p, phases };
            })
        );

        // Calculate stats
        const totalProjects = projectsWithPhases.length;
        const totalStars = projectsWithPhases.reduce((acc, p) => acc + (p.stars || 0), 0);
        const completedPhases = projectsWithPhases.reduce((acc, p) =>
            acc + p.phases.filter((ph) => ph.completed).length, 0
        );
        const totalPhases = projectsWithPhases.reduce((acc, p) => acc + p.phases.length, 0);

        res.status(200).json({
            portfolio: {
                user,
                projects: projectsWithPhases,
                stats: { totalProjects, totalStars, completedPhases, totalPhases },
            },
        });
    } catch (error) {
        logger.error('PORTFOLIO', 'Get portfolio failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

// ═══════════════════════════════════════════
// FR29: Report Generation
// ═══════════════════════════════════════════

/**
 * GET /api/reports/department/:branch
 * Department-level report: project counts, phase completion, domain distribution.
 */
async function getDepartmentReport(req, res) {
    try {
        const db = getDB();
        const branch = req.params.branch;

        // Students in this branch
        const branchStudents = await db.select({ id: users.id })
            .from(users)
            .where(and(eq(users.role, 'student'), eq(users.branch, branch)));
        const studentIds = branchStudents.map((s) => s.id);

        if (studentIds.length === 0) {
            return res.status(200).json({
                report: { branch, totalStudents: 0, totalProjects: 0, statusBreakdown: {}, domainDistribution: {}, phaseCompletion: [] },
            });
        }

        // All projects by these students
        const allProjects = await db.select()
            .from(projects)
            .where(inArray(projects.studentId, studentIds));

        // Status breakdown
        const statusBreakdown = {};
        for (const p of allProjects) {
            statusBreakdown[p.status] = (statusBreakdown[p.status] || 0) + 1;
        }

        // Domain distribution
        const domainDistribution = {};
        for (const p of allProjects) {
            if (Array.isArray(p.domainTags)) {
                for (const tag of p.domainTags) {
                    domainDistribution[tag] = (domainDistribution[tag] || 0) + 1;
                }
            }
        }

        // Phase completion rate across all projects
        const projectIds = allProjects.map((p) => p.id);
        let phases = [];
        if (projectIds.length > 0) {
            phases = await db.select()
                .from(projectPhases)
                .where(inArray(projectPhases.projectId, projectIds));
        }

        const phaseCompletion = PHASE_NAMES.map((name, i) => {
            const phaseNum = i + 1;
            const matching = phases.filter((p) => p.phaseNumber === phaseNum);
            const completed = matching.filter((p) => p.completed).length;
            return { phase: name, total: matching.length, completed, rate: matching.length ? Math.round((completed / matching.length) * 100) : 0 };
        });

        res.status(200).json({
            report: {
                branch,
                totalStudents: studentIds.length,
                totalProjects: allProjects.length,
                statusBreakdown,
                domainDistribution,
                phaseCompletion,
            },
        });
    } catch (error) {
        logger.error('REPORTS', 'Department report failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}

/**
 * GET /api/reports/student/:id
 * Individual student report: all projects, phases, feedback summary.
 */
async function getStudentReport(req, res) {
    try {
        const db = getDB();
        const studentId = parseInt(req.params.id);

        const [student] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            branch: users.branch,
            year: users.year,
            prn: users.prn,
        }).from(users).where(eq(users.id, studentId)).limit(1);

        if (!student) return res.status(404).json({ message: 'Student not found.' });

        const studentProjects = await db.select()
            .from(projects)
            .where(eq(projects.studentId, studentId))
            .orderBy(desc(projects.createdAt));

        const projectsWithDetails = await Promise.all(
            studentProjects.map(async (p) => {
                const phases = await db.select()
                    .from(projectPhases)
                    .where(eq(projectPhases.projectId, p.id))
                    .orderBy(projectPhases.phaseNumber);
                const files = await db.select()
                    .from(projectFiles)
                    .where(eq(projectFiles.projectId, p.id));
                const members = await db.select({
                    userId: projectMembers.userId,
                    roleInGroup: projectMembers.roleInGroup,
                    username: users.username,
                }).from(projectMembers)
                    .leftJoin(users, eq(projectMembers.userId, users.id))
                    .where(and(eq(projectMembers.projectId, p.id), eq(projectMembers.status, 'accepted')));
                return { ...p, phases, files, members };
            })
        );

        const totalPhases = projectsWithDetails.reduce((acc, p) => acc + p.phases.length, 0);
        const completedPhases = projectsWithDetails.reduce((acc, p) =>
            acc + p.phases.filter((ph) => ph.completed).length, 0
        );

        res.status(200).json({
            report: {
                student,
                projects: projectsWithDetails,
                stats: {
                    totalProjects: studentProjects.length,
                    totalPhases,
                    completedPhases,
                    completionRate: totalPhases ? Math.round((completedPhases / totalPhases) * 100) : 0,
                },
            },
        });
    } catch (error) {
        logger.error('REPORTS', 'Student report failed', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
}
