const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 模拟登录获取token
async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456'
    });
    return response.data.access_token;
  } catch (error) {
    console.log('登录失败，尝试使用已有token');
    return 'test_token';
  }
}

// 测试完整的AI对话流程
async function testAIScriptFlow() {
  let token;

  try {
    // 1. 登录
    console.log('1. 尝试登录...');
    token = await login();
    console.log('登录成功，token:', token.substring(0, 20) + '...');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 获取场景列表
    console.log('\n2. 获取场景列表...');
    const scenariosResponse = await axios.get(`${API_BASE}/ai-script-assistant/scenarios`, { headers });
    console.log('场景数量:', scenariosResponse.data.length);
    console.log('第一个场景:', scenariosResponse.data[0]);

    if (scenariosResponse.data.length === 0) {
      console.log('错误：没有找到场景数据');
      return;
    }

    const firstScenario = scenariosResponse.data[0];
    console.log('选择场景:', firstScenario.scenarioName, 'ID:', firstScenario.id);

    // 3. 获取技巧列表
    console.log('\n3. 获取技巧列表...');
    const techniquesResponse = await axios.get(`${API_BASE}/ai-script-assistant/techniques`, {
      headers,
      params: { scenarioId: firstScenario.id }
    });
    console.log('技巧数量:', techniquesResponse.data.length);

    let selectedTechnique = null;
    if (techniquesResponse.data.length > 0) {
      selectedTechnique = techniquesResponse.data[0];
      console.log('选择技巧:', selectedTechnique.techniqueName, 'ID:', selectedTechnique.id);
    }

    // 4. 创建对话
    console.log('\n4. 创建对话...');
    const createConversationData = {
      functionType: 'deal_assist',
      scenarioId: firstScenario.id,
      techniqueId: selectedTechnique ? selectedTechnique.id : undefined,
      title: '测试对话'
    };
    console.log('创建对话数据:', createConversationData);

    const conversationResponse = await axios.post(`${API_BASE}/ai-script-assistant/conversations`,
      createConversationData, { headers });
    console.log('对话创建成功，ID:', conversationResponse.data.id);

    const conversationId = conversationResponse.data.id;

    // 5. 发送消息
    console.log('\n5. 发送消息...');
    const messageData = {
      content: '你好，我想咨询一下课程信息',
      customerName: '测试客户',
      scenario: firstScenario.scenarioName,
      technique: selectedTechnique ? selectedTechnique.techniqueName : ''
    };
    console.log('发送消息数据:', messageData);

    const messageResponse = await axios.post(
      `${API_BASE}/ai-script-assistant/conversations/${conversationId}/messages`,
      messageData,
      { headers }
    );

    console.log('\n✅ AI响应成功！');
    console.log('用户消息:', messageResponse.data.userMessage.content);
    console.log('AI回复:', messageResponse.data.assistantMessage.content);
    console.log('思考过程:', messageResponse.data.assistantMessage.thinkingProcess);
    console.log('置信度:', messageResponse.data.assistantMessage.confidenceScore);

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
console.log('开始测试AI话术助手完整流程...\n');
testAIScriptFlow();