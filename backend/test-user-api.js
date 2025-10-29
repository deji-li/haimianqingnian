const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user?page=1&pageSize=20&keyword=&roleCode=',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NjE1NzE3MzMsImV4cCI6MTc2MjE3NjUzM30.8KBdVx7JXTVI0FS2xkwPL-Qx8JkC8FY0tshX8KKevGg',
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n响应数据:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求失败: ${e.message}`);
});

req.end();
