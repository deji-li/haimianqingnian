-- 简化版测试通知功能的SQL脚本

-- 1. 创建测试客户（用于测试高意向客户提醒）
INSERT INTO customers (
  wechat_nickname,
  wechat_id,
  real_name,
  phone,
  customer_intent,
  lifecycle_stage,
  sales_id,
  operator_id,
  source
) VALUES (
  '测试客户-高意向',
  'test_high_intent_001',
  '张三',
  '13800138001',
  '中意向',
  '潜在客户',
  1,
  1,
  '朋友推荐'
);

-- 2. 创建测试客户（用于测试客户分配通知）
INSERT INTO customers (
  wechat_nickname,
  wechat_id,
  real_name,
  phone,
  customer_intent,
  lifecycle_stage,
  sales_id,
  operator_id,
  source
) VALUES (
  '测试客户-重新分配',
  'test_assign_002',
  '李四',
  '13800138002',
  '低意向',
  '潜在客户',
  1,
  1,
  '线上广告'
);

-- 3. 创建测试客户（用于测试生命周期变化通知）
INSERT INTO customers (
  wechat_nickname,
  wechat_id,
  real_name,
  phone,
  customer_intent,
  lifecycle_stage,
  sales_id,
  operator_id,
  source
) VALUES (
  '测试客户-生命周期',
  'test_lifecycle_003',
  '王五',
  '13800138003',
  '高意向',
  '潜在客户',
  1,
  1,
  '自然搜索'
);

-- 4. 创建测试客户（用于今日回访提醒）
INSERT INTO customers (
  wechat_nickname,
  wechat_id,
  real_name,
  phone,
  customer_intent,
  lifecycle_stage,
  sales_id,
  operator_id,
  source,
  next_follow_time
) VALUES (
  '测试客户-今日回访',
  'test_followup_004',
  '赵六',
  '13800138004',
  '高意向',
  '意向客户',
  1,
  1,
  '自然搜索',
  CURDATE()
);

-- 5. 创建多个客户用于批量操作测试
INSERT INTO customers (
  wechat_nickname,
  wechat_id,
  real_name,
  phone,
  customer_intent,
  lifecycle_stage,
  sales_id,
  operator_id,
  source
) VALUES
('测试客户-批量1', 'test_batch_001', '孙七', '13800138011', '低意向', '潜在客户', 1, 1, '朋友推荐'),
('测试客户-批量2', 'test_batch_002', '周八', '13800138012', '低意向', '潜在客户', 1, 1, '线上广告'),
('测试客户-批量3', 'test_batch_003', '吴九', '13800138013', '低意向', '潜在客户', 1, 1, '自然搜索');

SELECT '✅ 测试数据创建完成！' AS message;
SELECT '' AS blank;
SELECT '📋 通知功能测试指南：' AS guide;
SELECT '' AS blank2;

SELECT '1️⃣ 测试高意向客户提醒' AS test1;
SELECT '   操作：找到"测试客户-高意向"，将意向等级从"中意向"改为"高意向"' AS action1;
SELECT '   预期：系统发送高意向客户提醒通知' AS result1;
SELECT '' AS blank3;

SELECT '2️⃣ 测试客户分配通知' AS test2;
SELECT '   操作：找到"测试客户-重新分配"，将销售人员从当前改为其他人' AS action2;
SELECT '   预期：新的销售人员收到客户分配通知' AS result2;
SELECT '' AS blank4;

SELECT '3️⃣ 测试生命周期变化通知' AS test3;
SELECT '   操作：找到"测试客户-生命周期"，在生命周期管理中改变阶段' AS action3;
SELECT '   预期：收到生命周期阶段变化通知' AS result3;
SELECT '' AS blank5;

SELECT '4️⃣ 测试批量操作完成通知' AS test4;
SELECT '   操作：勾选"测试客户-批量1/2/3"，执行批量更新操作' AS action4;
SELECT '   预期：收到批量操作完成通知，显示成功/失败统计' AS result4;
SELECT '' AS blank6;

SELECT '5️⃣ 测试今日回访提醒' AS test5;
SELECT '   说明："测试客户-今日回访"已设置今日需要回访' AS info1;
SELECT '   说明：定时任务会在每天早上9点发送回访提醒' AS info2;
SELECT '   说明：你可以在通知中心手动测试或查看这个客户的回访提醒' AS info3;
SELECT '' AS blank7;

SELECT '🔔 查看通知：登录系统后点击右上角的铃铛图标查看通知中心' AS tip;
