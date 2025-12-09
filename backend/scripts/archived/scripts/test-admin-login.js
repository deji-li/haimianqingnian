const http = require('http');

function testLogin(username, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username, password });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          console.log('\n登录响应:');
          console.log(JSON.stringify(result, null, 2));
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// 尝试多个可能的密码
const passwords = ['123456', 'admin123', 'admin', '123456789'];

async function runTests() {
  console.log('测试 admin 用户登录，尝试多个密码...\n');

  for (const pwd of passwords) {
    console.log(`\n尝试密码: ${pwd}`);
    console.log('----------------------------------------');
    try {
      const result = await testLogin('admin', pwd);
      if (result.access_token) {
        console.log('✓ 登录成功！');
        console.log(`用户名: ${result.user.username}`);
        console.log(`真实姓名: ${result.user.realName}`);
        console.log(`角色: ${result.user.roleName}`);
        console.log(`权限数量: ${result.user.permissions ? result.user.permissions.length : 0}`);

        if (result.user.permissions && result.user.permissions.length > 0) {
          console.log('\n✓ 权限列表已返回！');
          console.log('前10个权限:');
          result.user.permissions.slice(0, 10).forEach(perm => {
            console.log(`  - ${perm}`);
          });
        }
        break;
      }
    } catch (error) {
      console.log('✗ 错误:', error.message);
    }
  }
}

runTests().catch(console.error);
