# LioArcade - Start Script (Single Window)
# This script starts both backend and frontend in the same terminal using background jobs

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
}

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use (Frontend)" -ForegroundColor Yellow
}

Write-Host "`n🌐 Starting servers...`n" -ForegroundColor Yellow

# Start backend as background job
Write-Host "📡 Starting Backend API (Port 3001)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    npm run dev 2>&1
}

# Start frontend as background job
Write-Host "🎨 Starting Frontend App (Port 3000)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    npm run dev 2>&1
}

Write-Host "`n✅ Servers starting in background!" -ForegroundColor Green
Write-Host "`n📋 Server URLs:" -ForegroundColor Cyan
Write-Host "   Backend API:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "`n💡 Commands:" -ForegroundColor Cyan
Write-Host "   - View backend logs: Receive-Job -Id $($backendJob.Id)" -ForegroundColor White
Write-Host "   - View frontend logs: Receive-Job -Id $($frontendJob.Id)" -ForegroundColor White
Write-Host "   - Stop servers: Stop-Job -Id $($backendJob.Id),$($frontendJob.Id); Remove-Job -Id $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor White
Write-Host "`n⏳ Waiting for servers to start..." -ForegroundColor Yellow

# Wait and show initial output
Start-Sleep -Seconds 5

Write-Host "`n📊 Backend Output:" -ForegroundColor Cyan
Receive-Job -Id $backendJob.Id | Select-Object -First 10

Write-Host "`n📊 Frontend Output:" -ForegroundColor Cyan
Receive-Job -Id $frontendJob.Id | Select-Object -First 10

Write-Host "`n🎉 Servers are running! Press Ctrl+C to stop." -ForegroundColor Green
Write-Host "   (Servers will continue in background. Use Stop-Job to stop them)" -ForegroundColor Yellow

# Keep script running and show logs
try {
    while ($true) {
        Start-Sleep -Seconds 2
        $backendOutput = Receive-Job -Id $backendJob.Id
        $frontendOutput = Receive-Job -Id $frontendJob.Id
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Green
        }
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Blue
        }
    }
} catch {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Id $backendJob.Id, $frontendJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $backendJob.Id, $frontendJob.Id -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}



