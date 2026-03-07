@echo off
setlocal enabledelayedexpansion
title RSCOE Project Management System - Startup
color 0A
echo.
echo ========================================
echo   RSCOE Project Management System
echo   Complete Startup Script
echo ========================================
echo.

REM Check if MongoDB is already running
echo [1/3] Checking MongoDB...
netstat -an | findstr ":27017" >nul
if !errorlevel! == 0 (
    echo [OK] MongoDB is already running on port 27017
    goto start_backend
)

echo [INFO] Starting MongoDB...
REM Try to start MongoDB service first
net start MongoDB >nul 2>&1
if !errorlevel! == 0 (
    echo [OK] MongoDB service started successfully
    timeout /t 2 >nul
    goto start_backend
)

REM If service doesn't exist, start MongoDB manually
echo [INFO] Attempting to start MongoDB manually...
if not exist "C:\data\db" (
    mkdir "C:\data\db" 2>nul
    echo [INFO] Created data directory: C:\data\db
)

REM Try to find MongoDB in common installation paths
set MONGODB_PATH=
if exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe
) else if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe
) else if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
)

if defined MONGODB_PATH (
    start "MongoDB" /min "%MONGODB_PATH%" --dbpath "C:\data\db"
    echo [OK] MongoDB started in background
    echo [INFO] Waiting for MongoDB to initialize...
    timeout /t 3 >nul
) else (
    echo [WARNING] MongoDB executable not found in common paths.
    echo [WARNING] Please start MongoDB manually or install it.
    echo [WARNING] Continuing anyway - backend will show connection errors if MongoDB is not running.
)

:start_backend
echo.
echo [2/3] Starting Backend Server...
set "BACKEND_DIR=%~dp0server"
cd /d "%BACKEND_DIR%"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies (this may take a minute)...
    call npm install
    set INSTALL_RESULT=!errorlevel!
    if !INSTALL_RESULT! neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
    echo.
)

REM Check if multer is installed
npm list multer >nul 2>&1
set MULTER_CHECK=!errorlevel!
if !MULTER_CHECK! neq 0 (
    echo [INFO] Installing multer (required for file uploads)...
    call npm install multer
    echo [OK] Multer installed
    echo.
)

echo [INFO] Starting backend server on port 5000...
start "Backend Server" /d "%BACKEND_DIR%" cmd /k "node Index.js"
cd /d "%~dp0"
timeout /t 3 >nul

:start_frontend
echo.
echo [3/3] Starting Frontend Server...
set "FRONTEND_DIR=%~dp0"
cd /d "%FRONTEND_DIR%"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies (this may take a minute)...
    call npm install
    set INSTALL_RESULT=!errorlevel!
    if !INSTALL_RESULT! neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
    echo.
)

echo [INFO] Starting frontend server on port 3000...
start "Frontend Server" /d "%FRONTEND_DIR%" cmd /k "npm run dev"

echo [INFO] Waiting for frontend server to start...
timeout /t 10 >nul

echo.
echo ========================================
echo   ✅ Application Started Successfully!
echo ========================================
echo.
echo 📍 Access Points:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo    Health:   http://localhost:5000/health
echo.
echo 📝 Server Windows:
echo    - MongoDB: Running in background (or separate window)
echo    - Backend:  Check "Backend Server" window
echo    - Frontend: Check "Frontend Server" window
echo.
echo ⚠️  Important:
echo    - Keep all server windows open while using the application
echo    - To stop: Close the server windows or press Ctrl+C in each
echo.
echo ========================================
echo.
echo [INFO] Opening browser automatically...
start http://localhost:3000
timeout /t 1 >nul
echo [OK] Browser should open in a moment!
echo.
echo If browser didn't open, you can manually visit: http://localhost:3000
echo.
echo Press any key to close this window...
echo (The servers will continue running in separate windows)
pause >nul
