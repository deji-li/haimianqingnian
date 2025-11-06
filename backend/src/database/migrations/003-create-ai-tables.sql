-- =====================================================
-- AI智能化模块 - 数据库表结构
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- =====================================================
-- 1. AI聊天记录分析表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_chat_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL COMMENT '客户ID',
  `user_id` int NOT NULL COMMENT '上传销售ID',
  `chat_date` date NOT NULL COMMENT '聊天日期',
  `wechat_id` varchar(100) DEFAULT NULL COMMENT '客户微信号（销售手动补充）',
  `images` json DEFAULT NULL COMMENT '聊天截图URL数组',
  `ocr_text` text DEFAULT NULL COMMENT 'OCR识别的文本内容',
  `ai_analysis_result` json DEFAULT NULL COMMENT 'AI分析结果（20+维度）',

  -- 核心分析字段
  `quality_level` enum('A','B','C','D') DEFAULT NULL COMMENT '线索质量等级',
  `risk_level` enum('无风险','低','中','高') DEFAULT NULL COMMENT '流失风险等级',
  `intention_score` int DEFAULT NULL COMMENT '意向评分（0-100）',
  `estimated_value` decimal(10,2) DEFAULT NULL COMMENT '预估价值（元）',
  `decision_maker_role` varchar(50) DEFAULT NULL COMMENT '决策者角色',

  -- 处理状态
  `ocr_status` enum('待处理','处理中','已完成','失败') DEFAULT '待处理' COMMENT 'OCR状态',
  `analysis_status` enum('待分析','分析中','已完成','失败') DEFAULT '待分析' COMMENT 'AI分析状态',
  `error_message` text DEFAULT NULL COMMENT '错误信息',

  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_chat_date` (`chat_date`),
  KEY `idx_quality_level` (`quality_level`),
  KEY `idx_risk_level` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI聊天记录分析表';

-- =====================================================
-- 2. AI客户标签表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_customer_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL COMMENT '客户ID',
  `tag_category` varchar(50) NOT NULL COMMENT '标签分类：基础信息/需求痛点/行为特征/风险标签等',
  `tag_name` varchar(100) NOT NULL COMMENT '标签名称',
  `tag_value` varchar(255) DEFAULT NULL COMMENT '标签值',
  `source` enum('AI自动','人工添加') DEFAULT 'AI自动' COMMENT '标签来源',
  `confidence` decimal(3,2) DEFAULT NULL COMMENT 'AI置信度（0-1）',
  `from_chat_record_id` int DEFAULT NULL COMMENT '来源聊天记录ID',
  `is_active` tinyint DEFAULT 1 COMMENT '是否有效：1有效0失效',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_tag_category` (`tag_category`),
  KEY `idx_source` (`source`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI客户标签表';

-- =====================================================
-- 3. AI企业知识库表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL COMMENT '知识分类：课程介绍/常见问题/政策解读/话术模板等',
  `title` varchar(200) NOT NULL COMMENT '知识标题',
  `content` text NOT NULL COMMENT '知识内容',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `priority` int DEFAULT 0 COMMENT '优先级（数字越大越优先）',
  `usage_count` int DEFAULT 0 COMMENT '使用次数',
  `creator_id` int DEFAULT NULL COMMENT '创建人ID',
  `is_active` tinyint DEFAULT 1 COMMENT '是否启用：1启用0停用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_priority` (`priority`),
  KEY `idx_active` (`is_active`),
  FULLTEXT KEY `ft_keywords` (`keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI企业知识库表';

-- =====================================================
-- 4. AI话术库表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_scripts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `script_type` varchar(50) NOT NULL COMMENT '话术类型：开场白/需求挖掘/应对异议/促成/售后等',
  `scenario` varchar(100) DEFAULT NULL COMMENT '适用场景',
  `customer_profile` varchar(255) DEFAULT NULL COMMENT '适用客户画像',
  `script_title` varchar(200) NOT NULL COMMENT '话术标题',
  `script_content` text NOT NULL COMMENT '话术内容',
  `source` enum('AI生成','优秀案例','人工编写') DEFAULT 'AI生成' COMMENT '话术来源',
  `source_user_id` int DEFAULT NULL COMMENT '来源销售ID（优秀案例）',
  `effectiveness_score` decimal(3,1) DEFAULT NULL COMMENT '有效性评分（0-10）',
  `usage_count` int DEFAULT 0 COMMENT '使用次数',
  `success_count` int DEFAULT 0 COMMENT '成功次数',
  `is_active` tinyint DEFAULT 1 COMMENT '是否启用：1启用0停用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_script_type` (`script_type`),
  KEY `idx_source` (`source`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI话术库表';

-- =====================================================
-- 5. AI培训陪练记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_training_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '销售人员ID',
  `training_type` varchar(50) DEFAULT '对话陪练' COMMENT '培训类型：对话陪练/话术测试/场景演练等',
  `scenario` varchar(100) DEFAULT NULL COMMENT '训练场景',
  `customer_role` varchar(100) DEFAULT NULL COMMENT 'AI扮演的客户角色',
  `conversation` json DEFAULT NULL COMMENT '对话记录（数组）',
  `duration` int DEFAULT NULL COMMENT '时长（秒）',
  `round_count` int DEFAULT NULL COMMENT '对话轮数',

  -- AI评分
  `ai_score` decimal(3,1) DEFAULT NULL COMMENT 'AI总评分（0-10）',
  `communication_score` decimal(3,1) DEFAULT NULL COMMENT '沟通技巧评分',
  `response_speed_score` decimal(3,1) DEFAULT NULL COMMENT '响应速度评分',
  `objection_handling_score` decimal(3,1) DEFAULT NULL COMMENT '异议处理评分',
  `ai_feedback` text DEFAULT NULL COMMENT 'AI反馈建议',

  `training_result` enum('优秀','良好','及格','不及格') DEFAULT NULL COMMENT '训练结果',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_training_type` (`training_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI培训陪练记录表';

-- =====================================================
-- 6. AI风险预警表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_risk_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL COMMENT '客户ID',
  `risk_type` varchar(50) NOT NULL COMMENT '风险类型：流失风险/竞品风险/负面情绪/长期未跟进等',
  `risk_level` enum('低','中','高') DEFAULT '中' COMMENT '风险等级',
  `risk_score` int DEFAULT NULL COMMENT '风险评分（0-100）',
  `risk_reason` text DEFAULT NULL COMMENT '风险原因（AI分析）',
  `recommended_actions` json DEFAULT NULL COMMENT '建议行动（数组）',
  `from_chat_record_id` int DEFAULT NULL COMMENT '来源聊天记录ID',

  -- 处理状态
  `status` enum('待处理','处理中','已解决','已忽略') DEFAULT '待处理' COMMENT '处理状态',
  `assigned_to` int DEFAULT NULL COMMENT '分配给销售ID',
  `handler_id` int DEFAULT NULL COMMENT '处理人ID',
  `handle_result` text DEFAULT NULL COMMENT '处理结果',
  `handle_time` datetime DEFAULT NULL COMMENT '处理时间',

  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_risk_type` (`risk_type`),
  KEY `idx_risk_level` (`risk_level`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI风险预警表';

-- =====================================================
-- 7. AI诊断报告表
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_type` varchar(50) NOT NULL COMMENT '报告类型：周报/月报/季度报告等',
  `report_period` varchar(50) NOT NULL COMMENT '报告周期：2025-W01/2025-01/2025-Q1',
  `target_type` varchar(50) DEFAULT NULL COMMENT '目标类型：个人/团队/全公司',
  `target_id` int DEFAULT NULL COMMENT '目标ID（用户ID/部门ID）',

  -- 报告内容
  `report_data` json DEFAULT NULL COMMENT '报告数据（结构化）',
  `key_metrics` json DEFAULT NULL COMMENT '关键指标',
  `ai_insights` json DEFAULT NULL COMMENT 'AI洞察发现（数组）',
  `problems` json DEFAULT NULL COMMENT '问题诊断（数组）',
  `recommendations` json DEFAULT NULL COMMENT '改进建议（数组）',

  -- 生成状态
  `status` enum('生成中','已完成','失败') DEFAULT '生成中' COMMENT '生成状态',
  `generate_time` datetime DEFAULT NULL COMMENT '生成时间',
  `generator` varchar(50) DEFAULT 'AI自动生成' COMMENT '生成方式',

  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_report_type` (`report_type`),
  KEY `idx_report_period` (`report_period`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI诊断报告表';

-- =====================================================
-- 8. 在permissions表增加AI相关权限
-- =====================================================
INSERT INTO `permissions` (`code`, `name`, `module`, `description`, `status`) VALUES
-- AI聊天记录分析
('ai:chat:upload', '上传聊天记录', 'ai', '上传微信聊天截图', 1),
('ai:chat:view', '查看聊天分析', 'ai', '查看AI聊天分析结果', 1),
('ai:chat:delete', '删除聊天记录', 'ai', '删除聊天记录', 1),
('ai:chat:all', '查看所有聊天记录', 'ai', '查看所有销售的聊天记录（管理员）', 1),

-- AI标签管理
('ai:tag:view', '查看AI标签', 'ai', '查看客户AI标签', 1),
('ai:tag:edit', '编辑AI标签', 'ai', '编辑和管理AI标签', 1),

-- AI知识库
('ai:knowledge:view', '查看知识库', 'ai', '查看企业知识库', 1),
('ai:knowledge:create', '创建知识库', 'ai', '创建知识库条目', 1),
('ai:knowledge:edit', '编辑知识库', 'ai', '编辑知识库', 1),
('ai:knowledge:delete', '删除知识库', 'ai', '删除知识库条目', 1),

-- AI话术助手
('ai:script:view', '查看话术库', 'ai', '查看话术库', 1),
('ai:script:use', '使用话术', 'ai', '使用和复制话术', 1),
('ai:script:create', '创建话术', 'ai', '创建话术', 1),
('ai:script:edit', '编辑话术', 'ai', '编辑话术', 1),

-- AI培训陪练
('ai:training:use', '使用AI陪练', 'ai', '使用AI陪练功能', 1),
('ai:training:view', '查看培训记录', 'ai', '查看培训记录', 1),
('ai:training:all', '查看所有培训记录', 'ai', '查看所有人的培训记录（管理员）', 1),

-- AI风险预警
('ai:risk:view', '查看风险预警', 'ai', '查看风险预警', 1),
('ai:risk:handle', '处理风险预警', 'ai', '处理风险预警', 1),
('ai:risk:all', '查看所有风险', 'ai', '查看所有风险预警（管理员）', 1),

-- AI报告
('ai:report:view', '查看AI报告', 'ai', '查看AI诊断报告', 1),
('ai:report:generate', '生成AI报告', 'ai', '手动生成AI报告', 1),
('ai:report:all', '查看所有报告', 'ai', '查看所有AI报告（管理员）', 1),

-- AI分析看板
('ai:analytics:view', '查看AI分析', 'ai', '查看AI人效分析看板', 1),
('ai:analytics:all', '查看全部AI数据', 'ai', '查看所有人的AI数据（管理员）', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- =====================================================
-- 9. 为各角色分配AI权限
-- =====================================================

-- 销售人员（只能看自己）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM permissions
WHERE code IN (
  'ai:chat:upload',
  'ai:chat:view',
  'ai:tag:view',
  'ai:knowledge:view',
  'ai:script:view',
  'ai:script:use',
  'ai:training:use',
  'ai:training:view',
  'ai:risk:view',
  'ai:risk:handle',
  'ai:report:view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 3 AND permission_id = permissions.id
);

-- 销售主管（可以看团队）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM permissions
WHERE code LIKE 'ai:%'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 2 AND permission_id = permissions.id
);

-- 管理员（全部权限）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM permissions
WHERE code LIKE 'ai:%'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 1 AND permission_id = permissions.id
);

SELECT '✅ AI智能化模块表结构创建完成！' as message;
