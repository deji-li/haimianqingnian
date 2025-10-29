const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/target/progress/1',  // user_id = 1
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('返回的目标数量:', Array.isArray(result) ? result.length : '非数组');
      console.log('\n完整响应:');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('错误:', error);
});

req.end();
