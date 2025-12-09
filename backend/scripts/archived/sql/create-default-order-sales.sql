-- ======================================================
-- 创建"无主订单销售"默认用户
-- 创建日期: 2025-11-22
-- 用途: 为外部订单同步提供默认销售人员
-- ======================================================

-- 1. 创建"无主订单销售"用户
-- ======================================================

-- 检查是否已存在该用户
SELECT '检查是否已存在"无主订单销售"用户...' AS message;

SELECT
  id,
  username,
  real_name,
  status
FROM users
WHERE username = 'order_sync_default' OR real_name = '无主订单销售';

-- 如果不存在，则创建该用户
INSERT INTO users (
  username,
  password,
  real_name,
  phone,
  email,
  department_id,
  role_id,
  status,
  remark,
  create_time,
  update_time
)
SELECT
  'order_sync_default',
  '$2b$10$YourHashedPasswordHere',  -- 默认密码，建议后续禁用登录
  '无主订单销售',
  '00000000000',
  'order_sync@system.internal',
  (SELECT id FROM department LIMIT 1),  -- 使用第一个部门
  (SELECT id FROM roles WHERE name = '销售' LIMIT 1),  -- 使用销售角色
  0,  -- 状态设为禁用，防止登录
  '系统自动创建，用于外部订单同步时的默认销售人员。此账号已禁用登录。',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'order_sync_default'
);

-- 2. 获取创建的用户ID
-- ======================================================

SELECT '✅ 用户创建完成！' AS message;
SELECT '' AS blank1;

SET @default_sales_id = (SELECT id FROM users WHERE username = 'order_sync_default' LIMIT 1);

SELECT
  CONCAT('📋 无主订单销售用户ID: ', @default_sales_id) AS info;
SELECT '' AS blank2;

-- 3. 更新订单同步配置
-- ======================================================

-- 更新默认销售ID配置
UPDATE business_config
SET
  config_value = @default_sales_id,
  update_time = NOW()
WHERE config_key = 'order_sync.default_sales_id';

SELECT '⚙️ 已更新订单同步配置：' AS title;
SELECT
  config_key AS '配置项',
  config_value AS '配置值',
  config_name AS '名称'
FROM business_config
WHERE category = 'order_sync'
ORDER BY config_key;

SELECT '' AS blank3;

-- 4. 验证结果
-- ======================================================

SELECT '✅ 配置完成！详细信息如下：' AS summary;
SELECT '' AS blank4;

SELECT
  u.id AS '用户ID',
  u.username AS '用户名',
  u.real_name AS '姓名',
  u.phone AS '手机号',
  CASE u.status
    WHEN 1 THEN '启用'
    WHEN 0 THEN '禁用'
    ELSE '未知'
  END AS '状态',
  d.name AS '部门',
  r.name AS '角色',
  u.remark AS '备注'
FROM users u
LEFT JOIN department d ON u.department_id = d.id
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = 'order_sync_default';

SELECT '' AS blank5;

-- 5. 后续操作提示
-- ======================================================

SELECT '📝 重要提示：' AS notice;
SELECT '' AS blank6;

SELECT '1️⃣ "无主订单销售"用户已创建并设为禁用状态' AS tip1;
SELECT '   该用户仅用于外部订单同步，无法登录系统' AS detail1;
SELECT '' AS blank7;

SELECT '2️⃣ 订单同步配置已自动更新' AS tip2;
SELECT '   所有未绑定客户的外部订单将分配给该用户' AS detail2;
SELECT '' AS blank8;

SELECT '3️⃣ API密钥和地址已配置' AS tip3;
SELECT '   API密钥: 12MfKhW5fQf6KoVlBRqR7Wm8Ma2fMtZT' AS detail3_1;
SELECT '   API地址: https://yx.vipstore.top/yoga/admin/getGoodsOrderList' AS detail3_2;
SELECT '' AS blank9;

SELECT '4️⃣ 可以在前端"订单同步配置"页面查看和修改配置' AS tip4;
SELECT '   路由: /order/sync-config' AS detail4;
SELECT '' AS blank10;

-- 6. 清理操作（可选，谨慎执行）
-- ======================================================

SELECT '🗑️ 如需删除"无主订单销售"用户，请执行：' AS cleanup;
SELECT '' AS blank11;

SELECT '-- 删除用户（请谨慎执行）' AS cleanup_sql1;
SELECT '-- DELETE FROM users WHERE username = ''order_sync_default'';' AS cleanup_sql2;
SELECT '' AS blank12;

SELECT '-- 恢复默认配置' AS cleanup_sql3;
SELECT '-- UPDATE business_config SET config_value = ''1'' WHERE config_key = ''order_sync.default_sales_id'';' AS cleanup_sql4;

-- Migration completed
