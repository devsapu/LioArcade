# LioArcade - Initial Setup Script
# This script sets up the project for the first time

Write-Host "🚀 LioArcade Setup Script" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
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
        Write-Host "✅ PostgreSQL $version found" -ForegroundColor Green
        break
    }
}

if (-not $postgresFound) {
    Write-Host "⚠️  PostgreSQL not found in PATH. Checking if service is running..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "✅ PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
        Write-Host "⚠️  Note: You may need to add PostgreSQL to PATH manually" -ForegroundColor Yellow
    } else {
        Write-Host "❌ PostgreSQL not found. Please install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Red
        Write-Host "   Or use a cloud database (Railway, Supabase, Neon)" -ForegroundColor Yellow
    }
}

Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules exists. Skipping npm install..." -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend npm install failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
}

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules exists. Skipping npm install..." -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend npm install failed" -ForegroundColor Red
        Set-Location ../..
        exit 1
    }
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
}

Set-Location ../..

# Setup backend .env file
Write-Host "`n⚙️  Setting up backend environment..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating backend .env file..." -ForegroundColor Yellow
    
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
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✅ Created backend/.env file" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit backend/.env and set your DATABASE_URL with correct password!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Backend .env file already exists" -ForegroundColor Green
}

# Setup frontend .env.local file
Write-Host "`n⚙️  Setting up frontend environment..." -ForegroundColor Yellow
Set-Location ../frontend

if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating frontend .env.local file..." -ForegroundColor Yellow
    $envLocalContent = @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@
    $envLocalContent | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ Created frontend/.env.local file" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend .env.local file already exists" -ForegroundColor Green
}

Set-Location ../..

# Database setup
Write-Host "`n🗄️  Database setup..." -ForegroundColor Yellow
Set-Location backend

Write-Host "📝 Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Prisma generate failed. Make sure DATABASE_URL is correct in .env" -ForegroundColor Yellow
} else {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
}

Write-Host "`n📊 Pushing database schema..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure PostgreSQL is running and DATABASE_URL in .env is correct!" -ForegroundColor Yellow
$pushDb = Read-Host "Push schema to database now? (y/n)"

if ($pushDb -eq "y" -or $pushDb -eq "Y") {
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database schema pushed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Database push failed. Check your DATABASE_URL in backend/.env" -ForegroundColor Red
        Write-Host "   You can run 'npm run db:push' manually later" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipping database push. Run 'npm run db:push' manually when ready" -ForegroundColor Yellow
}

Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit backend/.env and set your DATABASE_URL" -ForegroundColor White
Write-Host "   2. If database wasn't pushed, run: cd backend && npm run db:push" -ForegroundColor White
Write-Host "   3. Run start.ps1 to start the application" -ForegroundColor White
Write-Host "`n🚀 To start the app, run: .\start.ps1" -ForegroundColor Cyan

