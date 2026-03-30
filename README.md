# APRS — Academic Project Repository & Skill Mapping System

A full-stack platform for managing college academic projects, tracking student skills, and bridging the gap between student capabilities and industry requirements. Built for **RSCOE** (Rajarshi Shahu College of Engineering).

---

## 🚀 Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| React | 18 | UI library |
| Vite | 7 | Build tool & dev server |
| React Router DOM | 6 | Client-side routing |
| Axios | 1.14 | HTTP client with auto-refresh interceptor |
| Recharts | 3 | Analytics & data visualization charts |
| Lucide React | 0.294 | Icon set |
| React Hot Toast | 2 | Toast notifications |

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Node.js | 24 | Runtime |
| Express | 5 | HTTP framework |
| Drizzle ORM | 0.45 | Type-safe SQL query builder |
| Zod | 4 | Request validation schemas |
| bcryptjs | 3 | Password hashing |
| jsonwebtoken | 9 | JWT auth (access 15 min + refresh 7 days) |
| helmet | 8 | HTTP security headers |
| cors | 2 | Cross-origin resource sharing |
| express-rate-limit | 8 | Rate limiting |
| undici | 7 | Custom DNS dispatcher (Cloudflare 1.1.1.1) |
| dotenv | 17 | Environment variable loading |

### Cloud Services
| Service | Purpose |
|---|---|
| **Neon** (PostgreSQL) | Serverless Postgres database via `@neondatabase/serverless` |
| **Cloudflare R2** | Object storage for project file uploads (S3-compatible via `@aws-sdk`) |
| **Resend** | Transactional email (password reset, notifications) |

### Dev / Tooling
| Tool | Purpose |
|---|---|
| drizzle-kit | Schema migrations & DB studio |
| pnpm | Package manager |
| Vite HMR | Hot module replacement in dev |

---

## 🗄️ Database Schema (PostgreSQL / Neon)

8 tables managed with Drizzle ORM:

- **users** — students, teachers, industry experts (role-based)
- **projects** — project records linked to a student
- **project_phases** — 6 phases per project with completion tracking
- **project_files** — R2 file references attached to projects
- **project_members** — team members on a project
- **feedback** — rubric-based feedback from teachers/experts
- **notifications** — in-app notification feed
- **refresh_tokens** — JWT refresh token store

---

## 🏗️ Project Structure

```
project-management-system/
├── client/                   React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── auth/         Login, Signup, ForgotPassword, ResetPassword
│       │   ├── common/       Landing, RoleSelection, BranchSelection, Profile, Help
│       │   └── dashboards/   Home, Student, Teacher, IndustryExpert
│       ├── components/
│       │   └── layout/       DashboardLayout
│       ├── context/           AuthContext, ThemeContext
│       └── services/          Axios API service layer
│
├── server/                   Node.js + Express backend
│   └── src/
│       ├── controllers/      auth, project, student, user, feedback,
│       │                     notification, analytics, file
│       ├── routes/           8 route files (REST)
│       ├── middleware/        validate, upload, auth
│       ├── models/ (Drizzle)  schema definitions
│       ├── config/            db.js (Neon), r2.js (Cloudflare R2)
│       └── utils/             email.js (Resend)
│   └── scripts/
│       ├── dns-fix.js        Cloudflare 1.1.1.1 DNS preload (for Neon on restricted networks)
│       ├── migrate.js        HTTP-based SQL migration runner
│       └── test-api.js       45-test end-to-end API suite
│
├── docs/                     SRS, task notes
├── package.json              Root workspace scripts
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v20+
- **pnpm** (`npm install -g pnpm`)
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudflare R2](https://dash.cloudflare.com) bucket
- A [Resend](https://resend.com) API key

### 1. Install Dependencies
```bash
pnpm install
cd client && pnpm install
cd ../server && pnpm install
```

### 2. Configure Server Environment
Create `server/.env`:
```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host-pooler.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=<128-char hex>
JWT_REFRESH_SECRET=<128-char hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Run Database Migration
```bash
cd server
pnpm db:migrate
```

### 4. Start Development
```bash
# From the root:
pnpm dev           # starts both client and server concurrently

# Or individually:
cd client && pnpm dev       # React app  →  http://localhost:3000
cd server && pnpm dev       # API server →  http://localhost:5000
```

---

## 🎯 Features

### Student
- Upload and manage academic projects (with file attachments to R2)
- Track project phases (6 milestones per project)
- View feedback and rubric scores from teachers/experts
- Analytics: completion %, stars, feedback count

### Teacher
- View all registered students by branch
- Monitor project status and progress
- Update project status (Pending → Under Review → Approved → Needs Revision)
- Post announcements per branch
- Review queue from real submitted projects

### Industry Expert
- Browse approved projects across all branches
- Submit structured rubric feedback (Innovation, Feasibility, Hireability)
- Star/highlight projects for recognition

### System
- **JWT auth** with access + refresh token rotation
- **Role-based access control** (student / teacher / expert)
- **Transactional emails** via Resend (password reset)
- **File storage** on Cloudflare R2 (up to 50 MB per file, 10 files per upload)
- **Rate limiting** on auth endpoints
- **Helmet** security headers
- **Analytics API** — skill radar, department stats, top students

---

## 🔌 API Overview

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Register (student/teacher/expert) |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate access token |
| POST | `/auth/logout` | ✅ | Invalidate refresh token |
| POST | `/auth/forgot-password` | — | Send reset email |
| POST | `/auth/reset-password` | — | Reset password via token |
| PATCH | `/auth/update-password` | ✅ | Change password |
| GET | `/projects` | ✅ | List all projects (paginated, filterable) |
| POST | `/projects` | ✅ student | Create project |
| GET | `/projects/:id` | ✅ | Get project by ID |
| PUT | `/projects/:id` | ✅ | Update project |
| DELETE | `/projects/:id` | ✅ | Delete project |
| PATCH | `/projects/:id/status` | ✅ teacher | Update project status |
| PUT | `/projects/:id/phases` | ✅ | Update project phase |
| POST | `/projects/:id/phases/bulk` | ✅ | Bulk update phases |
| GET | `/students` | ✅ teacher | All students |
| GET | `/students/branch/:branch` | ✅ teacher | Students by branch |
| GET | `/students/:id/skills` | ✅ | Student skill map |
| GET | `/users/profile` | ✅ | Get own profile |
| PATCH | `/users/profile` | ✅ | Update profile |
| POST | `/feedback` | ✅ | Submit feedback/rubric |
| GET | `/feedback/project/:id` | ✅ | Get project feedback |
| GET | `/notifications` | ✅ | Get notifications |
| PATCH | `/notifications/read-all` | ✅ | Mark all read |
| GET | `/analytics/skills` | ✅ | Skill radar data |
| GET | `/analytics/departments` | ✅ | Department stats |
| GET | `/analytics/top-students` | ✅ | Top students leaderboard |
| POST | `/files/upload` | ✅ | Upload file to R2 |
| GET | `/files/:key` | ✅ | Get signed download URL |
| DELETE | `/files/:key` | ✅ | Delete file from R2 |

---

## 🧪 Testing

Run the full 45-test end-to-end API suite:
```bash
cd server
node -r ./scripts/dns-fix.js scripts/test-api.js
```

Expected output: `Results: 45 passed, 0 failed`

---

## 🔧 DNS Note

If you're on a restricted network (e.g., college Wi-Fi) that blocks `*.neon.tech` DNS resolution, the server automatically applies a DNS fix via `scripts/dns-fix.js`. This preload patches Node's `dns.lookup` and the undici global dispatcher to use **Cloudflare 1.1.1.1** for Neon hostnames. No manual configuration needed — it runs automatically with all `pnpm start/dev/migrate` scripts.
- **Project Phases** — 6-phase lifecycle tracking with star ratings
- **File Uploads** — Upload project files (up to 50MB, 10 files)
- **Password Reset** — Email-based password recovery
- **Dark Mode** — Toggle between light and dark themes

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Vite, React Router, Axios, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | bcryptjs, JWT |
| Email | Nodemailer (Gmail) |

## 👥 Team
Built by a team of 6-7 students for RSCOE.
