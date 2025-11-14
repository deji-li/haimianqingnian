-- 初始化业务配置数据
-- 用于订单同步、字段映射等功能

-- 订单同步配置和默认值配置（config_value是JSON类型，使用JSON_QUOTE）
INSERT INTO `business_config` (`config_key`, `config_value`, `config_category`, `description`) VALUES
('order_sync.enabled', JSON_QUOTE('true'), 'business_rules', '是否启用订单自动同步'),
('order_sync.sync_range_days', JSON_QUOTE('7'), 'business_rules', '订单同步时间范围（天）'),
('order_sync.auto_create_campus', JSON_QUOTE('true'), 'business_rules', '自动创建不存在的校区'),
('order_sync.sync_customer_info', JSON_QUOTE('true'), 'business_rules', '是否同步更新客户信息'),
('order_sync.cron_expression', JSON_QUOTE('0 */2 * * *'), 'business_rules', '定时同步Cron表达式（每2小时一次）'),
('default_values.customer_intent', JSON_QUOTE('中意向'), 'default_values', '新客户默认意向度'),
('default_values.lifecycle_stage', JSON_QUOTE('线索'), 'default_values', '新客户默认生命周期')
ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `description` = VALUES(`description`);
