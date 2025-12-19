-- 创建AI提示词配置表
CREATE TABLE IF NOT EXISTS `ai_script_prompt_config` (
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
  CONSTRAINT `fk_prompt_config_scenario` FOREIGN KEY (`scenario_id`) REFERENCES `ai_script_scenario` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prompt_config_technique` FOREIGN KEY (`technique_id`) REFERENCES `ai_script_technique` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prompt_config_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_prompt_config_updater` FOREIGN KEY (`updated_by`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术提示词配置';

-- 插入默认配置
INSERT INTO `ai_script_prompt_config` (`function_type`, `config_name`, `system_prompt`, `user_prompt_template`, `temperature`, `max_tokens`, `knowledge_weight`, `variables`, `created_by`, `updated_by`) VALUES
('deal_assist', '帮你谈单-默认配置', '你是一位专业的销售顾问，擅长根据客户情况生成有效的销售话术。请基于提供的场景和技巧，生成符合客户特点的沟通内容。', '功能类型：{{functionType}}\n客户信息：{{customerName}}（{{industry}}，{{position}}）\n场景：{{scenario}}\n技巧：{{technique}}\n客户痛点：{{painPoint}}\n沟通目标：{{communicationGoal}}\n请生成相应的销售话术。', 0.70, 2000, 0.70, '["customerName", "industry", "position", "scenario", "technique", "painPoint", "communicationGoal"]', 1, NULL),
('reply_assist', '帮你回复-默认配置', '你是一位专业的客服顾问，擅长针对客户的疑问和异议，生成得体且有效的回复话术。', '功能类型：{{functionType}}\n客户提问：{{customerQuestion}}\n客户背景：{{customerName}}（{{industry}}）\n场景：{{scenario}}\n技巧：{{technique}}\n请生成专业回复。', 0.80, 2000, 0.60, '["customerQuestion", "customerName", "industry", "scenario", "technique"]', 1, NULL),
('script_polish', '话术润色-默认配置', '你是一位专业的文案编辑，擅长润色和优化销售话术，使其更加专业、流畅和有说服力。', '应用场景：{{applicationScenario}}\n润色目标：{{polishGoal}}\n原始话术：{{originalScript}}\n请润色优化。', 0.60, 1500, 0.50, '["applicationScenario", "polishGoal", "originalScript"]', 1, NULL),
('opening_lines', '开场白生成-默认配置', '你是一位资深的销售专家，擅长根据不同场景创作吸引人的开场白，快速建立与客户的良好沟通。', '场景类型：{{scenarioType}}\n客户背景：{{customerBackground}}\n技巧：{{technique}}\n沟通目标：{{goal}}\n请生成开场白。', 0.80, 1000, 0.60, '["scenarioType", "customerBackground", "technique", "goal"]', 1, NULL);