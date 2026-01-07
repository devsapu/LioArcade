# LioArcade - Stop Script
# This script stops all running backend and frontend servers

Write-Host "🛑 Stopping LioArcade Servers" -ForegroundColor Yellow
Write-Host "=============================`n" -ForegroundColor Yellow

# Stop processes on ports 3000 and 3001
$ports = @(3000, 3001)
$stopped = $false

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🛑 Stopping process on port $port (PID: $($process.Id)) - $($process.ProcessName)" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $stopped = $true
            }
        }
    }
}

if ($stopped) {
    Write-Host "`n✅ Servers stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "`nℹ️  No servers found running on ports 3000 or 3001" -ForegroundColor Cyan
}

# Also stop any background jobs
$jobs = Get-Job | Where-Object { $_.Name -like "*backend*" -or $_.Name -like "*frontend*" }
if ($jobs) {
    Write-Host "`n🛑 Stopping background jobs..." -ForegroundColor Yellow
    Stop-Job $jobs
    Remove-Job $jobs
    Write-Host "✅ Background jobs stopped" -ForegroundColor Green
}

Write-Host "`n✅ Done!" -ForegroundColor Green

