const http = require('http');

const makeRequest = (path, method, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: `/api/auth${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runVerification = async () => {
  try {
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    console.log('1. Testing Registration...');
    const regRes = await makeRequest('/register', 'POST', testUser);
    console.log('Registration Status:', regRes.statusCode);
    console.log('Registration Body:', regRes.body);

    if (regRes.statusCode !== 201) throw new Error('Registration failed');

    console.log('\n2. Testing Login...');
    const loginRes = await makeRequest('/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login Status:', loginRes.statusCode);
    console.log('Access Token received:', !!loginRes.body.accessToken);

    const cookies = loginRes.headers['set-cookie'];
    console.log('Cookies received:', !!cookies);

    if (loginRes.statusCode !== 200 || !loginRes.body.accessToken) throw new Error('Login failed');

    // Extract cookie for refresh
    const refreshCookie = cookies.find(c => c.startsWith('jwt='));

    console.log('\n3. Testing Refresh Token...');
    const refreshRes = await makeRequest('/refresh', 'GET', null, {
      'Cookie': refreshCookie
    });
    console.log('Refresh Status:', refreshRes.statusCode);
    console.log('New Access Token:', !!refreshRes.body.accessToken);

    if (refreshRes.statusCode !== 200) throw new Error('Refresh failed');

    console.log('\n4. Testing Logout...');
    const logoutRes = await makeRequest('/logout', 'POST', null, {
      'Cookie': refreshCookie
    });
    console.log('Logout Status:', logoutRes.statusCode);

    if (logoutRes.statusCode !== 204) throw new Error('Logout failed');

    console.log('\n--- VERIFICATION SUCCESSFUL ---');

  } catch (error) {
    console.error('\n--- VERIFICATION FAILED ---');
    console.error(error.message);
  }
};

runVerification();
