-- ========================================
-- AI话术助手完整初始化脚本
-- 包含所有表结构、索引、初始数据
-- ========================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. 创建AI话术推荐表
-- ========================================
DROP TABLE IF EXISTS `ai_script_recommendation`;
CREATE TABLE `ai_script_recommendation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `conversation_id` int NOT NULL COMMENT '来源对话ID',
  `message_id` int NOT NULL COMMENT '来源消息ID',
  `script_content` text NOT NULL COMMENT '话术内容',
  `function_type` enum('deal_assist','reply_assist','script_polish','opening_lines') NOT NULL COMMENT '功能类型',
  `scenario_id` int DEFAULT NULL COMMENT '场景ID',
  `technique_id` int DEFAULT NULL COMMENT '技巧ID',
  `ai_quality_score` decimal(3,2) DEFAULT '0.00' COMMENT 'AI质量评分',
  `user_feedback` enum('like','dislike','neutral') DEFAULT 'neutral' COMMENT '用户反馈',
  `usage_count` int DEFAULT '0' COMMENT '使用次数',
  `recommend_reason` varchar(500) DEFAULT NULL COMMENT '推荐原因',
  `status` enum('pending','approved','rejected') DEFAULT 'pending' COMMENT '审核状态',
  `approved_by` int DEFAULT NULL COMMENT '审核人',
  `approved_at` datetime DEFAULT NULL COMMENT '审核时间',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_function_type` (`function_type`),
  KEY `idx_status` (`status`),
  KEY `idx_source_conversation` (`conversation_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_recommendation_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `ai_script_conversation` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendation_message` FOREIGN KEY (`message_id`) REFERENCES `ai_script_message` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendation_approver` FOREIGN KEY (`approved_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='话术推荐';

-- ========================================
-- 2. 创建AI提示词配置表
-- ========================================
DROP TABLE IF EXISTS `ai_script_prompt_config`;
CREATE TABLE `ai_script_prompt_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `function_type` enum('deal_assist','reply_assist','script_polish','opening_lines') NOT NULL COMMENT '功能类型',
  `scenario_id` int DEFAULT NULL COMMENT '场景ID',
  `technique_id` int DEFAULT NULL COMMENT '技巧ID',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `system_prompt` text COMMENT '系统提示词',
  `user_prompt_template` text COMMENT '用户提示词模板',
  `temperature` decimal(3,2) DEFAULT '0.70' COMMENT '温度值',
  `max_tokens` int DEFAULT '2000' COMMENT '最大Token数',
  `knowledge_weight` decimal(3,2) DEFAULT '0.70' COMMENT '知识库权重',
  `variables` json DEFAULT NULL COMMENT '支持变量',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_by` int NOT NULL COMMENT '创建人',
  `updated_by` int DEFAULT NULL COMMENT '更新人',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_function_type` (`function_type`),
  KEY `idx_scenario_id` (`scenario_id`),
  KEY `idx_technique_id` (`technique_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_prompt_config_scenario` FOREIGN KEY (`scenario_id`) REFERENCES `ai_script_scenario` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prompt_config_technique` FOREIGN KEY (`technique_id`) REFERENCES `ai_script_technique` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prompt_config_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_prompt_config_updater` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术提示词配置';

-- ========================================
-- 3. 扩展现有表结构
-- ========================================

-- 扩展对话表，添加AI配置和思考过程
ALTER TABLE `ai_script_conversation`
ADD COLUMN `customer_metadata` json COMMENT '客户元数据' AFTER `technique_id`,
ADD COLUMN `ai_config_id` int DEFAULT NULL COMMENT '使用的AI配置ID' AFTER `customer_metadata`,
ADD COLUMN `thinking_process` text COMMENT 'AI思考过程' AFTER `ai_config_id`,
ADD COLUMN `knowledge_sources` json COMMENT '知识来源' AFTER `thinking_process`,
ADD INDEX `idx_ai_config_id` (`ai_config_id`);

-- 扩展消息表，添加深度思考相关字段
ALTER TABLE `ai_script_message`
ADD COLUMN `thinking_process` text COMMENT 'AI思考过程' AFTER `content`,
ADD COLUMN `confidence_score` decimal(3,2) DEFAULT '0.00' COMMENT '置信度' AFTER `thinking_process`,
ADD COLUMN `processing_time` int DEFAULT '0' COMMENT '处理时间(毫秒)' AFTER `confidence_score`,
ADD INDEX `idx_confidence_score` (`confidence_score`);

-- ========================================
-- 4. 初始化默认AI配置
-- ========================================
INSERT INTO `ai_script_prompt_config` (`function_type`, `config_name`, `system_prompt`, `user_prompt_template`, `temperature`, `max_tokens`, `knowledge_weight`, `variables`, `created_by`, `updated_by`) VALUES
('deal_assist', '帮你谈单-默认配置', '你是一位专业的销售顾问，擅长根据客户情况生成有效的销售话术。请基于提供的场景和技巧，生成符合客户特点的沟通内容。', '功能类型：{{functionType}}\n客户信息：{{customerName}}（{{industry}}，{{position}}）\n场景：{{scenario}}\n技巧：{{technique}}\n客户痛点：{{painPoint}}\n沟通目标：{{communicationGoal}}\n请生成相应的销售话术。', 0.70, 2000, 0.70, JSON_ARRAY('customerName', 'industry', 'position', 'scenario', 'technique', 'painPoint', 'communicationGoal'), 1, NULL),
('reply_assist', '帮你回复-默认配置', '你是一位专业的客服顾问，擅长针对客户的疑问和异议，生成得体且有效的回复话术。', '功能类型：{{functionType}}\n客户提问：{{customerQuestion}}\n客户背景：{{customerName}}（{{industry}}）\n场景：{{scenario}}\n技巧：{{technique}}\n请生成专业回复。', 0.80, 2000, 0.60, JSON_ARRAY('customerQuestion', 'customerName', 'industry', 'scenario', 'technique'), 1, NULL),
('script_polish', '话术润色-默认配置', '你是一位专业的文案编辑，擅长润色和优化销售话术，使其更加专业、流畅和有说服力。', '应用场景：{{applicationScenario}}\n润色目标：{{polishGoal}}\n原始话术：{{originalScript}}\n请润色优化。', 0.60, 1500, 0.50, JSON_ARRAY('applicationScenario', 'polishGoal', 'originalScript'), 1, NULL),
('opening_lines', '开场白生成-默认配置', '你是一位资深的销售专家，擅长根据不同场景创作吸引人的开场白，快速建立与客户的良好沟通。', '场景类型：{{scenarioType}}\n客户背景：{{customerBackground}}\n技巧：{{technique}}\n沟通目标：{{goal}}\n请生成开场白。', 0.80, 1000, 0.60, JSON_ARRAY('scenarioType', 'customerBackground', 'technique', 'goal'), 1, NULL);

-- ========================================
-- 5. 创建测试数据（可选）
-- ========================================

-- 插入一些测试推荐记录（如果需要）
INSERT INTO `ai_script_recommendation` (`conversation_id`, `message_id`, `script_content`, `function_type`, `ai_quality_score`, `recommend_reason`, `status`, `created_at`) VALUES
(1, 1, '基于您的产品特性，我建议我们可以从解决您当前面临的效率问题入手。我们的方案能够帮助您提升30%的工作效率，您是否愿意花10分钟时间了解一下具体如何实现？', 'deal_assist', 0.85, '高质量话术，逻辑清晰，直击痛点', 'approved', NOW()),
(2, 3, '关于您提到的价格问题，我完全理解您的考虑。让我给您算一笔账：虽然我们的投入看起来高一些，但长期来看，每年能为您节省约5万元的人力成本，大概8个月就能收回投资。您觉得这样的回报率如何？', 'reply_assist', 0.90, '优秀的价格谈判话术，用数据说话', 'approved', NOW()),
(3, 5, '请问您目前在销售过程中遇到的最大挑战是什么？是客户获取、转化率提升，还是团队管理方面的问题？', 'opening_lines', 0.80, '很好的需求挖掘开场白', 'pending', NOW());

-- ========================================
-- 6. 创建视图（可选）
-- ========================================

-- 创建推荐统计视图
CREATE OR REPLACE VIEW `v_recommendation_stats` AS
SELECT
  function_type,
  status,
  COUNT(*) as count,
  AVG(ai_quality_score) as avg_score,
  SUM(usage_count) as total_usage
FROM ai_script_recommendation
GROUP BY function_type, status;

-- ========================================
-- 7. 添加索引优化
-- ========================================

-- 为常用查询添加复合索引
ALTER TABLE `ai_script_recommendation`
ADD INDEX `idx_function_status` (`function_type`, `status`),
ADD INDEX `idx_created_status` (`created_at`, `status`),
ADD INDEX `idx_quality_score` (`ai_quality_score`);

ALTER TABLE `ai_script_prompt_config`
ADD INDEX `idx_function_active` (`function_type`, `is_active`),
ADD INDEX `idx_created_active` (`created_at`, `is_active`);

-- ========================================
-- 8. 设置触发器（可选）
-- ========================================

-- 创建自动更新审核时间的触发器
DELIMITER //
CREATE TRIGGER `tr_recommendation_approve_time`
BEFORE UPDATE ON `ai_script_recommendation`
FOR EACH ROW
BEGIN
  IF OLD.status <> 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    SET NEW.approved_at = CURRENT_TIMESTAMP;
  END IF;
END//
DELIMITER ;

-- ========================================
-- 恢复外键检查
-- ========================================
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 初始化完成提示
-- ========================================
SELECT 'AI话术助手初始化完成！' as message;
SELECT CONCAT('创建了 ', (SELECT COUNT(*) FROM ai_script_prompt_config), ' 个默认AI配置') as config_count;
SELECT CONCAT('创建了 ', (SELECT COUNT(*) FROM ai_script_recommendation), ' 条测试推荐记录') as recommendation_count;