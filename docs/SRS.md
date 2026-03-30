# Software Requirements Specification (SRS)

## Project Title: Academic Project Repository & Skill Mapping System (APRS)

---

## 1. Introduction

### 1.1 Purpose

Eliminate repetitive academic work, provide a centralized repository for student projects (similar to GitHub), and create a data-driven bridge between student skills and industry requirements.

### 1.2 Scope

The system manages projects across all college departments (Mechanical, Civil, Computer, ENTC, etc.). It tracks project lifecycles from first year to final year, allowing for "carry-forward" innovation rather than redundant repetition.

---

## 2. Overall Description

### 2.1 Product Perspective

A cloud-based web application that serves as a private repository for the college. It integrates data visualization (Radar Charts) for skill assessment.

### 2.2 User Classes and Characteristics

| Role | Description |
|---|---|
| **Students** | Upload projects, search for existing research, collaborate in groups, generate reports |
| **Faculty Mentors (Teachers)** | Monitor progress, approve projects, provide ratings/feedback |
| **Admin (College/Department)** | Manage department-wise data, oversee plagiarism/repetition checks |
| **Industry Experts / TNP** | Identify students with specific skill sets regardless of CGPA |

---

## 3. Functional Requirements

### 3.1 Project Repository Management

- **FR1 - Repository Creation:** Every project must have a unique repository (similar to GitHub).
- **FR2 - Unique Identification:** Every project assigned a unique ID based on sequence (e.g., `BRANCH_YEAR_ID`) for easy tracking.
- **FR3 - Project Continuity:** System must allow a project to be shifted from a previous batch to a new batch with added parameters/efficiency for continuous improvement.

### 3.2 Student & Group Profiling

- **FR4 - Identity Mapping:** Students identified by Name, Mobile Number, and PRN (Permanent Registration Number).
- **FR5 - Group Management:** Support for groups of 1–3 students per project.
- **FR6 - Skill Tagging:** Automatic or manual tagging of projects with domains (e.g., IoT, Cyber Security, Agriculture).

### 3.3 Search and Discovery

- **FR7 - Cross-Department Visibility:** Any student should be able to view "good projects" in other departments if marked public.
- **FR8 - Access Control:** Users can download data only if they have the required access permissions.

### 3.4 Automated Reporting & Integration

- **FR9 - Progress Tracking:** Real-time updates on project status to prevent last-minute "rushed" reports.

### 3.5 Analytics and Placement

- **FR10 - Radar Charts:** Generate visual skill profiles (Radar/Spider charts) for students based on project work.
- **FR11 - Industry Filter:** Allow TNP/Companies to search for "Top N students in [Domain]" based on project tags rather than just CGPA.

---

## 4. External Interface Requirements

### 4.1 User Interface

- **Dashboard:** Simple, intuitive UI so even a novice can navigate it.
- **Visuals:** Use of charts for project statistics and skill sets.

### 4.2 Software Interfaces

- **Cloud Hosting:** High-speed access and scalability (Neon PostgreSQL for DB).
- **Object Storage:** Cloudflare R2 for file uploads (project documents, reports).

---

## 5. Non-Functional Requirements

### 5.1 Performance

- Optimized for handling large amounts of data and concurrent users across 15+ departments.

### 5.2 Security & Integrity

- **Authentication:** JWT-based authentication with role-based access control (RBAC).
- **Rate Limiting:** API rate limiting to prevent abuse.
- **Input Validation:** Server-side validation on all endpoints.
- **Plagiarism Control:** Identify and flag repetitive project titles or content from previous years.
- **Backup:** Reliable backend backup to ensure no student data is lost.
- **CORS:** Proper CORS configuration for production.
- **Helmet:** HTTP security headers.

### 5.3 Usability

- Reduce time spent on manual Excel entries and repetitive formatting.
- Dark/light theme support.
- Responsive design for mobile, tablet, desktop.

---

## 6. Data Entities

| Entity | Key Attributes |
|---|---|
| **User** | id, username, email, password, role, branch, PRN, mobile, year, skills, avatar |
| **Project** | id, unique_project_id (BRANCH_YEAR_SEQ), title, description, domain/tags, mentor, group members, phases (1-6), stars, status, files, visibility (public/private) |
| **Department** | id, name, head_of_dept, total_projects |
| **Group** | id, project_id, members (user references), created_at |
| **Feedback** | id, project_id, reviewer_id, rating, comment, rubric_scores |
| **Notification** | id, user_id, message, type, read, created_at |

---

## 7. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router, Axios, Lucide Icons |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL (Neon DB - serverless) |
| **ORM** | Drizzle ORM |
| **File Storage** | Cloudflare R2 (S3-compatible object storage) |
| **Auth** | JWT (access + refresh tokens) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, express-rate-limit, CORS, bcryptjs, input validation (zod) |

---

## 8. API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user, return JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password via token |
| PATCH | `/api/auth/update-password` | Change password (authenticated) |

### Users / Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/:id` | Get user by ID (admin/teacher) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create project (with file upload) |
| GET | `/api/projects` | List projects (with filters, pagination) |
| GET | `/api/projects/:id` | Get project detail |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (owner only) |
| PATCH | `/api/projects/:id/status` | Update status (teacher/admin) |
| PATCH | `/api/projects/:id/phase` | Update single phase |
| PATCH | `/api/projects/:id/phases` | Update multiple phases |
| GET | `/api/projects/student/:studentId` | Get student's projects |
| GET | `/api/projects/search` | Search projects across departments |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | List all students |
| GET | `/api/students/branch/:branch` | Students by branch |
| GET | `/api/students/:id/skills` | Student skill profile |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit feedback on project |
| GET | `/api/feedback/project/:projectId` | Get feedback for project |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark as read |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/skills/:userId` | Skill radar data |
| GET | `/api/analytics/department/:branch` | Department statistics |

### File Management
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload files to R2 |
| GET | `/api/files/:key` | Get signed download URL |
| DELETE | `/api/files/:key` | Delete file from R2 |
