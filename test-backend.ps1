$ErrorActionPreference = "Continue"
$backendDir = "C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend"

# Start the backend server using npx
$env:NODE_ENV = "development"
$process = Start-Process -FilePath "npx" -ArgumentList "tsx", "src/main.ts" -WorkingDirectory $backendDir -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 6

# Test health endpoint
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    Write-Host "Health: SUCCESS"
    Write-Host ($health | ConvertTo-Json)
} catch {
    Write-Host "Health: FAILED - $($_.Exception.Message)"
}

# Test register endpoint
try {
    $registerBody = @{
        email = "test@test.com"
        password = "password123"
        fullName = "Test User"
        nifCif = "12345678A"
    } | ConvertTo-Json
    
    $register = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -TimeoutSec 5
    Write-Host "Register: SUCCESS"
    Write-Host ($register | ConvertTo-Json)
} catch {
    Write-Host "Register: FAILED - $($_.Exception.Message)"
}

# Test login endpoint  
try {
    $loginBody = @{
        email = "test@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5 -SessionVariable session
    Write-Host "Login: SUCCESS"
    Write-Host ($login | ConvertTo-Json)
} catch {
    Write-Host "Login: FAILED - $($_.Exception.Message)"
}

# Stop the server
if ($process -and !$process.HasExited) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "Test complete"