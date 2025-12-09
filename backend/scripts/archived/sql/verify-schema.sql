-- =====================================================
-- 数据库Schema验证脚本
-- =====================================================

USE education_crm;

-- 1. 检查 customers 表的运营相关字段
SELECT '=== 检查 customers 表字段 ===' as message;
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'customers'
  AND COLUMN_NAME IN ('operator_id', 'traffic_platform', 'traffic_city')
ORDER BY ORDINAL_POSITION;

-- 2. 检查 operation_accounts 表（不应该有 city 字段）
SELECT '=== 检查 operation_accounts 表 ===' as message;
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'operation_accounts'
ORDER BY ORDINAL_POSITION;

-- 3. 检查 operation_commission_records 表（应该有 order_tag 字段）
SELECT '=== 检查 operation_commission_records 表 ===' as message;
SELECT
  COLUMN_NAME,
  COLUMN_TYPE,
  IS_NULLABLE,
  COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'operation_commission_records'
  AND COLUMN_NAME IN ('order_tag', 'commission_amount')
ORDER BY ORDINAL_POSITION;

-- 4. 检查字典表中的运营提成配置
SELECT '=== 检查运营提成配置 ===' as message;
SELECT
  dict_type,
  dict_label,
  dict_value,
  remark,
  status
FROM dictionary
WHERE dict_type = 'operation_commission'
ORDER BY sort;

-- 5. 检查运营相关权限
SELECT '=== 检查运营权限 ===' as message;
SELECT code, name, module, status
FROM permissions
WHERE module = 'operation'
ORDER BY code;

-- 6. 检查运营角色
SELECT '=== 检查运营角色 ===' as message;
SELECT id, code, name, description, status
FROM roles
WHERE code IN ('operator', 'operator_manager');

SELECT '✅ Schema验证完成！' as status;
