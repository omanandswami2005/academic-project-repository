# 🚀 Quick Start - One Command to Start Everything

## Single Command Startup

Simply double-click or run:

```bash
START.bat
```

Or from command line:
```bash
start START.bat
```

## What It Does

The `START.bat` script automatically:

1. ✅ **Checks and starts MongoDB** (if not running)
2. ✅ **Installs dependencies** (if missing)
3. ✅ **Installs multer** (required for file uploads)
4. ✅ **Starts Backend Server** (port 5000)
5. ✅ **Starts Frontend Server** (port 3000)

## After Running

You'll see 3 windows:

1. **This Window** - Startup script (can be closed after servers start)
2. **Backend Server** - Shows server logs (keep open)
3. **Frontend Server** - Shows frontend logs (keep open)

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## First Time Setup

If this is your first time:

1. **Run `START.bat`** - It will install everything automatically
2. **Wait for installation** - First run may take a few minutes
3. **Check server windows** - Make sure both backend and frontend started successfully

## Troubleshooting

### MongoDB Not Starting
- Make sure MongoDB is installed
- Or start it manually: `net start MongoDB`

### Dependencies Not Installing
- Check your internet connection
- Run manually: `cd server && npm install` then `npm install`

### Port Already in Use
- Stop other applications using ports 3000 or 5000
- Or change ports in configuration files

## Stopping the Application

1. Close the **Backend Server** window (Ctrl+C)
2. Close the **Frontend Server** window (Ctrl+C)
3. MongoDB will keep running (stop with: `net stop MongoDB`)

## Alternative: Manual Start

If you prefer to start manually:

```bash
# Terminal 1: MongoDB
net start MongoDB

# Terminal 2: Backend
cd server
npm start

# Terminal 3: Frontend
npm run dev
```

But `START.bat` does all of this automatically! 🎉
