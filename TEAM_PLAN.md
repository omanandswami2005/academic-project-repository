# TEAM_PLAN.md

---

## 1. 👥 Team Roles (6 Developers)

To ensure clear ownership and minimize merge conflicts, the team is divided into 6 distinct roles. Each developer owns specific modules and is responsible for their stability.

*   **Developer 1:** Auth & Security
*   **Developer 2:** Backend Core APIs
*   **Developer 3:** Database & Schema
*   **Developer 4:** Frontend UI
*   **Developer 5:** Search & Analytics
*   **Developer 6:** Integration & Testing

---

## 2. 📌 Task Assignment per Developer

### Developer 1: Auth & Security
*   **Assigned Tasks:**
    *   Implement JWT Authentication
    *   Implement Role-Based Access Control (RBAC)
    *   API Request Validation
*   **Modules Owned:** `server/src/controllers/auth.controller.js`, `server/src/middleware/`
*   **Files Likely Modified:** `auth.controller.js`, `auth.js`, `validate.js`, `auth.routes.js`
*   **Deliverables:** Secure login endpoints, token generation, protected route middleware, and payload sanitization logic.

### Developer 2: Backend Core APIs
*   **Assigned Tasks:**
    *   Unique Project ID Generation
    *   Project Continuity / Batch Shifting (Backend portion)
    *   Migrate File Storage to Cloud
*   **Modules Owned:** `server/src/controllers/project.controller.js`, File handling services.
*   **Files Likely Modified:** `project.controller.js`, `project.routes.js`, `upload.js`, `s3.js`
*   **Deliverables:** Robust API for project creation with sequence IDs, AWS S3 integration for file uploads, and endpoint for cloning/shifting projects.

### Developer 3: Database & Schema
*   **Assigned Tasks:**
    *   Schema Update: Student Identity & Groups
    *   Schema Update: Domain Tagging
    *   Overleaf / LaTeX Integration (Backend formatting service)
*   **Modules Owned:** `server/src/models/`, `server/src/services/report.service.js`
*   **Files Likely Modified:** `User.js`, `Project.js`, `report.service.js`
*   **Deliverables:** Updated Mongoose schemas supporting PRN, 1-3 member groups, and skill arrays. LaTeX generation script.

### Developer 4: Frontend UI
*   **Assigned Tasks:**
    *   Remove Hardcoded Mock Data
    *   Centralized API Service Layer
    *   Cross-Department Visibility UI (Frontend filters)
    *   Project Continuity / Batch Shifting (Frontend UI)
*   **Modules Owned:** `client/src/pages/`, `client/src/api/`
*   **Files Likely Modified:** `TeacherDashboard.jsx`, `IndustryExpertDashboard.jsx`, `axios.js`, `StudentDashboard.jsx`
*   **Deliverables:** Cleaned up UI components, configured Axios instance with interceptors, and new frontend views for batch shifting and cross-department filters.

### Developer 5: Search & Analytics
*   **Assigned Tasks:**
    *   Project Search & Filtering API
    *   Visual Skill Profiles (Radar Charts)
    *   Plagiarism/Repetition Check
*   **Modules Owned:** Aggregation pipelines, `client/src/components/charts/`, `server/src/services/plagiarism.service.js`
*   **Files Likely Modified:** `project.controller.js` (Search endpoints), `ProfilePage.jsx`, `StudentDashboard.jsx` (for charts), `plagiarism.service.js`
*   **Deliverables:** MongoDB search pipelines for industry filters, frontend radar chart integrations, and a text-similarity backend service.

### Developer 6: Integration & Testing
*   **Assigned Tasks:**
    *   Integrate Dashboards with Live API (Connect Frontend UI to Core APIs/Search)
    *   Implement Global Error Handling & Logging
    *   End-to-End Testing setup
*   **Modules Owned:** `server/src/app.js`, `server/src/utils/logger.js`, API/UI binding logic.
*   **Files Likely Modified:** `app.js`, `logger.js`, `TeacherDashboard.jsx` (API integration logic), `IndustryExpertDashboard.jsx`
*   **Deliverables:** Fully functioning dashboards displaying real DB data, global error catchers (Morgan/Winston), and a stable CI/CD test suite.

---

## 3. 🔗 Dependency-Aware Execution

To prevent blockers, tasks will be executed in a strict dependency sequence:

1.  **Blocker 1:** **Database & Schema** (Dev 3) must update `User.js` and `Project.js` first. No backend or frontend work relying on new fields (Tags, PRN, Groups) can start until this is merged.
2.  **Blocker 2:** **Auth & Security** (Dev 1) must implement JWT. **Frontend UI** (Dev 4) cannot build the `Centralized API Service Layer` until the token structure is defined.
3.  **Blocker 3:** **Search & Analytics** (Dev 5) cannot build the `Project Search & Filtering API` until Dev 3 finishes Domain Tagging.
4.  **Blocker 4:** **Integration & Testing** (Dev 6) cannot `Integrate Dashboards with Live API` until Dev 5 finishes the Search API and Dev 2 stabilizes the Core APIs.
5.  **Immediate Action:** Dev 4 can `Remove Hardcoded Mock Data` immediately as it has no prerequisites.

---

## 4. 🧱 Backend vs Frontend Strategy

*   **Backend First:** Devs 1, 2, and 3 will begin immediately. They must define the JSON request/response contracts (API specs) on Day 1.
*   **Frontend Second:** Dev 4 and Dev 6 will mock the agreed-upon JSON contracts in their local state until the backend APIs are merged into the `dev` branch.
*   **API Stability:** Frontend development (Dev 4, Dev 5 on charts) will only consume APIs that have passed postman/unit tests and are merged. We will strictly avoid frontend development against moving backend targets.

---

## 5. 🔀 Conflict Prevention Strategy

*   **Shared Files Ownership:**
    *   `project.controller.js`: Owned by Dev 2 (Core logic), but Dev 5 (Search) needs to add endpoints. *Rule: Dev 5 creates a separate file `search.controller.js` or adds routes sequentially only after Dev 2's PR is merged.*
    *   `TeacherDashboard.jsx`: Owned by Dev 4 (UI layout), but modified by Dev 6 (API binding). *Rule: Dev 4 builds the UI structure and passes dummy props. Dev 6 wraps the UI in a container component that fetches data and passes it down.*
*   **Coordination Strategy:**
    *   Daily syncs to announce which shared files are currently being touched.
    *   Use of specific feature branches (e.g., `feature/dev1-auth`, `feature/dev3-schema`).
    *   Strict module isolation: Auth logic stays in `middleware/`, DB logic stays in `models/`. Do not bleed logic into routes.

---

## 6. 📅 Parallel Execution Plan

### Phase 1: Stabilization & Foundation (Parallel)
*   **Dev 1:** Building Auth Middlewares.
*   **Dev 3:** Updating DB Schemas.
*   **Dev 4:** Removing Mock Data and preparing Axios interceptors.
*   **Dev 6:** Setting up Global Error Logging and test environments.
*(All can work simultaneously without conflicts).*

### Phase 2: Core Development (Sequential triggers)
*   *Once Dev 1 & 3 are done:*
*   **Dev 2:** Builds Core APIs (ID generation, File storage) using the new schemas.
*   **Dev 5:** Builds Search & Filtering API based on the new tags schema.
*   **Dev 4:** Builds UI for Cross-Department visibility.

### Phase 3: Integration & Enhancements (Finalization)
*   *Once Dev 2 & 5 are done:*
*   **Dev 6:** Connects Dashboards to the live Search and Core APIs.
*   **Dev 5:** Implements Radar Charts on the frontend.
*   **Dev 2 & 3:** Work on Overleaf integration and Plagiarism checks.

---

## 7. 🧪 Integration & Testing Ownership

*   **Owner:** **Developer 6 (Integration & Testing)**
*   **Responsibilities:**
    *   API Integration: Ensure the Frontend Axios layer correctly parses Backend JSON responses and handles 400/500 errors gracefully.
    *   End-to-End Testing: Write automated UI tests (e.g., Playwright/Cypress) for the critical path: Login -> Upload Project -> Teacher Approval.
    *   Bug Tracking: Triage issues found during Phase 3, route them back to the respective module owner (e.g., Auth bugs to Dev 1), and verify fixes.

---

## 8. ⚠️ Risk Areas

*   **Conflict-Prone Files:** `project.controller.js` and `project.routes.js`. Both Dev 2 (Core APIs) and Dev 5 (Search API) will naturally want to edit these. *Mitigation: Split routes into `project.core.routes.js` and `project.search.routes.js` if necessary.*
*   **Bottlenecks:**
    *   **DB Schema (Dev 3):** If schema updates are delayed, all API development halts.
    *   **Auth (Dev 1):** If the JWT format changes mid-sprint, Frontend (Dev 4) and Integration (Dev 6) have to rewrite their interceptors.
*   **Integration Risks:** Developer 6 is a single point of failure for tying the app together. If Backend APIs do not exactly match the JSON contracts agreed upon in Phase 1, Phase 3 will derail into debugging sessions. *Mitigation: API Response standard strictly enforced via Dev 6's Global Error/Response wrapper.*