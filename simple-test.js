const http = require('http');

// API基础URL
const BASE_URL = 'http://localhost:3002/api';
let authToken = null;

// HTTP请求函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 3002,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0,
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}, 原始数据: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// 测试结果
let testsPassed = 0;
let testsFailed = 0;

async function runTest(name, testFn) {
  try {
    console.log(`\n🧪 测试: ${name}`);
    const result = await testFn();
    console.log(`✅ ${name} - 通过`);
    testsPassed++;
    return result;
  } catch (error) {
    console.log(`❌ ${name} - 失败: ${error.message}`);
    testsFailed++;
    return null;
  }
}

// 1. 测试服务器连接
async function testServerConnection() {
  const response = await makeRequest('GET', '/test');
  if (response.status !== 404) {
    throw new Error('服务器响应异常');
  }
  console.log('   📡 服务器连接正常');
  return true;
}

// 2. 测试用户登录
async function testLogin() {
  const response = await makeRequest('POST', '/auth/login', {
    username: 'admin',
    password: '123456'
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`登录失败: ${response.data.message || '未知错误'}`);
  }

  if (response.data.data && response.data.data.token) {
    authToken = response.data.data.token;
    console.log('   🔐 登录成功，获取到token');
    return response.data.data;
  } else {
    throw new Error('登录响应中没有token');
  }
}

// 3. 测试获取用户信息
async function testUserProfile() {
  const response = await makeRequest('GET', '/auth/profile');

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`获取用户信息失败: ${response.data.message || '未知错误'}`);
  }

  console.log(`   👤 用户: ${response.data.data.user?.realName || '未知'}`);
  return response.data.data.user;
}

// 4. 测试获取客户列表
async function testCustomerList() {
  const response = await makeRequest('GET', '/customer?page=1&limit=10');

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`获取客户列表失败: ${response.data.message || '未知错误'}`);
  }

  console.log(`   📊 客户总数: ${response.data.data?.total || 0}`);
  return response.data.data;
}

// 5. 测试创建客户
async function testCreateCustomer() {
  const customerData = {
    wechatId: `test_${Date.now()}@wechat`,
    wechatNickname: `测试客户_${Date.now()}`,
    phone: '13800138000',
    realName: '测试客户',
    gender: '男',
    age: 25,
    salesId: 1,
    customerIntent: '中意向',
    lifecycleStage: '线索',
    source: 'API测试'
  };

  const response = await makeRequest('POST', '/customer', customerData);

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`创建客户失败: ${response.data.message || '未知错误'}`);
  }

  console.log(`   ✨ 创建客户ID: ${response.data.data?.id || '未知'}`);
  return response.data.data;
}

// 6. 测试获取订单列表
async function testOrderList() {
  const response = await makeRequest('GET', '/order?page=1&limit=10');

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`获取订单列表失败: ${response.data.message || '未知错误'}`);
  }

  console.log(`   📋 订单总数: ${response.data.data?.total || 0}`);
  return response.data.data;
}

// 7. 测试系统配置
async function testSystemConfig() {
  const response = await makeRequest('GET', '/system/dictionary');

  if (response.status !== 200 || !response.data.success) {
    throw new Error(`获取系统配置失败: ${response.data.message || '未知错误'}`);
  }

  console.log(`   ⚙️ 字典项数量: ${response.data.data?.length || 0}`);
  return response.data.data;
}

// 主测试函数
async function main() {
  console.log('🚀 开始教育培训CRM系统API测试...\n');

  // 测试服务器连接
  await runTest('服务器连接', testServerConnection);

  // 用户认证测试
  const loginResult = await runTest('用户登录', testLogin);

  if (loginResult) {
    await runTest('获取用户信息', testUserProfile);
  }

  // 客户管理测试
  await runTest('获取客户列表', testCustomerList);
  await runTest('创建客户', testCreateCustomer);

  // 订单管理测试
  await runTest('获取订单列表', testOrderList);

  // 系统管理测试
  await runTest('获取系统配置', testSystemConfig);

  // 输出测试结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  console.log(`✅ 通过: ${testsPassed}`);
  console.log(`❌ 失败: ${testsFailed}`);
  console.log(`📈 成功率: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);

  if (testsPassed === testsPassed + testsFailed) {
    console.log('\n🎉 所有测试通过！系统运行正常。');
  } else if (testsPassed > 0) {
    console.log('\n⚠️  部分测试通过，系统基本可用，但需要修复失败的功能。');
  } else {
    console.log('\n💥 所有测试失败，系统存在严重问题，需要立即修复。');
  }

  return testsFailed === 0;
}

// 运行测试
main().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 测试运行失败:', error.message);
  process.exit(1);
});