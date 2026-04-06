# Simple server start + test using Jobs
$ErrorActionPreference = "SilentlyContinue"

# Create a job that starts the server
$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend"
    npx tsx src/main.ts
}

# Wait for job to start outputting
Start-Sleep -Seconds 6

# Check job output
$output = Receive-Job -Job $serverJob
Write-Host "=== Server Output ==="
Write-Host $output
Write-Host "===================="

# Try to test
Write-Host "`n=== Testing Endpoints ==="

try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Health: SUCCESS"
    Write-Host $health.Content
} catch {
    Write-Host "Health: FAILED - $($_.Exception.Message)"
}

try {
    $body = @{
        email = "test@test.com"
        password = "password123"
        fullName = "Test User"
        nifCif = "12345678A"
    } | ConvertTo-Json
    
    $register = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Write-Host "Register: SUCCESS"
    Write-Host $register.Content
} catch {
    Write-Host "Register: FAILED - $($_.Exception.Message)"
}

try {
    $body = @{
        email = "test@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $login = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Write-Host "Login: SUCCESS"
    Write-Host $login.Content
} catch {
    Write-Host "Login: FAILED - $($_.Exception.Message)"
}

# Cleanup
Stop-Job -Job $serverJob
Remove-Job -Job $serverJob
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "`nDone"