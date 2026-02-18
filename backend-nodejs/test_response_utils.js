const http = require('http');

const makeRequest = (path, method, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
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

async function runTests() {
  console.log('Testing Login with invalid credentials...');

  // Test 1: User Not Found
  try {
    const res1 = await makeRequest('/api/auth/login', 'POST', {
      email: 'nonexistent@example.com',
      password: 'password123'
    });
    console.log('Test 1 (User Not Found) Status:', res1.status);
    console.log('Test 1 Data:', JSON.stringify(res1.data, null, 2));

    if (res1.status === 401 && res1.data.message_code === 'USER_NOT_FOUND') {
      console.log('PASS: User Not Found response is correct.');
    } else {
      console.log('FAIL: User Not Found response is INCORRECT.');
    }

  } catch (error) { console.error(error); }
}

runTests();
