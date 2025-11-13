-- ================================================================
-- 创建AI提示词配置表
-- 用于存储所有AI功能的提示词和参数配置
-- ================================================================

USE education_crm;

CREATE TABLE IF NOT EXISTS `ai_prompt_configs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `scenario_key` varchar(50) NOT NULL COMMENT '场景唯一标识',
  `scenario_name` varchar(100) NOT NULL COMMENT '场景名称',
  `scenario_category` varchar(50) NOT NULL COMMENT '场景分类',
  `model_provider` enum('deepseek','doubao') NOT NULL COMMENT 'AI供应商',
  `model_name` varchar(100) DEFAULT NULL COMMENT '具体模型名称',
  `prompt_content` text NOT NULL COMMENT '提示词内容',
  `system_prompt` text COMMENT '系统提示词',
  `temperature` decimal(3,2) DEFAULT 0.30 COMMENT '温度参数',
  `max_tokens` int DEFAULT 2000 COMMENT '最大token数',
  `variables` json DEFAULT NULL COMMENT '支持的变量列表',
  `variable_description` text COMMENT '变量说明',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `version` int NOT NULL DEFAULT '1' COMMENT '版本号',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_provider` (`scenario_key`, `model_provider`),
  KEY `idx_category` (`scenario_category`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI提示词配置表';
