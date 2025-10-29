-- 添加客户生命周期阶段字段
ALTER TABLE `customers`
ADD COLUMN `lifecycle_stage` VARCHAR(50) NULL DEFAULT '线索'
AFTER `customer_intent`;

-- 为现有客户设置默认值
UPDATE `customers`
SET `lifecycle_stage` = '线索'
WHERE `lifecycle_stage` IS NULL;
