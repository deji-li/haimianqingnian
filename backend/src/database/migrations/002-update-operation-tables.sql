-- =====================================================
-- 运营管理模块 - 功能调整迁移
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- =====================================================
-- 1. 修改 operation_accounts 表
-- =====================================================
-- 删除 city 字段（改为通过 campus 关联获取）
-- 先检查并删除引用city的索引
SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'education_crm' AND table_name = 'operation_accounts' AND index_name = 'idx_platform_city'
);
SET @sql = IF(@index_exists > 0,
  'ALTER TABLE operation_accounts DROP INDEX idx_platform_city',
  'SELECT ''Index idx_platform_city does not exist'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 检查并删除 city 字段
SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = 'education_crm' AND table_name = 'operation_accounts' AND column_name = 'city'
);
SET @sql = IF(@column_exists > 0,
  'ALTER TABLE operation_accounts DROP COLUMN city',
  'SELECT ''Column city does not exist'' AS message'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 设置 campus_id 为必填
ALTER TABLE operation_accounts
MODIFY COLUMN campus_id int NOT NULL COMMENT '关联校区ID';

-- =====================================================
-- 2. 修改 operation_commission_records 表
-- =====================================================
-- 添加 order_tag 字段记录订单标签（如果不存在）
SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = 'education_crm'
  AND table_name = 'operation_commission_records'
  AND column_name = 'order_tag'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE operation_commission_records ADD COLUMN order_tag varchar(50) DEFAULT NULL COMMENT ''订单标签'' AFTER order_id',
  'SELECT ''Column order_tag already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. 初始化订单标签提成配置（字典表）
-- =====================================================
-- 使用字典表管理订单标签与运营提成金额的映射关系
-- dict_type: 'operation_commission'
-- dict_label: 订单标签名称
-- dict_value: 对应的运营提成金额（元）
INSERT INTO dictionary (dict_type, dict_label, dict_value, remark, sort, status)
VALUES
('operation_commission', '正常订单', '8', '正常订单的运营提成金额（元）', 1, 1),
('operation_commission', '活动订单', '5', '活动订单的运营提成金额（元）', 2, 1)
ON DUPLICATE KEY UPDATE
  dict_value=VALUES(dict_value),
  remark=VALUES(remark);

-- =====================================================
-- 4. 添加系统配置说明
-- =====================================================
SELECT '
运营提成配置说明：
1. 在系统字典管理中，dict_type 为 operation_commission 的记录为订单标签提成配置
2. dict_label 为订单标签名称（需与订单表中的 order_tag 一致）
3. dict_value 为该标签对应的运营提成金额（单位：元）
4. 可在后台字典管理中动态添加/修改订单标签的提成金额

提成生成规则：
1. 仅新学员订单（is_new_student = 1）才生成运营提成
2. 客户必须有绑定运营人员（operator_id 不为空）
3. 订单必须有标签（order_tag 不为空）且该标签在字典中配置了提成金额
4. 满足以上3个条件才自动创建运营提成记录
' as message;

SELECT '✅ 运营管理模块调整完成！' as status;
