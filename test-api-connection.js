const axios = require('axios');

async function testAPI() {
  console.log('开始测试AI话术助手API...\n');

  const baseURL = 'http://localhost:3000';

  try {
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const healthRes = await axios.get(`${baseURL}/health`);
    if (healthRes.data) {
      console.log('   ✅ 后端服务运行正常\n');
    }

    // 测试场景API
    console.log('2. 测试场景API...');
    try {
      const scenariosRes = await axios.get(`${baseURL}/ai-script-assistant/scenarios`);
      console.log('   ✅ 场景API响应正常');
      console.log(`   返���了 ${scenariosRes.data?.length || 0} 个场景\n`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ 场景API需要认证（正常）\n');
      } else {
        console.log('   ❌ 场景API错误:', error.message);
      }
    }

    // 测试配置API
    console.log('3. 测试配置API...');
    try {
      const configRes = await axios.get(`${baseURL}/ai-script-assistant/config/deal_assist`);
      console.log('   ✅ 配置API响应正常\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ 配置API需要认证（正常）\n');
      } else {
        console.log('   ❌ 配置API错误:', error.message);
      }
    }

    console.log('API测试完成！');
    console.log('\n请访问前端页面：');
    console.log('http://localhost:5175');
    console.log('\n菜单路径：/sales-tools/script-assistant');

  } catch (error) {
    console.error('❌ 后端服务未启动或无法连接:', error.message);
    console.log('\n请检查：');
    console.log('1. 后端服务是否启动（cd backend && npm run start）');
    console.log('2. 数据库连接是否正常');
    console.log('3. 端口3000是否被占用');
  }
}

testAPI();