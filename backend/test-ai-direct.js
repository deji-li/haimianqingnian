const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAIDirectly() {
  try {
    console.log('🔍 Testing AI Script Assistant API directly...');

    // Step 1: Login
    console.log('\n1. 登录获取token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ 登录成功，token:', token.substring(0, 30) + '...');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test scenarios endpoint
    console.log('\n2. 测试场景���口...');
    const scenariosResponse = await axios.get(`${API_BASE}/ai-script-assistant/scenarios`, { headers });
    console.log('✅ 场景接口正常，场景数量:', scenariosResponse.data.length);
    if (scenariosResponse.data.length > 0) {
      console.log('   第一个场景:', scenariosResponse.data[0].scenarioName);
    }

    // Step 3: Test techniques endpoint
    console.log('\n3. 测试技巧接口...');
    const techniquesResponse = await axios.get(`${API_BASE}/ai-script-assistant/techniques`, { headers });
    console.log('✅ 技巧接口正常，技巧数量:', techniquesResponse.data.length);
    if (techniquesResponse.data.length > 0) {
      console.log('   第一个技巧:', techniquesResponse.data[0].techniqueName);
    }

    // Step 4: Test conversation creation
    console.log('\n4. 测试创建对话...');
    const createConversationResponse = await axios.post(`${API_BASE}/ai-script-assistant/conversations`, {
      functionType: 'deal_assist',
      scenarioId: scenariosResponse.data[0]?.id || 1,
      techniqueId: techniquesResponse.data[0]?.id || 1,
      title: '测试对话'
    }, { headers });

    console.log('✅ 对话创建成功，ID:', createConversationResponse.data.id);

    const conversationId = createConversationResponse.data.id;

    // Step 5: Test sending message
    console.log('\n5. 测试发送AI消息...');
    const messageResponse = await axios.post(`${API_BASE}/ai-script-assistant/conversations/${conversationId}/messages`, {
      content: '你好，我想咨询一下课程信息',
      customerName: '测试客户',
      scenario: scenariosResponse.data[0]?.scenarioName || '默认场景',
      technique: techniquesResponse.data[0]?.techniqueName || '默认技巧'
    }, { headers });

    console.log('\n🎉 AI响应成功！');
    console.log('用户消息:', messageResponse.data.userMessage?.content);
    console.log('AI回复:', messageResponse.data.assistantMessage?.content);
    console.log('置信度:', messageResponse.data.assistantMessage?.confidenceScore);

    if (messageResponse.data.assistantMessage?.thinkingProcess) {
      console.log('思考过程:', messageResponse.data.assistantMessage.thinkingProcess.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    console.error('完整错误:', error);
  }
}

// 执行测试
testAIDirectly();