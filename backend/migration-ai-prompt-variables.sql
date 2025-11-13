-- ================================================================
-- 创建AI提示词变量配置表
-- 用于结构化管理每个AI功能的变量字段
-- ================================================================

USE education_crm;

CREATE TABLE IF NOT EXISTS `ai_prompt_variables` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `prompt_config_id` int NOT NULL COMMENT 'AI提示词配置ID（关联ai_prompt_configs表）',
  `scenario_key` varchar(50) NOT NULL COMMENT '场景标识（冗余字段，方便查询）',
  `variable_key` varchar(50) NOT NULL COMMENT '变量标识（如chatText、customerName）',
  `variable_name` varchar(100) NOT NULL COMMENT '变量名称（如聊天记录、客户姓名）',
  `variable_description` text COMMENT '变量说明',
  `data_type` varchar(20) DEFAULT 'text' COMMENT '数据类型：text/number/date/json/array',
  `is_required` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否必填',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `default_value` varchar(500) DEFAULT NULL COMMENT '默认值',
  `example_value` text COMMENT '示例值',
  `validation_rule` varchar(500) DEFAULT NULL COMMENT '验证规则',
  `display_order` int NOT NULL DEFAULT '0' COMMENT '显示顺序',
  `category` varchar(50) DEFAULT NULL COMMENT '变量分类（基础信息/客户信息/系统自动等）',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_variable` (`prompt_config_id`, `variable_key`),
  KEY `idx_scenario_key` (`scenario_key`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_prompt_variables_config` FOREIGN KEY (`prompt_config_id`) REFERENCES `ai_prompt_configs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI提示词变量配置表';
