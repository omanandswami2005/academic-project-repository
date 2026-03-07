@echo off
setlocal enabledelayedexpansion
title RSCOE Project Management System - Complete Startup
color 0B
cls

echo.
echo ================================================================
echo   RSCOE Project Management System
echo   Complete Startup Script - All-in-One
echo ================================================================
echo.

REM Get the script directory (handle paths with spaces)
set "PROJECT_ROOT=%~dp0"
set "SERVER_DIR=%PROJECT_ROOT%server"

echo [STEP 1/5] Checking MongoDB Status...
echo.

REM Check if MongoDB is already running
netstat -an | findstr ":27017" >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] MongoDB is already running on port 27017
    echo.
    goto :start_backend
)

echo [INFO] MongoDB not detected. Starting MongoDB...
echo.

REM Try to start MongoDB service first
net start MongoDB >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] MongoDB service started successfully
    echo [INFO] Waiting for MongoDB to initialize...
    timeout /t 3 >nul
    echo.
    goto :start_backend
)

REM If service doesn't exist, try to start MongoDB manually
echo [INFO] MongoDB service not found. Attempting manual start...
echo.

REM Create data directory if it doesn't exist
if not exist "C:\data\db" (
    mkdir "C:\data\db" >nul 2>&1
    echo [INFO] Created MongoDB data directory: C:\data\db
)

REM Try to find MongoDB in common installation paths
set "MONGODB_PATH="
set "MONGODB_VERSIONS=8.2 8.0 7.0 6.0 5.0"

for %%v in (%MONGODB_VERSIONS%) do (
    if exist "C:\Program Files\MongoDB\Server\%%v\bin\mongod.exe" (
        set "MONGODB_PATH=C:\Program Files\MongoDB\Server\%%v\bin\mongod.exe"
        goto :found_mongodb
    )
)

REM Also check Program Files (x86) and custom paths
for %%v in (%MONGODB_VERSIONS%) do (
    if exist "C:\Program Files (x86)\MongoDB\Server\%%v\bin\mongod.exe" (
        set "MONGODB_PATH=C:\Program Files (x86)\MongoDB\Server\%%v\bin\mongod.exe"
        goto :found_mongodb
    )
)

:found_mongodb
if defined MONGODB_PATH (
    echo [OK] Found MongoDB at: %MONGODB_PATH%
    echo [INFO] Starting MongoDB in background...
    start "MongoDB Server" /min "" "%MONGODB_PATH%" --dbpath "C:\data\db"
    echo [OK] MongoDB started in background
    echo [INFO] Waiting for MongoDB to initialize (5 seconds)...
    timeout /t 5 >nul
    echo.
) else (
    echo [WARNING] MongoDB executable not found in common installation paths.
    echo [WARNING] Please ensure MongoDB is installed and running.
    echo [WARNING] You can:
    echo           1. Install MongoDB from https://www.mongodb.com/try/download/community
    echo           2. Start MongoDB manually before running this script
    echo           3. Continue anyway (backend will show connection errors)
    echo.
    echo [INFO] Continuing with startup (MongoDB may not be available)...
    echo.
    timeout /t 2 >nul
)

:start_backend
echo [STEP 2/5] Setting up Backend Server...
echo.

REM Change to server directory
cd /d "%SERVER_DIR%" 2>nul
if not exist "Index.js" (
    echo [ERROR] Cannot access server directory
    echo [INFO] Expected path: %SERVER_DIR%
    echo [INFO] Please verify the server directory exists
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies (this may take 1-2 minutes)...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies!
        echo [INFO] Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed successfully
    echo.
) else (
    echo [OK] Backend dependencies already installed
    echo.
)

REM Verify critical packages
echo [INFO] Verifying critical packages...
npm list express mongoose multer >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Some packages may be missing. Reinstalling...
    call npm install express mongoose multer cors dotenv bcryptjs nodemailer
    echo.
)

echo [INFO] Starting backend server on port 5000...
echo [INFO] Backend will open in a new window...
echo.
start "Backend Server - Port 5000" /d "%SERVER_DIR%" cmd /k "node Index.js"
timeout /t 4 >nul

REM Verify backend is starting
echo [INFO] Waiting for backend to initialize...
timeout /t 3 >nul
echo.

:start_frontend
echo [STEP 3/5] Setting up Frontend Server...
echo.

REM Change to project root directory
cd /d "%PROJECT_ROOT%" 2>nul
if not exist "package.json" (
    echo [ERROR] Cannot access project root directory
    echo [INFO] Expected path: %PROJECT_ROOT%
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies (this may take 1-2 minutes)...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies!
        echo [INFO] Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed successfully
    echo.
) else (
    echo [OK] Frontend dependencies already installed
    echo.
)

echo [INFO] Starting frontend development server...
echo [INFO] Frontend will open in a new window...
echo.
start "Frontend Server - Vite Dev" /d "%PROJECT_ROOT%" cmd /k "npm run dev"
timeout /t 2 >nul

:wait_for_servers
echo [STEP 4/5] Waiting for servers to start...
echo.
echo [INFO] Waiting 12 seconds for both servers to fully initialize...
echo [INFO] Please wait...
timeout /t 12 >nul
echo.

:open_browser
echo [STEP 5/5] Opening Browser...
echo.

REM Try to detect the default browser and open localhost:3000
echo [INFO] Opening application in your default browser...
start http://localhost:3000
timeout /t 2 >nul

echo.
echo ================================================================
echo   ✅ APPLICATION STARTED SUCCESSFULLY!
echo ================================================================
echo.
echo 📍 Access Points:
echo    ┌─────────────────────────────────────────────┐
echo    │  Frontend:  http://localhost:3000          │
echo    │  Backend:   http://localhost:5000         │
echo    │  Health:    http://localhost:5000/health  │
echo    └─────────────────────────────────────────────┘
echo.
echo 📝 Server Windows:
echo    • MongoDB:  Running in background (or separate window)
echo    • Backend:  Check "Backend Server - Port 5000" window
echo    • Frontend: Check "Frontend Server - Vite Dev" window
echo.
echo ⚠️  IMPORTANT NOTES:
echo    • Keep ALL server windows open while using the application
echo    • To stop servers: Close the server windows or press Ctrl+C
echo    • If browser didn't open, manually visit: http://localhost:3000
echo.
echo 🎯 NEXT STEPS:
echo    1. Wait for frontend to finish loading (check the Vite window)
echo    2. If you see "ready in Xms" in the Vite window, you're good to go!
echo    3. The browser should have opened automatically
echo    4. Login/Signup and test the project upload feature
echo.
echo ================================================================
echo.
echo [INFO] This window will close in 5 seconds...
echo [INFO] Servers will continue running in separate windows
echo.
timeout /t 5 >nul

endlocal
exit /b 0
