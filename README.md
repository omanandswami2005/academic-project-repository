# RSCOE Project Management System

A full-stack project management system built with React (Vite) frontend and Node.js/Express backend with MongoDB database.

## 🚀 Quick Start - One Command

**Simply run this single command to start everything:**
```bash
START.bat
```

Or double-click `START.bat` in Windows Explorer.

This will automatically:
- ✅ Check and start MongoDB (if not running)
- ✅ Install all dependencies (if missing)
- ✅ Install multer (required for file uploads)
- ✅ Start Backend Server (port 5000)
- ✅ Start Frontend Server (port 3000)

**Access the application:** http://localhost:3000

> 📖 See `QUICK_START.md` for detailed instructions and troubleshooting.

---

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Manual Installation (if needed)

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   npm install multer  # Required for file uploads
   cd ..
   ```

### Alternative: Manual Start

#### Option 1: Using Existing Scripts

**Start Everything:**
```bash
start-project.bat  # Or use START.bat (recommended)
```

**Start Backend Only (with MongoDB):**
```bash
cd server
start-mongodb.bat
```

**Start Frontend Only:**
```bash
npm run dev
```

#### Option 2: Manual Start

1. **Start MongoDB:**
   - **Windows Service:** `net start MongoDB`
   - **Manual:** `mongod --dbpath C:\data\db`
   - Or use MongoDB Compass GUI

2. **Start Backend Server:**
   ```bash
   cd server
   npm start
   ```
   Server will run on: `http://localhost:5000`

3. **Start Frontend:**
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:3000`

### Verify Installation

1. **Check Backend Health:**
   - Open: `http://localhost:5000/health`
   - Should return: `{"status":"Server is running","database":"connected",...}`

2. **Check Frontend:**
   - Open: `http://localhost:3000`
   - Should see the landing page

## 📁 Project Structure

```
project-management-system/
├── src/                    # React frontend source
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── db.js               # Database connection
│   └── Index.js            # Express server
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## 🔌 API Endpoints

### Health Check
- **GET** `/health` - Check server and database status

### Authentication
- **POST** `/signup` - Create new user account
  - Body: `{ username, email, password, role }`
  - Returns: User object with id, username, email, role

- **POST** `/login` - User login
  - Body: `{ email, password, role }`
  - Returns: User object with id, username, email, role

## 🗄️ Database

- **Connection:** `mongodb://127.0.0.1:27017/project_db`
- **Database Name:** `project_db`
- **Collections:** `users`

## 👥 User Roles

- **Student** - Access student dashboard
- **Teacher** - Access teacher dashboard with branch selection
- **Expert** - Access industry expert dashboard

## 🛠️ Development

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd server
npm start          # Start server
```

## 🐛 Troubleshooting

### Database Connection Issues
- **Error:** "Database not connected"
- **Solution:** Ensure MongoDB is running on port 27017
  - Check: `netstat -an | findstr :27017`
  - Start: `net start MongoDB` or `mongod --dbpath C:\data\db`

### Port Already in Use
- **Error:** "Port 5000/3000 already in use"
- **Solution:** 
  - Stop other processes using these ports
  - Or change ports in `server/Index.js` (backend) and `vite.config.js` (frontend)

### Module Not Found
- **Error:** "Cannot find module..."
- **Solution:** 
  ```bash
  # Frontend
  npm install
  
  # Backend
  cd server
  npm install
  ```

### CORS Issues
- If you see CORS errors, ensure the backend server is running and CORS is enabled (already configured in `server/Index.js`)

## 📝 Notes

- The frontend runs on port 3000 (Vite dev server)
- The backend runs on port 5000 (Express server)
- MongoDB should run on port 27017 (default)
- User data is stored in browser localStorage after login

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are available but not currently implemented in login flow
- CORS is enabled for local development

## 📧 Support

For issues or questions, check the server README: `server/README.md`

