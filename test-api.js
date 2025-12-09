const http = require('http');
const https = require('https');

// API基础URL
const BASE_URL = 'http://localhost:3002/api';
let authToken = null;

// HTTP请求函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : undefined
      }
    };

    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试结果存储
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// 测试函数
async function testAPI(name, testFn) {
  try {
    console.log(`\n🧪 测试: ${name}`);
    await testFn();
    console.log(`✅ ${name} - 通过`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${name} - 失败: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({
      test: name,
      error: error.message,
      details: error.response?.data || error.stack
    });
  }
}

// 1. 测试用户登录
async function testUserLogin() {
  const response = await makeRequest('POST', '/auth/login', {
    username: 'admin',
    password: '123456'
  });

  if (response.data.success && response.data.data.token) {
    // 设置认证token
    authToken = response.data.data.token;
    return response.data.data;
  } else {
    throw new Error('登录响应格式错误');
  }
}

// 2. 测试获取用户信息
async function testUserInfo() {
  const response = await api.get('/auth/profile');
  if (response.data.success && response.data.data.user) {
    return response.data.data.user;
  } else {
    throw new Error('获取用户信息失败');
  }
}

// 3. 测试获取客户列表
async function testCustomerList() {
  const response = await api.get('/customer', {
    params: {
      page: 1,
      limit: 10
    }
  });

  if (response.data.success && Array.isArray(response.data.data.list)) {
    console.log(`   📊 客户总数: ${response.data.data.total}`);
    return response.data.data;
  } else {
    throw new Error('客户列表响应格式错误');
  }
}

// 4. 测试创建客户
async function testCreateCustomer() {
  const customerData = {
    wechatId: `test_${Date.now()}@wechat`,
    wechatNickname: `测试客户_${Date.now()}`,
    phone: '13800138000',
    realName: '测试客户',
    gender: '男',
    age: 25,
    address: '测试地址',
    salesId: 1,
    customerIntent: '中意向',
    lifecycleStage: '线索',
    source: '测试来源'
  };

  const response = await api.post('/customer', customerData);

  if (response.data.success && response.data.data.id) {
    console.log(`   ✨ 创建客户ID: ${response.data.data.id}`);
    return response.data.data;
  } else {
    throw new Error('创建客户失败');
  }
}

// 5. 测试获取订单列表
async function testOrderList() {
  const response = await api.get('/order', {
    params: {
      page: 1,
      limit: 10
    }
  });

  if (response.data.success && Array.isArray(response.data.data.list)) {
    console.log(`   📋 订单总数: ${response.data.data.total}`);
    return response.data.data;
  } else {
    throw new Error('订单列表响应格式错误');
  }
}

// 6. 测试AI营销助手
async function testAIMarketing() {
  const marketingData = {
    contentType: 'moments',
    configParams: {
      purpose: '课程推广',
      style: '专业',
      wordCount: '200'
    },
    selectedPainPoints: ['时间紧张', '学习效果担忧'],
    selectedNeeds: ['灵活时间', '专业指导']
  };

  const response = await api.post('/ai-marketing/generate-content', marketingData);

  if (response.data.success) {
    console.log(`   🤖 AI生成内容长度: ${response.data.data.content?.length || 0}`);
    return response.data.data;
  } else {
    throw new Error('AI营销助手测试失败');
  }
}

// 7. 测试企业知识库
async function testKnowledgeBase() {
  const response = await api.get('/enterprise-knowledge', {
    params: {
      page: 1,
      limit: 5
    }
  });

  if (response.data.success && Array.isArray(response.data.data.list)) {
    console.log(`   📚 知识库条目数: ${response.data.data.total}`);
    return response.data.data;
  } else {
    throw new Error('知识库测试失败');
  }
}

// 8. 测试系统配置
async function testSystemConfig() {
  const response = await api.get('/system/dictionary');

  if (response.data.success && Array.isArray(response.data.data)) {
    console.log(`   ⚙️ 字典项数量: ${response.data.data.length}`);
    return response.data.data;
  } else {
    throw new Error('系统配置测试失败');
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始API接口测试...\n');

  try {
    // 1. 用户认证测试
    const userInfo = await testAPI('用户登录', testUserLogin);

    await testAPI('获取用户信息', () => testUserInfo());

    // 2. 客户管理测试
    await testAPI('获取客户列表', testCustomerList);
    await testAPI('创建客户', testCreateCustomer);

    // 3. 订单管理测试
    await testAPI('获取订单列表', testOrderList);

    // 4. AI功能测试
    await testAPI('AI营销助手', testAIMarketing);

    // 5. 知识库测试
    await testAPI('企业知识库', testKnowledgeBase);

    // 6. 系统管理测试
    await testAPI('系统配置', testSystemConfig);

  } catch (error) {
    console.error('测试过程中发生严重错误:', error.message);
    testResults.errors.push({
      test: '主测试流程',
      error: error.message,
      details: error.stack
    });
  }

  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${testResults.passed}`);
  console.log(`❌ 失败: ${testResults.failed}`);
  console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. ${error.test}`);
      console.log(`   错误: ${error.error}`);
      if (error.details) {
        console.log(`   详情: ${JSON.stringify(error.details, null, 2)}`);
      }
    });
  }

  return testResults;
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().then(results => {
    process.exit(results.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testAPI };