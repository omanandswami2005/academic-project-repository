const { z } = require('zod');

// ─── Auth Schemas ───
const signupSchema = z.object({
    username: z.string().min(2, 'Username must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(['student', 'teacher', 'expert', 'admin']).optional().default('student'),
    branch: z.string().max(50).optional(),
    prn: z.string().max(50).optional(),
    mobile: z.string().max(20).optional(),
    year: z.string().max(10).optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── User Schemas ───
const updateProfileSchema = z.object({
    username: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    mobile: z.string().max(20).optional(),
    skills: z.array(z.string()).optional(),
    year: z.string().max(10).optional(),
    prn: z.string().max(50).optional(),
});

// ─── Project Schemas ───
const createProjectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(255),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    domainTags: z.array(z.string()).optional().default([]),
    visibility: z.enum(['public', 'private', 'department']).optional().default('private'),
    groupMembers: z.array(z.number()).optional().default([]),
    categoryId: z.coerce.number().int().positive().optional(),
    semester: z.coerce.number().int().min(1).max(12).optional(),
});

const updateProjectSchema = z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    domainTags: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'private', 'department']).optional(),
});

const updateProjectStatusSchema = z.object({
    status: z.enum(['pending', 'under_review', 'approved', 'needs_revision']),
});

const updatePhaseSchema = z.object({
    phase: z.string().min(1),
    completed: z.boolean().optional(),
    description: z.string().optional(),
});

const updatePhasesSchema = z.object({
    phases: z.array(z.object({
        phaseNumber: z.number().int().min(1).max(100),
        completed: z.boolean().optional(),
        description: z.string().optional(),
    })),
});

// ─── Feedback Schemas ───
const createFeedbackSchema = z.object({
    projectId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    rubricScores: z.record(z.string(), z.number()).optional().default({}),
});

// ─── Query Schemas ───
const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const projectFilterSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z.enum(['pending', 'under_review', 'approved', 'needs_revision']).optional(),
    branch: z.string().optional(),
    domain: z.string().optional(),
    visibility: z.enum(['public', 'private', 'department']).optional(),
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
});

const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const tokenParamSchema = z.object({
    token: z.string().min(1),
});

module.exports = {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updatePasswordSchema,
    refreshTokenSchema,
    updateProfileSchema,
    createProjectSchema,
    updateProjectSchema,
    updateProjectStatusSchema,
    updatePhaseSchema,
    updatePhasesSchema,
    createFeedbackSchema,
    paginationSchema,
    projectFilterSchema,
    idParamSchema,
    tokenParamSchema,
};
