-- ========================================
-- AI老板助手 - 数据库升级脚本
-- ========================================

USE education_crm;

-- ========================================
-- 1. 扩展客户洞察表
-- ========================================

-- 扩展 insight_type 枚举值
ALTER TABLE `ai_customer_insights`
MODIFY COLUMN `insight_type` ENUM(
  'pain_point',      -- 痛点（已有）
  'need',            -- 需求（已有）
  'interest',        -- 兴趣点（已有）
  'objection',       -- 客户异议（新增）
  'question',        -- 客户问题（新增）
  'competitor',      -- 提及竞品（新增）
  'refund_reason',   -- 退费原因（新增）
  'focus_point',     -- 客户焦点（新增）
  'suggestion'       -- 客户建议（新增）
) NOT NULL COMMENT '洞察类型';

-- 新增字段：关联聊天记录和关键词（如果报错duplicate column则忽略）
ALTER TABLE `ai_customer_insights`
ADD COLUMN `chat_record_id` INT NULL COMMENT '关联聊天记录ID' AFTER `user_id`;

ALTER TABLE `ai_customer_insights`
ADD COLUMN `keywords` JSON NULL COMMENT '关键词（用于高亮）' AFTER `content`;

-- 新增索引
ALTER TABLE `ai_customer_insights`
ADD INDEX `idx_chat_record` (`chat_record_id`);

-- ========================================
-- 2. 扩展风险预警表
-- ========================================

-- 扩展 risk_type 枚举值
ALTER TABLE `ai_risk_alerts`
MODIFY COLUMN `risk_type` ENUM(
  '流失风险',           -- 已有
  '高意向问询未处理',   -- 新增
  '不满风险',           -- 新增
  '潜在退课风险',       -- 新增
  '潜在退费风险'        -- 新增
) NOT NULL COMMENT '风险类型';

-- 新增索引优化查询
ALTER TABLE `ai_risk_alerts`
ADD INDEX `idx_status_level` (`status`, `risk_level`);

ALTER TABLE `ai_risk_alerts`
ADD INDEX `idx_create_time` (`create_time`);

ALTER TABLE `ai_risk_alerts`
ADD INDEX `idx_user_id` (`assigned_to`);

ALTER TABLE `ai_risk_alerts`
ADD INDEX `idx_risk_type` (`risk_type`);

-- ========================================
-- 3. 创建员工质检记录表
-- ========================================

CREATE TABLE IF NOT EXISTS `ai_staff_quality_records` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `chat_record_id` INT NOT NULL COMMENT '聊天记录ID',
  `user_id` INT NOT NULL COMMENT '员工ID',
  `customer_id` INT NOT NULL COMMENT '客户ID',
  `chat_date` DATE NOT NULL COMMENT '聊天日期',

  -- SOP质检数据
  `sop_items` JSON NULL COMMENT 'SOP检查项：[{name, completed, keywords}]',
  `sop_completed_count` INT DEFAULT 0 COMMENT 'SOP完成项数量',
  `sop_total_count` INT DEFAULT 0 COMMENT 'SOP总项数',
  `sop_score` INT NULL COMMENT 'SOP得分(0-100)',

  -- 违规质检数据
  `violations` JSON NULL COMMENT '违规项列表：[{type, content, keywords, severity}]',
  `violation_count` INT DEFAULT 0 COMMENT '违规数量',

  -- 执行力数据
  `message_count` INT DEFAULT 0 COMMENT '消息数量',
  `response_speed` VARCHAR(20) NULL COMMENT '响应速度：快速/正常/较慢',
  `response_time_avg` INT NULL COMMENT '平均响应时间(秒)',
  `high_intent_customer` TINYINT DEFAULT 0 COMMENT '是否高意向客户',
  `service_attitude` VARCHAR(20) NULL COMMENT '服务态度：优秀/良好/一般/较差',

  `create_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

  INDEX `idx_user_date` (`user_id`, `chat_date`),
  INDEX `idx_chat_record` (`chat_record_id`),
  INDEX `idx_customer` (`customer_id`),
  INDEX `idx_violation` (`violation_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI员工质检记录';

-- ========================================
-- 4. 创建SOP规则配置表
-- ========================================

CREATE TABLE IF NOT EXISTS `ai_sop_rules` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `rule_description` TEXT NULL COMMENT '规则描述',
  `check_keywords` JSON NULL COMMENT '检查关键词：["关键词1", "关键词2"]',
  `rule_category` VARCHAR(50) NULL COMMENT '规则分类',
  `rule_order` INT DEFAULT 0 COMMENT '规则顺序',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
  `create_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_category` (`rule_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SOP规则配置';

-- ========================================
-- 5. 创建违规规则配置表
-- ========================================

CREATE TABLE IF NOT EXISTS `ai_violation_rules` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `rule_name` VARCHAR(100) NOT NULL COMMENT '违规规则名称',
  `violation_type` VARCHAR(50) NOT NULL COMMENT '违规类型',
  `keywords` JSON NOT NULL COMMENT '违规关键词：["关键词1", "关键词2"]',
  `severity` ENUM('低','中','高') DEFAULT '中' COMMENT '严重程度',
  `description` TEXT NULL COMMENT '规则说明',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
  `create_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_type` (`violation_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='违规规则配置';

-- ========================================
-- 6. 插入默认SOP规则
-- ========================================

INSERT INTO `ai_sop_rules` (`rule_name`, `rule_description`, `check_keywords`, `rule_category`, `rule_order`) VALUES
('礼貌问候', '是否礼貌问候客户', '["您好", "你好", "欢迎", "很高兴"]', '开场', 1),
('自我介绍', '是否进行自我介绍', '["我是", "我叫", "这边是", "我们是"]', '开场', 2),
('了解需求', '是否主动了解客户需求', '["需要", "想要", "了解", "需求", "目的"]', '需求挖掘', 3),
('产品介绍', '是否介绍产品/课程', '["课程", "产品", "服务", "方案"]', '产品展示', 4),
('价格说明', '是否说明价格', '["价格", "费用", "多少钱", "收费"]', '价格沟通', 5),
('异议处理', '是否处理客户异议', '["理解", "确实", "可以", "没问题"]', '异议处理', 6),
('后续跟进', '是否约定后续跟进', '["联系", "跟进", "再聊", "保持"]', '收尾', 7);

-- ========================================
-- 7. 插入默认违规规则
-- ========================================

INSERT INTO `ai_violation_rules` (`rule_name`, `violation_type`, `keywords`, `severity`, `description`) VALUES
('过度承诺', '过度承诺', '["保证", "一定能", "肯定会", "百分百"]', '高', '避免对效果做绝对承诺'),
('侮辱谩骂', '不当言辞', '["傻", "笨", "蠢", "白痴", "滚"]', '高', '严禁侮辱或谩骂客户'),
('态度恶劣', '服务态度', '["不想买就别", "爱买不买", "随便你"]', '高', '避免态度恶劣'),
('泄露隐私', '隐私泄露', '["其他客户", "某某也买", "给你看别人"]', '中', '不得泄露其他客户信息'),
('强制推销', '违规营销', '["必须", "一定要", "不买就"]', '中', '避免强制推销'),
('虚假宣传', '虚假信息', '["最好的", "第一", "最便宜", "绝对"]', '中', '避免使用绝对化、夸大化的表述');

-- ========================================
-- 8. 更新脚本完成标记
-- ========================================

SELECT '✅ AI老板助手数据库升级完成！' AS message;
SELECT 'ai_customer_insights: 扩展了6个新的洞察类型' AS update_1;
SELECT 'ai_risk_alerts: 扩展了4个新的风险类型' AS update_2;
SELECT 'ai_staff_quality_records: 新建员工质检记录表' AS update_3;
SELECT 'ai_sop_rules: 新建SOP规则配置表，插入7条默认规则' AS update_4;
SELECT 'ai_violation_rules: 新建违规规则配置表，插入6条默认规则' AS update_5;
