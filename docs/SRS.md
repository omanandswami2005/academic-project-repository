# Software Requirements Specification (SRS)

## Project Title: Academic Project Repository & Skill Mapping System (APRS)

---

## 1. Introduction

### 1.1 Purpose

Eliminate repetitive academic work, provide a centralized repository for student projects (similar to GitHub), and create a data-driven bridge between student skills and industry requirements. The system also streamlines project evaluation, mentor allocation, deadline management, and generates ready-to-use reports for accreditation bodies (NAAC / NBA).

### 1.2 Scope

The system manages projects across all college departments (Mechanical, Civil, Computer, ENTC, etc.). It tracks project lifecycles from first year to final year, allowing for "carry-forward" innovation rather than redundant repetition. It covers the complete lifecycle: **topic approval → mentor assignment → phase-wise execution → review & grading → archival & carry-forward**.

### 1.3 Definitions & Acronyms

| Term | Meaning |
|---|---|
| PRN | Permanent Registration Number (unique per student) |
| NAAC | National Assessment and Accreditation Council |
| NBA | National Board of Accreditation |
| TNP | Training and Placement cell |
| HOD | Head of Department |
| CGPA | Cumulative Grade Point Average |
| Rubric | A structured scoring template (e.g., Technical Depth 0-10) |
| Carry-forward | Picking up a previous batch's unfinished/promising project and extending it |

---

## 2. Overall Description

### 2.1 Product Perspective

A cloud-based web application that serves as a private repository for the college. It integrates data visualization (Radar Charts) for skill assessment and provides workflow automation for the complete project lifecycle — from topic approval and mentor assignment through phase-wise tracking, deadline enforcement, evaluation, and final archival.

### 2.2 User Classes and Characteristics

| Role | Description |
|---|---|
| **Students** | Upload projects, track phases via Kanban board, collaborate in groups, view feedback, build skill profile, discover past projects for inspiration |
| **Faculty Mentors (Teachers)** | Monitor progress, set deadlines, approve/reject projects, provide structured rubric-based feedback, manage branch students, create announcements |
| **Admin (HOD / College)** | Manage departments, assign mentors, oversee plagiarism/repetition, generate accreditation reports, manage academic calendar |
| **Industry Experts / TNP** | Discover & evaluate student projects, filter top students by skill domain regardless of CGPA, provide industry feedback |

### 2.3 Operating Environment

- Accessible via modern web browsers (Chrome, Firefox, Safari, Edge)
- Responsive: desktop, tablet, and mobile
- Dark / light theme support
- Deployable on any Node.js hosting (Render, Railway, Vercel, etc.)

### 2.4 Assumptions and Dependencies

- College provides official student data (PRN, branch, year) for registration validation
- Teachers are pre-registered or self-register with college email
- Internet connectivity is required (cloud-hosted DB & file storage)
- File uploads limited to 50 MB per file (R2 free tier)

---

## 3. Functional Requirements

### 3.1 Project Repository Management

- **FR1 - Repository Creation:** Every project must have a unique repository (similar to GitHub) with title, description, domain tags, and file attachments.
- **FR2 - Unique Identification:** Every project assigned a unique ID based on sequence (e.g., `CSE_2026_001`) using `BRANCH_YEAR_SEQ` format for easy tracking.
- **FR3 - Project Continuity (Carry-Forward):** A completed/archived project can be "forked" by a new batch. The new project links to the original as `forkedFromId`, preserving attribution. The new team can add improvements and track what changed.
- **FR4 - Project Lifecycle Statuses:** `draft` → `pending` → `under_review` → `approved` / `needs_revision` → `completed` → `archived`. Teachers control status transitions; students can only move from draft to pending (submit for review).
- **FR5 - Six-Phase Execution Model:** Every project follows 6 mandatory phases:
  1. Idea & Proposal
  2. Research Paper
  3. Building Prototype
  4. Completing Prototype
  5. Completing Model
  6. Final Submission

  Each phase has: completion status, description, deadline (set by teacher), and completion timestamp.

### 3.2 Student & Group Management

- **FR6 - Identity Mapping:** Students identified by Name, Email, PRN, Mobile, Branch, and Year.
- **FR7 - Group Formation:** Support for groups of 1–4 students per project. One member is the "leader" (creator). Leader can invite other students by PRN/email; invitees accept or decline.
- **FR8 - Skill Tagging:** Projects tagged with domain skills (e.g., IoT, Cyber Security, ML, Web Dev). Tags auto-populate the student's skill profile for radar chart generation.
- **FR9 - Mentor Request:** Students can request a specific teacher as mentor while creating a project. Teacher receives a notification and can accept or reassign. If no mentor requested, HOD/admin assigns one.

### 3.3 Search and Discovery

- **FR10 - Cross-Department Visibility:** Any user can browse "public" projects across all departments. Students can discover past projects for inspiration before proposing their own topic.
- **FR11 - Advanced Search:** Search by title, description keyword, domain tag, branch, year, or student name. Supports combined filters and pagination.
- **FR12 - Duplicate/Plagiarism Detection:** When a student submits a new project title, the system checks similarity against all existing project titles in the same branch. If similarity > 70%, a warning is shown (not blocked) and the teacher is flagged.

### 3.4 Deadline & Progress Tracking

- **FR13 - Teacher-Set Deadlines:** Teachers can set a deadline date for each of the 6 phases per project (or branch-wide default deadlines). Students see countdowns on their Kanban board.
- **FR14 - Kanban Task Board:** Students manage their project phases via a 3-column drag-and-drop board (To Do → In Progress → Done). Dragging a card to "Done" marks the phase complete with a timestamp.
- **FR15 - Overdue Alerts:** If a phase deadline passes without completion, the system:
  - Marks the phase as "overdue" (visual indicator on student Kanban)
  - Sends a notification to the student
  - Flags the student in the teacher's "Needs Attention" list
- **FR16 - Auto Progress Calculation:** Project completion percentage = (completed phases / 6) × 100. Stars are earned per phase (max 6 stars).

### 3.5 Feedback & Evaluation

- **FR17 - Structured Rubric Scoring:** Teachers and experts evaluate projects using a 5-dimension rubric (each 0-10):
  - Technical Depth
  - Innovation & Originality
  - Documentation Quality
  - Presentation & Demo
  - Completeness

  Total score out of 50, stored as JSON.
- **FR18 - Written Feedback:** In addition to rubric scores, reviewers can add free-text comments.
- **FR19 - Multi-Reviewer Support:** A project can receive feedback from multiple teachers and experts. All reviews are visible on the project detail page.
- **FR20 - Evaluation Confirmation:** After submitting feedback, the expert/teacher sees a confirmation screen with option to "Submit Another" or "Close" — preventing accidental modal closure.

### 3.6 Notifications & Communication

- **FR21 - Event-Driven Notifications:** The system generates notifications for:
  - Project status change (approved, needs revision)
  - New feedback received
  - Mentor assignment confirmation
  - Deadline approaching (3 days before, 1 day before)
  - Phase overdue
  - Group invitation received / accepted / declined
  - Announcement posted by teacher
- **FR22 - Teacher Announcements:** Teachers can post branch-wide announcements (title + message). All students in the branch see the announcement on their dashboard.
- **FR23 - Mark Read / Read All:** Users can mark individual notifications as read, or mark all as read.

### 3.7 Analytics & Placement

- **FR24 - Skill Radar Charts:** Generate visual skill profiles (Radar/Spider charts) for each student based on:
  - Domain tags from their projects
  - Rubric scores from teacher/expert evaluations
  - Number of completed phases
- **FR25 - Industry Filter (Top-N):** TNP/companies can search "Top N students in [Domain]" ranked by project quality (stars, rubric scores) rather than just CGPA.
- **FR26 - Department Analytics:** Per-branch aggregated stats:
  - Total students & projects
  - Approved vs pending vs overdue
  - Average rubric scores
  - Domain distribution (pie/bar chart)
  - Year-over-year comparison
- **FR27 - Student Portfolio View:** Students get an auto-generated portfolio page showing all their projects, skills radar, total stars, feedback summary — shareable via a public link for placement interviews.

### 3.8 Admin & College Management

- **FR28 - Admin Dashboard:** HOD/admin can:
  - View all departments and their stats at a glance
  - Assign/reassign mentors to projects
  - Set academic calendar (semester start/end, submission deadlines)
  - Manage user accounts (activate/deactivate, reset passwords)
- **FR29 - Report Generation (Accreditation):** Generate downloadable reports:
  - Department-wise project summary (PDF/Excel)
  - Student-wise project & skill report
  - Mentor workload report (projects per teacher)
  - Semester-wise completion statistics
  - These reports align with NAAC/NBA documentation requirements.
- **FR30 - Plagiarism Dashboard:** Admin sees a list of flagged similar projects with similarity percentage, allowing manual review and action.
- **FR31 - Academic Calendar:** Define semester periods, default phase deadlines, and submission windows. Projects created during a semester auto-inherit the calendar's deadlines.

### 3.9 Project Continuity & Archival

- **FR32 - End-of-Semester Archival:** At semester end, all approved projects are automatically marked "archived." Archived projects remain searchable and viewable but cannot be edited.
- **FR33 - Fork/Carry-Forward:** Any student (current or next batch) can "fork" an archived project — creating a new project pre-populated with the original's description and tags, linked via `forkedFromId`. The original team gets credited.
- **FR34 - Version History:** Each file upload creates a new version. Students can view previous uploads and revert if needed. Teachers can see the submission timeline.

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Student Dashboard
- **Kanban Board** — Drag-and-drop task management (To Do / In Progress / Done) with deadline badges and overdue indicators
- **Project Upload Center** — Create project with title, description, tags, file attachments, group member invites, and mentor request
- **Progress Tracker** — Visual phase-by-phase completion with percentage and stars
- **Feedback View** — All received reviews with rubric breakdowns
- **Skill Analytics** — Personal radar chart and skill profile summary
- **Skill Resources** — Curated learning channels for skill development
- **Notifications** — Real-time alerts for feedback, deadlines, status changes

#### 4.1.2 Teacher Dashboard
- **Branch Overview** — Stats: active students, review queue, overdue count, avg completion
- **Student Tracker** — Searchable table of all branch students with project status, progress bar, and last activity
- **Review Queue** — List of projects awaiting review, sorted by priority (new submissions, overdue, under review). One-click approve/revise with rubric scoring form
- **Student Detail Modal** — Clicking a student shows: project list, phase status, skill radar, feedback history, submitted files
- **Deadline Management** — Set branch-wide or per-project phase deadlines. View overdue students
- **Announcements** — Create and manage branch-wide announcements
- **Sidebar Badge** — Real-time count of pending reviews on sidebar

#### 4.1.3 Industry Expert Dashboard
- **Project Catalog** — Browse all public projects with multi-filter (branch, domain, year, completion %)
- **Featured Projects** — Highest-rated projects highlighted for quick access
- **Evaluation Modal** — Structured feedback form (Innovation, Feasibility, Hireability scores + comments) with submission confirmation
- **Top Students** — Ranked leaderboard by domain, star count, and rubric scores
- **Department Statistics** — Branch-level analytics with domain distribution

#### 4.1.4 Admin Dashboard *(new)*
- **College Overview** — Total students, projects, teachers, approval rates across all branches
- **Mentor Assignment** — Assign/reassign teacher mentors to projects
- **Academic Calendar** — Set semester dates, default deadlines
- **User Management** — Activate/deactivate accounts, reset passwords
- **Plagiarism Flags** — Review flagged similar projects
- **Report Generator** — Export department/student/mentor reports (PDF/Excel)

#### 4.1.5 Common Pages
- **Landing Page** — Platform overview with role-based login navigation
- **Profile Page** — Edit name, phone, bio (500 chars); change password
- **Role Selection** — Choose role during signup (student / teacher / expert)
- **Branch Selection** — Select department on teacher/admin entry
- **Help Page** — Contextual tips and platform guide

### 4.2 Software Interfaces

- **Cloud Hosting:** High-speed access and scalability (Neon PostgreSQL for DB).
- **Object Storage:** Cloudflare R2 for file uploads (project documents, reports, images).
- **Email Service:** Nodemailer (Gmail SMTP) for password resets, deadline reminders, and notification digests.

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Page load time < 2 seconds on 4G connection
- API response time < 500ms for standard queries
- Supports 500+ concurrent users across 15+ departments
- Paginated endpoints (default 20 items, max 100)

### 5.2 Security & Integrity

- **Authentication:** JWT-based access + refresh token system with role-based access control (RBAC).
- **Password Security:** bcryptjs hashing (12 rounds), minimum 6-character passwords with strength validation.
- **Rate Limiting:** Global rate limit + stricter limits on auth endpoints (login, signup, forgot-password).
- **Input Validation:** Server-side Zod validation on all endpoints. Client-side validation for UX.
- **Plagiarism Control:** Title similarity check using string comparison (Levenshtein / cosine). Flag but don't block — teacher reviews flags.
- **File Security:** Presigned URLs for downloads (time-limited). File type validation on upload (PDF, DOCX, images, code files).
- **CORS:** Whitelist production domain only. No wildcard origins.
- **Helmet:** HTTP security headers (XSS, clickjacking, content-type sniffing protection).
- **Backup:** Neon DB automatic daily backups + point-in-time recovery.
- **Session Management:** Refresh tokens stored as hashes in DB, invalidated on logout. Max 5 active sessions per user.

### 5.3 Usability

- Reduce time spent on manual Excel entries and repetitive formatting.
- Dark / light theme toggle (persisted in localStorage).
- Responsive design: mobile, tablet, desktop breakpoints.
- Keyboard accessible — all interactive elements reachable via Tab, actions via Enter/Space.
- Toast notifications for success/error feedback on all actions.
- Loading states and skeleton screens during data fetches.

### 5.4 Reliability

- System availability target: 99.5% uptime
- Graceful error handling — no blank screens on API failure, fallback UI shown
- Auto-retry on network failures (Axios interceptor retries once on 5xx)

### 5.5 Scalability

- Stateless API design — horizontally scalable behind load balancer
- Database connection pooling (Neon serverless auto-scales)
- File storage on R2 — no local disk dependency

---

## 6. Data Entities

| Entity | Key Attributes |
|---|---|
| **User** | id, username, email, password_hash, role (student/teacher/expert/admin), branch, PRN, mobile, bio, year, skills (JSON), avatar_url, reset_password_token, reset_password_expires, created_at, updated_at |
| **Project** | id, unique_project_id (BRANCH_YEAR_SEQ), title, description, domain_tags (JSON), student_id (FK→User), mentor_id (FK→User), status (draft/pending/under_review/approved/needs_revision/completed/archived), visibility (public/private/department), stars, forked_from_id (FK→Project, nullable), semester, academic_year, created_at, updated_at |
| **Project Phase** | id, project_id (FK→Project), phase_number (1-6), phase_name, completed, completed_at, description, deadline (nullable, set by teacher) |
| **Project File** | id, project_id (FK→Project), filename, original_name, r2_key, file_size, file_type, version (integer, auto-increment per project), uploaded_at |
| **Project Member** | id, project_id (FK→Project), user_id (FK→User), role_in_group (leader/member), status (invited/accepted/declined), joined_at |
| **Feedback** | id, project_id (FK→Project), reviewer_id (FK→User), rating, comment, rubric_scores (JSON: {technical, innovation, documentation, presentation, completion}), created_at |
| **Notification** | id, user_id (FK→User), title, message, type (info/success/warning/error/deadline/feedback), read, link (optional deep-link to relevant page), created_at |
| **Refresh Token** | id, user_id (FK→User), token_hash, expires_at, created_at |
| **Announcement** | id, teacher_id (FK→User), branch, title, content, created_at |
| **Academic Calendar** | id, semester_name, branch (nullable = all), start_date, end_date, default_phase_deadlines (JSON), created_by (FK→User), created_at |
| **Plagiarism Flag** | id, new_project_id (FK→Project), existing_project_id (FK→Project), similarity_score, reviewed (boolean), reviewed_by (FK→User, nullable), created_at |

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 7, React Router v6, Axios, Lucide Icons, Recharts, @hello-pangea/dnd, react-hot-toast |
| **Backend** | Node.js 20, Express 5 |
| **Database** | PostgreSQL (Neon DB - serverless) |
| **ORM** | Drizzle ORM |
| **File Storage** | Cloudflare R2 (S3-compatible object storage) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |
| **Validation** | Zod v4 (server-side schema validation) |
| **Security** | Helmet, express-rate-limit, CORS, bcryptjs |
| **Styling** | Custom CSS with CSS variables (design tokens), dark/light theme |
| **Drag & Drop** | @hello-pangea/dnd (react-beautiful-dnd fork) |

---

## 8. API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user (email, password, role, branch, PRN) |
| POST | `/api/auth/login` | Login with email + password, return JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token using refresh token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password via token |
| PATCH | `/api/auth/update-password` | Change password (authenticated) |

### Users / Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile (name, mobile, bio, skills) |
| GET | `/api/users/:id` | Get user by ID (admin/teacher) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create project (with file upload, group members, mentor request) |
| GET | `/api/projects` | List projects (filters: status, branch, domain, visibility, year) |
| GET | `/api/projects/:id` | Get project detail (phases, files, members, feedback) |
| PATCH | `/api/projects/:id` | Update project (title, description, tags, visibility) |
| DELETE | `/api/projects/:id` | Delete project (owner only, cascades files from R2) |
| PATCH | `/api/projects/:id/status` | Update status (teacher/admin only) |
| PATCH | `/api/projects/:id/phase` | Update single phase (mark complete, add description) |
| PATCH | `/api/projects/:id/phases` | Bulk update multiple phases |
| GET | `/api/projects/student/:studentId` | Get all projects by a student |
| GET | `/api/projects/search` | Search projects across departments (query, branch, domain) |
| POST | `/api/projects/:id/fork` | Fork/carry-forward an archived project *(new)* |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | List all students (teacher/admin) |
| GET | `/api/students/branch/:branch` | Students by branch with project stats |
| GET | `/api/students/:id/skills` | Student skill radar data |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit structured feedback (rubric + comment) |
| GET | `/api/feedback/project/:projectId` | Get all feedback for a project |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications (paginated) |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/skills/:userId` | Skill radar data for student |
| GET | `/api/analytics/department/:branch` | Department statistics (students, projects, domains) |
| GET | `/api/analytics/top-students` | Top students by domain (for TNP/industry) |
| GET | `/api/analytics/overview` | College-wide overview stats (admin) *(new)* |

### File Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload file to R2 (multipart, max 50MB) |
| GET | `/api/files/:key` | Get presigned download URL |
| DELETE | `/api/files/:key` | Delete file from R2 (owner/admin) |

### Announcements *(new)*
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/announcements` | Create branch announcement (teacher) |
| GET | `/api/announcements/branch/:branch` | Get announcements for branch |
| DELETE | `/api/announcements/:id` | Delete announcement (author/admin) |

### Admin *(new)*
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/overview` | College-wide stats for admin dashboard |
| PATCH | `/api/admin/projects/:id/mentor` | Assign/reassign mentor to project |
| GET | `/api/admin/plagiarism-flags` | Get all flagged similar projects |
| PATCH | `/api/admin/plagiarism-flags/:id` | Mark flag as reviewed |
| GET | `/api/admin/reports/:type` | Generate report (department/student/mentor) |

---

## 9. User Flow Diagrams

### 9.1 Student Flow
```
Landing → Signup (select role: student, branch, PRN) → Login (email + password)
→ Home Dashboard → Student Dashboard
  ├── Upload Project (title, desc, tags, files, invite members, request mentor)
  │     └── System generates unique ID (CSE_2026_001)
  │     └── System checks title similarity → warns if duplicate
  │     └── Mentor notified
  ├── Kanban Board (drag phases between To Do / In Progress / Done)
  │     └── Deadline badges shown per phase
  │     └── Overdue phases highlighted red
  ├── View Feedback (rubric scores + comments from reviewers)
  ├── Skill Analytics (radar chart auto-generated from project tags + scores)
  ├── Skill Resources (curated learning links)
  └── Notifications (status changes, feedback, deadlines, invites)
```

### 9.2 Teacher Flow
```
Landing → Login → Home Dashboard → Teacher Dashboard
  ├── Select Branch → View Branch Overview (stats)
  ├── Student Tracker (search by name/PRN, view progress)
  │     └── Click student → Detail Modal (projects, phases, radar, feedback)
  ├── Review Queue (pending projects, sorted by priority)
  │     └── Click project → Review with Rubric (5 dimensions × 10 pts)
  │     └── Approve / Request Revision + written feedback
  ├── Set Phase Deadlines (branch-wide or per-project)
  │     └── System auto-notifies students approaching deadline
  ├── Announcements (create branch-wide notices)
  └── Sidebar badge shows pending review count
```

### 9.3 Industry Expert Flow
```
Landing → Login → Home Dashboard → Expert Dashboard
  ├── Project Catalog (browse public projects, multi-filter)
  │     └── Featured projects section (3+ stars)
  ├── Evaluate Project (Innovation, Feasibility, Hireability + comment)
  │     └── Confirmation screen after submit
  ├── Top Students (ranked by domain, stars, rubric scores)
  └── Department Statistics (branch-level analytics)
```

### 9.4 Admin Flow *(new)*
```
Landing → Login → Home Dashboard → Admin Dashboard
  ├── College Overview (all-branch stats at a glance)
  ├── Mentor Assignment (assign/reassign teachers to projects)
  ├── User Management (activate/deactivate, password resets)
  ├── Plagiarism Flags (review similar project alerts)
  ├── Academic Calendar (set semester dates, default deadlines)
  └── Report Generator (export PDF/Excel for NAAC/NBA)
```

---

## 10. Appendix

### 10.1 Project Status Transitions

```
draft ──(student submits)──→ pending
pending ──(teacher picks up)──→ under_review
under_review ──(teacher approves)──→ approved
under_review ──(teacher requests changes)──→ needs_revision
needs_revision ──(student resubmits)──→ pending
approved ──(all 6 phases done)──→ completed
completed ──(semester ends)──→ archived
```

### 10.2 Star Calculation

Stars = count of completed phases (0–6). Displayed as visual rating on project cards.

### 10.3 Skill Radar Dimensions

Radar chart axes are dynamically generated from:
1. Domain tags across all student projects (e.g., IoT, ML, Web Dev)
2. Weighted by rubric scores from evaluations
3. Normalized to 0–100 scale

### 10.4 Rubric Scoring Template

| Dimension | Range | Description |
|---|---|---|
| Technical Depth | 0–10 | Complexity of implementation, algorithms, architecture |
| Innovation | 0–10 | Originality, creative problem-solving |
| Documentation | 0–10 | Quality of report, README, code comments |
| Presentation | 0–10 | Demo quality, communication, slide design |
| Completion | 0–10 | How much of the proposed scope was delivered |
| **Total** | **0–50** | |
