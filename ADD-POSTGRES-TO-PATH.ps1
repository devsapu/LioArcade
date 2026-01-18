# PowerShell script to permanently add PostgreSQL to PATH
# Run this script as Administrator

$postgresPath = "C:\Program Files\PostgreSQL\18\bin"

# Check if already in PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$postgresPath*") {
    # Add to system PATH
    [Environment]::SetEnvironmentVariable(
        "Path",
        $currentPath + ";$postgresPath",
        "Machine"
    )
    Write-Host "✅ PostgreSQL added to PATH successfully!" -ForegroundColor Green
    Write-Host "Please close and reopen PowerShell for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "✅ PostgreSQL is already in PATH!" -ForegroundColor Green
}

# Test if psql is accessible
$psqlPath = Join-Path $postgresPath "psql.exe"
if (Test-Path $psqlPath) {
    Write-Host "`nPostgreSQL location: $psqlPath" -ForegroundColor Cyan
    Write-Host "To test, run: psql --version" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Warning: psql.exe not found at expected location" -ForegroundColor Yellow
}



