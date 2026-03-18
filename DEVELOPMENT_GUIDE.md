# DEVELOPMENT_GUIDE.md

---

## 1. 📌 Development Principles
* **Follow SRS Strictly:** The Software Requirements Specification (SRS) is the single source of truth. Every feature, behavior, and workflow must align with it. If something is not defined in the SRS, it should not be implemented without team discussion.
* **Simplicity & Readability:** Code should be easy to understand by any team member. Prefer clear logic over clever shortcuts. Maintain readability even if it takes slightly more lines of code.
* **Avoid Over-Engineering:** Build only what is required for the current scope. Do not introduce unnecessary abstractions, patterns, or tools unless there is a clear need.
* **Production-Ready Mindset:** This is a real system used by a college. Code must be stable, secure, and handle edge cases properly. Avoid temporary or mock implementations.

---

## 2. 🏗️ Project Structure Rules
A clear separation of concerns ensures maintainability and prevents conflicts between developers.

* **Controllers (`server/src/controllers/`):** Responsible only for handling HTTP requests and responses. They should extract input, call services, and return standardized responses.
* **Services (`server/src/services/`):** Contain all business logic and database interactions. This layer ensures logic is reusable and testable.
* **Models (`server/src/models/`):** Define database schemas and relationships. No business logic should be implemented here beyond schema-level constraints.
* **Middleware (`server/src/middleware/`):** Handle cross-cutting concerns such as authentication, authorization, validation, and logging.
* **Frontend (`client/src/`):** Components should only handle UI and local state. All API interactions must go through a centralized API layer.

❗ **Important Rule:** Do not mix responsibilities (e.g., no database queries inside controllers).

---

## 3. 🔌 API Standards (VERY IMPORTANT)
Consistency in API design ensures smooth integration between frontend and backend.

### API Versioning
- All endpoints must follow `/api/v1/...`
- Any breaking change must create a new version (`/api/v2/...`)
- Existing APIs must never be modified in a way that breaks clients

### Standard Response Format
All API responses must follow this structure:

{
  success: boolean,
  data: object,
  message: string,
  errors?: string[]
}

**Rules:**
- `data` must never be null on success (use `{}` or `[]`)
- Maintain the same response format across all endpoints
- Do not return raw arrays or unstructured data

### HTTP Status Codes
- `200 OK` → successful request  
- `201 Created` → resource created  
- `400 Bad Request` → validation errors  
- `401 Unauthorized` → missing/invalid token  
- `403 Forbidden` → role-based restriction  
- `404 Not Found` → resource not found  
- `500 Internal Server Error` → server error  

---

## 4. 🔐 Authentication & Authorization
Security must always be enforced at the backend level.

* **JWT Mandatory:** All protected routes must verify a JWT using middleware.
* **Do Not Trust Frontend:** Never rely on frontend validation or hidden fields for security.
* **RBAC Enforcement:** Always verify user roles before performing actions (e.g., only teachers can approve projects).
* **Sensitive Data Protection:** Never expose passwords, tokens, or internal fields in API responses.

---

## 5. 🧪 Validation Rules
Validation ensures data integrity and system stability.

* Use validation middleware (Joi / express-validator)
* Validate requests before they reach controllers
* Sanitize all inputs to prevent injection attacks

**Mandatory Validations:**
- Email must follow proper format
- PRN must be unique and validated
- Required fields must not be missing
- File uploads must have valid type and size limits

---

## 6. 🧱 Coding Standards

### Backend
* Use `async/await` for all asynchronous operations
* Do not place business logic inside route files
* Controllers must NOT directly interact with the database
* All database operations must go through services
* Keep files modular and maintainable (prefer <300 lines)

### Frontend
* Use a centralized Axios API layer for all requests
* Do not use direct `fetch` calls
* Keep components small, reusable, and focused
* Use environment variables instead of hardcoded values

---

## 7. 🔀 Git Workflow
A disciplined Git workflow prevents conflicts and ensures code quality.

* Use branch naming: `feature/<module>`
* Never push directly to `main` or `dev`
* All changes must go through Pull Requests (PR)
* At least one approval is required before merging
* Keep PRs small and focused

---

## 8. 🤖 AI Usage Guidelines (CRITICAL)
AI is a tool, not a decision-maker.

* Never blindly copy AI-generated code
* Always understand the code before using it
* Ensure AI-generated code follows project structure and standards
* If AI suggestions conflict with project rules, follow project rules
* When unsure, discuss with the team before merging

---

## 9. 🔗 Dependency Rules
Proper sequencing prevents blockers and rework.

* Follow TASKS.md and TEAM_PLAN.md strictly
* Do not start tasks before their dependencies are completed
* Backend APIs must be stable before frontend integration begins

---

## 10. ⚠️ Common Mistakes to Avoid
* Using hardcoded values or mock data
* Skipping validation checks
* Mixing frontend and backend logic
* Editing another developer’s module without coordination
* Returning inconsistent API responses

---

## 11. 🧪 Testing & Debugging
Testing ensures system reliability.

* Test all APIs using Postman before frontend integration
* Use proper logging tools (avoid console.log in production)
* Handle edge cases (null values, invalid inputs)
* Do not allow silent failures — always return structured errors

---

## 12. 🚀 Definition of Done (DoD)
A task is complete only if:
1. It works according to the SRS
2. It follows this DEVELOPMENT_GUIDE.md
3. It is tested properly
4. It has no linting or formatting errors
5. It is reviewed and approved via PR

---

## 13. 📊 Code Consistency Rules
Consistency improves maintainability.

* Follow uniform naming conventions
* Reuse existing code wherever possible
* Avoid duplication (DRY principle)
* Maintain a single source of truth for API structure

---

## 14. 🛠️ Database Migration Rules
Schema changes must be handled carefully.

* Never break existing data
* Always plan a migration strategy
* Test schema changes in staging before production
* Avoid schema changes after stabilization without approval

---

## 15. 🔐 File Upload Security
File handling must be secure.

* Reject executable or unsafe files
* Validate file type and size
* Rename files before storing
* Store files outside public directories

---

## 16. 🔍 Code Review Checklist
Before approving a PR:

* Code follows DEVELOPMENT_GUIDE.md
* No hardcoded values
* API responses follow standard format
* Proper validation is implemented
* No duplicate logic exists
* No debug logs remain

---

## 17. 🛡️ Branch Protection Rules
* Protect main branch from direct changes
* Require PR + review before merge
* Disallow force pushes

---

## 18. ⚡ Performance Rules
* All list APIs must implement pagination
* Avoid returning large datasets
* Add indexes to frequently queried fields
* Optimize database queries

---

## 19. 🌍 Environment Configuration
* Never store secrets in code
* Use `.env` files for configuration
* Maintain separate configs for development and production

---

## 20. ❗ Error Handling Rules
* Use centralized error handling middleware
* Do not expose raw error objects
* Always return structured error responses
* Error messages must be clear and user-friendly

---

## 21. 📦 Constants & Configuration Rules
* Store reusable constants (roles, statuses, etc.) in a central file
* Avoid hardcoding repeated values across the codebase

---

## ⚠️ Final Rules
* This guide is mandatory for all developers
* No deviation without team discussion
* Consistency is more important than speed
* Stability is more important than adding features
