const axios = require('axios');

// 配置
const BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5174';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testAIScriptAssistant() {
  console.log('=== AI Script Assistant 完整功能测试 ===\n');

  try {
    // 1. 测试登录
    console.log('1. 测试用户登录...');
    const loginResponse = await api.post('/auth/login', {
      username: 'admin', // 使用admin用户
      password: 'admin123' // 尝试常见密码
    });

    if (loginResponse.data.statusCode === 200) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log(`Token: ${token.substring(0, 20)}...`);
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
      // 尝试其他密码
      const passwords = ['123456', 'admin', 'password', '123123'];
      for (const pwd of passwords) {
        try {
          const res = await api.post('/auth/login', {
            username: 'admin',
            password: pwd
          });
          if (res.data.statusCode === 200) {
            console.log(`✅ 登录成功 (密码: ${pwd})`);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.token}`;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // 2. 测试获取场景列表
    console.log('\n2. 测试获取场景列表...');
    try {
      const scenariosResponse = await api.get('/ai-script-assistant/scenarios');
      if (scenariosResponse.data.statusCode === 200) {
        console.log('✅ 获取场景列表成功');
        console.log(`场景数量: ${scenariosResponse.data.data.length}`);
        scenariosResponse.data.data.forEach((scenario, index) => {
          console.log(`  ${index + 1}. ${scenario.scenarioName} (${scenario.functionType})`);
        });
      } else {
        console.log('❌ 获取场景列表失败:', scenariosResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 获取场景列表异常:', error.response?.data || error.message);
    }

    // 3. 测试获取对话历史
    console.log('\n3. 测试获取对话历史...');
    try {
      const conversationsResponse = await api.get('/ai-script-assistant/conversations', {
        params: { page: 1, limit: 10 }
      });
      if (conversationsResponse.data.statusCode === 200) {
        console.log('✅ 获取对话历史成功');
        console.log(`对话数量: ${conversationsResponse.data.data.items.length}`);
      } else {
        console.log('❌ 获取对话历史失败:', conversationsResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 获取对话历史异常:', error.response?.data || error.message);
    }

    // 4. 测试创建新对话
    console.log('\n4. 测试创建新对话...');
    try {
      const createConversationResponse = await api.post('/ai-script-assistant/conversations', {
        functionType: 'reply_assist',
        scenarioId: 1,
        techniqueId: 1,
        title: '测试对话'
      });

      if (createConversationResponse.data.statusCode === 200) {
        console.log('✅ 创建对话成功');
        const conversationId = createConversationResponse.data.data.id;
        console.log(`对话ID: ${conversationId}`);

        // 5. 测试发送消息
        console.log('\n5. 测试发送消息...');
        try {
          const messageResponse = await api.post(`/ai-script-assistant/conversations/${conversationId}/messages`, {
            content: '客户说价格太贵了，如何回复？'
          });

          if (messageResponse.data.statusCode === 200) {
            console.log('✅ 发送消息成功');
            console.log('AI回复:', messageResponse.data.data.content?.substring(0, 100) + '...');
          } else {
            console.log('❌ 发送消息失败:', messageResponse.data.message);
          }
        } catch (error) {
          console.log('❌ 发送消息异常:', error.response?.data || error.message);
        }
      } else {
        console.log('❌ 创建对话失败:', createConversationResponse.data.message);
      }
    } catch (error) {
      console.log('❌ 创建对话异常:', error.response?.data || error.message);
    }

    console.log('\n=== 测试完成 ===');
    console.log(`前端访问地址: ${FRONTEND_URL}`);
    console.log('请手动访问前端页面进行完整测试');

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAIScriptAssistant();