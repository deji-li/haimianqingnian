-- ========================================
-- AI话术助手数据库表结构
-- ========================================

-- 1. 对话会话表
CREATE TABLE IF NOT EXISTS `ai_script_conversation` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '对话ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `customer_id` INT DEFAULT NULL COMMENT '客户ID（可选）',
  `function_type` ENUM('deal_assist', 'reply_assist', 'script_polish', 'opening_lines') NOT NULL COMMENT '功能类型',
  `scenario_id` INT DEFAULT NULL COMMENT '场景ID',
  `technique_id` INT DEFAULT NULL COMMENT '技巧ID',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '对话标题（AI生成摘要）',
  `last_message_time` DATETIME DEFAULT NULL COMMENT '最后消息时间',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_function` (`user_id`, `function_type`, `is_active`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_last_message` (`last_message_time`),
  INDEX `idx_customer` (`customer_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术对话会话表';

-- 2. 对话消息表
CREATE TABLE IF NOT EXISTS `ai_script_message` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` INT NOT NULL COMMENT '对话ID',
  `role` ENUM('user', 'assistant') NOT NULL COMMENT '角色',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `thinking_process` TEXT DEFAULT NULL COMMENT 'AI思考过程',
  `knowledge_source` JSON DEFAULT NULL COMMENT '知识来源（知识库ID、标题等）',
  `source_type` ENUM('knowledge_direct', 'knowledge_hybrid', 'ai_generate') DEFAULT NULL COMMENT '来源类型',
  `suggestions` JSON DEFAULT NULL COMMENT '改进方向建议',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_role` (`role`),
  FOREIGN KEY (`conversation_id`) REFERENCES `ai_script_conversation`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术对话消息表';

-- 3. 场景配置表
CREATE TABLE IF NOT EXISTS `ai_script_scenario` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '场景ID',
  `function_type` ENUM('deal_assist', 'reply_assist', 'opening_lines') NOT NULL COMMENT '功能类型',
  `scenario_name` VARCHAR(50) NOT NULL COMMENT '场景名称',
  `scene_category` VARCHAR(50) DEFAULT NULL COMMENT '映射到知识库的sceneCategory',
  `scenario_desc` TEXT DEFAULT NULL COMMENT '场景描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_function_name` (`function_type`, `scenario_name`),
  INDEX `idx_function_type` (`function_type`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术场景配置表';

-- 4. 技巧配置表
CREATE TABLE IF NOT EXISTS `ai_script_technique` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '技巧ID',
  `scenario_id` INT NOT NULL COMMENT '场景ID',
  `technique_name` VARCHAR(100) NOT NULL COMMENT '技巧名称',
  `technique_desc` TEXT DEFAULT NULL COMMENT '技巧描述',
  `keywords` VARCHAR(500) DEFAULT NULL COMMENT '用于知识库匹配的关键词（逗号分隔）',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_scenario` (`scenario_id`, `is_active`),
  FOREIGN KEY (`scenario_id`) REFERENCES `ai_script_scenario`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术技巧配置表';

-- 5. 反馈表
CREATE TABLE IF NOT EXISTS `ai_script_feedback` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '反馈ID',
  `message_id` INT NOT NULL COMMENT '消息ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `feedback_type` ENUM('like', 'dislike') NOT NULL COMMENT '反馈类型',
  `feedback_reason` TEXT DEFAULT NULL COMMENT '反馈原因',
  `is_learned` BOOLEAN DEFAULT FALSE COMMENT '是否已学习到知识库',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY `uk_message_user` (`message_id`, `user_id`),
  INDEX `idx_message` (`message_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_learned` (`is_learned`),
  FOREIGN KEY (`message_id`) REFERENCES `ai_script_message`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术反馈表';

-- 6. 更新字典表：添加功能类型字典
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_script_function_type', '帮你谈单', 'deal_assist', 1, 1, 'AI话术功能类型'),
('ai_script_function_type', '帮你回复', 'reply_assist', 2, 1, 'AI话术功能类型'),
('ai_script_function_type', '话术润色', 'script_polish', 3, 1, 'AI话术功能类型'),
('ai_script_function_type', '开场白', 'opening_lines', 4, 1, 'AI话术功能类型')
ON DUPLICATE KEY UPDATE `dict_label` = VALUES(`dict_label`);
