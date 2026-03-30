# APRS — Remaining Work & Deployment Guide

> **Current state (as of March 31, 2026):** All code is written, server loads without errors, client builds successfully (1440 modules). No tests have been run. No database exists yet. This document is a complete, ordered checklist of everything left to do.

---

## Quick Summary

| Area | Status |
|------|--------|
| Server code (controllers, routes, middleware) | ✅ Complete |
| Client code (all pages connected to real APIs) | ✅ Complete |
| Server loads (`node -e "require('./src/app')"`) | ✅ Verified |
| Client builds (`pnpm build`) | ✅ Verified |
| Credentials added | ❌ Not done |
| Database tables created | ❌ Not done |
| API tested | ❌ Not done |
| UI tested | ❌ Not done |
| Deployed | ❌ Not done |

---

## PHASE 1 — Credentials & Database Setup (Do This First)

Nothing can be tested until this is done.

### 1.1 Neon DB (Required)

1. Go to [https://neon.tech](https://neon.tech) → create a free account
2. Create a new project → name it `aprs_db`
3. Copy the connection string from the Dashboard (looks like `postgresql://user:password@ep-xxx.region.aws.neon.tech/aprs_db?sslmode=require`)
4. Open `server/.env` and replace:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/aprs_db?sslmode=require
   ```
5. Run database migration to create all 8 tables:
   ```bash
   cd server
   pnpm db:push
   ```
   Expected output: `All changes applied` — this creates: `users`, `projects`, `project_phases`, `project_files`, `project_members`, `feedback`, `notifications`, `refresh_tokens`

### 1.2 JWT Secrets (Required)

Generate two strong random secrets (never commit these):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Run twice. Put in `server/.env`:
```
JWT_SECRET=<first 128-char hex string>
JWT_REFRESH_SECRET=<second 128-char hex string>
```

### 1.3 Email (Required for Forgot Password)

**Option A — Gmail (easiest for dev):**
1. Google Account → Security → Enable 2-Factor Authentication
2. Google Account → Security → App Passwords → Generate one for "Mail"
3. In `server/.env`:
   ```
   EMAIL_USER=yourgmail@gmail.com
   EMAIL_PASS=<16-char app password>
   ```

**Option B — Resend (better for production, free tier available):**
1. Sign up at [https://resend.com](https://resend.com)
2. Get API key → use SMTP relay credentials they provide

### 1.4 Cloudflare R2 (Required for file uploads, optional otherwise)

If you want file upload/download to work:
1. Cloudflare dashboard → R2 Object Storage → Create bucket named `aprs-uploads`
2. R2 → Manage R2 API Tokens → Create token with "Edit" permission
3. In `server/.env`:
   ```
   R2_ACCOUNT_ID=<your cloudflare account id, found in the right sidebar>
   R2_ACCESS_KEY_ID=<token access key id>
   R2_SECRET_ACCESS_KEY=<token secret access key>
   R2_BUCKET_NAME=aprs-uploads
   ```

> **If you skip R2:** File upload endpoints will fail gracefully (the middleware has a fallback), but project creation with file attachments won't work. Text-only project creation will still work.

### 1.5 Verify Setup

After all credentials are added, start the server and confirm it connects:
```bash
cd server
pnpm dev
```
Expected output:
```
✅ Database connection established
🚀 Server running on port 5000
```
If you see `Database connection error` — double-check `DATABASE_URL` format and that `?sslmode=require` is appended.

---

## PHASE 2 — Running Locally

### Start both in parallel (from project root):
```bash
pnpm dev
```
Or separately:
```bash
# Terminal 1 — server
cd server && pnpm dev

# Terminal 2 — client
cd client && pnpm dev
```

- Server: `http://localhost:5000`
- Client: `http://localhost:3000`

---

## PHASE 3 — API Testing

**Recommended tool:** Install the **Thunder Client** extension in VS Code (free, no sign-in needed), or use Postman.

**Base URL for all requests:** `http://localhost:5000/api`

---

### 3.1 Auth Endpoints — Test in This Order

#### Create first user (student)
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "Test Student",
  "email": "student@test.com",
  "password": "Student@123",
  "role": "student",
  "branch": "CSE",
  "year": "3rd Year",
  "prn": "21CSE001"
}
```
Expected: `201` with `{ message: "Account created successfully..." }`

#### Create teacher account
```
POST /api/auth/signup
{
  "username": "Test Teacher",
  "email": "teacher@test.com",
  "password": "Teacher@123",
  "role": "teacher",
  "branch": "CSE"
}
```
Expected: `201`

#### Create expert account
```
POST /api/auth/signup
{
  "username": "Industry Expert",
  "email": "expert@test.com",
  "password": "Expert@123",
  "role": "expert"
}
```
Expected: `201`

#### Login as student → save the tokens
```
POST /api/auth/login
{
  "email": "student@test.com",
  "password": "Student@123",
  "role": "student"
}
```
Expected: `200` with `{ accessToken, refreshToken, user: { id, email, role, ... } }`
**Save the `accessToken` — paste it as `Bearer <token>` in Authorization header for all authenticated requests below.**

#### Test auth edge cases
| Test | Request | Expected |
|------|---------|----------|
| Duplicate email | POST /signup same email | `400` |
| Weak password | POST /signup `"password": "abc"` | `400` |
| Wrong password | POST /login wrong pass | `400` |
| Role mismatch | POST /login student email with role=teacher | `403` |
| Refresh token | POST /auth/refresh `{ "refreshToken": "<saved>"}` | `200` new tokens |
| Logout | POST /auth/logout `{ "refreshToken": "<saved>" }` | `200` |
| Update password | PATCH /auth/update-password `{ currentPassword, newPassword }` + Bearer token | `200` |

#### Forgot password flow (requires email credentials set up)
```
POST /api/auth/forgot-password
{ "email": "student@test.com" }
```
Expected: `200` (always, even for non-existent emails — by design to prevent enumeration)
Check your inbox → copy the token from the reset link URL → use it:
```
POST /api/auth/reset-password/<token>
{ "password": "NewPass@456" }
```
Expected: `200`

---

### 3.2 User Endpoints

Authenticate as student first (`Authorization: Bearer <accessToken>`):

| Test | Request | Expected |
|------|---------|----------|
| Get my profile | `GET /api/users/me` | `200` + user object |
| No auth | `GET /api/users/me` (no header) | `401` |
| Update profile | `PATCH /api/users/me` `{ "username": "Updated Name" }` | `200` |
| Get user by ID (as teacher) | `GET /api/users/<studentId>` with teacher token | `200` |
| Get user by ID (as student) | `GET /api/users/<otherId>` with student token | `403` |

---

### 3.3 Project Endpoints

Log in as the **student** and use that Bearer token:

#### Create a project (text-only, no files)
```
POST /api/projects
Content-Type: application/json
Authorization: Bearer <student_token>

{
  "title": "Smart Agriculture IoT System",
  "description": "A system to monitor soil moisture using IoT sensors",
  "domainTags": ["IoT", "Agriculture", "Embedded Systems"],
  "visibility": "public",
  "groupMemberIds": []
}
```
Expected: `201` with `{ project: { id, uniqueProjectId: "CSE_2026_001", ... } }`

#### Get all projects (as teacher)
```
GET /api/projects
Authorization: Bearer <teacher_token>
```
Expected: `200` with `{ projects: [...], pagination: { total, page, limit } }`

#### Get with filters
```
GET /api/projects?branch=CSE&status=pending&page=1&limit=10
GET /api/projects?visibility=public
```

#### Get single project
```
GET /api/projects/<id>
```
Expected: `200` with full detail including `phases` array and `files` array

#### Update phase (as owner student)
```
PATCH /api/projects/<id>/phase
Authorization: Bearer <student_token>
{ "phaseId": <phaseId>, "completed": true }
```
Expected: `200`

#### Update project status (as teacher)
```
PATCH /api/projects/<id>/status
Authorization: Bearer <teacher_token>
{ "status": "approved" }
```
Expected: `200` — also check that a notification was created for the student

#### Try status update as student → should be blocked
```
PATCH /api/projects/<id>/status
Authorization: Bearer <student_token>
{ "status": "approved" }
```
Expected: `403`

#### Search projects
```
GET /api/projects/search?q=IoT
```
Expected: `200` with matching projects

#### Delete project (as owner)
```
DELETE /api/projects/<id>
Authorization: Bearer <student_token>
```
Expected: `200`

---

### 3.4 Students Endpoints

```
GET /api/students
Authorization: Bearer <teacher_token>    → 200

GET /api/students
Authorization: Bearer <student_token>   → 403

GET /api/students/branch/CSE
Authorization: Bearer <teacher_token>    → 200 + students array

GET /api/students/<studentId>/skills
Authorization: Bearer <teacher_token>    → 200 + { radarData: [...] }
```

---

### 3.5 Feedback Endpoints

First create a project, then submit feedback as teacher:
```
POST /api/feedback
Authorization: Bearer <teacher_token>
{
  "projectId": <id>,
  "rating": 4,
  "comment": "Good project concept, needs better documentation.",
  "rubricScores": { "innovation": 4, "execution": 3, "presentation": 4 }
}
```
Expected: `201` — check that a notification was created for project owner

```
GET /api/feedback/project/<projectId>
Authorization: Bearer <student_token>    → 200 + feedback array
```

---

### 3.6 Notification Endpoints

After doing the teacher status update and feedback submission above:
```
GET /api/notifications
Authorization: Bearer <student_token>   → 200 + notifications (should have 2)

PATCH /api/notifications/<id>/read
Authorization: Bearer <student_token>   → 200

PATCH /api/notifications/read-all
Authorization: Bearer <student_token>   → 200
```

---

### 3.7 Analytics Endpoints

```
GET /api/analytics/skills/<studentId>
Authorization: Bearer <teacher_token>   → 200 + radar data

GET /api/analytics/department/CSE
Authorization: Bearer <teacher_token>   → 200 + department stats

GET /api/analytics/top-students?domain=IoT
Authorization: Bearer <expert_token>    → 200 + students list
```

---

### 3.8 File Endpoints (requires R2 credentials)

Use multipart form data (Thunder Client → Body → Form → add files):
```
POST /api/files/upload
Authorization: Bearer <student_token>
Form field: projectId = <id>
Form field: files = (attach a PDF or image file)
```
Expected: `201` with file metadata including `r2Key`

```
GET /api/files/<r2Key>
Authorization: Bearer <student_token>   → 200 + { url: "<presigned URL>" }

DELETE /api/files/<r2Key>
Authorization: Bearer <student_token>   → 200
```

---

### 3.9 Rate Limiting Tests

Using curl or a loop tool — hit auth endpoint 11 times in quick succession:
```bash
for i in {1..11}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong","role":"student"}'
done
```
First 10: `400` (wrong credentials), 11th: `429 Too Many Requests`

---

### 3.10 Security Tests

| Test | How | Expected |
|------|-----|----------|
| SQL injection | Send `email: "' OR '1'='1"` in login | `400` (Zod rejects before DB) |
| XSS in input | Send `username: "<script>alert(1)</script>"` in signup | Stored as literal string, not executed (parameterized query) |
| Missing auth | Any protected endpoint without token | `401` |
| Expired token | Use a token after 15 minutes | `401` with `{ message: "Token expired" }` |
| Invalid file type | Upload `.exe` file | `400` |
| File too large | Upload file > 50MB | `400` |
| CORS from wrong origin | Set `Origin: http://evil.com` in headers | `CORS error` (no `Access-Control-Allow-Origin` returned) |
| Helmet headers | Check any response headers | Should see `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` |

---

## PHASE 4 — UI Testing

Start both server and client, then test each flow in the browser at `http://localhost:3000`.

### 4.1 Landing Page
- [ ] Page loads with no console errors
- [ ] "Get Started" / Login button → navigates to `/role-selection`
- [ ] Dark/light theme toggle works

### 4.2 Role Selection → Login Flow
- [ ] Click Student → navigates to `/login/student`
- [ ] Click Teacher → navigates to `/login/teacher`
- [ ] Click Industry Expert → navigates to `/login/expert`

### 4.3 Login Page
- [ ] Empty submission → shows validation errors
- [ ] Wrong password → shows toast error
- [ ] Correct student credentials → redirects to `/student`
- [ ] Correct teacher credentials → redirects to `/teacher`
- [ ] Correct expert credentials → redirects to `/expert`
- [ ] "Forgot Password?" link → navigates to `/forgot-password`

### 4.4 Signup Page
- [ ] All fields render correctly per role (student shows branch/year/PRN, teacher shows department, expert shows company/expertise)
- [ ] Password mismatch → shows toast error
- [ ] Password < 8 chars → shows toast error
- [ ] Duplicate email → shows toast error from API
- [ ] Successful signup → shows success toast → redirects to `/login/<role>`
- [ ] Password visibility toggle works

### 4.5 Forgot Password
- [ ] Submit email → success message appears in UI
- [ ] Check email inbox → reset link received
- [ ] Click link → `/reset-password/<token>` loads
- [ ] Submit new password → toast success → redirected to login

### 4.6 Protected Routes (Security Test)
- [ ] Visit `/student` while not logged in → redirected to `/login/student`
- [ ] Visit `/teacher` while logged in as student → redirected away (to correct dashboard)
- [ ] Visit `/expert` while logged in as teacher → redirected away

### 4.7 Student Dashboard
- [ ] Dashboard loads with correct username in header
- [ ] Project list loads (empty state on first use)
- [ ] **Create project:** Fill form → submit → project appears in list
- [ ] Phase checkboxes: toggle phase → completion % updates
- [ ] Notifications bell → shows unread count → clicking marks as read
- [ ] Sidebar navigation between sections works
- [ ] Profile link → navigates to `/profile`
- [ ] Logout → clears session → redirects to `/`

### 4.8 Teacher Dashboard
- [ ] Branch selection shows all 7 branches
- [ ] Selecting a branch → student table populates via API
- [ ] Project review section shows projects with "pending" status
- [ ] Approve button → status changes → project disappears from pending queue
- [ ] Feedback form → submit → success toast
- [ ] Notifications show feedback-triggered notifications

### 4.9 Industry Expert Dashboard
- [ ] Project catalog loads real projects from API
- [ ] Branch filter narrows results
- [ ] Domain filter narrows results
- [ ] "Evaluate" button → feedback modal opens
- [ ] Submit evaluation → success toast
- [ ] Top students filter by domain works (requires data)

### 4.10 Home Dashboard
- [ ] Shows "Active Projects" count (real number from API)
- [ ] Shows user's role and branch

### 4.11 Profile Page
- [ ] Loads current user data (name, email, branch, year)
- [ ] "Save Changes" → submits PATCH /api/users/me → toast success
- [ ] "Change Password" → submits PATCH /api/auth/update-password → toast success
- [ ] Entering wrong current password → toast error

### 4.12 Help Page
- [ ] Page loads without errors
- [ ] FAQ accordion opens/closes

### 4.13 Cross-Cutting
- [ ] Dark/light theme persists after page refresh
- [ ] Loading spinners appear on all API calls
- [ ] Toast notifications appear for all success/error actions
- [ ] No console errors in DevTools after normal use

---

## PHASE 5 — Known Gaps to Fix Before Production

These are current limitations in the implementation that should be addressed:

### 5.1 Missing: Proper 404 Page
`App.jsx` currently redirects all unknown routes to `/` instead of showing a not-found page.

**Fix:** Replace the last route in `App.jsx`:
```jsx
// Change this:
<Route path="*" element={<Navigate to="/" replace />} />

// To this:
<Route path="*" element={<div style={{padding:'2rem',textAlign:'center'}}><h2>404 — Page Not Found</h2><a href="/">Go Home</a></div>} />
```
Or create a proper `NotFound.jsx` page.

### 5.2 HomeDashboard is Minimal
The current `HomeDashboard.jsx` only shows 3 stats and a welcome message. This is fine for now, but you'll likely want to add:
- Recent project activity feed
- Recent notifications
- Quick links to role-specific dashboards

### 5.3 BranchSelection Uses localStorage
`BranchSelection.jsx` saves the selected branch to `localStorage` before navigating. This works because `TeacherDashboard.jsx` reads from route state. However, it's inconsistent. Low priority — it works.

### 5.4 File Upload in Student Create-Project Form
The current `StudentDashboard.jsx` creates projects **without** file attachments (text fields only). The R2 upload endpoint exists at `POST /api/files/upload` but the project creation form doesn't attach files. 

**To add file upload to project creation form:**
- Change the form to use `multipart/form-data` 
- Add a file input
- Call `fileAPI.upload(formData)` first → get back `r2Key`
- Include the `r2Key` references when calling `projectAPI.create()`

### 5.5 Refresh Token in api.js
The auto-refresh interceptor in `client/src/services/api.js` correctly queues concurrent requests during a refresh. However, when the refresh itself fails (expired refresh token), it calls `localStorage.clear()` and redirects with `window.location.href = '/role-selection'`. This is a hard redirect that skips React Router. Works correctly, but less elegant than using `navigate()`.

---

## PHASE 6 — Deployment

### 6.1 Choose Hosting Platforms

| Service | Server (Node.js) | Client (React) | Free Tier |
|---------|-----------------|----------------|-----------|
| **Recommended** | Railway | Vercel | ✅ Both free |
| Alternative | Render | Netlify | ✅ Both free |
| Alternative | Fly.io | Cloudflare Pages | ✅ Both free |

**Neon DB** is already cloud-hosted — no extra setup needed.

---

### 6.2 Deploy Server (Example: Railway)

1. Go to [https://railway.app](https://railway.app) → sign in with GitHub
2. New Project → Deploy from GitHub repo → select your repo
3. Set the **Root Directory** to `server`
4. Railway auto-detects Node.js
5. In Railway → Variables → Add all env vars from `server/.env`:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your neon URL>
   JWT_SECRET=<generated>
   JWT_REFRESH_SECRET=<generated>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   R2_ACCOUNT_ID=<your id>
   R2_ACCESS_KEY_ID=<your key>
   R2_SECRET_ACCESS_KEY=<your secret>
   R2_BUCKET_NAME=aprs-uploads
   EMAIL_USER=<your email>
   EMAIL_PASS=<app password>
   FRONTEND_URL=https://your-app.vercel.app
   CORS_ORIGINS=https://your-app.vercel.app
   ```
6. Railway gives you a URL like `https://aprs-server-production.up.railway.app`
7. After deploy, run the DB migration via Railway's shell or temporarily allow public access to run `pnpm db:push`

---

### 6.3 Deploy Client (Example: Vercel)

1. Go to [https://vercel.com](https://vercel.com) → sign in with GitHub
2. Import Project → select your repo
3. Set **Root Directory** to `client`
4. Set **Build Command** to `pnpm build`
5. Set **Output Directory** to `dist`
6. Under Environment Variables, add:
   ```
   VITE_API_URL=https://aprs-server-production.up.railway.app
   VITE_APP_NAME=APRS - Academic Project Repository
   ```
7. Deploy → Vercel gives you a URL like `https://aprs.vercel.app`

---

### 6.4 Post-Deployment: Update Server CORS

Go back to Railway → Variables → Update:
```
FRONTEND_URL=https://aprs.vercel.app
CORS_ORIGINS=https://aprs.vercel.app
```
Redeploy the server (Railway does this automatically).

---

### 6.5 Post-Deployment: Setup R2 Bucket CORS

In Cloudflare R2 → your bucket → Settings → CORS Policy → Add:
```json
[
  {
    "AllowedOrigins": ["https://aprs.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

---

### 6.6 Post-Deployment: Run Database Migration

If Railway shell is available:
```bash
pnpm db:push
```
Or add a `postinstall` script in `server/package.json`:
```json
"postinstall": "drizzle-kit push"
```
**Remove this after first successful deploy** to avoid re-running migrations.

---

### 6.7 Final Production Checklist

- [ ] `DATABASE_URL` points to Neon production (not the placeholder URL)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong random strings (64+ bytes)
- [ ] `NODE_ENV=production` is set on server
- [ ] `CORS_ORIGINS` matches exact production frontend URL (no trailing slash)
- [ ] `VITE_API_URL` in client points to production server URL
- [ ] `pnpm db:push` has been run on production Neon DB
- [ ] Server health check: `GET https://your-server.railway.app/health` returns `200` (or test any endpoint)
- [ ] Client loads at production URL without errors
- [ ] Full signup → login → dashboard flow works on production
- [ ] Password reset email arrives from production server

---

## PHASE 7 — Optional Improvements (Post-Launch)

These aren't blockers but would polish the system:

| Feature | Description | Effort |
|---------|-------------|--------|
| File upload in project form | Attach PDFs/images when creating projects | Medium |
| Project continuation (carry-forward) | FR3 from SRS — branch a project from old batch | High |
| Plagiarism/similarity check | FR2 from SRS — detect duplicate project ideas | High |
| Student ID verification | Validate PRN against college database | Medium |
| Export/Report generation | PDF report of student portfolio | Medium |
| Admin dashboard | Full admin panel for college management | High |
| Real-time notifications | Replace polling with WebSockets (Socket.io) | Medium |
| Proper 404 page | Replace current `Navigate to="/"` fallback | Low |
| Advanced analytics | More charts, department comparisons | Medium |
| Email templates | HTML styled emails for password reset | Low |
| Search with full-text index | PostgreSQL GIN index for `tsvector` search | Low |
| Rate limit by user ID | Currently rate-limited by IP only | Low |

---

## TL;DR — The Exact Next Steps

```
1. Add DATABASE_URL to server/.env         (Neon DB)
2. Add JWT_SECRET + JWT_REFRESH_SECRET     (run crypto command)
3. Add EMAIL_USER + EMAIL_PASS             (Gmail app password)
4. cd server && pnpm db:push               (creates tables)
5. pnpm dev (from root)                    (starts both server + client)
6. Test signup → login → create project → approve (as teacher) → check notifications
7. Fix any bugs found during testing
8. Deploy server to Railway
9. Deploy client to Vercel
10. Update CORS_ORIGINS and VITE_API_URL to production URLs
11. Test on production
```
