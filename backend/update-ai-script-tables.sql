-- ============================================
-- AI话术助手数据库表结构优化脚本
-- ============================================

-- 1. 为技巧表添加prompt_template字段
ALTER TABLE `ai_script_technique`
ADD COLUMN `prompt_template` text COMMENT 'AI提示词模板' AFTER `technique_desc`;

-- 2. 为对��表添加扩展字段（用于存储更多信息）
ALTER TABLE `ai_script_conversation`
ADD COLUMN `customer_metadata` json COMMENT '客户元数据' AFTER `technique_id`,
ADD COLUMN `ai_config_id` int DEFAULT NULL COMMENT '使用的AI配置ID' AFTER `customer_metadata`,
ADD COLUMN `thinking_process` text COMMENT 'AI思考过程' AFTER `ai_config_id`,
ADD COLUMN `knowledge_sources` json COMMENT '知识来源' AFTER `thinking_process`;

-- 3. 为消息表添加扩展字段
ALTER TABLE `ai_script_message`
ADD COLUMN `thinking_process` text COMMENT 'AI思考过程' AFTER `content`,
ADD COLUMN `confidence_score` decimal(3,2) DEFAULT '0.00' COMMENT '置信度' AFTER `thinking_process`,
ADD COLUMN `processing_time` int DEFAULT '0' COMMENT '处理时间(毫秒)' AFTER `confidence_score`;

-- 4. 创建AI提示词配置表
CREATE TABLE IF NOT EXISTS `ai_script_prompt_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `function_type` enum('deal_assist','reply_assist','script_polish','opening_lines') NOT NULL COMMENT '功能类型',
  `scenario_id` int DEFAULT NULL COMMENT '场景ID',
  `technique_id` int DEFAULT NULL COMMENT '技巧ID',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `system_prompt` text COMMENT '系统提示词',
  `user_prompt_template` text COMMENT '用户提示词模板',
  `temperature` decimal(3,2) DEFAULT '0.7' COMMENT '温度值',
  `max_tokens` int DEFAULT '2000' COMMENT '最大Token数',
  `knowledge_weight` decimal(3,2) DEFAULT '0.7' COMMENT '知识库权重',
  `variables` json DEFAULT NULL COMMENT '支持变量',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `created_by` int NOT NULL COMMENT '创建人',
  `updated_by` int DEFAULT NULL COMMENT '更新人',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_function_type` (`function_type`),
  KEY `idx_scenario_id` (`scenario_id`),
  KEY `idx_technique_id` (`technique_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI话术提示词配置';

-- 5. 创建话术推荐表
CREATE TABLE IF NOT EXISTS `ai_script_recommendation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `source_conversation_id` int NOT NULL COMMENT '来源对话ID',
  `source_message_id` int NOT NULL COMMENT '来源消息ID',
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
  KEY `idx_source_conversation` (`source_conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='话术推荐';

SELECT '✅ 数据库表结构优化完成！' as result;