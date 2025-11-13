-- 修复customer_intent字段的ENUM值
ALTER TABLE `customers`
MODIFY COLUMN `customer_intent`
ENUM('高意向', '中意向', '低意向', '无意向')
NOT NULL DEFAULT '中意向'
COMMENT '客户意向等级';
