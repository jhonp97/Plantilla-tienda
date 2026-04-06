$backendDir = "C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend"
$testScript = @"
const http = require('http');

const post = (path, body) => new Promise((resolve, reject) => {
  const data = JSON.stringify(body);
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let result = '';
    res.on('data', chunk => result += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(result)); } 
      catch { resolve(result); }
    });
  });
  req.on('error', reject);
  req.write(data);
  req.end();
});

const get = (path) => new Promise((resolve, reject) => {
  const req = http.get('http://localhost:3000' + path, (res) => {
    let result = '';
    res.on('data', chunk => result += chunk);
    res.on('end', () => {
      try { resolve(JSON.parse(result)); } 
      catch { resolve(result); }
    });
  });
  req.on('error', reject);
  req.end();
});

(async () => {
  try {
    console.log('1. Health:', JSON.stringify(await get('/health')));
  } catch(e) { console.log('Health error:', e.message); }
  
  try {
    console.log('2. Register:', JSON.stringify(await post('/api/auth/register', {
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test User',
      nifCif: '12345678A'
    })));
  } catch(e) { console.log('Register error:', e.message); }
  
  try {
    console.log('3. Login:', JSON.stringify(await post('/api/auth/login', {
      email: 'test@test.com',
      password: 'password123'
    })));
  } catch(e) { console.log('Login error:', e.message); }
})();
"@

# Save test script
$testScript | Out-File -FilePath "$backendDir\test-runner.js" -Encoding UTF8

# Start server in background using Start-Process with tsx
$proc = Start-Process -FilePath "npx" -ArgumentList "tsx", "C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend\src\main.ts" -WorkingDirectory "C:\Users\perez\Desktop\tienda\Plantilla-tienda\backend" -PassThru -WindowStyle Hidden

# Wait for server to start
Start-Sleep -Seconds 8

# Run test script
node "C:\Users\perez\Desktop\tienda\Plantilla-tienda\test-runner.cjs"

# Kill the server
Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue