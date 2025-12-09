-- 简化的企业知识库数据库修复脚本

-- 1. 创建企业知识库主表
CREATE TABLE IF NOT EXISTS `enterprise_knowledge_base` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '知识标题/问题',
  `content` TEXT NOT NULL COMMENT '知识内容/答案',
  `keywords` VARCHAR(500) NULL COMMENT '关键词',
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `product_category` VARCHAR(50) NULL COMMENT '产品分类',
  `customer_type` VARCHAR(50) NULL COMMENT '客户类型',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',
  `relevance_score` DECIMAL(5,2) DEFAULT 0 COMMENT '相关度评分',
  `quality_score` DECIMAL(5,2) DEFAULT 0 COMMENT '质量评分',
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `positive_feedback_count` INT DEFAULT 0 COMMENT '正反馈次数',
  `negative_feedback_count` INT DEFAULT 0 COMMENT '负反馈次数',
  `source_type` ENUM('manual', 'ai_mining', 'industry_recommend', 'file_import') DEFAULT 'manual',
  `source_id` INT NULL COMMENT '来源记录ID',
  `creator_id` INT NULL COMMENT '创建人ID',
  `status` ENUM('active', 'inactive', 'pending_review') DEFAULT 'active',
  `priority` INT DEFAULT 0 COMMENT '优先级',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_status` (`status`),
  INDEX `idx_source_type` (`source_type`),
  INDEX `idx_quality_score` (`quality_score`),
  FULLTEXT INDEX `idx_search` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 创建待审核表
CREATE TABLE IF NOT EXISTS `knowledge_pending_review` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `question` VARCHAR(500) NOT NULL COMMENT '挖掘的问题',
  `answer` TEXT NOT NULL COMMENT '挖掘的答案',
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `product_category` VARCHAR(50) NULL COMMENT '产品分类',
  `customer_type` VARCHAR(50) NULL COMMENT '客户类型',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',
  `ai_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI质量评分',
  `confidence_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI置信度',
  `source_type` ENUM('chat_mining', 'industry_recommend') NULL,
  `source_chat_record_id` INT NULL COMMENT '来源聊天记录ID',
  `review_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `reviewer_id` INT NULL COMMENT '审核人ID',
  `review_time` DATETIME NULL COMMENT '审核时间',
  `mining_batch_id` VARCHAR(50) NULL COMMENT '挖掘批次ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_review_status` (`review_status`),
  INDEX `idx_ai_score` (`ai_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 创建行业问题库
CREATE TABLE IF NOT EXISTS `industry_question_library` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `industry_name` VARCHAR(100) NOT NULL COMMENT '行业名称',
  `question` VARCHAR(500) NOT NULL COMMENT '常见问题',
  `answer_template` TEXT NULL COMMENT '答案模板',
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',
  `source_type` ENUM('system_preset', 'ai_generate') DEFAULT 'system_preset',
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_industry` (`industry_name`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. 插入示例数据
INSERT IGNORE INTO `enterprise_knowledge_base`
(`title`, `content`, `scene_category`, `question_type`, `source_type`, `creator_id`, `quality_score`)
VALUES
('什么是AI助手？', 'AI助手是基于人工智能技术的智能客服系统，可以自动回答用户问题、提供个性化服务。', '企业介绍', '系统咨询', 'manual', 1, 90),
('如何联系我们？', '您可以通过以下方式联系我们：\n1. 电话：400-123-4567\n2. 邮箱：service@example.com\n3. 在线客服：工作时间 9:00-18:00', '服务咨询', '联系方式', 'manual', 1, 85);

INSERT IGNORE INTO `industry_question_library`
(`industry_name`, `question`, `answer_template`, `scene_category`, `question_type`, `source_type`)
VALUES
('教育', '你们的教学理念是什么？', '我们秉承【个性化教育】的理念，注重因材施教。', '企业介绍', '理念咨询', 'system_preset'),
('教育', '课程收费如何？', '我们的课程收费根据【课程类型】而定，具体请咨询课程顾问。', '价格咨询', '费用咨询', 'system_preset');

SELECT '企业知识库数据库创建完成！' AS status;