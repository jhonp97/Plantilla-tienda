$ErrorActionPreference = "SilentlyContinue"

function Get-CdpErrors($port, $sec) {
    $err = @()
    try {
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ct = [Threading.CancellationToken]::None
        $ws.ConnectAsync((Invoke-RestMethod "http://localhost:$port/json" -TimeoutSec 3)[0].webSocketDebuggerUrl, $ct).Wait()
        '{"id":1,"method":"Runtime.enable"}','{"id":2,"method":"Log.enable"}' | % { $ws.SendAsync([ArraySegment[byte]][Text.Encoding]::UTF8.GetBytes($_), 'Text', $true, $ct).Wait() }
        $buf = [byte[]]::new(32768); $end = (Get-Date).AddSeconds($sec)
        while ((Get-Date) -lt $end -and $ws.State -eq 'Open') {
            $r = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $ct)
            if ($r.Wait(500) -and $r.Result.Count -gt 0) {
                $j = [Text.Encoding]::UTF8.GetString($buf,0,$r.Result.Count) | ConvertFrom-Json -EA SilentlyContinue
                if ($j.method -match "exceptionThrown|consoleAPICalled|entryAdded" -and ($j.method -eq "Runtime.exceptionThrown" -or $j.params.type -eq "error" -or $j.params.entry.level -eq "error")) { $err += $j }
            }
        }
        $ws.CloseAsync('NormalClosure', "", $ct).Wait()
    } catch {}
    $err
}

cd C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend

# Kill any existing processes on port 3000
Get-NetTCPConnection -LocalPort 3000 -EA SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force -EA SilentlyContinue }
Start-Sleep 1

# Start backend
$job = Start-Job -ScriptBlock { cd C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend; npx tsx src/main.ts }
Write-Host "Starting backend..."

# Wait for server
$attempts = 0
$serverUp = $false
while ($attempts -lt 10 -and !$serverUp) {
    Start-Sleep 1
    try {
        Invoke-RestMethod "http://localhost:3000/health" -TimeoutSec 1 | Out-Null
        $serverUp = $true
    } catch {
        $attempts++
    }
}

if ($serverUp) {
    Write-Host "✅ Server is UP"
    
    # Test register
    try {
        $body = @{email="test@test.com";password="password123";fullName="Test User";nifCif="12345678A"} | ConvertTo-Json
        $r = Invoke-RestMethod "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host "✅ Register: SUCCESS"
    } catch {
        Write-Host "❌ Register: FAILED - $($_.Exception.Message)"
    }
    
    # Test login
    try {
        $body = @{email="test@test.com";password="password123"} | ConvertTo-Json
        $r = Invoke-RestMethod "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
        Write-Host "✅ Login: SUCCESS"
    } catch {
        Write-Host "❌ Login: FAILED - $($_.Exception.Message)"
    }
} else {
    Write-Host "❌ Server failed to start"
}

# Cleanup
Stop-Job $job -EA SilentlyContinue
Get-Job | Remove-Job -EA SilentlyContinue
Get-NetTCPConnection -LocalPort 3000 -EA SilentlyContinue | % { Stop-Process -Id $_.OwningProcess -Force -EA SilentlyContinue }
Write-Host "Done"