-- ========================================
-- AI功能数据库初始化脚本
-- ========================================
-- 执行前请确保已连接到正确的数据库
-- USE education_crm;

-- ========================================
-- 1. 创建AI提示词配置表
-- ========================================
CREATE TABLE IF NOT EXISTS `ai_prompt_configs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `scenario_key` varchar(50) NOT NULL COMMENT '场景标识：chat_deep_analysis, chat_ocr_extract等',
  `scenario_name` varchar(100) NOT NULL COMMENT '场景名称',
  `scenario_category` varchar(50) NOT NULL COMMENT '场景分类：客户管理、聊天分析、销售辅助、团队管理',
  `model_provider` enum('deepseek','doubao') NOT NULL COMMENT 'AI模型供应商：deepseek=DeepSeek, doubao=豆包',
  `model_name` varchar(100) DEFAULT NULL COMMENT '模型名称，如：deepseek-chat, ep-xxxxx',
  `system_prompt` text COMMENT '系统提示词：定义AI的角色和行为',
  `prompt_content` text NOT NULL COMMENT '用户提示词模板：支持变量替换{{variable}}',
  `temperature` decimal(3,2) DEFAULT '0.30' COMMENT '温度参数：0-1，越高越随机创意，越低越确定准确',
  `max_tokens` int DEFAULT '2000' COMMENT '最大token数：限制返回内容长度',
  `variables` json DEFAULT NULL COMMENT '支持的变量列表：如["chatText","customerName"]',
  `variable_description` text COMMENT '变量说明：每个变量的含义和使用方法',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用：1=启用 0=禁用',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_provider` (`scenario_key`,`model_provider`) COMMENT '场景+供应商唯一索引',
  KEY `idx_scenario_category` (`scenario_category`) COMMENT '场景分类索引',
  KEY `idx_is_active` (`is_active`) COMMENT '启用状态索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI提示词配置表';

-- ========================================
-- 2. 插入默认AI配置
-- ========================================

-- 2.1 聊天深度分析（DeepSeek）
INSERT INTO `ai_prompt_configs`
  (`scenario_key`, `scenario_name`, `scenario_category`, `model_provider`, `model_name`, `system_prompt`, `prompt_content`, `temperature`, `max_tokens`, `variables`, `variable_description`, `is_active`)
VALUES
  ('chat_deep_analysis', '聊天深度分析', '聊天分析', 'deepseek', 'deepseek-chat',
   '你是一个专业的教育培训行业销售分析专家，擅长分析微信聊天记录并提供深度洞察。

你的任务是：
1. 深入分析销售与客户的微信聊天记录
2. 从20+个维度全面评估客户情况
3. 识别客户需求、痛点、异议和风险
4. 评估商机价值和成交可能性
5. 提供具体可执行的销售策略和话术建议

分析要求：
- 客观准确，基于事实证据
- 洞察深入，发现隐藏信息
- 建议具体，可直接执行
- 输出格式为严格的JSON，方便系统解析',
   '请深度分析以下微信聊天记录，并按照JSON格式输出分析结果。

【聊天记录】
{{chatText}}

【分析要求】
请严格按照以下JSON格式输出分析结果（不要添加任何markdown格式符号）：

{
  "qualityLevel": "A/B/C/D（A=高价值，B=中等价值，C=一般，D=低价值）",
  "riskLevel": "无风险/低/中/高",
  "intentionScore": 85,
  "communicationSummary": "简要概括本次沟通的核心内容（100字以内）",

  "customerProfile": {
    "parentRole": "家长身份",
    "studentGrade": "学生年级",
    "studentAge": 10,
    "familyEconomicLevel": "高/中/低",
    "educationAttitude": "很重视/一般/不太重视",
    "decisionMakerRole": "单独决策/共同决策/需配偶同意",
    "communicationStyle": "直接/委婉/理性/感性",
    "timeAvailability": "充足/一般/紧张",
    "location": "所在城市",
    "wechatActivity": "高/中/低"
  },

  "customerNeeds": ["需求1", "需求2"],
  "customerPainPoints": ["痛点1", "痛点2"],
  "customerInterests": ["兴趣点1", "兴趣点2"],
  "customerObjections": ["顾虑1", "顾虑2"],
  "competitorMentioned": ["竞品1"],

  "customerMindset": "积极/观望/抗拒/犹豫",
  "emotionalTone": "友好/中立/不耐烦/负面",
  "trustLevel": "高/中/低",

  "estimatedValue": 5000,
  "estimatedCycle": "短期（1周内）/中期（1-4周）/长期（1个月+）",
  "dealOpportunity": "高/中/低",
  "urgency": "高/中/低",
  "competitiveness": "高/中/低",

  "nextSteps": ["建议行动1", "建议行动2"],
  "salesStrategy": "整体销售策略说明",
  "recommendedScripts": {
    "opening": "开场白话术",
    "valueProposition": "价值主张话术",
    "objectionHandling": "应对异议话术",
    "closing": "促成话术"
  },

  "riskFactors": ["风险因素1"],
  "riskReason": "风险原因详细说明"
}',
   0.30, 4000,
   '["chatText", "customerName", "customerPhone", "customerIntent"]',
   'chatText: 聊天记录文本\ncustomerName: 客户姓名（可选）\ncustomerPhone: 客户电话（可选）\ncustomerIntent: 客户意向等级（可选）',
   1)
ON DUPLICATE KEY UPDATE
  `scenario_name` = VALUES(`scenario_name`),
  `system_prompt` = VALUES(`system_prompt`),
  `prompt_content` = VALUES(`prompt_content`),
  `update_time` = CURRENT_TIMESTAMP;

-- 2.2 聊天OCR识别（豆包）
INSERT INTO `ai_prompt_configs`
  (`scenario_key`, `scenario_name`, `scenario_category`, `model_provider`, `model_name`, `system_prompt`, `prompt_content`, `temperature`, `max_tokens`, `variables`, `variable_description`, `is_active`)
VALUES
  ('chat_ocr_extract', '聊天OCR识别', '聊天分析', 'doubao', 'your_doubao_endpoint_id',
   '你是一个专业的OCR文字识别助手。请提取图片中的所有文字内容，保持原有格式和顺序。',
   '请识别这张微信聊天截图中的所有文字内容，包括发送者、时间和消息内容。保持原有的对话顺序和格式。',
   0.10, 2000,
   NULL,
   '无需变量，直接识别图片中的文字',
   1)
ON DUPLICATE KEY UPDATE
  `scenario_name` = VALUES(`scenario_name`),
  `system_prompt` = VALUES(`system_prompt`),
  `prompt_content` = VALUES(`prompt_content`),
  `update_time` = CURRENT_TIMESTAMP;

-- 2.3 客户复苏话术（DeepSeek）
INSERT INTO `ai_prompt_configs`
  (`scenario_key`, `scenario_name`, `scenario_category`, `model_provider`, `model_name`, `system_prompt`, `prompt_content`, `temperature`, `max_tokens`, `variables`, `variable_description`, `is_active`)
VALUES
  ('customer_recovery_script', '客户复苏话术', '客户管理', 'deepseek', 'deepseek-chat',
   '你是一个教育培训销售话术专家，擅长编写自然、亲切、有吸引力的客户复苏话术。',
   '请为以下沉睡客户生成一条复苏话术：

客户信息：
- 姓名：{{customerName}}
- 上次沟通时间：{{lastContactTime}}
- 客户需求：{{needs}}
- 之前顾虑：{{objections}}

要求：
1. 话术自然、不生硬，像朋友聊天
2. 提供新的价值点或福利信息
3. 给客户一个愿意回复的理由
4. 控制在100字以内
5. 不要使用过于商业化的语言

请直接输出话术内容，不要其他说明文字。',
   0.70, 500,
   '["customerName", "lastContactTime", "needs", "objections"]',
   'customerName: 客户姓名\nlastContactTime: 上次沟通时间\nneeds: 客户需求\nobjections: 客户之前的顾虑',
   1)
ON DUPLICATE KEY UPDATE
  `scenario_name` = VALUES(`scenario_name`),
  `system_prompt` = VALUES(`system_prompt`),
  `prompt_content` = VALUES(`prompt_content`),
  `update_time` = CURRENT_TIMESTAMP;

-- 2.4 客户信息提取（DeepSeek）
INSERT INTO `ai_prompt_configs`
  (`scenario_key`, `scenario_name`, `scenario_category`, `model_provider`, `model_name`, `system_prompt`, `prompt_content`, `temperature`, `max_tokens`, `variables`, `variable_description`, `is_active`)
VALUES
  ('customer_info_extract', '客户信息提取', '客户管理', 'deepseek', 'deepseek-chat',
   '你是一个专业的信息提取助手，擅长从对话文本中提取结构化的客户信息。',
   '请从以下聊天记录中提取客户的基本信息：

{{chatText}}

请以JSON格式输出以下信息（如果无法确定则填null）：
{
  "realName": "真实姓名",
  "phone": "手机号",
  "wechatNickname": "微信昵称",
  "gender": "性别",
  "location": "所在地区",
  "studentGrade": "学生年级",
  "studentAge": 学生年龄数字
}',
   0.20, 1000,
   '["chatText"]',
   'chatText: 聊天记录文本',
   1)
ON DUPLICATE KEY UPDATE
  `scenario_name` = VALUES(`scenario_name`),
  `system_prompt` = VALUES(`system_prompt`),
  `prompt_content` = VALUES(`prompt_content`),
  `update_time` = CURRENT_TIMESTAMP;

-- ========================================
-- 3. 添加权限配置（如果permissions表存在）
-- ========================================

-- 检查permissions表是否存在，如果存在则插入权限
SET @permission_table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'permissions'
);

-- AI配置管理权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`, `status`)
SELECT 'system:ai-config', 'AI配置管理', 'system', '管理AI提示词配置', 1
WHERE @permission_table_exists > 0
  AND NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` = 'system:ai-config');

-- 智能创建客户权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`, `status`)
SELECT 'customer:smart-create', '智能创建客户', 'customer', 'AI智能识别创建客户', 1
WHERE @permission_table_exists > 0
  AND NOT EXISTS (SELECT 1 FROM `permissions` WHERE `code` = 'customer:smart-create');

-- ========================================
-- 4. 验证数据
-- ========================================

-- 查询已插入的AI配置
SELECT
  id,
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  is_active,
  create_time
FROM ai_prompt_configs
ORDER BY scenario_category, scenario_key;

-- 统计信息
SELECT
  scenario_category,
  model_provider,
  COUNT(*) as config_count
FROM ai_prompt_configs
GROUP BY scenario_category, model_provider;

-- ========================================
-- 初始化完成提示
-- ========================================
SELECT '========================================' as '';
SELECT 'AI功能数据库初始化完成！' as '';
SELECT '========================================' as '';
SELECT CONCAT('总配置数：', COUNT(*)) as '' FROM ai_prompt_configs;
SELECT '请确保.env文件中已配置DeepSeek和豆包的API Key' as '';
SELECT '========================================' as '';
