# RSCOE Project Management System - PowerShell Startup Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  RSCOE Project Management System" -ForegroundColor Green
Write-Host "  Complete Startup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is already running
Write-Host "[1/3] Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue

if ($mongoRunning) {
    Write-Host "[OK] MongoDB is already running on port 27017" -ForegroundColor Green
} else {
    Write-Host "[INFO] Starting MongoDB..." -ForegroundColor Yellow
    
    # Try to start MongoDB service
    try {
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Write-Host "[OK] MongoDB service started successfully" -ForegroundColor Green
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "[WARNING] Could not start MongoDB service. Please start it manually." -ForegroundColor Yellow
        Write-Host "[WARNING] Continuing anyway - backend will show connection errors if MongoDB is not running." -ForegroundColor Yellow
    }
}

# Start Backend
Write-Host ""
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\server"

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing backend dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install backend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check if multer is installed
$multerInstalled = npm list multer 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Installing multer (required for file uploads)..." -ForegroundColor Yellow
    npm install multer
    Write-Host "[OK] Multer installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[INFO] Starting backend server on port 5000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k node Index.js" -WindowStyle Normal
Start-Sleep -Seconds 3

# Start Frontend
Write-Host ""
Write-Host "[3/3] Starting Frontend Server..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing frontend dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install frontend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[INFO] Starting frontend server on port 3000..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Health:   http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "📝 Server Windows:" -ForegroundColor Cyan
Write-Host "   - MongoDB: Running in background (or separate window)" -ForegroundColor White
Write-Host "   - Backend:  Check 'Backend Server (Port 5000)' window" -ForegroundColor White
Write-Host "   - Frontend: Check 'Frontend Server (Port 3000)' window" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "   - Keep all server windows open while using the application" -ForegroundColor White
Write-Host "   - To stop: Close the server windows or press Ctrl+C in each" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to close this window (servers will continue running)"
