-- AI老板助手 - 数据库迁移脚本
-- 执行此脚本以支持AI老板助手的风险预警和扩展客户洞察功能
-- 执行时间: 2025-11-25

USE education_crm;

-- ========== 1. 创建 ai_risk_alerts 表 ==========
CREATE TABLE IF NOT EXISTS `ai_risk_alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chat_record_id` int DEFAULT NULL COMMENT '聊天记录ID',
  `customer_id` int NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) DEFAULT NULL COMMENT '客户名称',
  `staff_id` int DEFAULT NULL COMMENT '员工ID',
  `staff_name` varchar(100) DEFAULT NULL COMMENT '员工名称',
  `risk_type` enum('high_intent_no_action','dissatisfaction_risk','potential_churn','potential_refund') NOT NULL COMMENT '风险类型: 高意向未处理/不满风险/潜在退课/潜在退费',
  `risk_level` enum('low','medium','high') NOT NULL DEFAULT 'medium' COMMENT '风险级别',
  `description` text NOT NULL COMMENT '风险描述',
  `suggestion` text COMMENT '处理建议',
  `status` enum('pending','processing','resolved','ignored') NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  `assigned_to` int DEFAULT NULL COMMENT '指派给(用户ID)',
  `assigned_to_name` varchar(100) DEFAULT NULL COMMENT '处理人名称',
  `resolution_note` text COMMENT '处理备注',
  `resolved_at` datetime DEFAULT NULL COMMENT '解决时间',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_chat_record` (`chat_record_id`),
  KEY `IDX_customer` (`customer_id`),
  KEY `IDX_staff` (`staff_id`),
  KEY `IDX_risk_type` (`risk_type`),
  KEY `IDX_risk_level` (`risk_level`),
  KEY `IDX_status` (`status`),
  KEY `IDX_assigned_to` (`assigned_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI风险预警表';

-- ========== 2. 扩展 ai_customer_insights 表的 insight_type 枚举 ==========
-- 新增6种洞察类型: objection, question, competitor, refund_reason, focus_point, suggestion

ALTER TABLE `ai_customer_insights`
MODIFY COLUMN `insight_type` enum(
  'pain_point',      -- 客户痛点 (原有)
  'need',            -- 客户需求 (原有)
  'interest',        -- 客户兴趣点 (原有)
  'objection',       -- 客户异议 (新增)
  'question',        -- 客户问题 (新增)
  'competitor',      -- 竞品情报 (新增)
  'refund_reason',   -- 退费原因 (新增)
  'focus_point',     -- 客户关注点 (新增)
  'suggestion'       -- 改进建议 (新增)
) NOT NULL COMMENT '洞察类型';

-- ========== 验证脚本执行结果 ==========
SELECT '✅ ai_risk_alerts 表创建成功' AS status;
SELECT '✅ ai_customer_insights 枚举扩展成功' AS status;

-- 查看 ai_risk_alerts 表结构
DESC ai_risk_alerts;

-- 查看 ai_customer_insights 表的 insight_type 字段
SHOW COLUMNS FROM ai_customer_insights LIKE 'insight_type';

-- ========== 说明 ==========
--
-- 1. ai_risk_alerts 表用于存储AI分析出的业务风险
--    - 4种风险类型: 高意向未处理、不满风险、潜在退课、潜在退费
--    - 支持风险指派和处理流程
--    - 与聊天记录、客户、员工关联
--
-- 2. ai_customer_insights 扩展后支持9种洞察类型
--    - 原有3种: pain_point(痛点)、need(需求)、interest(兴趣)
--    - 新增6种: objection(异议)、question(问题)、competitor(竞品)、
--               refund_reason(退费原因)、focus_point(关注点)、suggestion(建议)
--
-- 执行完此脚本后,请重启后端服务以加载新的路由配置
