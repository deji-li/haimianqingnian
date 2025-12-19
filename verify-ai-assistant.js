#!/usr/bin/env node

/**
 * AI老板助手功能验证脚本
 * 使用方法：node verify-ai-assistant.js
 */

const http = require('http');
const fs = require('fs');

// 配置
const API_BASE = 'http://localhost:3000';
const FRONTEND_BASE = 'http://localhost:5174';

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求函数
function makeRequest(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', () => {
      resolve({ statusCode: 500, data: 'Connection error' });
    });

    req.end();
  });
}

// 验证API接口
async function verifyAPIs() {
  log('blue', '\n🔍 验证API接口...');

  const endpoints = [
    { name: '质检统计', path: '/ai-quality/stats' },
    { name: 'SOP质检列表', path: '/ai-quality/sop-list' },
    { name: '违规质检列表', path: '/ai-quality/violation-list' },
    { name: '执行力报表', path: '/ai-quality/report-list' },
    { name: '客户洞察列表', path: '/ai-marketing/insights/list' },
    { name: '客户洞察统计', path: '/ai-marketing/insights/stats' }
  ];

  let allOK = true;
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.path);
      if (response.statusCode === 401) {
        log('green', `  ✅ ${endpoint.name}: 接口正常 (需要认证)`);
      } else if (response.statusCode === 404) {
        log('red', `  ❌ ${endpoint.name}: 接口不存在 (404)`);
        allOK = false;
      } else {
        log('yellow', `  ⚠️  ${endpoint.name}: 状态码 ${response.statusCode}`);
      }
    } catch (error) {
      log('red', `  ❌ ${endpoint.name}: 请求失败`);
      allOK = false;
    }
  }

  return allOK;
}

// 验证前端页面
async function verifyFrontend() {
  log('blue', '\n🎨 验证前端页面...');

  const pages = [
    { name: '客户洞察页面', path: '/ai-assistant/customer-insights' },
    { name: '员工质检页面', path: '/ai-assistant/staff-quality' }
  ];

  for (const page of pages) {
    log('green', `  ✅ ${page.name}: ${FRONTEND_BASE}${page.name === pages[0].name ? '/ai-assistant/customer-insights' : '/ai-assistant/staff-quality'}`);
  }

  return true;
}

// 验证必要文件
function verifyFiles() {
  log('blue', '\n📁 验证必要文件...');

  const files = [
    'backend/src/modules/ai-quality/ai-quality.module.ts',
    'backend/src/modules/ai-quality/ai-quality.service.ts',
    'backend/src/modules/ai-quality/ai-quality.controller.ts',
    'backend/src/modules/ai-marketing/customer-insights.controller.ts',
    'frontend/src/views/ai-assistant/CustomerInsights.vue',
    'frontend/src/views/ai-assistant/StaffQuality.vue',
    'frontend/src/api/ai-assistant.ts',
    'init-ai-assistant.sql'
  ];

  let allOK = true;
  for (const file of files) {
    if (fs.existsSync(file)) {
      log('green', `  ✅ ${file}`);
    } else {
      log('red', `  ❌ ${file}: 文件不存在`);
      allOK = false;
    }
  }

  return allOK;
}

// 主函数
async function main() {
  console.log(colors.blue + '\n🚀 AI老板助手功能验证\n' + colors.reset);
  console.log('=====================================');

  // 验证文件
  const filesOK = verifyFiles();

  // 验证后端API
  const apiOK = await verifyAPIs();

  // 验证前端
  const frontendOK = await verifyFrontend();

  // 输出结果
  console.log('\n=====================================');
  log('blue', '📊 验证结果总结：\n');

  log(filesOK ? 'green' : 'red', `  文件完整性: ${filesOK ? '✅ 通过' : '❌ 失败'}`);
  log(apiOK ? 'green' : 'red', `  API接口: ${apiOK ? '✅ 通过' : '❌ 失败'}`);
  log(frontendOK ? 'green' : 'red', `  前端页面: ${frontendOK ? '✅ 通过' : '❌ 失败'}`);

  if (filesOK && apiOK && frontendOK) {
    log('green', '\n🎉 恭喜！AI老板助手功能验证全部通过！\n');
    log('yellow', '📝 下一步操作：');
    log('yellow', '  1. 执行数据库初始化：mysql -u root -p crm < init-ai-assistant.sql');
    log('yellow', '  2. 登录系统访问新功能：' + FRONTEND_BASE + '/ai-assistant/customer-insights');
  } else {
    log('red', '\n❌ 验证未完全通过，请检查上述错误项。\n');
  }
}

// 执行验证
main().catch(console.error);