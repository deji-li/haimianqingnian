-- ========================================
-- AI营销助手数据库表结构
-- 创建时间：2025-11-20
-- ========================================

-- 1. 营销文案历史记录表
CREATE TABLE IF NOT EXISTS `ai_marketing_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `content_type` VARCHAR(50) NOT NULL COMMENT '场景类型：moments/wechat/douyin/xiaohongshu/video_script/official',
  `selected_pain_points` JSON COMMENT '选中的痛点',
  `selected_needs` JSON COMMENT '选中的需求',
  `selected_interests` JSON COMMENT '选中的兴趣点',
  `config_params` JSON COMMENT '配置参数（目的/主题、风格、字数/时长等）',
  `generated_content` TEXT COMMENT '生成的文案',
  `knowledge_used` JSON COMMENT '使用的知识库内容',
  `generation_mode` ENUM('knowledge_ai', 'pure_ai') DEFAULT 'knowledge_ai' COMMENT '生成模式',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否有效：1-是，0-否（已删除）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_content_type` (`content_type`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_user_type` (`user_id`, `content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI营销文案历史记录表';

-- 2. 文案反馈表
CREATE TABLE IF NOT EXISTS `ai_marketing_feedback` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `history_id` INT NOT NULL COMMENT '历史记录ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `rating` TINYINT COMMENT '评分：1-点踩，2-点赞',
  `feedback_type` VARCHAR(50) COMMENT '反馈类型：内容不准确/风格不对/太短了/太长了/其他问题',
  `suggestion` TEXT COMMENT '优化建议',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_history_id` (`history_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_create_time` (`create_time`),
  CONSTRAINT `fk_feedback_history` FOREIGN KEY (`history_id`) REFERENCES `ai_marketing_history`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI营销文案反馈表';

-- 3. 客户洞察数据表（如果需要独立存储）
CREATE TABLE IF NOT EXISTS `ai_customer_insights` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `customer_id` INT NOT NULL COMMENT '客户ID',
  `user_id` INT NOT NULL COMMENT '负责人ID',
  `insight_type` ENUM('pain_point', 'need', 'interest') NOT NULL COMMENT '洞察类型：痛点/需求/兴趣点',
  `content` VARCHAR(500) NOT NULL COMMENT '洞察内容',
  `mention_count` INT DEFAULT 1 COMMENT '提及次数',
  `source` VARCHAR(50) COMMENT '来源：chat_analysis/manual',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否有效：1-是，0-否',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_insight_type` (`insight_type`),
  INDEX `idx_mention_count` (`mention_count` DESC),
  UNIQUE KEY `uk_customer_type_content` (`customer_id`, `insight_type`, `content`(200))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户洞察数据表';

-- ========================================
-- 完成
-- ========================================
-- 说明：
-- 1. 创建了3个核心表
-- 2. ai_marketing_history：存储所有生成的文案历史
-- 3. ai_marketing_feedback：存储用户反馈
-- 4. ai_customer_insights：存储客户洞察数据（痛点/需求/兴趣点）
-- 5. 所有表使用utf8mb4字符集
-- 6. 添加了必要的索引优化查询性能
-- ========================================
