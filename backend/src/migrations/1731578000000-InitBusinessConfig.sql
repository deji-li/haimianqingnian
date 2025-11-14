-- 初始化业务配置数据
-- 用于订单同步、字段映射等功能

-- 订单同步配置和默认值配置
INSERT INTO `business_config` (`config_key`, `config_value`, `config_category`, `description`) VALUES
('order_sync.enabled', 'true', 'business_rules', '是否启用订单自动同步'),
('order_sync.sync_range_days', '7', 'business_rules', '订单同步时间范围（天）'),
('order_sync.auto_create_campus', 'true', 'business_rules', '自动创建不存在的校区'),
('order_sync.sync_customer_info', 'true', 'business_rules', '是否同步更新客户信息'),
('order_sync.cron_expression', '0 */2 * * *', 'business_rules', '定时同步Cron表达式（每2小时一次）'),
('default_values.customer_intent', '中意向', 'default_values', '新客户默认意向度'),
('default_values.lifecycle_stage', '线索', 'default_values', '新客户默认生命周期')
ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `description` = VALUES(`description`);

-- 字段映射配置（JSON类型，使用CAST）
INSERT INTO `business_config` (`config_key`, `config_value`, `config_category`, `description`) VALUES
('field_mapping.order_status', CAST('{"1":"待支付","2":"已支付","3":"已完成","4":"已取消"}' AS JSON), 'field_mapping', '订单状态映射'),
('field_mapping.payment_method', CAST('{"1":"微信支付","2":"支付宝","3":"银行卡","4":"现金"}' AS JSON), 'field_mapping', '支付方式映射')
ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `description` = VALUES(`description`);
