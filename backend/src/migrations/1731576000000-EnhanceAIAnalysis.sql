-- Migration: Enhance AI Analysis Features
-- Date: 2025-11-14
-- Description: 优化AI分析功能，添加痛点、兴趣点提取，支持文本上传

-- ========== 1. AI聊天记录表（ai_chat_records）新增字段 ==========

-- 添加上传类型字段（支持截图和文本）
ALTER TABLE ai_chat_records
ADD COLUMN upload_type ENUM('screenshot', 'text', 'file') NOT NULL DEFAULT 'screenshot' COMMENT '上传类型：screenshot-截图, text-直接文本, file-文件上传',
ADD INDEX idx_upload_type (upload_type);

-- 添加原始文本字段（用于直接上传文本）
ALTER TABLE ai_chat_records
ADD COLUMN raw_text TEXT NULL COMMENT '原始聊天文本（文本上传时使用）';

-- 添加文件路径字段
ALTER TABLE ai_chat_records
ADD COLUMN file_path VARCHAR(500) NULL COMMENT '上传文件路径（文件上传时使用）';

-- 添加痛点字段
ALTER TABLE ai_chat_records
ADD COLUMN pain_points JSON NULL COMMENT '客户痛点列表，如["孩子注意力不集中","学习效率低"]';

-- 添加兴趣点字段
ALTER TABLE ai_chat_records
ADD COLUMN interest_points JSON NULL COMMENT '客户兴趣点列表，如["关注课程效果","重视师资力量"]';

-- 添加需求摘要字段
ALTER TABLE ai_chat_records
ADD COLUMN needs_summary TEXT NULL COMMENT '需求摘要（AI提炼的核心需求）';

-- 添加异议点字段
ALTER TABLE ai_chat_records
ADD COLUMN objections JSON NULL COMMENT '客户异议点列表，如["价格较贵","时间不合适"]';

-- ========== 2. 客户表（customers）AI分析字段优化 ==========

-- 添加痛点字段（从聊天记录聚合）
ALTER TABLE customers
ADD COLUMN pain_points JSON NULL COMMENT '客户痛点（从所有聊天记录中聚合提取）' AFTER ai_profile;

-- 添加兴趣点字段
ALTER TABLE customers
ADD COLUMN interest_points JSON NULL COMMENT '客户兴趣点（从所有聊天记录中聚合提取）' AFTER pain_points;

-- 添加需求关键词字段
ALTER TABLE customers
ADD COLUMN need_keywords JSON NULL COMMENT '需求关键词列表' AFTER interest_points;

-- ========== 3. AI话术库表（ai_scripts）优化 ==========

-- 添加适用痛点字段
ALTER TABLE ai_scripts
ADD COLUMN target_pain_points JSON NULL COMMENT '适用的客户痛点，如["价格敏感","时间紧张"]',
ADD INDEX idx_script_type (script_type);

-- 添加适用场景详情
ALTER TABLE ai_scripts
ADD COLUMN scenario_details TEXT NULL COMMENT '场景详细描述';

-- 添加话术效果数据
ALTER TABLE ai_scripts
ADD COLUMN conversion_rate DECIMAL(5,2) NULL COMMENT '转化率（百分比）',
ADD COLUMN avg_response_time INT NULL COMMENT '平均响应时间（秒）';

-- ========== 4. 新增AI营销助手场景配置表 ==========

CREATE TABLE IF NOT EXISTS ai_marketing_scenarios (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  scenario_key VARCHAR(50) NOT NULL UNIQUE COMMENT '场景标识（如：pain_point_analysis）',
  scenario_name VARCHAR(100) NOT NULL COMMENT '场景名称',
  scenario_category VARCHAR(50) NOT NULL COMMENT '场景分类（痛点分析/需求挖掘/话术推荐等）',
  description TEXT NULL COMMENT '场景描述',
  model_provider ENUM('deepseek', 'doubao') NOT NULL DEFAULT 'deepseek' COMMENT 'AI供应商',
  model_name VARCHAR(100) NULL COMMENT '具体模型名称',
  system_prompt TEXT NULL COMMENT '系统提示词',
  user_prompt_template TEXT NOT NULL COMMENT '用户提示词模板（支持变量）',
  required_variables JSON NULL COMMENT '必需变量列表，如["chat_content","customer_profile"]',
  optional_variables JSON NULL COMMENT '可选变量列表',
  temperature DECIMAL(3,2) DEFAULT 0.3 COMMENT '温度参数',
  max_tokens INT DEFAULT 2000 COMMENT '最大token数',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category (scenario_category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI营销助手场景配置表';

-- 插入6个营销助手场景配置
INSERT INTO ai_marketing_scenarios (scenario_key, scenario_name, scenario_category, description, model_provider, system_prompt, user_prompt_template, required_variables, temperature, sort_order) VALUES

-- 场景1：痛点识别与分析
('pain_point_analysis', '痛点识别与分析', '需求挖掘', '从聊天记录中识别并分析客户痛点', 'deepseek',
'你是一位专业的教育咨询顾问，擅长从家长的对话中识别他们在孩子教育方面的痛点和焦虑。',
'请分析以下家长与销售的聊天记录，识别出家长的主要痛点（3-5个），并给出详细说明：

【聊天记录】
{{chat_content}}

【客户背景】
{{customer_profile}}

请按以下格式输出JSON：
{
  "pain_points": [
    {"point": "痛点1", "description": "详细说明", "urgency": "高/中/低"},
    {"point": "痛点2", "description": "详细说明", "urgency": "高/中/低"}
  ],
  "core_concern": "核心关切点",
  "emotional_state": "情绪状态分析"
}',
'["chat_content", "customer_profile"]', 0.3, 1),

-- 场景2：兴趣点挖掘
('interest_point_mining', '兴趣点挖掘', '需求挖掘', '从聊天中挖掘客户的兴趣点和关注点', 'deepseek',
'你是一位敏锐的销售分析师，能够从对话细节中发现客户的真实兴趣点。',
'请分析以下聊天记录，挖掘出客户的兴趣点和关注点：

【聊天记录】
{{chat_content}}

请识别出：
1. 客户明确表达的兴趣（如：询问课程、咨询价格等）
2. 客户隐含的兴趣（如：反复提及某个话题、停留在某个功能说明上）
3. 客户最关注的核心要素（如：师资、效果、性价比等）

输出JSON格式：
{
  "explicit_interests": ["兴趣1", "兴趣2"],
  "implicit_interests": ["隐含兴趣1", "隐含兴趣2"],
  "core_interests": ["核心关注点1", "核心关注点2"],
  "priority_rank": ["排序后的优先级列表"]
}',
'["chat_content"]', 0.3, 2),

-- 场景3：需求精准定位
('need_positioning', '需求精准定位', '需求挖掘', '精准定位客户的核心需求和期望', 'deepseek',
'你是专业的需求分析师，能够准确把握客户的真实需求。',
'基于以下聊天内容和客户痛点，精准定位客户需求：

【聊天记录】
{{chat_content}}

【已识别痛点】
{{pain_points}}

【已识别兴趣点】
{{interest_points}}

请输出JSON：
{
  "primary_need": "核心需求",
  "secondary_needs": ["次要需求1", "次要需求2"],
  "expected_outcome": "期望成果",
  "decision_factors": ["决策因素1", "决策因素2"],
  "budget_range": "预算区间预估",
  "urgency_level": "紧迫程度（高/中/低）",
  "need_summary": "需求总结"
}',
'["chat_content", "pain_points", "interest_points"]', 0.3, 3),

-- 场景4：话术智能推荐
('script_recommendation', '话术智能推荐', '话术辅助', '基于客户特征推荐合适的销售话术', 'deepseek',
'你是经验丰富的销售培训师，能够根据客户特征推荐最适合的沟通话术。',
'根据以下客户信息，推荐最适合的销售话术：

【客户痛点】
{{pain_points}}

【客户兴趣点】
{{interest_points}}

【当前沟通阶段】
{{conversation_stage}}

【客户决策角色】
{{decision_role}}

请推荐3-5条话术，输出JSON：
{
  "recommended_scripts": [
    {
      "title": "话术标题",
      "content": "话术内容",
      "usage_scenario": "适用场景",
      "pain_point_addressed": "针对的痛点",
      "expected_effect": "预期效果",
      "tips": "使用技巧"
    }
  ],
  "communication_strategy": "整体沟通策略建议"
}',
'["pain_points", "interest_points", "conversation_stage", "decision_role"]', 0.4, 4),

-- 场景5：异议处理建议
('objection_handling', '异议处理建议', '话术辅助', '分析客户异议并提供处理建议', 'deepseek',
'你是销售异议处理专家，擅长将客户的拒绝转化为机会。',
'分析以下聊天中的客户异议，并提供处理建议：

【聊天记录】
{{chat_content}}

【已识别的异议点】
{{objections}}

请输出JSON：
{
  "objections_analysis": [
    {
      "objection": "异议内容",
      "type": "异议类型（价格/时间/效果/信任等）",
      "root_cause": "根本原因分析",
      "handling_approach": "处理方法",
      "recommended_script": "推荐话术",
      "do_and_dont": {"do": ["应该做的"], "dont": ["避免做的"]}
    }
  ],
  "priority_order": "处理优先级排序",
  "overall_strategy": "整体策略建议"
}',
'["chat_content", "objections"]', 0.3, 5),

-- 场景6：成交时机判断
('closing_timing', '成交时机判断', '销售策略', '判断最佳成交时机并提供行动建议', 'deepseek',
'你是销售时机把握专家，能够准确判断客户的成交信号。',
'基于以下信息，判断成交时机和提供行动建议：

【聊天记录】
{{chat_content}}

【客户意向评分】
{{intention_score}}

【已解决的痛点】
{{resolved_pain_points}}

【未解决的痛点】
{{unresolved_pain_points}}

【沟通轮次】
{{communication_rounds}}

请输出JSON：
{
  "closing_signal_strength": "成交信号强度（强/中/弱）",
  "detected_signals": ["检测到的成交信号1", "信号2"],
  "timing_assessment": "时机评估（立即成交/继续培育/暂缓跟进）",
  "recommended_action": "推荐行动",
  "closing_script": "成交话术",
  "risk_factors": ["风险因素1", "因素2"],
  "success_probability": "成交概率预估（百分比）",
  "next_steps": ["下一步行动1", "行动2"]
}',
'["chat_content", "intention_score", "resolved_pain_points", "unresolved_pain_points", "communication_rounds"]', 0.3, 6)

ON DUPLICATE KEY UPDATE
  user_prompt_template = VALUES(user_prompt_template),
  system_prompt = VALUES(system_prompt),
  update_time = CURRENT_TIMESTAMP;

-- ========== 5. 新增AI分析任务队列表（用于异步处理） ==========

CREATE TABLE IF NOT EXISTS ai_analysis_queue (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  task_type ENUM('chat_analysis', 'customer_profile', 'marketing_scenario', 'script_generation') NOT NULL COMMENT '任务类型',
  task_key VARCHAR(100) NOT NULL COMMENT '任务标识（如：chat_record_123）',
  entity_type VARCHAR(50) NOT NULL COMMENT '关联实体类型',
  entity_id INT NOT NULL COMMENT '关联实体ID',
  task_params JSON NULL COMMENT '任务参数',
  priority INT DEFAULT 5 COMMENT '优先级（1-10，数字越小优先级越高）',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '任务状态',
  retry_count INT DEFAULT 0 COMMENT '重试次数',
  max_retries INT DEFAULT 3 COMMENT '最大重试次数',
  error_message TEXT NULL COMMENT '错误信息',
  result JSON NULL COMMENT '执行结果',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  started_at DATETIME NULL COMMENT '开始处理时间',
  completed_at DATETIME NULL COMMENT '完成时间',
  INDEX idx_status_priority (status, priority),
  INDEX idx_task_key (task_key),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI分析任务队列表';

-- Migration completed successfully
