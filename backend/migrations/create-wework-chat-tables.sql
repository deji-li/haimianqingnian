-- 创建企业微信会话内容存档相关表
-- 用于Phase 3: 会话内容存档集成

-- 1. 企业微信聊天记录表
CREATE TABLE IF NOT EXISTS `education_crm`.`wework_chat_records` (
  `id` VARCHAR(36) NOT NULL COMMENT '主键ID',
  `msgid` VARCHAR(64) NOT NULL COMMENT '消息ID，企业微信消息唯一标识',
  `external_userid` VARCHAR(64) NULL COMMENT '外部联系人userid',
  `userid` VARCHAR(64) NULL COMMENT '内部成员userid',
  `msgtype` VARCHAR(32) NOT NULL COMMENT '消息类型(text/image/voice/video/file等)',
  `msgcontent` JSON NOT NULL COMMENT '消息内容，包含所有消息属性',
  `msgtime` BIGINT NOT NULL COMMENT '消息发送时间，毫秒级时间戳',

  -- 消息处理状态
  `processing_status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '处理状态',
  `ocr_result` TEXT NULL COMMENT 'OCR识别结果(图片消息)',
  `voice_text` TEXT NULL COMMENT '语音转文字结果(语音消息)',
  `file_content` TEXT NULL COMMENT '文件内容解析结果(文档消息)',

  -- AI分析相关
  `customer_id` INT NULL COMMENT '关联CRM客户ID',
  `ai_chat_record_id` INT NULL COMMENT '关联AI分析记录ID',
  `ai_analysis_status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT 'AI分析状态',
  `ai_analysis_result` JSON NULL COMMENT 'AI分析结果',
  `ai_insights` JSON NULL COMMENT 'AI洞察结果',

  -- 会话内容存档相关
  `archive_session_id` VARCHAR(64) NULL COMMENT '存档会话ID',
  `archive_sequence` BIGINT NULL COMMENT '存档序号',
  `archive_time` DATETIME NULL COMMENT '存档时间',
  `webhook_received_time` DATETIME NULL COMMENT 'Webhook接收时间',

  -- 智能触发相关
  `trigger_analysis` BOOLEAN DEFAULT FALSE COMMENT '是否触发AI分析',
  `auto_tag_updated` BOOLEAN DEFAULT FALSE COMMENT '是否自动更新标签',
  `sales_notified` BOOLEAN DEFAULT FALSE COMMENT '是否已通知销售人员',

  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_msgid` (`msgid`),
  INDEX `idx_external_userid` (`external_userid`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_archive_session` (`archive_session_id`),
  INDEX `idx_processing_status` (`processing_status`),
  INDEX `idx_ai_analysis_status` (`ai_analysis_status`),
  INDEX `idx_msgtime` (`msgtime`),
  INDEX `idx_trigger_analysis` (`trigger_analysis`),
  INDEX `idx_created_time` (`created_time`),

  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`ai_chat_record_id`) REFERENCES `ai_chat_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业微信聊天记录表';

-- 2. AI触发规则表
CREATE TABLE IF NOT EXISTS `education_crm`.`wework_ai_trigger_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `rule_name` VARCHAR(255) NOT NULL COMMENT '规则名称',
  `trigger_type` ENUM('keyword', 'message_type', 'time_interval', 'customer_status') NOT NULL COMMENT '触发类型',
  `trigger_conditions` JSON NOT NULL COMMENT '触发条件配置',
  `action_type` ENUM('ai_analysis', 'tag_update', 'sales_notification', 'followup_reminder') NOT NULL COMMENT '动作类型',
  `action_config` JSON NOT NULL COMMENT '动作配置',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `priority` INT DEFAULT 0 COMMENT '优先级，数值越大优先级越高',
  `description` TEXT NULL COMMENT '规则描述',
  `created_by` VARCHAR(64) NULL COMMENT '创建人',
  `updated_by` VARCHAR(64) NULL COMMENT '更新人',
  `chat_record_id` VARCHAR(36) NULL COMMENT '关联的聊天记录ID',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_trigger_type` (`trigger_type`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_created_time` (`created_time`),

  FOREIGN KEY (`chat_record_id`) REFERENCES `wework_chat_records` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI分析触发规则表';

-- 3. 企业微信会话存档配置表
CREATE TABLE IF NOT EXISTS `education_crm`.`wework_archive_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `corp_id` VARCHAR(64) NOT NULL COMMENT '企业ID',
  `archive_id` INT NOT NULL COMMENT '存档ID',
  `archive_name` VARCHAR(255) NOT NULL COMMENT '存档名称',
  `archive_type` ENUM('all', 'department', 'user') DEFAULT 'all' COMMENT '存档类型',
  `department_ids` JSON NULL COMMENT '存档部门ID列表',
  `user_ids` JSON NULL COMMENT '存档用户ID列表',
  `archive_start_time` DATETIME NULL COMMENT '存档开始时间',
  `archive_end_time` DATETIME NULL COMMENT '存档结束时间',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  `sync_enabled` BOOLEAN DEFAULT TRUE COMMENT '是否启用同步',
  `ai_analysis_enabled` BOOLEAN DEFAULT TRUE COMMENT '是否启用AI分析',

  -- Webhook配置
  `webhook_url` VARCHAR(500) NULL COMMENT 'Webhook回调地址',
  `webhook_token` VARCHAR(255) NULL COMMENT 'Webhook验证Token',
  `webhook_aes_key` VARCHAR(255) NULL COMMENT 'Webhook消息加密密钥',

  -- 同步配置
  `sync_interval_minutes` INT DEFAULT 60 COMMENT '同步间隔(分钟)',
  `last_sync_time` DATETIME NULL COMMENT '最后同步时间',

  `description` TEXT NULL COMMENT '配置描述',
  `created_by` VARCHAR(64) NULL COMMENT '创建人',
  `updated_by` VARCHAR(64) NULL COMMENT '更新人',
  `created_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_corp_id` (`corp_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sync_enabled` (`sync_enabled`),
  INDEX `idx_ai_analysis_enabled` (`ai_analysis_enabled`),
  INDEX `idx_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业微信会话存档配置表';

-- 插入系统预设的AI触发规则
INSERT INTO `education_crm`.`wework_ai_trigger_rules`
(`rule_name`, `trigger_type`, `trigger_conditions`, `action_type`, `action_config`, `priority`, `description`) VALUES

-- 关键词触发规则
('价格敏感客户', 'keyword',
 '{"keywords": ["价格", "多少钱", "费用", "收费", "便宜", "贵", "优惠", "折扣"]}',
 'ai_analysis',
 '{"messageCount": 20, "priority": "high", "focusPricing": true}',
 90,
 '当客户提及价格相关词汇时触发AI分析，重点关注价格敏感度'),

('竞争品牌提及', 'keyword',
 '{"keywords": ["其他机构", "对比", "某某机构", "竞品", "别家", "其他地方"]}',
 'ai_analysis',
 '{"messageCount": 15, "focusCompetitors": true}',
 85,
 '当客户提及竞争机构时触发AI分析，重点关注竞品对比'),

('报名意向强烈', 'keyword',
 '{"keywords": ["报名", "试听", "报名", "怎么报名", "什么时候开课", "想报名"]}',
 'tag_update',
 '{"tags": ["高意向", "待跟进"], "priority": "urgent"}',
 95,
 '当客户表达强烈报名意向时自动标记为高意向客户'),

('考虑中客户', 'keyword',
 '{"keywords": ["考虑", "商量", "想想", "回去商量", "需要考虑"]}',
 'followup_reminder',
 '{"reminderType": "followup", "delayHours": 24}',
 80,
 '当客户表示需要考虑时创建24小时跟进提醒'),

('效果关注', 'keyword',
 '{"keywords": ["效果", "质量", "水平", "怎么样", "好不好", "靠谱吗"]}',
 'ai_analysis',
 '{"messageCount": 25, "focusEffect": true}',
 75,
 '当客户关注学习效果时触发深度分析'),

('时间相关咨询', 'keyword',
 '{"keywords": ["时间", "什么时候", "多长时间", "频率", "安排"]}',
 'ai_analysis',
 '{"messageCount": 20, "focusSchedule": true}',
 70,
 '当客户咨询时间安排时触发时间相关分析'),

-- 消息类型触发规则
('多媒体互动', 'message_type',
 '{"messageTypes": ["image", "voice", "video"]}',
 'ai_analysis',
 '{"includeMedia": true, "messageCount": 30}',
 70,
 '当客户发送多媒体消息时触发AI分析'),

('文件分享', 'message_type',
 '{"messageTypes": ["file", "doc"]}',
 'tag_update',
 '{"tags": ["积极互动", "资料咨询"]}',
 60,
 '当客户分享文件时标记为积极互动'),

('语音消息', 'message_type',
 '{"messageTypes": ["voice"]}',
 'ai_analysis',
 '{"messageCount": 15, "includeVoice": true}',
 65,
 '当客户发送语音消息时触发语音分析'),

-- 时间间隔触发规则
('定期客户分析', 'time_interval',
 '{"intervalHours": 72}',
 'ai_analysis',
 '{"messageCount": 100, "fullAnalysis": true}',
 50,
 '每72小时对客户进行一次全面分析'),

('每周客户回访', 'time_interval',
 '{"intervalHours": 168}',
 'sales_notification',
 '{"notificationType": "weekly_reminder"}',
 40,
 '每168小时(7天)提醒销售人员回访'),

('高频互动客户', 'time_interval',
 '{"intervalHours": 12}',
 'ai_analysis',
 '{"messageCount": 10, "focusActivity": true}',
 60,
 '每12小时对高频互动客户进行快速分析'),

-- 客户状态触发规则
('意向度提升', 'customer_status',
 '{"intentionChange": true, "intentionThreshold": 70}',
 'sales_notification',
 '{"notificationType": "hot_lead"}',
 100,
 '当客户意向度达到70分以上时发送高意向提醒'),

('新客户首次互动', 'customer_status',
 '{"newCustomer": true}',
 'ai_analysis',
 '{"messageCount": 10, "firstImpression": true}',
 88,
 '新客户首次互动时进行第一印象分析'),

('风险客户预警', 'customer_status',
 '{"riskIncrease": true, "riskThreshold": "中"}',
 'sales_notification',
 '{"notificationType": "risk_warning"}',
 95,
 '当客户风险等级提升到中等级别时发送风险预警'),

('成交机会高', 'customer_status',
 '{"opportunityHigh": true, "opportunityThreshold": "高"}',
 'sales_notification',
 '{"notificationType": "high_opportunity"}',
 90,
 '当AI分析显示成交机会高时发送成交提醒');

-- 插入示例企业微信存档配置
INSERT INTO `education_crm`.`wework_archive_configs`
(`corp_id`, `archive_id`, `archive_name`, `archive_type`, `is_active`, `sync_enabled`, `ai_analysis_enabled`, `description`) VALUES
('example_corp_001', 1001, '全量会话存档', 'all', TRUE, TRUE, TRUE, '全量存档所有员工的会话内容'),
('example_corp_001', 1002, '销售部门存档', 'department', TRUE, TRUE, TRUE, '仅存档销售部门员工的会话内容');

-- 更新客户表，添加企业微信聊天相关字段
ALTER TABLE `customers`
ADD COLUMN `wework_chat_count` INT DEFAULT 0 COMMENT '企业微信聊天记录数量',
ADD COLUMN `wework_last_chat_time` DATETIME NULL COMMENT '最后企业微信聊天时间',
ADD COLUMN `wework_chat_analyzed` BOOLEAN DEFAULT FALSE COMMENT '是否已进行聊天分析';

-- 为客户表添加企业微信相关索引
ALTER TABLE `customers`
ADD INDEX `idx_wework_chat_count` (`wework_chat_count`),
ADD INDEX `idx_wework_last_chat_time` (`wework_last_chat_time`),
ADD INDEX `idx_wework_chat_analyzed` (`wework_chat_analyzed`);

-- 创建聊天记录统计视图
CREATE OR REPLACE VIEW `v_wework_chat_stats` AS
SELECT
    c.id as customer_id,
    c.name as customer_name,
    COUNT(wcr.id) as total_messages,
    COUNT(CASE WHEN wcr.msgtype = 'text' THEN 1 END) as text_messages,
    COUNT(CASE WHEN wcr.msgtype = 'image' THEN 1 END) as image_messages,
    COUNT(CASE WHEN wcr.msgtype = 'voice' THEN 1 END) as voice_messages,
    COUNT(CASE WHEN wcr.msgtype = 'file' THEN 1 END) as file_messages,
    MAX(wcr.msgtime) as last_message_time,
    COUNT(CASE WHEN wcr.ai_analysis_status = 'completed' THEN 1 END) as analyzed_messages,
    COUNT(CASE WHEN wcr.trigger_analysis = TRUE THEN 1 END) as triggered_messages
FROM `customers` c
LEFT JOIN `wework_chat_records` wcr ON c.id = wcr.customer_id
GROUP BY c.id, c.name;

-- 创建AI分析效果统计视图
CREATE OR REPLACE VIEW `v_wework_ai_analysis_stats` AS
SELECT
    DATE(wcr.created_time) as analysis_date,
    COUNT(*) as total_analyzed,
    COUNT(CASE WHEN wcr.ai_analysis_status = 'completed' THEN 1 END) as successful_analysis,
    COUNT(CASE WHEN wcr.ai_analysis_status = 'failed' THEN 1 END) as failed_analysis,
    AVG(CASE WHEN wcr.customer_id IS NOT NULL AND c.intention_score IS NOT NULL THEN c.intention_score ELSE 0 END) as avg_intention_score,
    COUNT(CASE WHEN wcr.auto_tag_updated = TRUE THEN 1 END) as auto_tag_updates,
    COUNT(CASE WHEN wcr.sales_notified = TRUE THEN 1 END) as sales_notifications
FROM `wework_chat_records` wcr
LEFT JOIN `customers` c ON wcr.customer_id = c.id
WHERE wcr.created_time >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY DATE(wcr.created_time)
ORDER BY analysis_date DESC;