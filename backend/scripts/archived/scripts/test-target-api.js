const axios = require('axios');

async function testTargetAPI() {
  try {
    console.log('开始测试 /api/target 接口...');

    // 先登录获取token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    console.log('登录成功，token:', loginRes.data.data.token);

    const token = loginRes.data.data.token;

    // 调用目标列表接口
    const targetRes = await axios.get('http://localhost:3000/api/target', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n===== API响应 =====');
    console.log('状态码:', targetRes.status);
    console.log('响应数据结构:', JSON.stringify(targetRes.data, null, 2));
    console.log('\n===== 数据详情 =====');
    if (targetRes.data && targetRes.data.data) {
      console.log('数据类型:', typeof targetRes.data.data);
      console.log('是否为数组:', Array.isArray(targetRes.data.data));
      console.log('数据长度:', targetRes.data.data.length);
      if (targetRes.data.data.length > 0) {
        console.log('第一条数据:', JSON.stringify(targetRes.data.data[0], null, 2));
      }
    }

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testTargetAPI();
