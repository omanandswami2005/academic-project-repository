@echo off
echo ========================================
echo   Server Status Check
echo ========================================
echo.

echo [1] Checking if port 5000 is in use...
netstat -an | findstr ":5000" | findstr "LISTENING"
if %errorlevel% == 0 (
    echo [OK] Port 5000 is in use
) else (
    echo [WARNING] Port 5000 is not in use - server is not running
)

echo.
echo [2] Testing server health endpoint...
curl -s http://localhost:5000/health 2>nul
if %errorlevel% == 0 (
    echo [OK] Server is responding
) else (
    echo [ERROR] Server is not responding correctly
    echo [INFO] The server may need to be restarted
)

echo.
echo [3] Checking MongoDB connection...
netstat -an | findstr ":27017" | findstr "LISTENING"
if %errorlevel% == 0 (
    echo [OK] MongoDB is running on port 27017
) else (
    echo [WARNING] MongoDB is not running
)

echo.
echo ========================================
echo   Recommendations:
echo ========================================
echo.
echo If server is not responding:
echo   1. Stop the server (close the server window)
echo   2. Run: restart-server.bat
echo   3. Or manually: cd server ^&^& npm start
echo.
pause

