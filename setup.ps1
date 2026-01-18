# LioArcade - Initial Setup Script
# This script sets up the project for the first time

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "LioArcade Setup Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "OK Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "OK npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
$postgresFound = $false
$postgresPath = $null

# Check common PostgreSQL installation paths
$postgresVersions = @(18, 17, 16, 15, 14)
foreach ($version in $postgresVersions) {
    $testPath = "C:\Program Files\PostgreSQL\$version\bin\psql.exe"
    if (Test-Path $testPath) {
        $postgresFound = $true
        $postgresPath = "C:\Program Files\PostgreSQL\$version\bin"
        Write-Host "OK PostgreSQL $version found" -ForegroundColor Green
        break
    }
}

if (-not $postgresFound) {
    Write-Host "WARNING: PostgreSQL not found in PATH. Checking if service is running..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "OK PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
        Write-Host "NOTE: You may need to add PostgreSQL to PATH manually" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Red
        Write-Host "Or use a cloud database (Railway, Supabase, Neon)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptPath "backend"
Set-Location $backendPath

if (Test-Path "node_modules") {
    Write-Host "WARNING: node_modules exists. Skipping npm install..." -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Backend npm install failed" -ForegroundColor Red
        Set-Location $scriptPath
        exit 1
    }
    Write-Host "OK Backend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptPath "frontend"
Set-Location $frontendPath

if (Test-Path "node_modules") {
    Write-Host "WARNING: node_modules exists. Skipping npm install..." -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend npm install failed" -ForegroundColor Red
        Set-Location $scriptPath
        exit 1
    }
    Write-Host "OK Frontend dependencies installed" -ForegroundColor Green
}

# Setup backend .env file
Write-Host ""
Write-Host "Setting up backend environment..." -ForegroundColor Yellow
Set-Location $backendPath

if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    
    # Generate JWT secrets
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $envContent = @"
# Server Configuration
PORT=3001
NODE_ENV=development

# Database URL
# For LOCAL PostgreSQL (add sslmode=disable):
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lioarcade?schema=public&sslmode=disable"

# For CLOUD databases (Railway/Supabase/Neon), use their provided connection string:
# DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT Configuration (Auto-generated - change in production!)
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
"@
    
    $envFile = Join-Path $backendPath ".env"
    [System.IO.File]::WriteAllText($envFile, $envContent)
    Write-Host "OK Created backend/.env file" -ForegroundColor Green
    Write-Host "IMPORTANT: Edit backend/.env and set your DATABASE_URL with correct password!" -ForegroundColor Yellow
} else {
    Write-Host "OK Backend .env file already exists" -ForegroundColor Green
}

# Setup frontend .env.local file
Write-Host ""
Write-Host "Setting up frontend environment..." -ForegroundColor Yellow
Set-Location $frontendPath

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating frontend .env.local file..." -ForegroundColor Yellow
    $envLocalContent = "NEXT_PUBLIC_API_URL=http://localhost:3001"
    $envLocalFile = Join-Path $frontendPath ".env.local"
    [System.IO.File]::WriteAllText($envLocalFile, $envLocalContent)
    Write-Host "OK Created frontend/.env.local file" -ForegroundColor Green
} else {
    Write-Host "OK Frontend .env.local file already exists" -ForegroundColor Green
}

# Database setup
Write-Host ""
Write-Host "Database setup..." -ForegroundColor Yellow
Set-Location $backendPath

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Prisma generate failed. Make sure DATABASE_URL is correct in .env" -ForegroundColor Yellow
    Write-Host "You can run 'npm run db:generate' manually after setting DATABASE_URL" -ForegroundColor Yellow
} else {
    Write-Host "OK Prisma Client generated" -ForegroundColor Green
}

Write-Host ""
Write-Host "Database schema push..." -ForegroundColor Yellow
Write-Host "WARNING: Make sure PostgreSQL is running and DATABASE_URL in .env is correct!" -ForegroundColor Yellow
Write-Host "You can push the schema manually by running: cd backend; npm run db:push" -ForegroundColor Yellow

Set-Location $scriptPath

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit backend/.env and set your DATABASE_URL with correct password" -ForegroundColor White
Write-Host "  2. Push database schema: cd backend; npm run db:push" -ForegroundColor White
Write-Host "  3. Run start.ps1 to start the application" -ForegroundColor White
Write-Host ""
Write-Host "To start the app, run: .\start.ps1" -ForegroundColor Cyan
