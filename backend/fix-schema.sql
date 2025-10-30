-- =====================================================
-- Schema修复脚本 - 如果字段被TypeORM错误删除，使用此脚本恢复
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- 1. 检查并恢复 customers 表的 operator_id 字段
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'education_crm'
    AND table_name = 'customers'
    AND column_name = 'operator_id'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE customers ADD COLUMN operator_id int DEFAULT NULL COMMENT ''引流运营人员ID'' AFTER sales_id',
  'SELECT ''✓ Column operator_id exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. 检查并恢复 customers 表的 traffic_platform 字段
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'education_crm'
    AND table_name = 'customers'
    AND column_name = 'traffic_platform'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE customers ADD COLUMN traffic_platform enum(''小红书'',''抖音'',''视频号'') DEFAULT NULL COMMENT ''来源平台'' AFTER traffic_source',
  'SELECT ''✓ Column traffic_platform exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. 检查并恢复 customers 表的 traffic_city 字段
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'education_crm'
    AND table_name = 'customers'
    AND column_name = 'traffic_city'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE customers ADD COLUMN traffic_city enum(''广州'',''上海'',''深圳'',''北京'') DEFAULT NULL COMMENT ''来源城市'' AFTER traffic_platform',
  'SELECT ''✓ Column traffic_city exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. 检查并添加索引
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'education_crm'
    AND table_name = 'customers'
    AND index_name = 'idx_operator'
);

SET @sql = IF(@index_exists = 0,
  'ALTER TABLE customers ADD KEY idx_operator (operator_id)',
  'SELECT ''✓ Index idx_operator exists'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. 验证修复结果
SELECT '=== 修复后的字段状态 ===' as message;
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

SELECT '✅ Schema修复完成！' as status;
