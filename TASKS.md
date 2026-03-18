# TASKS.md

---

## 1. 🔥 High Priority (Blocking Issues)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Implement JWT Authentication** | Update login to generate and return JWT. Add auth middleware to protect all routes. | Backend | `server/src/controllers/auth.controller.js`, `server/src/middleware/auth.js`, `server/src/routes/*.js` | High |
| **Implement Role-Based Access Control (RBAC)** | Restrict API access based on user roles (student, teacher, admin, expert). | Backend | `server/src/middleware/auth.js`, `server/src/routes/*.js` | Medium |
| **Remove Hardcoded Mock Data** | Remove all mock data from dashboards and replace with API-driven data or loading states. | Frontend | `client/src/pages/dashboards/*.jsx` | Low |
| **API Request Validation** | Validate all incoming requests using Joi/express-validator to ensure data integrity. | Backend | `server/src/middleware/validate.js`, `server/src/routes/*.js` | Medium |
| **Schema Update: Student Identity (PRN Enforcement)** | Add PRN and mobile fields, enforce uniqueness and validation at schema + API level. | Backend | `server/src/models/User.js` | Medium |
| **Schema Update: Group Projects** | Modify Project schema to support 1–3 members per project. | Backend | `server/src/models/Project.js` | Medium |
| **Schema Update: Domain/Skill Tagging** | Add array-based domain/skill tagging to projects. | Backend | `server/src/models/Project.js` | Low |
| **File Access Control** | Restrict file downloads based on user roles and permissions. | Backend | `server/src/controllers/project.controller.js`, middleware | Medium |

---

## 2. ⚙️ Medium Priority (Core Features)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Project Search & Filtering API** | Build search API using MongoDB aggregation (filters: tags, branch, status). Include pagination. | Backend | `server/src/controllers/project.controller.js`, `routes/project.routes.js` | High |
| **Pagination & Query Optimization** | Add pagination (limit/skip), indexing for performance optimization. | Backend | `server/src/models/*.js`, controllers | Medium |
| **Integrate Dashboards with Live API** | Connect dashboards to real backend APIs (remove static UI assumptions). | Frontend | `client/src/pages/dashboards/*.jsx`, `client/src/api/` | High |
| **Unique Project ID Generation** | Generate IDs in format `BRANCH_YEAR_ID`. | Backend | `server/src/models/Project.js`, controller | Medium |
| **Project Continuity / Batch Shifting** | Allow projects to be cloned or continued across batches. | Fullstack | controllers + frontend dashboards | High |
| **Cross-Department Visibility UI** | Enable viewing approved/public projects across departments. | Fullstack | `client/src/pages/...`, backend queries | Medium |
| **Centralized API Service Layer** | Create Axios instance with interceptors (JWT handling). | Frontend | `client/src/api/axios.js` | Medium |
| **Department Management System** | Create Department model and APIs for department-level data. | Backend | `server/src/models/Department.js`, controllers, routes | Medium |
| **Admin Management APIs** | APIs for managing users, departments, and system controls. | Backend | `server/src/controllers/admin.controller.js` | Medium |
| **Industry Ranking System** | Rank students based on skills, project phases, and ratings. | Backend | aggregation logic in controllers | Medium |

---

## 3. 🧪 Low Priority (Enhancements)

| Task Name | Description | Backend/Frontend | Files/Modules Affected | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Visual Skill Profiles (Radar Charts)** | Display skill visualization using chart libraries. | Frontend | dashboards/profile pages | Medium |
| **Overleaf / LaTeX Integration** | Generate formatted reports automatically from project data. | Backend | `server/src/services/report.service.js` | High |
| **Plagiarism/Repetition Check** | Detect duplicate/similar projects using text similarity. | Backend | `server/src/services/plagiarism.service.js` | High |
| **Migrate File Storage to Cloud** | Replace local storage with AWS S3 or GCP storage. | Backend | upload middleware/config | Medium |
| **Global Error Handling & Logging** | Implement Morgan (requests) + Winston (errors). | Backend | `server/src/app.js`, utils/logger | Low |
| **Rate Limiting (Security)** | Prevent brute-force attacks on auth endpoints. | Backend | middleware | Low |
| **Basic API Testing** | Add unit/integration tests for critical APIs. | Backend | test files | Medium |

---

## 4. 🔗 Task Dependencies

- JWT Authentication → required before RBAC, API integration
- Schema Updates → required before Search API
- Search API → required before Dashboard integration
- Remove Hardcoded Data → must be done early
- Department System → required before Admin APIs
- Pagination → required before production deployment

---

## 5. 📦 Sprint Plan

### 🚀 Phase 1: Stabilization (Sprint 1)
- JWT Authentication
- RBAC
- Remove Hardcoded Data
- API Validation
- Centralized API Layer
- PRN Enforcement

---

### ⚙️ Phase 2: SRS Alignment (Sprint 2–3)
- Group Projects
- Domain Tagging
- Search & Filtering API
- Dashboard Integration
- Unique Project ID
- Cross-Department Visibility
- Project Continuity
- Department System
- Admin APIs
- Industry Ranking

---

### 🏁 Phase 3: Production Readiness (Sprint 4)
- Pagination & Optimization
- Radar Charts
- Logging & Error Handling
- File Storage Migration
- Rate Limiting
- Testing
- Overleaf Integration
- Plagiarism Detection

---
