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
