# RSCOE Project Management System - Complete Startup Script (PowerShell)
# Run this script to start MongoDB, Backend, Frontend, and open browser

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  RSCOE Project Management System" -ForegroundColor Cyan
Write-Host "  Complete Startup Script - All-in-One" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerDir = Join-Path $ProjectRoot "server"

# Step 1: Check MongoDB
Write-Host "[STEP 1/5] Checking MongoDB Status..." -ForegroundColor Yellow
Write-Host ""

$mongoRunning = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "[OK] MongoDB is already running on port 27017" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Starting MongoDB..." -ForegroundColor Yellow
    
    # Try to start MongoDB service
    try {
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Write-Host "[OK] MongoDB service started successfully" -ForegroundColor Green
        Start-Sleep -Seconds 3
        Write-Host ""
    } catch {
        Write-Host "[WARNING] MongoDB service not found or already running" -ForegroundColor Yellow
        Write-Host "[INFO] Please ensure MongoDB is installed and running" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Step 2: Setup Backend
Write-Host "[STEP 2/5] Setting up Backend Server..." -ForegroundColor Yellow
Write-Host ""

Set-Location $ServerDir

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing backend dependencies (this may take 1-2 minutes)..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install backend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Backend dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Backend dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[INFO] Starting backend server on port 5000..." -ForegroundColor Yellow
Write-Host "[INFO] Backend will open in a new window..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ServerDir'; node Index.js" -WindowStyle Normal
Start-Sleep -Seconds 4

# Step 3: Setup Frontend
Write-Host "[STEP 3/5] Setting up Frontend Server..." -ForegroundColor Yellow
Write-Host ""

Set-Location $ProjectRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing frontend dependencies (this may take 1-2 minutes)..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install frontend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Frontend dependencies installed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[OK] Frontend dependencies already installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[INFO] Starting frontend development server..." -ForegroundColor Yellow
Write-Host "[INFO] Frontend will open in a new window..." -ForegroundColor Yellow
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 2

# Step 4: Wait for servers
Write-Host "[STEP 4/5] Waiting for servers to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Waiting 12 seconds for both servers to fully initialize..." -ForegroundColor Yellow
Write-Host "[INFO] Please wait..." -ForegroundColor Yellow
Start-Sleep -Seconds 12
Write-Host ""

# Step 5: Open Browser
Write-Host "[STEP 5/5] Opening Browser..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Opening application in your default browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ✅ APPLICATION STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Yellow
Write-Host "   ┌─────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "   │  Frontend:  http://localhost:3000          │" -ForegroundColor White
Write-Host "   │  Backend:   http://localhost:5000         │" -ForegroundColor White
Write-Host "   │  Health:    http://localhost:5000/health  │" -ForegroundColor White
Write-Host "   └─────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Server Windows:" -ForegroundColor Yellow
Write-Host "   • MongoDB:  Running in background (or separate window)" -ForegroundColor White
Write-Host "   • Backend:  Check PowerShell window for 'Backend Server'" -ForegroundColor White
Write-Host "   • Frontend: Check PowerShell window for 'Frontend Server'" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "   • Keep ALL server windows open while using the application" -ForegroundColor White
Write-Host "   • To stop servers: Close the server windows or press Ctrl+C" -ForegroundColor White
Write-Host "   • If browser didn't open, manually visit: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Wait for frontend to finish loading (check the Vite window)" -ForegroundColor White
Write-Host "   2. If you see 'ready in Xms' in the Vite window, you're good to go!" -ForegroundColor White
Write-Host "   3. The browser should have opened automatically" -ForegroundColor White
Write-Host "   4. Login/Signup and test the project upload feature" -ForegroundColor White
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
Write-Host "(Servers will continue running in separate windows)" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
