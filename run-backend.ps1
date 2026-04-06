# Run backend server in foreground for testing
cd C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend

# First kill any existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server and keep running
npx tsx src/main.ts