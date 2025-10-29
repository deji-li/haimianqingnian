-- 创建销售目标表
CREATE TABLE IF NOT EXISTS `sales_target` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID（销售人员）',
  `target_type` VARCHAR(20) NOT NULL COMMENT '目标类型：monthly(月度)、quarterly(季度)、yearly(年度)',
  `target_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '目标金额',
  `actual_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '实际完成金额',
  `target_count` INT NOT NULL DEFAULT 0 COMMENT '目标订单数',
  `actual_count` INT NOT NULL DEFAULT 0 COMMENT '实际完成订单数',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE NOT NULL COMMENT '结束日期',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-未开始，1-进行中，2-已完成，3-已过期',
  `remark` TEXT COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_target_type` (`target_type`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_end_date` (`end_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售目标表';

-- 添加目标类型字典
INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('target_type', '月度目标', 'monthly', 1, 1, '每月销售目标'),
('target_type', '季度目标', 'quarterly', 2, 1, '每季度销售目标'),
('target_type', '年度目标', 'yearly', 3, 1, '每年销售目标');

-- 添加目标状态字典
INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('target_status', '未开始', '0', 1, 1, '目标未开始'),
('target_status', '进行中', '1', 2, 1, '目标进行中'),
('target_status', '已完成', '2', 3, 1, '目标已完成'),
('target_status', '已过期', '3', 4, 1, '目标已过期');
