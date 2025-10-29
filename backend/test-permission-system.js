const http = require('http');

// 测试登录并获取权限信息
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

// 测试受保护的接口
function testProtectedEndpoint(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/customer',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('测试权限系统');
  console.log('========================================\n');

  // 测试不同角色的登录
  const testUsers = [
    { username: 'admin', password: 'admin123', role: '系统管理员' },
    { username: 'sales_manager', password: 'sales123', role: '销售主管' },
    { username: 'sales', password: 'sales123', role: '销售顾问' },
    { username: 'finance', password: 'finance123', role: '财务人员' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n测试用户: ${user.username} (${user.role})`);
      console.log('----------------------------------------');

      const loginResult = await testLogin(user.username, user.password);

      if (loginResult.access_token) {
        console.log('✓ 登录成功');
        console.log(`用户名: ${loginResult.user.username}`);
        console.log(`真实姓名: ${loginResult.user.realName}`);
        console.log(`角色: ${loginResult.user.roleName}`);
        console.log(`权限数量: ${loginResult.user.permissions ? loginResult.user.permissions.length : 0}`);

        if (loginResult.user.permissions && loginResult.user.permissions.length > 0) {
          console.log('✓ 权限列表已返回');
          console.log('权限示例:');
          loginResult.user.permissions.slice(0, 5).forEach(perm => {
            console.log(`  - ${perm}`);
          });
          if (loginResult.user.permissions.length > 5) {
            console.log(`  ... 还有 ${loginResult.user.permissions.length - 5} 个权限`);
          }

          // 测试访问受保护的接口
          console.log('\n测试访问客户列表接口...');
          const apiResult = await testProtectedEndpoint(loginResult.access_token);
          console.log(`API 响应状态码: ${apiResult.status}`);

          if (apiResult.status === 200) {
            console.log('✓ 有权限访问客户列表');
          } else if (apiResult.status === 403) {
            console.log('✗ 无权限访问客户列表 (403 Forbidden)');
          } else {
            console.log(`其他状态: ${apiResult.body}`);
          }
        } else {
          console.log('✗ 权限列表为空或未返回');
        }
      } else {
        console.log('✗ 登录失败:', loginResult);
      }
    } catch (error) {
      console.log('✗ 测试出错:', error.message);
    }
  }

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

// 给后端服务一些启动时间
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);
