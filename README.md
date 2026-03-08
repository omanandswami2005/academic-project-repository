# APRS - Academic Project Repository & Skill Mapping System

A centralized platform for managing college academic projects, tracking student skills, and bridging the gap between student capabilities and industry requirements.

## 🏗️ Project Structure

```
academic-project-repository/
├── client/          → React.js frontend (Vite)
├── server/          → Node.js backend (Express + MongoDB)
├── docs/            → Project documentation (SRS, tasks)
├── .gitignore
├── package.json     → Root scripts (run both client & server)
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running on `localhost:27017`

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
Edit `server/.env` with your actual values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/project_db
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Start Development
```bash
# Run both client & server concurrently
npm run dev

# Or run individually
npm run client    # React app on http://localhost:3000
npm run server    # API server on http://localhost:5000
```

## 🎯 Features
- **Project Repository** — GitHub-like project management for students
- **Role-based Dashboards** — Student, Teacher, Industry Expert
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
