-- 创建AI API密钥配置表
CREATE TABLE IF NOT EXISTS `ai_api_keys` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `provider` enum('deepseek','doubao') NOT NULL COMMENT 'AI供应商',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥',
  `api_url` varchar(500) NOT NULL COMMENT 'API地址',
  `endpoint_id` varchar(200) DEFAULT NULL COMMENT '端点ID（豆包专用）',
  `model_name` varchar(100) DEFAULT NULL COMMENT '默认模型名称',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `remark` text COMMENT '备注说明',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider` (`provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='AI API密钥配置表';
