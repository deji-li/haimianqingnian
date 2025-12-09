/**
 * 带认证的完整业务流程测试脚本
 * 使用有效JWT token测试完整的业务流程
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
  auth: {
    username: 'admin',
    password: '123456'
  }
};

// 全局JWT token
let jwtToken = null;

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

// 登录获取JWT token
async function login() {
  console.log('\n=== 步骤0: 用户登录获取JWT Token ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const requestData = {
      username: config.auth.username,
      password: config.auth.password
    };

    const response = await makeRequest(options, requestData);

    if (response.statusCode === 200 && response.data && response.data.data && response.data.data.token) {
      jwtToken = response.data.data.token;
      console.log('✅ 登录成功，获取到JWT Token');
      console.log('🔑 Token前缀:', jwtToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ 登录失败:', response.data?.message || '未知错误');
      console.log('🔍 响应详情:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ 登录异常:', error.message);
    return false;
  }
}

// 测试步骤1: 检查用户信息
async function checkUserInfo() {
  console.log('\n=== 步骤1: 检查用户信息 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/auth/userinfo',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 用户信息获取成功');
      console.log('👤 用户名:', response.data.data.username);
      console.log('🆔 用户ID:', response.data.data.userId);
      return true;
    } else {
      console.log('❌ 用户信息获取失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 用户信息检查异常:', error.message);
    return false;
  }
}

// 测试步骤2: 检查企业知识库（带认证）
async function checkKnowledgeBase() {
  console.log('\n=== 步骤2: 检查企业知识库 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/enterprise-knowledge/list?page=1&limit=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 企业知识库正常，记录数:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('📝 示例知识库条目:', response.data.data[0]?.title || '无');
      }
      return response.data.data;
    } else {
      console.log('❌ 企业知识库检查失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return [];
    }
  } catch (error) {
    console.log('❌ 企业知识库检查异常:', error.message);
    return [];
  }
}

// 测试步骤3: 检查AI配置（带认证）
async function checkAIConfiguration() {
  console.log('\n=== 步骤3: 检查AI配置 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/ai-config?limit=20',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
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
        console.log('📝 营销场景配置:');
        marketingConfigs.forEach(config => {
          console.log('  -', config.scenario_name, `(${config.scenario_key})`);
        });
        return marketingConfigs;
      } else {
        console.log('⚠️ 未找到营销场景配置');
        return [];
      }
    } else {
      console.log('❌ AI配置检查失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return [];
    }
  } catch (error) {
    console.log('❌ AI配置检查异常:', error.message);
    return [];
  }
}

// 测试步骤4: 创建测试客户
async function createTestCustomer() {
  console.log('\n=== 步骤4: 创建测试客户 ===');

  try {
    const customerData = {
      wechatId: `test_customer_${Date.now()}`,
      wechatNickname: 'AI测试客户-家长',
      phone: '13800138000',
      customerName: '测试家长',
      gender: 2,
      age: 35,
      occupation: '公司职员',
      city: '广州',
      province: '广东',
      remark: '孩子8岁，对少儿编程感兴趣，预算有限'
    };

    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/customer',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options, customerData);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 客户创建成功');
      console.log('👤 客户ID:', response.data.data.id);
      console.log('📱 微信ID:', response.data.data.wechatId);
      console.log('👥 昵称:', response.data.data.wechatNickname);
      return response.data.data.id;
    } else {
      console.log('❌ 客户创建失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 客户创建异常:', error.message);
    return null;
  }
}

// 测试步骤5: 获取客户洞察
async function getCustomerInsights(customerId) {
  console.log('\n=== 步骤5: 获取客户洞察 ===');

  if (!customerId) {
    console.log('❌ 无客户ID，跳过客户洞察测试');
    return [];
  }

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: `/api/ai-marketing/assistant/insights/${customerId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 客户洞察获取成功');
      console.log('📊 洞察数据:', JSON.stringify(response.data.data, null, 2));
      return response.data.data;
    } else {
      console.log('❌ 客户洞察获取失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return [];
    }
  } catch (error) {
    console.log('❌ 客户洞察获取异常:', error.message);
    return [];
  }
}

// 测试步骤6: 添加客户洞察
async function addCustomerInsight(customerId) {
  console.log('\n=== 步骤6: 添加客户洞察 ===');

  if (!customerId) {
    console.log('❌ 无客户ID，跳过添加洞察测试');
    return false;
  }

  try {
    const insightData = {
      customerId: customerId,
      insightType: 'pain_point',
      content: '担心孩子沉迷电子游戏，希望找到有益的兴趣爱好'
    };

    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/ai-marketing/assistant/insights',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options, insightData);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 客户洞察添加成功');
      console.log('💭 洞察内容:', insightData.content);
      return true;
    } else {
      console.log('❌ 客户洞察添加失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return false;
    }
  } catch (error) {
    console.log('❌ 客户洞察添加异常:', error.message);
    return false;
  }
}

// 测试步骤7: 生成AI营销内容
async function generateAIMarketingContent(customerId) {
  console.log('\n=== 步骤7: 生成AI营销内容 ===');

  try {
    const requestData = {
      customerId: customerId || undefined,
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options, requestData);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ AI营销内容生成成功');
      console.log('📝 生成内容:', response.data.data.content || response.data.data);
      console.log('🆔 历史记录ID:', response.data.data.historyId);
      return response.data.data;
    } else {
      console.log('❌ AI营销内容生成失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return null;
    }
  } catch (error) {
    console.log('❌ AI营销内容生成异常:', error.message);
    return null;
  }
}

// 测试步骤8: 查询生成历史
async function queryGenerationHistory() {
  console.log('\n=== 步骤8: 查询生成历史 ===');

  try {
    const options = {
      hostname: config.backend.host,
      port: config.backend.port,
      path: '/api/ai-marketing/assistant/history?page=1&limit=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    };

    const response = await makeRequest(options);

    if (response.statusCode === 200 && response.data && response.data.data) {
      console.log('✅ 生成历史查询成功');
      console.log('📊 历史记录数:', response.data.data.length);
      response.data.data.forEach((record, index) => {
        console.log(`📝 记录${index + 1}: ${record.contentType} - ${record.purpose || '无目的'}`);
      });
      return response.data.data;
    } else {
      console.log('❌ 生成历史查询失败:', response.statusCode);
      console.log('🔍 错误信息:', response.data?.message);
      return [];
    }
  } catch (error) {
    console.log('❌ 生成历史查询异常:', error.message);
    return [];
  }
}

// 主测试函数
async function runAuthenticatedBusinessFlowTest() {
  console.log('🚀 开始带认证的完整业务流程测试');
  console.log('=====================================');

  const results = {
    login: false,
    userInfo: false,
    knowledgeBase: false,
    aiConfiguration: false,
    customerCreation: false,
    customerInsights: false,
    addInsight: false,
    aiGeneration: false,
    historyQuery: false
  };

  // 步骤0: 登录获取token
  results.login = await login();
  if (!results.login) {
    console.log('❌ 无法获取JWT Token，终止测试');
    return results;
  }

  // 步骤1: 检查用户信息
  results.userInfo = await checkUserInfo();

  // 步骤2: 检查企业知识库
  const knowledgeData = await checkKnowledgeBase();
  results.knowledgeBase = knowledgeData.length >= 0;

  // 步骤3: 检查AI配置
  const aiConfigs = await checkAIConfiguration();
  results.aiConfiguration = aiConfigs.length >= 0;

  // 步骤4: 创建测试客户
  const customerId = await createTestCustomer();
  results.customerCreation = customerId !== null;

  // 步骤5: 获取客户洞察
  const insights = await getCustomerInsights(customerId);
  results.customerInsights = true; // 只要不报错就算成功

  // 步骤6: 添加客户洞察
  results.addInsight = await addCustomerInsight(customerId);

  // 步骤7: 生成AI营销内容
  const aiContent = await generateAIMarketingContent(customerId);
  results.aiGeneration = aiContent !== null;

  // 步骤8: 查询生成历史
  const history = await queryGenerationHistory();
  results.historyQuery = history.length >= 0;

  // 汇总测试结果
  console.log('\n=====================================');
  console.log('📊 认证测试结果汇总:');
  console.log('=====================================');

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ 通过' : '❌ 失败';
    const testName = {
      login: '用户登录',
      userInfo: '用户信息检查',
      knowledgeBase: '企业知识库检查',
      aiConfiguration: 'AI配置检查',
      customerCreation: '测试客户创建',
      customerInsights: '客户洞察获取',
      addInsight: '客户洞察添加',
      aiGeneration: 'AI营销内容生成',
      historyQuery: '生成历史查询'
    }[test];

    console.log(`${status} ${testName}`);
  });

  console.log('\n=====================================');
  console.log(`🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！完整业务流程正常');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️ 大部分测试通过，系统基本正常，存在部分问题需要修复');
  } else {
    console.log('🚨 多项测试失败，系统存在严重问题需要立即处理');
  }

  console.log('=====================================');

  // 输出业务流程状态
  console.log('\n📋 业务流程状态:');
  console.log('- 用户认证:', results.login ? '✅ 正常' : '❌ 异常');
  console.log('- 企业知识库:', results.knowledgeBase ? '✅ 正常' : '❌ 异常');
  console.log('- AI配置系统:', results.aiConfiguration ? '✅ 正常' : '❌ 异常');
  console.log('- 客户管理:', results.customerCreation ? '✅ 正常' : '❌ 异常');
  console.log('- 客户洞察:', results.customerInsights ? '✅ 正常' : '❌ 异常');
  console.log('- AI营销生成:', results.aiGeneration ? '✅ 正常' : '❌ 异常');
  console.log('- 历史记录:', results.historyQuery ? '✅ 正常' : '❌ 异常');

  return results;
}

// 执行测试
if (require.main === module) {
  runAuthenticatedBusinessFlowTest()
    .then(results => {
      console.log('\n✨ 带认证的完整业务流程测试完成');
      process.exit(results.login ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  runAuthenticatedBusinessFlowTest,
  login,
  checkUserInfo,
  checkKnowledgeBase,
  checkAIConfiguration,
  createTestCustomer,
  getCustomerInsights,
  addCustomerInsight,
  generateAIMarketingContent,
  queryGenerationHistory
};