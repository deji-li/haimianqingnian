-- ========================================
-- AI字段映射配置表
-- 创建时间: 2025-01-15
-- 用途: 配置AI字段映射规则，支持直接映射、转换映射、AI提取三种方式
-- ========================================

CREATE TABLE IF NOT EXISTS `ai_field_mapping_configs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 映射场景
  `mapping_scenario` VARCHAR(50) NOT NULL COMMENT '映射场景key',
  `scenario_name` VARCHAR(100) NOT NULL COMMENT '场景名称',

  -- 源字段和目标字段
  `source_field` VARCHAR(100) NOT NULL COMMENT '源字段名',
  `target_field` VARCHAR(100) NOT NULL COMMENT '目标字段名',

  -- 映射规则
  `mapping_type` ENUM('direct', 'transform', 'ai_extract') DEFAULT 'direct' COMMENT '映射类型：direct-直接映射, transform-转换映射, ai_extract-AI提取',
  `transform_rule` TEXT COMMENT '转换规则（JS表达式或AI场景key）',

  -- 数据类型
  `data_type` VARCHAR(50) COMMENT '数据类型',
  `default_value` VARCHAR(500) COMMENT '默认值',

  -- 其他
  `is_required` TINYINT DEFAULT 0 COMMENT '是否必填',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
  `display_order` INT DEFAULT 0 COMMENT '显示顺序',
  `remark` TEXT COMMENT '备注说明',

  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 索引
  INDEX `idx_scenario` (`mapping_scenario`),
  INDEX `idx_active` (`is_active`),
  UNIQUE KEY `uk_scenario_source` (`mapping_scenario`, `source_field`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI字段映射配置表';

-- ========================================
-- 初始化数据：聊天记录 → 知识库映射配置
-- ========================================

INSERT INTO `ai_field_mapping_configs` (
  `mapping_scenario`,
  `scenario_name`,
  `source_field`,
  `target_field`,
  `mapping_type`,
  `transform_rule`,
  `data_type`,
  `is_required`,
  `display_order`,
  `remark`
) VALUES
-- 直接映射：聊天记录文本
(
  'chat_to_knowledge',
  '聊天记录转知识库',
  'ocrText',
  'rawContent',
  'direct',
  NULL,
  'string',
  1,
  1,
  '直接将OCR识别的文本作为原始内容'
),
-- AI提取映射：提取Q&A
(
  'chat_to_knowledge',
  '聊天记录转知识库',
  'ocrText',
  'extractedQA',
  'ai_extract',
  'knowledge_qa_extraction',
  'json',
  1,
  2,
  '使用AI从聊天记录中提取问答对'
),
-- 转换映射：质量等级转分数
(
  'chat_to_knowledge',
  '聊天记录转知识库',
  'qualityLevel',
  'initialScore',
  'transform',
  'return {A:95, B:85, C:70, D:50}[value] || 60;',
  'number',
  0,
  3,
  '将质量等级（A/B/C/D）转换为初始分数'
),
-- 直接映射：客户ID
(
  'chat_to_knowledge',
  '聊天记录转知识库',
  'customerId',
  'sourceCustomerId',
  'direct',
  NULL,
  'number',
  0,
  4,
  '记录来源客户ID'
),
-- 直接映射：聊天日期
(
  'chat_to_knowledge',
  '聊天记录转知识库',
  'chatDate',
  'sourceDate',
  'direct',
  NULL,
  'date',
  0,
  5,
  '记录聊天日期'
);
