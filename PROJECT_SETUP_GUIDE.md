# Project Management System - Setup & Run Guide

## ✅ Issues Fixed

1. **"next is not a function" Error**: Fixed multer middleware configuration
2. **6 Phases Feature**: Fully integrated with star rating system
3. **Project Upload**: Now working correctly with proper error handling

## 🚀 Step-by-Step Setup Instructions

### Prerequisites
- Node.js (v14 or higher) installed
- MongoDB installed and running
- Git (optional, for version control)

### Step 1: Install Frontend Dependencies

1. Open a terminal/command prompt
2. Navigate to the project root directory:
   ```bash
   cd "c:\Users\Utkarsh\Desktop\project management system"
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```

### Step 2: Install Backend Dependencies

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Go back to the root directory:
   ```bash
   cd ..
   ```

### Step 3: Start MongoDB

**Option A: If MongoDB is installed as a Windows Service**
- MongoDB should start automatically
- Verify it's running by checking Windows Services

**Option B: Manual Start**
1. Open a new terminal/command prompt
2. Navigate to MongoDB bin directory (usually `C:\Program Files\MongoDB\Server\<version>\bin`)
3. Run:
   ```bash
   mongod --dbpath "C:\data\db"
   ```
   (Make sure the `C:\data\db` directory exists, or use your MongoDB data path)

**Option C: Using the provided batch file**
- Double-click `server\start-mongodb.bat` (if available)

### Step 4: Start the Backend Server

1. Open a **new terminal/command prompt**
2. Navigate to the server directory:
   ```bash
   cd "c:\Users\Utkarsh\Desktop\project management system\server"
   ```
3. Start the server:
   ```bash
   npm start
   ```
   OR
   ```bash
   node Index.js
   ```
4. You should see: `🚀 Server running on port 5000`
5. **Keep this terminal open** - the server must stay running

### Step 5: Start the Frontend Development Server

1. Open a **new terminal/command prompt** (keep the backend terminal running)
2. Navigate to the project root directory:
   ```bash
   cd "c:\Users\Utkarsh\Desktop\project management system"
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. You should see the Vite server starting
5. The app will open at `http://localhost:3000` (or the port shown in terminal)

### Step 6: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You should see the landing page

## 📋 Quick Start (Using Batch Files - If Available)

If you have batch files in the project:

1. **Start MongoDB**: Double-click `server\start-mongodb.bat`
2. **Start Server**: Double-click `server\start-server.bat`
3. **Start Frontend**: Double-click `START.bat` or `start-project.bat`

## 🎯 Testing the Features

### Test Student Login & Project Upload

1. **Sign Up/Login as Student**:
   - Go to `http://localhost:3000`
   - Click "Sign Up" or "Login"
   - Create/login with a student account

2. **Upload a Project**:
   - After login, click on "Uploads" in the sidebar
   - Fill in:
     - Project Name: (e.g., "My First Project")
     - Project Description: (e.g., "This is a test project")
   - (Optional) Upload files
   - Click "Upload Project"
   - You should see a success message

3. **View Your Projects**:
   - Scroll down in the Uploads section
   - You should see "My Uploaded Projects"
   - Each project shows:
     - Project name and status
     - **6 stars** (initially 0/6 filled)
     - **6 phases** with checkboxes

4. **Test Phase Completion**:
   - Check any phase checkbox (e.g., "Phase 1: Publishing Idea")
   - The star count should update automatically
   - Completed phases turn green
   - You can add descriptions to each phase

## 🔧 Troubleshooting

### Error: "Database not connected"
- **Solution**: Make sure MongoDB is running (Step 3)
- Check MongoDB is listening on port 27017

### Error: "Cannot find module"
- **Solution**: Run `npm install` in both root and server directories

### Error: "Port 5000 already in use"
- **Solution**: 
  - Close any other application using port 5000
  - Or change the port in `server/Index.js` (last line)

### Error: "Port 3000 already in use"
- **Solution**: 
  - Vite will automatically use the next available port
  - Check the terminal for the actual port number

### Upload Button Not Working
- **Solution**: 
  - Make sure backend server is running on port 5000
  - Check browser console for errors
  - Verify MongoDB is connected

### Phases Not Showing
- **Solution**: 
  - Make sure you've uploaded at least one project
  - Refresh the page
  - Check browser console for errors

## 📁 Project Structure

```
project management system/
├── server/                 # Backend (Node.js/Express)
│   ├── Index.js           # Main server file
│   ├── models/            # Database models
│   │   ├── User.js
│   │   └── Project.js     # Project model with 6 phases
│   └── uploads/           # Uploaded files storage
├── src/                   # Frontend (React)
│   ├── pages/
│   │   └── StudentDashboard.jsx  # Student dashboard with phases
│   └── components/
└── package.json           # Frontend dependencies
```

## ✨ Features Implemented

✅ **Student Project Upload**
- Students can post new projects
- Projects stored in MongoDB backend
- Projects visible when students login

✅ **6-Phase Project Tracking**
1. Phase 1: Publishing Idea
2. Phase 2: Publishing Research Paper
3. Phase 3: Building Prototype
4. Phase 4: Completing Prototype
5. Phase 5: Completing Model
6. Phase 6: Final Submission

✅ **Star Rating System**
- Automatically calculates stars based on completed phases
- 0-6 stars (1 star per completed phase)
- Visual star display with count

✅ **Phase Management**
- Check/uncheck phases to mark completion
- Add descriptions/notes for each phase
- Completion dates automatically recorded
- Visual indicators for completed phases

## 🎓 Next Steps

1. Test all features thoroughly
2. Upload multiple projects
3. Complete different phases
4. Verify stars update correctly
5. Test with multiple student accounts

## 📞 Support

If you encounter any issues:
1. Check the terminal/console for error messages
2. Verify MongoDB is running
3. Ensure both frontend and backend servers are running
4. Check that all dependencies are installed

---

**Happy Coding! 🚀**
