-- 创建提成方案表
CREATE TABLE IF NOT EXISTS `commission_schemes` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '方案ID',
  `name` VARCHAR(100) NOT NULL COMMENT '方案名称',
  `type` ENUM('fixed', 'percentage', 'tiered', 'custom') NOT NULL DEFAULT 'fixed' COMMENT '方案类型：fixed-固定金额，percentage-百分比，tiered-阶梯制，custom-自定义',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级（数值越大优先级越高）',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `description` TEXT COMMENT '方案描述',
  `rules` JSON NOT NULL COMMENT '规则配置（JSON格式）',
  `conditions` JSON COMMENT '匹配条件（JSON格式）',
  `created_by` INT COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status_priority` (`status`, `priority` DESC),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提成方案表';

-- 为订单表添加提成相关字段
ALTER TABLE `orders`
ADD COLUMN `order_tag` VARCHAR(50) COMMENT '订单标签（用于匹配提成方案）' AFTER `source`,
ADD COLUMN `commission_scheme_id` INT COMMENT '匹配的提成方案ID' AFTER `order_tag`,
ADD COLUMN `commission_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '提成金额' AFTER `commission_scheme_id`,
ADD COLUMN `commission_calculated_at` DATETIME COMMENT '提成计算时间' AFTER `commission_amount`;

-- 添加索引
ALTER TABLE `orders`
ADD INDEX `idx_commission_scheme` (`commission_scheme_id`),
ADD INDEX `idx_order_tag` (`order_tag`);

-- 插入示例提成方案数据
INSERT INTO `commission_schemes` (`name`, `type`, `priority`, `status`, `description`, `rules`, `conditions`) VALUES
('普通订单提成', 'percentage', 10, 1, '普通订单按销售额的8%计算提成',
 '{"percentage": 8, "minAmount": 0, "maxAmount": null}',
 '{"orderTags": ["normal", "regular"], "minOrderAmount": 0}'),

('活动订单提成', 'fixed', 20, 1, '活动订单固定提成500元',
 '{"amount": 500}',
 '{"orderTags": ["promotion", "campaign"], "minOrderAmount": 0}'),

('高额订单阶梯提成', 'tiered', 30, 1, '订单金额越高，提成比例越高',
 '{"tiers": [{"minAmount": 0, "maxAmount": 10000, "percentage": 5}, {"minAmount": 10001, "maxAmount": 30000, "percentage": 8}, {"minAmount": 30001, "maxAmount": null, "percentage": 12}]}',
 '{"orderTags": ["premium", "vip"], "minOrderAmount": 0}'),

('新课程推广提成', 'fixed', 25, 1, '新课程推广每单提成800元',
 '{"amount": 800}',
 '{"orderTags": ["new_course"], "courses": ["Python编程", "AI人工智能"]}'),

('续费订单提成', 'percentage', 15, 1, '续费订单按6%计算提成',
 '{"percentage": 6}',
 '{"orderTags": ["renewal"], "minOrderAmount": 0}');

-- 创建提成计算记录表（用于审计）
CREATE TABLE IF NOT EXISTS `commission_calculations` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `order_id` INT NOT NULL COMMENT '订单ID',
  `scheme_id` INT NOT NULL COMMENT '提成方案ID',
  `scheme_name` VARCHAR(100) NOT NULL COMMENT '方案名称（快照）',
  `order_amount` DECIMAL(10, 2) NOT NULL COMMENT '订单金额',
  `commission_amount` DECIMAL(10, 2) NOT NULL COMMENT '提成金额',
  `calculation_rule` JSON NOT NULL COMMENT '计算规则（快照）',
  `sales_id` INT NOT NULL COMMENT '销售人员ID',
  `calculate_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_sales_id` (`sales_id`),
  INDEX `idx_scheme_id` (`scheme_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提成计算记录表';
