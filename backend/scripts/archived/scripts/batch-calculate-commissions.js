/**
 * 批量计算订单佣金 - 打通财务模块
 * 使用方法: node batch-calculate-commissions.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// 需要先登录获取token，这里使用测试账号
const USERNAME = 'admin';
const PASSWORD = 'admin123';

let authToken = '';

async function login() {
  try {
    console.log('🔐 正在登录...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    authToken = response.data.access_token;
    console.log('✅ 登录成功！');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

async function getOrders() {
  try {
    console.log('\n📦 获取所有未计算佣金的订单...');
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // 筛选出未计算佣金的订单（commission_calculated_at为空）
    const orders = response.data.list || response.data;
    const uncalculatedOrders = orders.filter(
      order => !order.commissionCalculatedAt
    );

    console.log(`✅ 找到 ${uncalculatedOrders.length} 个未计算佣金的订单`);
    return uncalculatedOrders;
  } catch (error) {
    console.error('❌ 获取订单失败:', error.response?.data || error.message);
    return [];
  }
}

async function calculateCommission(orderId, orderNo) {
  try {
    console.log(`\n💰 计算订单 ${orderNo} (ID: ${orderId}) 的佣金...`);
    const response = await axios.post(
      `${API_URL}/commission/calculate/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const { commissionAmount, scheme } = response.data;
    console.log(`   ✅ 计算成功！`);
    console.log(`   📊 佣金方案: ${scheme?.name || '无'}`);
    console.log(`   💵 佣金金额: ¥${commissionAmount}`);

    return { success: true, orderId, orderNo, commissionAmount, schemeName: scheme?.name };
  } catch (error) {
    console.error(`   ❌ 计算失败:`, error.response?.data?.message || error.message);
    return { success: false, orderId, orderNo, error: error.response?.data?.message || error.message };
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 开始批量计算订单佣金 - 财务模块打通');
  console.log('========================================\n');

  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n⚠️ 请检查登录凭证后重试');
    return;
  }

  // 2. 获取未计算佣金的订单
  const orders = await getOrders();
  if (orders.length === 0) {
    console.log('\n✨ 所有订单都已计算佣金，无需处理！');
    return;
  }

  // 3. 批量计算佣金
  console.log('\n========================================');
  console.log('📊 开始批量计算佣金');
  console.log('========================================');

  const results = [];
  for (const order of orders) {
    const result = await calculateCommission(order.id, order.orderNo);
    results.push(result);

    // 避免请求过快，稍作延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 4. 统计结果
  console.log('\n========================================');
  console.log('📈 批量计算结果统计');
  console.log('========================================');

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;
  const totalCommission = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + (r.commissionAmount || 0), 0);

  console.log(`\n✅ 成功: ${successCount}个订单`);
  console.log(`❌ 失败: ${failedCount}个订单`);
  console.log(`💰 总佣金: ¥${totalCommission.toFixed(2)}`);

  if (successCount > 0) {
    console.log('\n📋 成功计算的订单详情:');
    results
      .filter(r => r.success)
      .forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.orderNo} - ${r.schemeName} - ¥${r.commissionAmount}`);
      });
  }

  if (failedCount > 0) {
    console.log('\n⚠️ 失败的订单详情:');
    results
      .filter(r => !r.success)
      .forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.orderNo} - ${r.error}`);
      });
  }

  console.log('\n========================================');
  console.log('✅ 批量计算完成！财务模块已打通！');
  console.log('========================================\n');
}

// 执行主函数
main().catch(error => {
  console.error('\n❌ 执行出错:', error);
  process.exit(1);
});
