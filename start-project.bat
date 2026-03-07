@echo off
echo ========================================
echo   RSCOE Project Management System
echo   Starting Full Application
echo ========================================
echo.

REM Check if MongoDB is already running
netstat -an | findstr ":27017" >nul
if %errorlevel% == 0 (
    echo [OK] MongoDB is already running on port 27017
    goto :start_backend
)

echo [INFO] Starting MongoDB...
REM Try to start MongoDB service first
net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] MongoDB service started successfully
    timeout /t 2 >nul
    goto :start_backend
)

REM If service doesn't exist, start MongoDB manually
echo [INFO] Starting MongoDB manually...
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
    echo [INFO] Waiting for MongoDB to start...
    timeout /t 3 >nul
) else (
    echo [WARNING] MongoDB executable not found in common paths.
    echo [WARNING] Please start MongoDB manually or install it.
    echo [WARNING] Continuing anyway - backend will show connection errors if MongoDB is not running.
)

:start_backend
echo.
echo [INFO] Starting Backend Server...
echo.
cd /d "%~dp0server"
REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies...
    call npm install
    echo.
)
start "Backend Server" cmd /k "node Index.js"
timeout /t 3 >nul

echo.
echo [INFO] Starting Frontend Server...
echo.
cd /d "%~dp0"
REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    echo.
)
start "Frontend Server" cmd /k "npm run dev"
timeout /t 2 >nul

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
echo (The servers will continue running in separate windows)
pause >nul

