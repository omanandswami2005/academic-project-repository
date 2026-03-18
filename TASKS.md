# TASKS.md

## 1. High Priority (Blocking Issues)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Implement JWT Authentication** | Update login to generate and return a JWT. Create an `authMiddleware` to verify tokens on protected routes to secure the API. | Backend | `server/src/controllers/auth.controller.js`, `server/src/middleware/auth.js`, `server/src/routes/*.js` | High |
| **Implement Role-Based Access Control (RBAC)** | Create an `authorize` middleware to restrict endpoint access based on user role (student, teacher, expert). | Backend | `server/src/middleware/auth.js`, `server/src/routes/*.js` | Medium |
| **Remove Hardcoded Mock Data** | Delete all hardcoded mock arrays from dashboard components to prevent false assumptions of completion. Replace with empty states/loaders. | Frontend | `client/src/pages/dashboards/TeacherDashboard.jsx`, `client/src/pages/dashboards/IndustryExpertDashboard.jsx` | Low |
| **API Request Validation** | Add a validation layer (e.g., Joi or express-validator) to sanitize and validate incoming payloads for auth and project endpoints. | Backend | `server/src/middleware/validate.js`, `server/src/routes/*.js` | Medium |
| **Schema Update: Student Identity & Groups** | Update User and Project Mongoose schemas to mandate PRN/Mobile mapping and support 1-3 members per project group. | Backend | `server/src/models/User.js`, `server/src/models/Project.js` | Medium |
| **Schema Update: Domain Tagging** | Update Project schema to support an array of skill/domain tags as required by the SRS. | Backend | `server/src/models/Project.js` | Low |

---

## 2. Medium Priority (Core Features)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Project Search & Filtering API** | Create a robust MongoDB aggregation pipeline endpoint to allow searching projects by skill tags, domain, branch, and status. | Backend | `server/src/controllers/project.controller.js`, `server/src/routes/project.routes.js` | High |
| **Integrate Dashboards with Live API** | Connect the Teacher and Industry Expert dashboards to the real backend endpoints (fetching students and filtered projects). | Frontend | `client/src/pages/dashboards/TeacherDashboard.jsx`, `client/src/pages/dashboards/IndustryExpertDashboard.jsx`, `client/src/api/` | High |
| **Unique Project ID Generation** | Implement a sequence generator to assign unique IDs to projects in the format `BRANCH_YEAR_ID`. | Backend | `server/src/models/Project.js`, `server/src/controllers/project.controller.js` | Medium |
| **Project Continuity / Batch Shifting** | Add an endpoint and UI flow to allow an existing project to be shifted or cloned into a new batch for continuous improvement. | Fullstack | `server/src/controllers/project.controller.js`, `client/src/pages/dashboards/TeacherDashboard.jsx` | High |
| **Cross-Department Visibility UI** | Implement frontend filters and adjust backend queries to allow viewing "good" (public/approved) projects from other departments. | Fullstack | `server/src/pages/dashboards/*.jsx`, `server/src/controllers/project.controller.js` | Medium |
| **Centralized API Service Layer** | Refactor frontend to use a centralized Axios instance with interceptors for attaching the JWT, rather than hardcoded URLs. | Frontend | `client/src/api/axios.js`, all `client/src/pages/` | Medium |

---

## 3. Low Priority (Enhancements)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Visual Skill Profiles (Radar Charts)** | Integrate a charting library (e.g., Recharts, Chart.js) to display Radar/Spider charts of student skills based on project tags. | Frontend | `client/src/pages/dashboards/StudentDashboard.jsx`, `client/src/pages/common/ProfilePage.jsx` | Medium |
| **Overleaf / LaTeX Integration** | Implement an automated report generation flow that compiles project data into a formatted LaTeX document. | Backend | `server/src/services/report.service.js`, `server/src/controllers/project.controller.js` | High |
| **Plagiarism/Repetition Check** | Build a basic text similarity check (or integrate an external API) when a new project title/synopsis is submitted. | Backend | `server/src/services/plagiarism.service.js` | High |
| **Migrate File Storage to Cloud** | Replace local Multer disk storage with AWS S3 or Google Cloud Storage for production scalability. | Backend | `server/src/middleware/upload.js`, `server/src/config/s3.js` | Medium |
| **Implement Global Error Handling & Logging** | Setup Morgan for request logging and Winston for application logging. Standardize JSON error responses. | Backend | `server/src/app.js`, `server/src/utils/logger.js` | Low |

---

## 4. Task Dependencies

*   **Implement JWT Authentication** must be completed BEFORE **Integrate Dashboards with Live API** and **Centralized API Service Layer**.
*   **Schema Update: Domain Tagging** must be completed BEFORE **Project Search & Filtering API**.
*   **Project Search & Filtering API** must be completed BEFORE **Integrate Dashboards with Live API** (specifically for the Industry Expert dashboard).
*   **Schema Update: Student Identity & Groups** must be completed BEFORE **Unique Project ID Generation** (if ID relies on student data).
*   **Remove Hardcoded Mock Data** is an independent blocker that should be merged immediately to stop false assumptions.

---

## 5. Sprint Plan (3 Phases)

### Phase 1: Stabilization (Sprint 1)
*Focus: Security, Data Integrity, and Architectural Cleanup.*
*   Remove Hardcoded Mock Data
*   Implement JWT Authentication
*   Implement Role-Based Access Control (RBAC)
*   API Request Validation
*   Centralized API Service Layer

### Phase 2: SRS Alignment (Sprint 2 & 3)
*Focus: Meeting the core requirements defined in the SRS.*
*   Schema Update: Student Identity & Groups
*   Schema Update: Domain Tagging
*   Project Search & Filtering API
*   Integrate Dashboards with Live API
*   Unique Project ID Generation
*   Cross-Department Visibility UI
*   Project Continuity / Batch Shifting

### Phase 3: Production Readiness & Enhancements (Sprint 4)
*Focus: Analytics, Automation, and Deployment readiness.*
*   Visual Skill Profiles (Radar Charts)
*   Migrate File Storage to Cloud
*   Implement Global Error Handling & Logging
*   Overleaf / LaTeX Integration
*   Plagiarism/Repetition Check