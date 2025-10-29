const http = require('http');

// 先登录获取token
function login() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.data && json.data.token) {
            resolve(json.data.token);
          } else {
            reject(new Error('登录失败: ' + JSON.stringify(json)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 测试用户API
function testUserAPI(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/user?page=1&pageSize=20&keyword=&roleCode=',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('\n响应数据:');
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));
          resolve();
        } catch (e) {
          console.log(data);
          resolve();
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 执行
login()
  .then(token => {
    console.log('登录成功，获取到token');
    return testUserAPI(token);
  })
  .catch(err => {
    console.error('错误:', err.message);
  });
