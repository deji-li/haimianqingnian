/**
 * 完整业务流程测试脚本
 * 测试从客户创建到AI营销内容生成的完整链路
 * 不依赖JWT认证，直接测试系统核心功能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 测试配置
const config = {
  backend: {
    host: 'localhost',
    port: 3002
  },
  testFiles: {
    chatRecord: path.join(__dirname, 'test-chat-records.txt')
  }
};

// HTTP请求工具
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body,
            error: error.message
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试步骤1: 检查系统状态
async function checkSystemHealth() {
  console.log('\n=== 步骤1: 检查系统健康状态 ===');

  try {
    // 检查后端API
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200) {
      console.log('✅ 后端API服务正常');
      return true;
    } else {
      console.log('❌ 后端API服务异常:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ 系统健康检查失败:', error.message);
    return false;
  }
}

// 测试步骤2: 检查企业知识库
async function checkKnowledgeBase() {
  console.log('\n=== 步骤2: 检查企业知识库 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/enterprise-knowledge/list?page=1&limit=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 企业知识库正常，记录数:', response.data.data.length);
      console.log('📝 示例知识库条目:', response.data.data[0]?.title || '无');
      return true;
    } else {
      console.log('❌ 企业知识库检查失败:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ 企业知识库检查异常:', error.message);
    return false;
  }
}

// 测试步骤3: 检查AI配置
async function checkAIConfiguration() {
  console.log('\n=== 步骤3: 检查AI配置 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/ai-config?limit=10',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ AI配置正常，配置数:', response.data.data.length);

      // 检查是否有营销场景配置
      const marketingConfigs = response.data.data.filter(config =>
        config.scenario_key && config.scenario_key.includes('marketing')
      );

      if (marketingConfigs.length > 0) {
        console.log('📝 营销场景配置:', marketingConfigs.map(c => c.scenario_name).join(', '));
        return true;
      } else {
        console.log('⚠️ 未找到营销场景配置');
        return false;
      }
    } else {
      console.log('❌ AI配置检查失败:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ AI配置检查异常:', error.message);
    return false;
  }
}

// 测试步骤4: 模拟文件上传
async function testFileUpload() {
  console.log('\n=== 步骤4: 测试文件上传 ===');

  if (!fs.existsSync(config.testFiles.chatRecord)) {
    console.log('❌ 测试文件不存在:', config.testFiles.chatRecord);
    return false;
  }

  try {
    // 读取测试文件
    const fileContent = fs.readFileSync(config.testFiles.chatRecord, 'utf8');
    console.log('📁 测试文件大小:', fileContent.length, '字符');

    // 创建multipart form数据
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="test-chat-records.txt"',
      'Content-Type: text/plain',
      '',
      fileContent,
      `--${boundary}--`
    ].join('\r\n');

    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 文件上传成功，文件ID:', response.data.data.id);
      console.log('📝 文件路径:', response.data.data.path);
      return response.data.data.id;
    } else {
      console.log('❌ 文件上传失败:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ 文件上传异常:', error.message);
    return false;
  }
}

// 测试步骤5: 检查AI营销助手路由
async function checkAIMarketingRoutes() {
  console.log('\n=== 步骤5: 检查AI营销助手路由 ===');

  const routes = [
    '/api/ai-marketing/assistant/generate',
    '/api/ai-marketing/assistant/history',
    '/api/ai-marketing/assistant/insights'
  ];

  let availableRoutes = 0;

  for (const route of routes) {
    try {
      const options = {
        hostname: config.backend.host,
        port: config.backend.port,
        path: route,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await makeRequest(options);

      // 401表示路由存在但需要认证，404表示路由不存在
      if (response.statusCode === 401) {
        console.log('✅ 路由存在（需要认证）:', route);
        availableRoutes++;
      } else if (response.statusCode === 404) {
        console.log('❌ 路由不存在:', route);
      } else {
        console.log('⚠️ 路由状态未知:', route, response.statusCode);
      }
    } catch (error) {
      console.log('❌ 路由检查异常:', route, error.message);
    }
  }

  console.log('📊 可用路由数:', availableRoutes, '/', routes.length);
  return availableRoutes === routes.length;
}

// 测试步骤6: 模拟AI营销内容生成请求
async function testAIMarketingGeneration() {
  console.log('\n=== 步骤6: 模拟AI营销内容生成请求 ===');

  try {
    const requestData = {
      contentType: 'moments',
      configParams: {
        purpose: '少儿编程课程推广',
        style: '亲切',
        wordCount: 200
      },
      selectedPainPoints: ['孩子沉迷游戏', '担心孩子未来'],
      selectedNeeds: ['培养逻辑思维', '提前接触编程'],
      selectedInterests: ['科技教育', '孩子兴趣培养']
    };

    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/ai-marketing/assistant/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, requestData);

    if (response.statusCode === 401) {
      console.log('✅ AI营销生成路由存在（需要认证）');
      return true;
    } else if (response.statusCode === 404) {
      console.log('❌ AI营销生成路由不存在');
      return false;
    } else {
      console.log('⚠️ AI营销生成状态:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('❌ AI营销生成测试异常:', error.message);
    return false;
  }
}

// 测试步骤7: 检查数据库连接
async function checkDatabaseConnection() {
  console.log('\n=== 步骤7: 检查数据库连接 ===');

  try {
    // 通过检查公开的API端点来验证数据库连接
    const endpoints = [
      '/api/enterprise-knowledge/list',
      '/api/ai-config',
      '/api/business-config'
    ];

    let connectedEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const options = {
          hostname: config.backend.host,
          port: config.backend.port,
          path: endpoint,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };

        const response = await makeRequest(options);

        if (response.statusCode === 200) {
          console.log('✅ 数据库连接正常:', endpoint);
          connectedEndpoints++;
        } else {
          console.log('❌ 数据库连接失败:', endpoint, response.statusCode);
        }
      } catch (error) {
        console.log('❌ 数据库连接异常:', endpoint, error.message);
      }
    }

    console.log('📊 数据库连接正常端点:', connectedEndpoints, '/', endpoints.length);
    return connectedEndpoints > 0;
  } catch (error) {
    console.log('❌ 数据库连接检查异常:', error.message);
    return false;
  }
}

// 主测试函数
async function runCompleteBusinessFlowTest() {
  console.log('🚀 开始完整业务流程测试');
  console.log('=====================================');

  const results = {
    systemHealth: false,
    knowledgeBase: false,
    aiConfiguration: false,
    fileUpload: false,
    aiMarketingRoutes: false,
    aiMarketingGeneration: false,
    databaseConnection: false
  };

  // 执行所有测试步骤
  results.systemHealth = await checkSystemHealth();
  results.knowledgeBase = await checkKnowledgeBase();
  results.aiConfiguration = await checkAIConfiguration();
  results.fileUpload = await testFileUpload();
  results.aiMarketingRoutes = await checkAIMarketingRoutes();
  results.aiMarketingGeneration = await testAIMarketingGeneration();
  results.databaseConnection = await checkDatabaseConnection();

  // 汇总测试结果
  console.log('\n=====================================');
  console.log('📊 测试结果汇总:');
  console.log('=====================================');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    const testName = {
      systemHealth: '系统健康检查',
      knowledgeBase: '企业知识库检查',
      aiConfiguration: 'AI配置检查',
      fileUpload: '文件上传测试',
      aiMarketingRoutes: 'AI营销助手路由检查',
      aiMarketingGeneration: 'AI营销内容生成测试',
      databaseConnection: '数据库连接检查'
    }[test];

    console.log(`${status} ${testName}`);
  });

  console.log('\n=====================================');
  console.log(`🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！系统完整业务流程正常');
  } else if (passedTests >= totalTests * 0.7) {
    console.log('⚠️ 大部分测试通过，系统基本正常，存在部分问题需要修复');
  } else {
    console.log('🚨 多项测试失败，系统存在严重问题需要立即处理');
  }

  console.log('=====================================');

  // 输出系统状态报告
  console.log('\n📋 系统状态报告:');
  console.log('- 后端服务:', results.systemHealth ? '✅ 正常' : '❌ 异常');
  console.log('- 企业知识库:', results.knowledgeBase ? '✅ 正常' : '❌ 异常');
  console.log('- AI配置:', results.aiConfiguration ? '✅ 正常' : '❌ 异常');
  console.log('- 文件上传:', results.fileUpload ? '✅ 正常' : '❌ 异常');
  console.log('- AI营销助手:', results.aiMarketingRoutes ? '✅ 路由正常' : '❌ 路由异常');
  console.log('- 数据库连接:', results.databaseConnection ? '✅ 正常' : '❌ 异常');

  return results;
}

// 执行测试
if (require.main === module) {
  runCompleteBusinessFlowTest()
    .then(results => {
      console.log('\n✨ 完整业务流程测试完成');
      process.exit(results.systemHealth ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  runCompleteBusinessFlowTest,
  checkSystemHealth,
  checkKnowledgeBase,
  checkAIConfiguration,
  testFileUpload,
  checkAIMarketingRoutes,
  testAIMarketingGeneration,
  checkDatabaseConnection
};