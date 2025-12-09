-- 测试通知功能的SQL脚本
-- 请确保你已经登录系统并且有一个用户ID

-- 1. 创建一个测试客户（用于测试高意向客户提醒）
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

-- 2. 创建一个测试客户（用于测试客户分配通知 - 先分配给用户1，稍后改为用户2来测试）
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
  '测试客户-待分配',
  'test_assign_002',
  '李四',
  '13800138002',
  '低意向',
  '潜在客户',
  1,
  1,
  '线上广告'
);

-- 3. 创建一个测试客户（用于测试生命周期变化通知）
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

-- 4. 创建一个需要今天回访的客户（用于测试回访提醒）
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

-- 5. 为7天未跟进客户创建跟进记录（模拟7天前的跟进）
SET @customer_7days_id = (SELECT MAX(id) FROM customers) + 1;
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
  '测试客户-7天未跟进',
  'test_7days_005',
  '孙七',
  '13800138005',
  '高意向',
  '意向客户',
  1,
  1,
  '朋友推荐'
);

-- 创建7天前的跟进记录
INSERT INTO customer_follow_records (
  customer_id,
  follow_type,
  follow_content,
  next_follow_time,
  operator_id,
  create_time
) VALUES (
  @customer_7days_id,
  '电话沟通',
  '初步了解需求',
  DATE_ADD(DATE_SUB(NOW(), INTERVAL 7 DAY), INTERVAL 3 DAY),
  1,
  DATE_SUB(NOW(), INTERVAL 7 DAY)
);

-- 6. 为14天未跟进客户创建跟进记录（模拟14天前的跟进）
SET @customer_14days_id = (SELECT MAX(id) FROM customers) + 1;
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
  '测试客户-14天未跟进',
  'test_14days_006',
  '周八',
  '13800138006',
  '高意向',
  '意向客户',
  1,
  1,
  '线上广告'
);

-- 创建14天前的跟进记录
INSERT INTO customer_follow_records (
  customer_id,
  follow_type,
  follow_content,
  next_follow_time,
  operator_id,
  create_time
) VALUES (
  @customer_14days_id,
  '微信沟通',
  '发送课程资料',
  DATE_ADD(DATE_SUB(NOW(), INTERVAL 14 DAY), INTERVAL 3 DAY),
  1,
  DATE_SUB(NOW(), INTERVAL 14 DAY)
);

SELECT '测试数据创建完成！' AS message;
SELECT '请使用以下操作来测试通知功能：' AS instructions;
SELECT '' AS blank;
SELECT '1. 测试高意向客户提醒：' AS step1;
SELECT '   - 在客户管理中找到"测试客户-高意向"' AS action1;
SELECT '   - 将客户意向从"中意向"改为"高意向"' AS action2;
SELECT '   - 保存后查看通知中心，应该收到高意向客户提醒' AS result1;
SELECT '' AS blank2;
SELECT '2. 测试客户分配通知：' AS step2;
SELECT '   - 在客户管理中找到"测试客户-待分配"' AS action3;
SELECT '   - 为该客户分配一个销售人员' AS action4;
SELECT '   - 被分配的销售人员应该收到客户分配通知' AS result2;
SELECT '' AS blank3;
SELECT '3. 测试生命周期变化通知：' AS step3;
SELECT '   - 在客户管理中找到"测试客户-生命周期"' AS action5;
SELECT '   - 在客户生命周期管理中，将该客户从"潜在客户"改为"意向客户"' AS action6;
SELECT '   - 保存后查看通知中心，应该收到生命周期变化通知' AS result3;
SELECT '' AS blank4;
SELECT '4. 测试批量操作完成通知：' AS step4;
SELECT '   - 在客户列表中勾选多个客户' AS action7;
SELECT '   - 执行批量更新操作（如批量修改销售人员或意向等级）' AS action8;
SELECT '   - 操作完成后应该收到批量操作完成通知，显示成功/失败数量' AS result4;
SELECT '' AS blank5;
SELECT '5. 查看已存在的通知：' AS step5;
SELECT '   - "测试客户-7天未跟进" 和 "测试客户-14天未跟进" 会在自动化规则执行时收到提醒' AS info1;
SELECT '   - "测试客户-今日回访" 会在每天早上9点收到回访提醒（定时任务）' AS info2;
SELECT '   - 你可以手动运行自动化规则来测试这些通知' AS info3;
