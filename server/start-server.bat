@echo off
echo ========================================
echo   Project Management System - Server
echo ========================================
echo.
echo Starting server...
echo Make sure MongoDB is running on port 27017
echo.
cd /d "%~dp0"
node Index.js
pause

