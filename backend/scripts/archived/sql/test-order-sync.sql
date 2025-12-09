-- ======================================================
-- 海绵订单同步功能测试数据脚本
-- 创建日期: 2025-11-21
-- 用途: 用于测试订单同步功能的完整流程
-- ======================================================

-- 1. 创建测试客户并绑定海绵订单号
-- ======================================================

-- 测试客户1：已绑定订单号
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
  external_order_ids,
  create_time
) VALUES (
  '测试客户-张三',
  'wx_zhangsan',
  '张三',
  '13800138001',
  '高意向',
  '意向客户',
  1,
  1,
  '朋友推荐',
  JSON_ARRAY('20227343', '20228888'),  -- 绑定海绵订单号
  NOW()
);

-- 测试客户2：已绑定订单号
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
  external_order_ids,
  create_time
) VALUES (
  '测试客户-李四',
  'wx_lisi',
  '李四',
  '13800138002',
  '中意向',
  '潜在客户',
  1,
  1,
  '线上广告',
  JSON_ARRAY('20229999'),  -- 绑定海绵订单号
  NOW()
);

-- 测试客户3：未绑定订单号（用于测试错误情况）
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
  external_order_ids,
  create_time
) VALUES (
  '测试客户-王五',
  'wx_wangwu',
  '王五',
  '13800138003',
  '低意向',
  '线索',
  1,
  1,
  '自然搜索',
  NULL,  -- 未绑定订单号
  NOW()
);

-- 2. 检查业务配置（确保同步配置存在）
-- ======================================================

-- 检查配置是否存在
SELECT
  config_key,
  config_value,
  config_name
FROM business_config
WHERE category = 'order_sync'
ORDER BY config_key;

-- 如果配置不存在，插入默认配置
INSERT INTO business_config (category, config_key, config_value, config_name, remark, create_time, update_time) VALUES
('order_sync', 'order_sync.api_key', '12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT', 'API密钥', '海绵系统API密钥', NOW(), NOW()),
('order_sync', 'order_sync.api_url', 'https://yx.vipstore.top/yoga/admin/getGoodsOrderList', 'API地址', '海绵订单列表接口地址', NOW(), NOW()),
('order_sync', 'order_sync.default_sales_id', '1', '默认销售ID', '外部订单默认分配的销售人员ID', NOW(), NOW()),
('order_sync', 'order_sync.enabled', 'false', '启用自动同步', '是否启用定时自动同步（测试时建议关闭）', NOW(), NOW()),
('order_sync', 'order_sync.interval', '30', '同步间隔(分钟)', '定时同步的时间间隔', NOW(), NOW()),
('order_sync', 'order_sync.daily_update_time', '02:00', '每日批量更新时间', '每天批量更新订单状态的时间', NOW(), NOW()),
('order_sync', 'order_sync.sync_range_days', '7', '增量同步天数', '定时同步时拉取最近N天的订单', NOW(), NOW()),
('order_sync', 'order_sync.batch_size', '100', '每批次同步数量', '每次同步处理的订单数量', NOW(), NOW()),
('order_sync', 'order_sync.update_existing', 'true', '更新已存在订单', '是否更新已同步的订单', NOW(), NOW()),
('order_sync', 'order_sync.sync_customer_info', 'true', '同步客户信息', '是否将订单信息补充到客户档案', NOW(), NOW()),
('order_sync', 'order_sync.auto_create_campus', 'true', '自动创建校区', '遇到不存在的校区时是否自动创建', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  config_value = VALUES(config_value),
  update_time = NOW();

-- 3. 验证数据
-- ======================================================

SELECT '✅ 测试数据准备完成！' AS message;
SELECT '' AS blank1;

-- 显示已创建的测试客户
SELECT '📋 已创建的测试客户：' AS title;
SELECT
  id,
  real_name AS '姓名',
  phone AS '手机号',
  wechat_id AS '微信号',
  external_order_ids AS '已绑定订单号'
FROM customers
WHERE wechat_id LIKE 'wx_%'
  AND create_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY id DESC;

SELECT '' AS blank2;

-- 显示订单同步配置
SELECT '⚙️ 订单同步配置：' AS title;
SELECT
  config_key AS '配置项',
  config_value AS '配置值',
  config_name AS '名称'
FROM business_config
WHERE category = 'order_sync'
ORDER BY config_key;

-- 4. 测试指南
-- ======================================================

SELECT '' AS blank3;
SELECT '📝 测试步骤指南：' AS guide;
SELECT '' AS blank4;

SELECT '1️⃣ 访问订单同步配置页面' AS step1;
SELECT '   路由: /order/sync-config' AS action1;
SELECT '' AS blank5;

SELECT '2️⃣ 在"基本设置"标签检查配置' AS step2;
SELECT '   确认API密钥和API地址是否正确' AS action2;
SELECT '   确认"启用自动同步"为关闭状态（测试用）' AS action3;
SELECT '' AS blank6;

SELECT '3️⃣ 在"客户绑定"标签查看已绑定客户' AS step3;
SELECT '   应该能看到"测试客户-张三"绑定了2个订单号' AS action4;
SELECT '   应该能看到"测试客户-李四"绑定了1个订单号' AS action5;
SELECT '' AS blank7;

SELECT '4️⃣ 在"手动同步"标签执行同步' AS step4;
SELECT '   选择时间范围（建议最近30天）' AS action6;
SELECT '   点击"开始同步"按钮' AS action7;
SELECT '' AS blank8;

SELECT '5️⃣ 查看同步结果' AS step5;
SELECT '   查看成功/失败统计' AS action8;
SELECT '   如有错误，查看错误详情' AS action9;
SELECT '' AS blank9;

SELECT '6️⃣ 在"同步日志"标签查看详细日志' AS step6;
SELECT '   可以查看每个订单的同步状态' AS action10;
SELECT '   可以查看变更详情和错误信息' AS action11;
SELECT '' AS blank10;

SELECT '7️⃣ 在订单列表页面查看同步的订单' AS step7;
SELECT '   路由: /order/list' AS action12;
SELECT '   使用"数据来源"筛选"海绵青年GO"' AS action13;
SELECT '   查看"同步状态"列的显示' AS action14;
SELECT '' AS blank11;

-- 5. 常见问题排查
-- ======================================================

SELECT '❓ 常见问题排查：' AS troubleshooting;
SELECT '' AS blank12;

SELECT 'Q1: 同步失败提示"未找到关联客户"？' AS q1;
SELECT 'A1: 检查客户的external_order_ids字段是否包含对应的订单号' AS a1;
SELECT '    可以使用上面的SQL查询验证' AS a1_tip;
SELECT '' AS blank13;

SELECT 'Q2: 订单列表看不到同步的订单？' AS q2;
SELECT 'A2: 1) 检查同步日志是否显示成功' AS a2_1;
SELECT '    2) 刷新订单列表页面' AS a2_2;
SELECT '    3) 使用"数据来源=海绵青年GO"筛选' AS a2_3;
SELECT '' AS blank14;

SELECT 'Q3: API调用失败？' AS q3;
SELECT 'A3: 1) 检查网络连接' AS a3_1;
SELECT '    2) 检查API密钥是否正确' AS a3_2;
SELECT '    3) 检查API地址是否可访问' AS a3_3;
SELECT '' AS blank15;

SELECT 'Q4: 校区不存在导致同步失败？' AS q4;
SELECT 'A4: 在"基本设置"中开启"自动创建校区"选项' AS a4;
SELECT '' AS blank16;

-- 6. 清理测试数据（可选）
-- ======================================================

SELECT '🗑️ 如需清理测试数据，请执行以下SQL：' AS cleanup;
SELECT '' AS blank17;

SELECT '-- 删除测试客户（请谨慎执行）' AS cleanup_sql1;
SELECT '-- DELETE FROM customers WHERE wechat_id LIKE \'wx_%\' AND create_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);' AS cleanup_sql2;
SELECT '' AS blank18;

SELECT '-- 删除测试订单（请谨慎执行）' AS cleanup_sql3;
SELECT '-- DELETE FROM orders WHERE data_source = \'海绵青年GO\' AND create_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);' AS cleanup_sql4;
SELECT '' AS blank19;

SELECT '-- 删除同步日志（请谨慎执行）' AS cleanup_sql5;
SELECT '-- DELETE FROM order_sync_logs WHERE sync_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);' AS cleanup_sql6;
