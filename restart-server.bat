@echo off
echo ========================================
echo   Restarting Backend Server
echo ========================================
echo.

REM Kill any existing Node processes on port 5000
echo [INFO] Stopping existing server processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo [INFO] Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 >nul

echo [INFO] Starting server...
cd /d "%~dp0server"
start "Backend Server" cmd /k "node Index.js"

echo.
echo [OK] Server should be starting...
echo [INFO] Check the server window for status messages
echo.
pause

