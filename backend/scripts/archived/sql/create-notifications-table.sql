-- 创建通知表
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` int NOT NULL COMMENT '接收用户ID',
  `type` enum('info','success','warning','error','remind') NOT NULL DEFAULT 'info' COMMENT '通知类型',
  `title` varchar(200) NOT NULL COMMENT '通知标题',
  `content` text NOT NULL COMMENT '通知内容',
  `link` varchar(500) DEFAULT NULL COMMENT '跳转链接',
  `is_read` tinyint NOT NULL DEFAULT '0' COMMENT '是否已读：0-未读，1-已读',
  `read_time` timestamp NULL DEFAULT NULL COMMENT '阅读时间',
  `source_type` varchar(50) DEFAULT NULL COMMENT '来源类型：automation-自动化，system-系统，manual-手动',
  `source_id` int DEFAULT NULL COMMENT '来源ID',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_source` (`source_type`,`source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统通知表';

-- 为现有用户创建一些测试通知（可选）
-- INSERT INTO notifications (user_id, type, title, content, source_type, source_id)
-- VALUES (1, 'info', '欢迎使用系统', '欢迎使用海绵青年CRM系统！', 'system', NULL);
