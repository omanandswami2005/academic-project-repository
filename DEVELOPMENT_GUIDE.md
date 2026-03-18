# DEVELOPMENT_GUIDE.md

---

## 1. 📌 Development Principles
*   **Follow SRS Strictly:** The Software Requirements Specification (SRS) is the single source of truth. If a feature is not in the SRS, do not build it.
*   **Simplicity & Readability:** Keep code simple, readable, and maintainable. Write code that your peers can understand easily.
*   **Avoid Over-Engineering:** Build what is required now. Do not preemptively add complex abstractions unless justified by immediate scaling needs.
*   **Production-Ready:** This is a real product for college operations. Code must be stable, secure, and handle edge cases gracefully. Never write "demo-only" code.

---

## 2. 🏗️ Project Structure Rules
Maintain strict separation of concerns. Do NOT mix responsibilities.

*   **Controllers (`server/src/controllers/`):** Solely responsible for handling HTTP requests, extracting payloads, calling services, and returning standard HTTP responses.
*   **Services (`server/src/services/`):** Contains all core business logic, database queries, and external integrations (e.g., email, LaTeX).
*   **Models (`server/src/models/`):** Defines database schemas and Mongoose virtuals/hooks. No business logic outside of data shaping.
*   **Middleware (`server/src/middleware/`):** Handles cross-cutting concerns like JWT authentication, RBAC authorization, and payload validation.
*   **Frontend Components (`client/src/components/`, `client/src/pages/`):** Responsible ONLY for UI rendering and local state. All data fetching must go through the centralized Axios API layer.

---

## 3. 🔌 API Standards (VERY IMPORTANT)
Consistency across the API is mandatory. No inconsistent API responses are allowed.

**Standard Success Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Standard Error Response Format:**
```json
{
  "success": false,
  "data": null,
  "message": "A human-readable error description",
  "errors": ["Optional array of specific validation errors"]
}
```

**HTTP Status Codes:**
*   `200 OK`: Successful GET/PUT/PATCH.
*   `201 Created`: Successful POST (resource created).
*   `400 Bad Request`: Validation errors or missing parameters.
*   `401 Unauthorized`: Missing or invalid JWT.
*   `403 Forbidden`: Valid JWT, but user lacks role permissions (RBAC).
*   `404 Not Found`: Resource does not exist.
*   `500 Internal Server Error`: Server crash or unhandled exception.

---

## 4. 🔐 Authentication & Authorization Rules
*   **JWT is Mandatory:** All protected routes must verify a JWT via the `authMiddleware`.
*   **Never Trust the Frontend:** Do not rely on hidden fields or client-side checks for security.
*   **Strict RBAC:** Always validate the user's role on the backend before executing sensitive actions (e.g., only a `teacher` can update a project to `approved`).
*   **Data Masking:** Do not expose sensitive data (like hashed passwords or reset tokens) in API responses. Use Mongoose `.select('-password')`.

---

## 5. 🧪 Validation Rules
*   **Middleware Enforced:** Use validation libraries (like Joi or express-validator) at the route level before requests hit the controller.
*   **Sanitize Inputs:** Never store raw user input directly into the database without sanitization to prevent NoSQL injection and XSS.
*   **Strict Validations:**
    *   **Email:** Must match standard email regex.
    *   **PRN:** Must be strictly unique across the system and adhere to college formatting.
    *   **Files:** Validate MIME types (PDF, ZIP, Images) and enforce strict file size limits (e.g., 50MB max).
    *   **Required Fields:** Ensure all non-nullable schema fields are present in the payload.

---

## 6. 🧱 Coding Standards

### Backend
*   **Async/Await:** Use `async/await` exclusively. Do not use `.then().catch()` chains or legacy callbacks. Use `try/catch` blocks for error handling.
*   **Naming Conventions:** Use `camelCase` for variables/functions, `PascalCase` for Models/Classes, and `UPPER_SNAKE_CASE` for environment variables and constants.
*   **Modular Files:** Keep files under 300 lines. Break large controllers down into smaller services.
*   **No Logic in Routes:** Route files (`*.routes.js`) should only map paths to middleware and controller functions.

### Frontend
*   **Centralized API Layer:** All network requests must use the pre-configured Axios instance (`client/src/api/axios.js`). **No direct `fetch` calls.**
*   **Small Components:** Keep React components small, focused, and reusable. Move complex logic into custom hooks.
*   **Environment Variables:** Use `import.meta.env.VITE_*` for configurations; absolutely no hardcoded URLs (e.g., `http://localhost:5000`).

---

## 7. 🔀 Git Workflow Rules
*   **Branch Naming:** `feature/<module-name>` (e.g., `feature/jwt-auth`), `bugfix/<issue-name>`, `hotfix/<critical-issue>`.
*   **No Direct Pushes:** Direct pushes to `main` or `dev` are strictly prohibited.
*   **Pull Requests (PR):** All code must be merged via PR.
*   **Review Process:** Every PR requires at least one approval from a peer before merging.
*   **Keep it Small:** Small PRs are easier to review. Do not combine multiple unrelated features into a single PR.
*   **Commit Messages:** Use clear, imperative mood messages (e.g., "Add JWT middleware", not "added auth").

---

## 8. 🤖 AI Usage Guidelines (CRITICAL)
*   **Do NOT Blindly Copy:** Never paste AI-generated code directly into the codebase without reading line-by-line.
*   **Understand Before Using:** You are accountable for the code you commit. If you don't understand what the AI wrote, do not merge it.
*   **Enforce Standards:** AI often generates generic code. You must refactor AI output to strictly match our **Project Structure**, **API Standards**, and **Coding Conventions**.
*   **Resolve Conflicts:** If an AI suggests an architecture or library that conflicts with `FINAL_SYSTEM_ALIGNMENT.md` or this guide, **follow the project rules**.
*   **When in Doubt:** If you are unsure if an AI-suggested pattern is safe or optimal, discuss it in the team sync before proceeding.

---

## 9. 🔗 Dependency Rules
*   **Respect the Pipeline:** Do not start a task before its prerequisite dependencies (as defined in `TASKS.md` and `TEAM_PLAN.md`) are complete and merged.
*   **Backend First:** Frontend developers must wait for backend API contracts to be finalized before building integration UI.

---

## 10. ⚠️ Common Mistakes to Avoid
*   **Hardcoded Values:** No magic numbers, fake mock arrays, or hardcoded API endpoints.
*   **Skipping Validation:** Assuming the frontend already validated the data.
*   **Mixing Logic:** Putting database queries inside React components, or HTML generation inside Express controllers.
*   **Rogue Editing:** Editing another developer’s assigned module without communication and coordination.
*   **Inconsistent Responses:** Returning raw arrays instead of the standard `{ success, data, message }` object.

---

## 11. 🧪 Testing & Debugging
*   **Postman First:** Backend developers must test APIs thoroughly using Postman/Insomnia to verify edge cases before handing them off to the frontend.
*   **Proper Logging:** Use Winston/Morgan for logging. `console.log` should not be left in production code.
*   **Edge Cases:** Handle null values, empty arrays, invalid IDs, and database timeouts gracefully.
*   **No Silent Failures:** Catch blocks must either resolve the issue or throw a formatted error to the client. Do not suppress exceptions.

---

## 12. 🚀 Definition of Done (DoD)
A task is considered complete ONLY if:
1.  The code works correctly according to the SRS.
2.  It strictly follows this `DEVELOPMENT_GUIDE.md`.
3.  It has passed basic manual testing (and unit tests, if applicable).
4.  There are no linting or formatting errors.
5.  It has been reviewed and approved via a Pull Request.

---

## 13. 📊 Code Consistency Rules
*   **Uniformity:** Follow the exact same naming conventions and file structures across the entire project.
*   **Reusability:** Reuse existing utility functions, services, and UI components. Check the codebase before writing something from scratch.
*   **DRY Principle:** Do Not Repeat Yourself. If you write the same logic twice, abstract it into a helper function or service.
*   **Cleanliness:** Remove commented-out code, unused variables, and excessive whitespace before committing.