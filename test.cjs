// Simple test script
const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test5@test.com',
        password: 'password123',
        fullName: 'Test User',
        nifCif: '12345678A'
      })
    });
    const data = await response.json();
    console.log('Register:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Register error:', e.message);
  }
};

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test5@test.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Login:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Login error:', e.message);
  }
};

testRegister().then(() => testLogin());