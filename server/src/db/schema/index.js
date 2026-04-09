const { pgTable, text, varchar, integer, boolean, timestamp, serial, jsonb, uniqueIndex, index } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// ─── Users ───
const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).notNull().default('student'), // student, teacher, expert, admin
    branch: varchar('branch', { length: 50 }),
    prn: varchar('prn', { length: 50 }).unique(),
    mobile: varchar('mobile', { length: 20 }),
    bio: text('bio').default(''),
    year: varchar('year', { length: 10 }),
    skills: jsonb('skills').default([]),
    avatarUrl: text('avatar_url'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpires: timestamp('reset_password_expires'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
    index('users_branch_idx').on(table.branch),
]);

const usersRelations = relations(users, ({ many }) => ({
    ownedProjects: many(projects, { relationName: 'studentProjects' }),
    mentoredProjects: many(projects, { relationName: 'mentorProjects' }),
    projectMembers: many(projectMembers),
    feedback: many(feedback),
    notifications: many(notifications),
    refreshTokens: many(refreshTokens),
}));

// ─── Project Categories (teacher-created) ───
const projectCategories = pgTable('project_categories', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    branch: varchar('branch', { length: 50 }),
    createdBy: integer('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('categories_branch_idx').on(table.branch),
    index('categories_created_by_idx').on(table.createdBy),
]);

const projectCategoriesRelations = relations(projectCategories, ({ one }) => ({
    creator: one(users, {
        fields: [projectCategories.createdBy],
        references: [users.id],
    }),
}));

// ─── Projects ───
const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    uniqueProjectId: varchar('unique_project_id', { length: 50 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    domainTags: jsonb('domain_tags').default([]),
    categoryId: integer('category_id').references(() => projectCategories.id),
    semester: integer('semester'),
    studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mentorId: integer('mentor_id').references(() => users.id),
    mentorStatus: varchar('mentor_status', { length: 20 }).default('none'), // none, requested, accepted, reassigned
    status: varchar('status', { length: 30 }).notNull().default('pending'), // pending, under_review, approved, needs_revision, archived
    visibility: varchar('visibility', { length: 20 }).notNull().default('private'), // public, private, department
    stars: integer('stars').notNull().default(0),
    forkedFromId: integer('forked_from_id').references(() => projects.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
    uniqueIndex('projects_unique_id_idx').on(table.uniqueProjectId),
    index('projects_student_idx').on(table.studentId),
    index('projects_status_idx').on(table.status),
    index('projects_visibility_idx').on(table.visibility),
    index('projects_category_idx').on(table.categoryId),
]);

const projectsRelations = relations(projects, ({ one, many }) => ({
    student: one(users, {
        fields: [projects.studentId],
        references: [users.id],
        relationName: 'studentProjects',
    }),
    mentor: one(users, {
        fields: [projects.mentorId],
        references: [users.id],
        relationName: 'mentorProjects',
    }),
    category: one(projectCategories, {
        fields: [projects.categoryId],
        references: [projectCategories.id],
    }),
    phases: many(projectPhases),
    files: many(projectFiles),
    members: many(projectMembers),
    feedback: many(feedback),
    forkedFrom: one(projects, {
        fields: [projects.forkedFromId],
        references: [projects.id],
        relationName: 'forkedProjects',
    }),
    forks: many(projects, { relationName: 'forkedProjects' }),
}));

// ─── Project Phases ───
const projectPhases = pgTable('project_phases', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    phaseNumber: integer('phase_number').notNull(),
    phaseName: varchar('phase_name', { length: 100 }).notNull(),
    completed: boolean('completed').notNull().default(false),
    completedAt: timestamp('completed_at'),
    description: text('description').default(''),
    deadline: timestamp('deadline'),
}, (table) => [
    index('phases_project_idx').on(table.projectId),
]);

const projectPhasesRelations = relations(projectPhases, ({ one }) => ({
    project: one(projects, {
        fields: [projectPhases.projectId],
        references: [projects.id],
    }),
}));

// ─── Project Files ───
const projectFiles = pgTable('project_files', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    phaseId: integer('phase_id'),
    uploadedBy: integer('uploaded_by').references(() => users.id),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }).notNull(),
    r2Key: text('r2_key').notNull(),
    fileSize: integer('file_size').notNull(),
    fileType: varchar('file_type', { length: 100 }).notNull(),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
}, (table) => [
    index('files_project_idx').on(table.projectId),
    index('files_uploaded_by_idx').on(table.uploadedBy),
]);

const projectFilesRelations = relations(projectFiles, ({ one }) => ({
    project: one(projects, {
        fields: [projectFiles.projectId],
        references: [projects.id],
    }),
}));

// ─── Project Members (group support) ───
const projectMembers = pgTable('project_members', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleInGroup: varchar('role_in_group', { length: 30 }).default('member'), // leader, member
    status: varchar('status', { length: 20 }).default('accepted'), // invited, accepted, declined
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
}, (table) => [
    index('members_project_idx').on(table.projectId),
    index('members_user_idx').on(table.userId),
]);

const projectMembersRelations = relations(projectMembers, ({ one }) => ({
    project: one(projects, {
        fields: [projectMembers.projectId],
        references: [projects.id],
    }),
    user: one(users, {
        fields: [projectMembers.userId],
        references: [users.id],
    }),
}));

// ─── Feedback ───
const feedback = pgTable('feedback', {
    id: serial('id').primaryKey(),
    projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    reviewerId: integer('reviewer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    rubricScores: jsonb('rubric_scores').default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('feedback_project_idx').on(table.projectId),
    index('feedback_reviewer_idx').on(table.reviewerId),
]);

const feedbackRelations = relations(feedback, ({ one }) => ({
    project: one(projects, {
        fields: [feedback.projectId],
        references: [projects.id],
    }),
    reviewer: one(users, {
        fields: [feedback.reviewerId],
        references: [users.id],
    }),
}));

// ─── Notifications ───
const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 30 }).notNull().default('info'), // info, success, warning, error
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('notifications_user_idx').on(table.userId),
    index('notifications_read_idx').on(table.read),
]);

const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

// ─── Refresh Tokens ───
const refreshTokens = pgTable('refresh_tokens', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    index('refresh_tokens_hash_idx').on(table.tokenHash),
    index('refresh_tokens_user_idx').on(table.userId),
]);

const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    user: one(users, {
        fields: [refreshTokens.userId],
        references: [users.id],
    }),
}));

module.exports = {
    users,
    usersRelations,
    projectCategories,
    projectCategoriesRelations,
    projects,
    projectsRelations,
    projectPhases,
    projectPhasesRelations,
    projectFiles,
    projectFilesRelations,
    projectMembers,
    projectMembersRelations,
    feedback,
    feedbackRelations,
    notifications,
    notificationsRelations,
    refreshTokens,
    refreshTokensRelations,
};
