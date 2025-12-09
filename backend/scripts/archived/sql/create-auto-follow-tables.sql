-- 阶段式自动回访功能 - 数据库迁移脚本
-- 执行时间: 2025-11-24

-- ==================== 1. 创建自动回访配置表 ====================
CREATE TABLE IF NOT EXISTS `auto_follow_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_intent` VARCHAR(20) NOT NULL COMMENT '客户意向:极高意向/高意向/中意向/低意向/无意向/待评估/成交',
  `round_number` TINYINT NOT NULL COMMENT '回访轮次:1-5',
  `days_interval` INT NOT NULL COMMENT '间隔天数',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用:1启用/0禁用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_intent_round` (`customer_intent`, `round_number`),
  INDEX `idx_customer_intent` (`customer_intent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自动回访配置表';

-- ==================== 2. 扩展customers表 ====================
ALTER TABLE `customers`
ADD COLUMN `auto_follow_enabled` TINYINT DEFAULT 1 COMMENT '是否启用自动回访:1启用/0禁用' AFTER `external_order_ids`,
ADD COLUMN `auto_follow_round` TINYINT DEFAULT 0 COMMENT '当前自动回访轮次:0-5(0表示未开始)' AFTER `auto_follow_enabled`,
ADD COLUMN `manual_follow_set` TINYINT DEFAULT 0 COMMENT '是否手动设置过回访时间:1是/0否' AFTER `auto_follow_round`,
ADD COLUMN `last_auto_follow_time` DATETIME NULL COMMENT '上次自动回访计算时间' AFTER `manual_follow_set`;

-- ==================== 3. 更新完整的客户意向度字典 ====================
DELETE FROM dictionary WHERE dict_type='customer_intent';

INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('customer_intent', '极高意向', '极高意向', 1, 1, '客户意向度非常高，即将成交'),
('customer_intent', '高意向', '高意向', 2, 1, '客户意向度高，积极跟进'),
('customer_intent', '中意向', '中意向', 3, 1, '客户意向度一般，需要培育'),
('customer_intent', '低意向', '低意向', 4, 1, '客户意向度较低，长期跟进'),
('customer_intent', '无意向', '无意向', 5, 1, '客户无意向'),
('customer_intent', '待评估', '待评估', 6, 1, '新客户，意向度待评估'),
('customer_intent', '成交', '成交', 7, 1, '客户已成交，需要定期回访维护');

-- ==================== 4. 初始化默认配置数据 ====================

-- 极高意向: 1天 → 3天 → 7天 → 15天 → 30天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('极高意向', 1, 1, 1),
('极高意向', 2, 3, 1),
('极高意向', 3, 7, 1),
('极高意向', 4, 15, 1),
('极高意向', 5, 30, 1);

-- 高意向: 3天 → 7天 → 15天 → 20天 → 30天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('高意向', 1, 3, 1),
('高意向', 2, 7, 1),
('高意向', 3, 15, 1),
('高意向', 4, 20, 1),
('高意向', 5, 30, 1);

-- 中意向: 7天 → 15天 → 30天 → 30天 → 30天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('中意向', 1, 7, 1),
('中意向', 2, 15, 1),
('中意向', 3, 30, 1),
('中意向', 4, 30, 1),
('中意向', 5, 30, 1);

-- 低意向: 15天 → 30天 → 60天 → 60天 → 60天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('低意向', 1, 15, 1),
('低意向', 2, 30, 1),
('低意向', 3, 60, 1),
('低意向', 4, 60, 1),
('低意向', 5, 60, 1);

-- 无意向: 30天 → 60天 → 90天 → 90天 → 90天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('无意向', 1, 30, 1),
('无意向', 2, 60, 1),
('无意向', 3, 90, 1),
('无意向', 4, 90, 1),
('无意向', 5, 90, 1);

-- 待评估: 3天 → 7天 → 15天 → 30天 → 30天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('待评估', 1, 3, 1),
('待评估', 2, 7, 1),
('待评估', 3, 15, 1),
('待评估', 4, 30, 1),
('待评估', 5, 30, 1);

-- 成交: 30天 → 60天 → 90天 → 180天 → 180天
INSERT INTO `auto_follow_configs` (`customer_intent`, `round_number`, `days_interval`, `is_active`) VALUES
('成交', 1, 30, 1),
('成交', 2, 60, 1),
('成交', 3, 90, 1),
('成交', 4, 180, 1),
('成交', 5, 180, 1);

-- ==================== 5. 数据验证 ====================
SELECT
  customer_intent AS '意向度',
  GROUP_CONCAT(
    CONCAT('第', round_number, '轮:', days_interval, '天')
    ORDER BY round_number
    SEPARATOR ' → '
  ) AS '回访周期'
FROM auto_follow_configs
WHERE is_active = 1
GROUP BY customer_intent
ORDER BY
  CASE customer_intent
    WHEN '成交' THEN 1
    WHEN '极高意向' THEN 2
    WHEN '高意向' THEN 3
    WHEN '中意向' THEN 4
    WHEN '低意向' THEN 5
    WHEN '无意向' THEN 6
    WHEN '待评估' THEN 7
  END;

SELECT '✓ 自动回访功能数据库迁移完成' AS '状态';
