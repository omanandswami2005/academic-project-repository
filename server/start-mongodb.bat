@echo off
echo Starting MongoDB...
echo.

REM Check if MongoDB is already running
netstat -an | findstr ":27017" >nul
if %errorlevel% == 0 (
    echo MongoDB is already running on port 27017
    goto :start_server
)

REM Try to start MongoDB service first
net start MongoDB >nul 2>&1
if %errorlevel% == 0 (
    echo MongoDB service started successfully
    timeout /t 2 >nul
    goto :start_server
)

REM If service doesn't exist, start MongoDB manually
echo Starting MongoDB manually...
if not exist "C:\data\db" (
    mkdir "C:\data\db"
    echo Created data directory: C:\data\db
)

start "MongoDB" /min "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
echo Waiting for MongoDB to start...
timeout /t 3 >nul

:start_server
echo.
echo Starting Node.js server...
echo.
cd /d "%~dp0"
node Index.js
pause

