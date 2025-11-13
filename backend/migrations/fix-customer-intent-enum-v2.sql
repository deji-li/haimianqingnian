-- 修复customer_intent字段的ENUM值（包含数据迁移）

-- 步骤1: 先将字段改为VARCHAR类型（临时）
ALTER TABLE `customers`
MODIFY COLUMN `customer_intent` VARCHAR(20) NOT NULL DEFAULT '中意向';

-- 步骤2: 更新现有数据
UPDATE `customers` SET `customer_intent` = '高意向' WHERE `customer_intent` = '高';
UPDATE `customers` SET `customer_intent` = '中意向' WHERE `customer_intent` = '中';
UPDATE `customers` SET `customer_intent` = '低意向' WHERE `customer_intent` = '低';

-- 步骤3: 将字段改回ENUM类型（新的值）
ALTER TABLE `customers`
MODIFY COLUMN `customer_intent`
ENUM('高意向', '中意向', '低意向', '无意向')
NOT NULL DEFAULT '中意向'
COMMENT '客户意向等级';
