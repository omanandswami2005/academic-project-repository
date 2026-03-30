# APRS Implementation Checklist

## Legend
- [ ] Not started
- [x] Completed

---

## 1. Project Setup & Configuration

### 1.1 Database Migration (MongoDB → PostgreSQL/Neon)
- [ ] Install Drizzle ORM + pg driver (`drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`)
- [ ] Remove mongoose dependency
- [ ] Create Drizzle config (`drizzle.config.js`)
- [ ] Create DB connection module (`server/src/config/db.js`)
- [ ] Define all schemas in `server/src/db/schema/`
- [ ] Run initial migration with `drizzle-kit push`

### 1.2 Cloudflare R2 Setup
- [ ] Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`
- [ ] Create R2 client config (`server/src/config/r2.js`)
- [ ] Replace multer disk storage with R2 upload
- [ ] Create file upload/download/delete utilities
- [ ] Generate presigned URLs for downloads

### 1.3 Environment Configuration
- [ ] Create `server/.env.example` with all required vars
- [ ] Create `client/.env.example` with VITE_ prefixed vars
- [ ] Create real `server/.env` (gitignored)
- [ ] Create real `client/.env` (gitignored)
- [ ] Update `.gitignore` for new patterns

### 1.4 Dependency Management
- [ ] Update root `package.json` scripts (use pnpm)
- [ ] Update `server/package.json` (add new deps, remove mongoose)
- [ ] Update `client/package.json` (add recharts for radar charts)
- [ ] Install all packages with pnpm

---

## 2. Database Schema Design

### 2.1 Tables
- [ ] `users` table (id, username, email, password_hash, role, branch, prn, mobile, year, avatar_url, created_at, updated_at)
- [ ] `projects` table (id, unique_project_id, title, description, domain_tags, student_id, mentor_id, status, visibility, stars, created_at, updated_at)
- [ ] `project_phases` table (id, project_id, phase_number, phase_name, completed, completed_at, description)
- [ ] `project_files` table (id, project_id, filename, original_name, r2_key, file_size, file_type, uploaded_at)
- [ ] `project_members` table (id, project_id, user_id, role_in_group)
- [ ] `feedback` table (id, project_id, reviewer_id, rating, comment, rubric_scores_json, created_at)
- [ ] `notifications` table (id, user_id, title, message, type, read, created_at)
- [ ] `refresh_tokens` table (id, user_id, token_hash, expires_at, created_at)

### 2.2 Indexes
- [ ] Index on users.email (unique)
- [ ] Index on users.prn (unique, nullable)
- [ ] Index on projects.student_id
- [ ] Index on projects.unique_project_id (unique)
- [ ] Index on projects.status
- [ ] Index on project_members.project_id
- [ ] Index on feedback.project_id
- [ ] Index on notifications.user_id
- [ ] Index on refresh_tokens.token_hash

---

## 3. Server Implementation

### 3.1 Security Middleware
- [ ] Install and configure `helmet` (HTTP security headers)
- [ ] Install and configure `express-rate-limit` (global + per-route)
- [ ] Install and configure `cors` with proper origin whitelist
- [ ] Install `zod` for request validation
- [ ] Create JWT middleware (`auth.middleware.js`) with access/refresh tokens
- [ ] Create role-based authorization middleware (`role.middleware.js`)
- [ ] Create request validation middleware (`validate.middleware.js`)
- [ ] Add request body size limits

### 3.2 Authentication API
- [ ] `POST /api/auth/signup` — register with validation (email, password strength, role)
- [ ] `POST /api/auth/login` — authenticate, return access + refresh tokens
- [ ] `POST /api/auth/refresh` — refresh access token using refresh token
- [ ] `POST /api/auth/logout` — invalidate refresh token
- [ ] `POST /api/auth/forgot-password` — send reset email
- [ ] `POST /api/auth/reset-password/:token` — reset password via token
- [ ] `PATCH /api/auth/update-password` — change password (authenticated)

### 3.3 User/Profile API
- [ ] `GET /api/users/me` — get current user profile
- [ ] `PATCH /api/users/me` — update profile fields (name, mobile, skills, avatar)
- [ ] `GET /api/users/:id` — get user by ID (teachers/admin only)

### 3.4 Projects API
- [ ] `POST /api/projects` — create project with file upload to R2
- [ ] `GET /api/projects` — list with pagination, filter (status, branch, domain, visibility)
- [ ] `GET /api/projects/:id` — get full project detail with phases, files, members
- [ ] `PATCH /api/projects/:id` — update project (owner or teacher)
- [ ] `DELETE /api/projects/:id` — delete project (owner only, cascades files)
- [ ] `PATCH /api/projects/:id/status` — update status (teacher/admin only)
- [ ] `PATCH /api/projects/:id/phase` — update single phase (owner)
- [ ] `PATCH /api/projects/:id/phases` — update multiple phases (owner)
- [ ] `GET /api/projects/student/:studentId` — student's projects
- [ ] `GET /api/projects/search` — full-text search across departments

### 3.5 Students API
- [ ] `GET /api/students` — list all students (teachers/admin)
- [ ] `GET /api/students/branch/:branch` — students by branch with project info
- [ ] `GET /api/students/:id/skills` — student skill radar data derived from projects

### 3.6 Feedback API
- [ ] `POST /api/feedback` — submit feedback on project (teacher/expert)
- [ ] `GET /api/feedback/project/:projectId` — get all feedback for a project

### 3.7 Notifications API
- [ ] `GET /api/notifications` — get user's notifications (paginated)
- [ ] `PATCH /api/notifications/:id/read` — mark notification as read
- [ ] `PATCH /api/notifications/read-all` — mark all as read

### 3.8 Analytics API
- [ ] `GET /api/analytics/skills/:userId` — radar chart data for student
- [ ] `GET /api/analytics/department/:branch` — department-level stats
- [ ] `GET /api/analytics/top-students` — top students by domain (industry filter)

### 3.9 File Management API
- [ ] `POST /api/files/upload` — upload to R2, return file metadata
- [ ] `GET /api/files/:key` — generate presigned download URL
- [ ] `DELETE /api/files/:key` — delete file from R2 (owner/admin)

---

## 4. Client Implementation

### 4.1 Auth Context & Protected Routes
- [ ] Create `AuthContext` with JWT token management
- [ ] Auto-refresh token on expiry (interceptor)
- [ ] Create `ProtectedRoute` component with role check
- [ ] Persist auth state in localStorage (tokens only)
- [ ] Redirect unauthenticated users to login

### 4.2 API Client
- [ ] Create axios instance with base URL from env
- [ ] Add request interceptor for auth headers
- [ ] Add response interceptor for 401 → refresh flow
- [ ] Centralize API calls in `services/` folder

### 4.3 Pages — Auth
- [ ] Login page — connects to real API
- [ ] Signup page — connects to real API with validation
- [ ] Forgot Password page — connects to real API
- [ ] Reset Password page — connects to real API

### 4.4 Pages — Common
- [ ] Landing Page — functional with real navigation
- [ ] Role Selection — navigates to correct login
- [ ] Branch Selection — fetches real branch data
- [ ] Profile Page — loads/updates real user data
- [ ] Help Page — static content, functional

### 4.5 Pages — Student Dashboard
- [ ] Project upload form submitting to real API + R2
- [ ] Phase tracking with real phase update API
- [ ] Project list from real API
- [ ] Skill resources section
- [ ] Progress analytics with real data

### 4.6 Pages — Teacher Dashboard
- [ ] Branch selection loads real students
- [ ] Student tracker table with real data
- [ ] Project review queue from real API
- [ ] Status update (approve/revise) via real API
- [ ] Feedback submission via real API

### 4.7 Pages — Industry Expert Dashboard
- [ ] Project catalog with real API filters (branch, domain, status)
- [ ] Search across departments
- [ ] Project evaluation modal with feedback API
- [ ] Top students by domain filter

### 4.8 Charts & Analytics
- [ ] Install recharts
- [ ] Radar/spider chart component for skill profiles
- [ ] Bar chart for department statistics
- [ ] Progress charts for project phases

---

## 5. API Testing Checklist

### 5.1 Auth Endpoints
- [ ] POST /api/auth/signup — valid data → 201
- [ ] POST /api/auth/signup — duplicate email → 400
- [ ] POST /api/auth/signup — missing fields → 400
- [ ] POST /api/auth/signup — weak password → 400
- [ ] POST /api/auth/login — valid credentials → 200 + tokens
- [ ] POST /api/auth/login — wrong password → 400
- [ ] POST /api/auth/login — non-existent email → 400
- [ ] POST /api/auth/login — mismatched role → 403
- [ ] POST /api/auth/refresh — valid refresh token → 200 + new tokens
- [ ] POST /api/auth/refresh — expired token → 401
- [ ] POST /api/auth/refresh — invalid token → 401
- [ ] POST /api/auth/logout — valid → 200
- [ ] POST /api/auth/forgot-password — existing email → 200
- [ ] POST /api/auth/forgot-password — non-existent email → 200 (same response)
- [ ] POST /api/auth/reset-password/:token — valid token → 200
- [ ] POST /api/auth/reset-password/:token — expired token → 400
- [ ] PATCH /api/auth/update-password — valid → 200
- [ ] PATCH /api/auth/update-password — wrong current password → 400
- [ ] PATCH /api/auth/update-password — unauthenticated → 401

### 5.2 User Endpoints
- [ ] GET /api/users/me — authenticated → 200 + user data
- [ ] GET /api/users/me — unauthenticated → 401
- [ ] PATCH /api/users/me — update name → 200
- [ ] PATCH /api/users/me — update mobile → 200
- [ ] GET /api/users/:id — as teacher → 200
- [ ] GET /api/users/:id — as student (not self) → 403

### 5.3 Project Endpoints
- [ ] POST /api/projects — valid data + files → 201
- [ ] POST /api/projects — missing required fields → 400
- [ ] POST /api/projects — unauthenticated → 401
- [ ] POST /api/projects — as teacher → 403
- [ ] GET /api/projects — as teacher → 200 + list
- [ ] GET /api/projects — pagination (page, limit) → correct subset
- [ ] GET /api/projects — filter by status → correct results
- [ ] GET /api/projects — filter by branch → correct results
- [ ] GET /api/projects/:id — exists → 200 + full detail
- [ ] GET /api/projects/:id — not found → 404
- [ ] PATCH /api/projects/:id — owner updates → 200
- [ ] PATCH /api/projects/:id — non-owner → 403
- [ ] DELETE /api/projects/:id — owner deletes → 200
- [ ] DELETE /api/projects/:id — non-owner → 403
- [ ] PATCH /api/projects/:id/status — teacher approves → 200
- [ ] PATCH /api/projects/:id/status — student tries → 403
- [ ] PATCH /api/projects/:id/status — invalid status → 400
- [ ] PATCH /api/projects/:id/phase — valid phase update → 200
- [ ] PATCH /api/projects/:id/phase — invalid phase name → 400
- [ ] GET /api/projects/student/:studentId — valid → 200
- [ ] GET /api/projects/search?q=keyword — returns matches → 200

### 5.4 Student Endpoints
- [ ] GET /api/students — as teacher → 200
- [ ] GET /api/students — as student → 403
- [ ] GET /api/students/branch/:branch — valid branch → 200
- [ ] GET /api/students/branch/:branch — invalid branch → 200 + empty
- [ ] GET /api/students/:id/skills — valid → 200 + radar data

### 5.5 Feedback Endpoints
- [ ] POST /api/feedback — teacher submits → 201
- [ ] POST /api/feedback — student submits → 403
- [ ] POST /api/feedback — missing fields → 400
- [ ] GET /api/feedback/project/:id — exists → 200 + list

### 5.6 Notification Endpoints
- [ ] GET /api/notifications — authenticated → 200 + list
- [ ] GET /api/notifications — unauthenticated → 401
- [ ] PATCH /api/notifications/:id/read — valid → 200
- [ ] PATCH /api/notifications/read-all — valid → 200

### 5.7 Analytics Endpoints
- [ ] GET /api/analytics/skills/:userId — valid → 200 + radar data
- [ ] GET /api/analytics/department/:branch — valid → 200 + stats
- [ ] GET /api/analytics/top-students?domain=CyberSecurity → 200 + list

### 5.8 File Endpoints
- [ ] POST /api/files/upload — valid file → 201 + metadata
- [ ] POST /api/files/upload — file too large → 400
- [ ] GET /api/files/:key — valid → 200 + presigned URL
- [ ] GET /api/files/:key — not found → 404
- [ ] DELETE /api/files/:key — owner → 200
- [ ] DELETE /api/files/:key — non-owner → 403

### 5.9 Rate Limiting
- [ ] Auth endpoints — max 10 requests/15min per IP
- [ ] General API — max 100 requests/15min per IP
- [ ] File upload — max 20 requests/15min per user
- [ ] Verify 429 response when exceeded

### 5.10 Security
- [ ] All endpoints return proper CORS headers
- [ ] Helmet headers present in responses
- [ ] JWT tokens expire properly
- [ ] SQL injection attempts are blocked by parameterized queries
- [ ] XSS payloads in inputs are sanitized
- [ ] File uploads validate mime types
- [ ] Presigned URLs expire after configured time

---

## 6. UI Testing Checklist

### 6.1 Landing Page
- [ ] Page loads without errors
- [ ] Login button navigates to role selection
- [ ] Signup button navigates to role selection
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark/light theme toggle works

### 6.2 Role Selection
- [ ] Three role cards displayed (Student, Teacher, Expert)
- [ ] Clicking card navigates to correct login route
- [ ] Back navigation works

### 6.3 Login Page
- [ ] Form validation (empty fields, email format)
- [ ] Correct error messages on failed login
- [ ] Successful login redirects to correct dashboard
- [ ] "Forgot password" link works
- [ ] Theme toggle visible

### 6.4 Signup Page
- [ ] All fields present (name, email, password, branch)
- [ ] Password strength indicator
- [ ] Duplicate email shows error
- [ ] Successful signup redirects to login
- [ ] Branch dropdown populated

### 6.5 Forgot/Reset Password
- [ ] Email form submits and shows success message
- [ ] Reset form with valid token works
- [ ] Reset form with expired token shows error
- [ ] Password confirmation validation

### 6.6 Student Dashboard
- [ ] Project upload form with file attachment
- [ ] File upload progress indicator
- [ ] Phase tracking UI with checkmarks
- [ ] Project list displays real projects
- [ ] Skill resources section accessible
- [ ] Analytics/progress charts render
- [ ] Sidebar navigation works
- [ ] Logout works and clears session

### 6.7 Teacher Dashboard
- [ ] Branch selection shows all departments
- [ ] Student tracker table loads real data
- [ ] Clicking student shows detail modal
- [ ] Review queue shows pending projects
- [ ] Approve/Revision buttons update status
- [ ] Feedback form submits correctly
- [ ] Search/filter works

### 6.8 Industry Expert Dashboard
- [ ] Project catalog loads with filters
- [ ] Branch, domain, status filters work
- [ ] Search across departments returns results
- [ ] Project evaluation modal opens/closes
- [ ] Feedback submission works
- [ ] Top students filter by domain

### 6.9 Profile Page
- [ ] Shows current user data
- [ ] Edit form updates profile
- [ ] Password change modal works
- [ ] Avatar upload (if implemented)

### 6.10 Help Page
- [ ] FAQ accordion works
- [ ] All links functional
- [ ] Contact information displayed

### 6.11 Cross-cutting UI
- [ ] Dark/light theme works across all pages
- [ ] Navigation consistent across pages
- [ ] Error boundaries catch and display errors
- [ ] Loading states shown during API calls
- [ ] Empty states for no data
- [ ] Toast notifications for success/error
- [ ] 404 page for undefined routes
