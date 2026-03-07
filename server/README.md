# Backend Server Setup

## Quick Start (Easiest Method)

**Option 1: Use the startup script (Recommended)**
```bash
cd server
start-mongodb.bat
```
This will automatically start MongoDB and then start the server.

**Option 2: Manual Start**

1. **Start MongoDB:**
   - **Method A (Service):** `net start MongoDB`
   - **Method B (Manual):** 
     ```bash
     "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
     ```
   - **Method C:** Use MongoDB Compass (GUI tool)

2. **Start the server:**
   ```bash
   cd server
   npm start
   ```
   Or double-click: `start-server.bat`

3. **Verify everything is working:**
   - Open browser: `http://localhost:5000/health`
   - You should see: `{"status":"Server is running","database":"connected",...}`
   - In the terminal, you should see: `✅ Database is Connected!` and `🚀 Server running on port 5000`

## API Endpoints

### Health Check
- **GET** `/health` - Check server and database status

### Signup
- **POST** `/signup`
- Body: `{ username, email, password, role }`
- Returns: User object with id, username, email, role

### Login
- **POST** `/login`
- Body: `{ email, password, role }`
- Returns: User object with id, username, email, role

## Database

- MongoDB connection: `mongodb://127.0.0.1:27017/project_db`
- Database name: `project_db`
- Collections: `users`

## Troubleshooting

- **"Database not connected"**: Make sure MongoDB is running on port 27017
- **Port 5000 already in use**: Stop any other process using port 5000
- **Module not found**: Run `npm install` in the server directory

