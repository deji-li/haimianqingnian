/**
 * Test script for team-stats API using Node.js built-in http
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: path.includes('login') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (path.includes('login')) {
      const postData = JSON.stringify({
        username: 'admin',
        password: '123456'
      });
      req.write(postData);
    }

    req.end();
  });
}

async function main() {
  console.log('========================================');
  console.log('  Team Stats API Test');
  console.log('========================================\n');

  try {
    // Step 1: Login
    console.log('[Step 1] Logging in as admin...');
    const loginResp = await makeRequest('/api/auth/login');

    if (loginResp.status !== 200 && loginResp.status !== 201) {
      console.log(`[ERROR] Login failed with status ${loginResp.status}`);
      console.log('Response:', JSON.stringify(loginResp.data, null, 2));
      return;
    }

    const token = loginResp.data.data?.access_token || loginResp.data.data?.token;
    if (!token) {
      console.log('[ERROR] No token received');
      console.log('Response:', JSON.stringify(loginResp.data, null, 2));
      return;
    }

    console.log(`[SUCCESS] Login successful`);
    console.log(`Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Test member performance
    console.log('[Step 2] Testing member-performance API...');
    const perfResp = await makeRequest(
      '/api/team-stats/member-performance?sortBy=totalAmount&limit=50',
      token
    );

    console.log(`Status: ${perfResp.status}`);
    if (perfResp.status === 200) {
      console.log('[SUCCESS] API call successful');
      console.log(`Data count: ${perfResp.data.data?.length || 0}`);
    } else {
      console.log('[ERROR] API call failed');
      console.log('Response:', JSON.stringify(perfResp.data, null, 2));
    }
    console.log('');

    // Step 3: Test department comparison
    console.log('[Step 3] Testing department-comparison API...');
    const deptResp = await makeRequest('/api/team-stats/department-comparison', token);
    console.log(`Status: ${deptResp.status}`);
    console.log('Response:', JSON.stringify(deptResp.data, null, 2));
    console.log('');

    // Step 4: Test campus comparison
    console.log('[Step 4] Testing campus-comparison API...');
    const campusResp = await makeRequest('/api/team-stats/campus-comparison', token);
    console.log(`Status: ${campusResp.status}`);
    console.log('Response:', JSON.stringify(campusResp.data, null, 2));
    console.log('');

  } catch (error) {
    console.log('[FATAL ERROR]', error.message);
  }

  console.log('========================================');
  console.log('  Test Complete');
  console.log('========================================');
}

main();
