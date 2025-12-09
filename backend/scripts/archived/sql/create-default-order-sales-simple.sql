-- 创建"无主订单销售"默认用户并更新配置

-- 1. 创建用户（如果不存在）
INSERT INTO users (
  username,
  password,
  real_name,
  phone,
  email,
  department_id,
  role_id,
  status
)
SELECT
  'order_sync_default',
  '$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '无主订单销售',
  '00000000000',
  'order_sync@system.internal',
  (SELECT id FROM department LIMIT 1),
  (SELECT id FROM roles WHERE name = '销售' LIMIT 1),
  0
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'order_sync_default'
);

-- 2. 更新订单同步配置
UPDATE business_config
SET
  config_value = (SELECT id FROM users WHERE username = 'order_sync_default' LIMIT 1),
  update_time = NOW()
WHERE config_key = 'order_sync.default_sales_id';

-- 3. 显示结果
SELECT '✅ 配置完成！' AS message;
SELECT '' AS blank;

SELECT
  u.id AS '用户ID',
  u.username AS '用户名',
  u.real_name AS '姓名',
  CASE u.status
    WHEN 1 THEN '启用'
    WHEN 0 THEN '禁用'
  END AS '状态',
  d.name AS '部门',
  r.name AS '角色'
FROM users u
LEFT JOIN department d ON u.department_id = d.id
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.username = 'order_sync_default';

SELECT '' AS blank2;

SELECT
  config_key AS '配置项',
  config_value AS '配置值',
  config_name AS '名称'
FROM business_config
WHERE config_key = 'order_sync.default_sales_id';
