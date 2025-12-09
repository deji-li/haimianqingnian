// 测试订单绑定功能
const axios = require('axios');

async function testOrderBinding() {
  const baseURL = 'http://localhost:3000/api';

  try {
    // 1. 登录获取token
    console.log('1. 登录中...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    const token = loginRes.data.accessToken;
    console.log('✓ 登录成功');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. 获取客户43的当前信息
    console.log('\n2. 获取客户43的信息...');
    const customer43 = await axios.get(`${baseURL}/customer/43`, { headers });
    console.log('客户43当前信息:', {
      id: customer43.data.id,
      wechatNickname: customer43.data.wechatNickname,
      externalOrderIds: customer43.data.externalOrderIds
    });

    // 3. 更新客户43，触发订单绑定逻辑
    console.log('\n3. 更新客户43，绑定订单20227904...');
    const updateData = {
      ...customer43.data,
      externalOrderIds: ['20227904'] // 确保包含订单号
    };

    await axios.put(`${baseURL}/customer/43`, updateData, { headers });
    console.log('✓ 更新成功');

    // 4. 等待一下让异步操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. 检查订单是否已转移
    console.log('\n4. 检查订单20227904的绑定情况...');
    const ordersRes = await axios.get(`${baseURL}/order?keyword=20227904&page=1&pageSize=10`, { headers });
    const order = ordersRes.data.list.find(o => o.orderNo === '20227904');

    if (order) {
      console.log('订单信息:', {
        orderNo: order.orderNo,
        customerId: order.customerId,
        customerName: order.customerName
      });

      if (order.customerId === 43) {
        console.log('✅ 成功！订单已转移到客户43');
      } else {
        console.log('❌ 失败：订单还在客户' + order.customerId);
      }
    }

    // 6. 检查客户44是否还存在
    console.log('\n5. 检查客户44是否被删除...');
    try {
      await axios.get(`${baseURL}/customer/44`, { headers });
      console.log('❌ 客户44仍然存在（可能有其他数据，未删除）');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ 客户44已被成功删除');
      } else {
        throw error;
      }
    }

    console.log('\n测试完成！');

  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testOrderBinding();
