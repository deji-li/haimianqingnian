-- 扩展用户表，添加上下级关系
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `superior_id` INT DEFAULT NULL COMMENT '上级用户ID（直属领导）' AFTER `role_id`;
ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_superior_id` (`superior_id`);

-- 示例：为普通销售设置上级为销售经理
-- UPDATE users SET superior_id = (SELECT id FROM users WHERE role = 'sales_manager' LIMIT 1) WHERE role = 'sales';
