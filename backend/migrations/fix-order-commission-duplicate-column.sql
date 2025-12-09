-- 修复订单表中重复的commission_amount列名问题
-- 将第二个commission_amount（老师提成）重命名为teacher_commission_amount

-- 首先检查是否已经存在teacher_commission_amount列
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'teacher_commission_amount'
    AND TABLE_SCHEMA = DATABASE()
);

-- 如果不存在teacher_commission_amount列，则添加它
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE orders ADD COLUMN teacher_commission_amount DECIMAL(10,2) DEFAULT 0 COMMENT ''老师提成金额''',
    'SELECT ''teacher_commission_amount column already exists'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 如果存在重复的commission_amount列，则删除第二个（老师提成）
-- 注意：这个操作需要小心，确保数据不丢失
-- 这里我们假设第二个commission_amount存储的是老师提成数据

-- 备份数据（如果第二个commission_amount存在且有数据）
SET @has_duplicate = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'commission_amount'
    AND TABLE_SCHEMA = DATABASE()
);

-- 如果teacher_commission_amount为空且有重复列，则迁移数据
SET @migrate_data = (
    SELECT COUNT(*)
    FROM orders
    WHERE teacher_commission_amount = 0
);

SET @sql = IF(@has_duplicate > 0 AND @migrate_data > 0,
    'UPDATE orders SET teacher_commission_amount = commission_amount WHERE teacher_commission_amount = 0',
    'SELECT ''No data migration needed'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加注释说明
ALTER TABLE orders
MODIFY COLUMN commission_amount DECIMAL(10,2) DEFAULT 0 COMMENT '销售提成金额',
MODIFY COLUMN teacher_commission_amount DECIMAL(10,2) DEFAULT 0 COMMENT '老师提成金额';

-- 显示更新结果
SELECT
    'Order table commission columns fixed' as status,
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'orders'
AND COLUMN_NAME IN ('commission_amount', 'teacher_commission_amount')
AND TABLE_SCHEMA = DATABASE();