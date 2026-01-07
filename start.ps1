# LioArcade - Start Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting LioArcade Application" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ Backend .env file not found!" -ForegroundColor Red
    Write-Host "   Run setup.ps1 first to set up the project" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "❌ Frontend .env.local file not found!" -ForegroundColor Red
    Write-Host "   Run setup.ps1 first to set up the project" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exist
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "⚠️  Backend dependencies not installed. Installing now..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "⚠️  Frontend dependencies not installed. Installing now..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host "✅ Dependencies check passed`n" -ForegroundColor Green

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Check if ports are available
if (Test-Port -Port 3001) {
    Write-Host "⚠️  Port 3001 is already in use (Backend)" -ForegroundColor Yellow
    Write-Host "   Backend might already be running. Continue anyway? (y/n)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use (Frontend)" -ForegroundColor Yellow
    Write-Host "   Frontend might already be running. Continue anyway? (y/n)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

Write-Host "`n🌐 Starting servers...`n" -ForegroundColor Yellow

# Start backend in new window
Write-Host "📡 Starting Backend API (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 Backend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "🎨 Starting Frontend App (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🚀 Frontend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host "`n✅ Servers starting in separate windows!" -ForegroundColor Green
Write-Host "`n📋 Server URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "`n💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Backend and Frontend are running in separate PowerShell windows" -ForegroundColor White
Write-Host "   - Close those windows to stop the servers" -ForegroundColor White
Write-Host "   - Check backend window for API logs" -ForegroundColor White
Write-Host "   - Check frontend window for Next.js logs" -ForegroundColor White
Write-Host "`n🎉 Happy coding!" -ForegroundColor Green

