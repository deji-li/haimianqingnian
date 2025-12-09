const axios = require('axios');

async function testPendingFollowups() {
  try {
    // 首先登录获取 token
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'admin',
      password: 'admin123',
    });

    const token = loginRes.data.access_token;
    console.log('登录成功，token:', token ? '已获取' : '未获取');

    // 调用待跟进客户 API
    const res = await axios.get('http://localhost:3000/api/customer/pending-followups', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('\n=== 待跟进客户数据 ===');
    console.log('返回数据条数:', res.data.length);

    if (res.data.length > 0) {
      console.log('\n第一条数据详情:');
      console.log(JSON.stringify(res.data[0], null, 2));

      console.log('\n所有客户简要信息:');
      res.data.forEach((customer, index) => {
        console.log(`${index + 1}. 姓名:${customer.realName || '空'} 微信昵称:${customer.wechatNickname || '空'} 微信号:${customer.wechatId || '空'} 手机:${customer.phone || '空'}`);
      });
    } else {
      console.log('没有待跟进客户数据');
    }
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testPendingFollowups();
