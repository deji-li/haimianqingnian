-- 创建用户-校区多对多关联表
CREATE TABLE IF NOT EXISTS `user_campus` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `campus_id` INT NOT NULL COMMENT '校区ID',
  `is_primary` TINYINT DEFAULT 0 COMMENT '是否为主校区',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_user_campus` (`user_id`, `campus_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_campus_id` (`campus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户校区关联表';

-- 迁移现有数据（将users表中的campus_id迁移到user_campus表）
INSERT INTO `user_campus` (`user_id`, `campus_id`, `is_primary`)
SELECT `id`, `campus_id`, 1
FROM `users`
WHERE `campus_id` IS NOT NULL;

-- 备注：暂不删除users表的campus_id字段，保持向后兼容
-- 如需删除，请在确认数据迁移成功后执行：
-- ALTER TABLE `users` DROP COLUMN `campus_id`;
