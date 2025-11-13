-- ================================================================
-- AI提示词配置补充脚本
-- 添加剩余的5个AI功能配置
-- 使用 INSERT IGNORE 确保不覆盖已有配置
-- ================================================================

USE education_crm;

-- ================================================================
-- 1. AI训练对话功能
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI训练',
  'ai_training_conversation',
  'AI对话训练',
  'deepseek',
  'deepseek-chat',
  '你是一个教育培训的潜在客户，用于帮助销售人员进行销售话术练习。',
  '你正在扮演一个教育培训的潜在客户，场景是"{{scenario}}"。
之前的对话：
{{conversationHistory}}

现在请作为客户回复销售，要求：
1. 符合真实客户的反应
2. 可以提出异议或顾虑
3. 50字以内
4. 直接输出客户的话，不要"客户："前缀',
  0.8,
  200,
  1,
  JSON_ARRAY('scenario', 'conversationHistory'),
  '【变量说明】
scenario: 训练场景，如首次电话沟通/价格异议处理/课程介绍
conversationHistory: 对话历史记录（系统自动拼接），格式如下：
  销售：您好...
  客户：...'
);

-- ================================================================
-- 2. 营销文案生成功能
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  '营销工具',
  'marketing_content_generate',
  '营销文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业营销文案专家，擅长创作各类营销内容，包括朋友圈文案、短视频脚本、公众号推文等。',
  '{{instruction}}

{{painPoints}}

{{needs}}

{{interests}}

{{purpose}}

{{style}}

{{wordCount}}

{{tips}}

直接输出文案内容，不要其他说明。',
  0.8,
  2000,
  1,
  JSON_ARRAY('instruction', 'painPoints', 'needs', 'interests', 'purpose', 'style', 'wordCount', 'tips'),
  '【变量说明】
instruction: 文案类型指令（系统自动填充），支持的类型：
  - 朋友圈文案
  - 微信群发文案
  - 抖音营销文案
  - 小红书营销文案
  - 短视频拍摄脚本
  - 公众号推文

painPoints: 客户痛点列表，多个用换行分隔
needs: 客户需求列表，多个用换行分隔
interests: 客户兴趣点列表，多个用换行分隔
purpose: 发布目的，如引流/转化/品牌宣传
style: 风格要求，如专业/亲切/幽默/激励
wordCount: 字数要求，如100字以内/500-800字
tips: 注意事项（系统根据文案类型自动填充）'
);

-- ================================================================
-- 3. CRM问题诊断功能
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'CRM分析',
  'crm_problem_diagnosis',
  'CRM问题诊断',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的CRM数据分析专家，擅长从关键指标中识别业务问题和改进机会。',
  '作为CRM分析专家，请诊断以下数据中存在的问题：

关键指标：
{{keyMetrics}}

请以JSON数组格式输出问题，例如：["问题1", "问题2", "问题3"]

要求：
1. 深入分析指标背后的问题
2. 找出影响业绩的关键因素
3. 问题描述要具体明确
4. 3-5个问题即可',
  0.7,
  1000,
  1,
  JSON_ARRAY('keyMetrics'),
  '【变量说明】
keyMetrics: 关键指标数据（系统自动计算并拼接），包括：
  - 转化率：客户成交率
  - 平均响应时间：销售响应客户的平均时长
  - 高质量线索比例：A/B级客户占比
  - 新增客户数、成交客户数
  等多维度数据'
);

-- ================================================================
-- 4. CRM改进建议功能
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'CRM分析',
  'crm_improvement_recommendation',
  'CRM改进建议',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的CRM顾问，擅长根据诊断出的问题提供具体可执行的改进方案。',
  '基于以下问题，请给出具体的改进建议：

问题：
{{problems}}

请以JSON数组格式输出建议，例如：["建议1", "建议2", "建议3"]

要求：
1. 建议要具体可执行
2. 针对问题提供解决方案
3. 考虑实施的可行性
4. 3-5条建议即可',
  0.7,
  1000,
  1,
  JSON_ARRAY('problems'),
  '【变量说明】
problems: 问题列表（由问题诊断功能自动生成），格式：
  1. 问题1描述
  2. 问题2描述
  3. 问题3描述
  （系统自动拼接，每行一个问题）'
);

-- ================================================================
-- 5. AI人效分析功能
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'CRM分析',
  'ai_efficiency_analysis',
  'AI人效分析报告',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的CRM数据分析专家，擅长分析销售人员的工作效率和AI使用效果。',
  '请对以下销售数据进行人效分析：

{{salesData}}

要求：
1. 分析销售效率和AI功能使用情况
2. 识别高效销售的特征
3. 找出可改进的环节
4. 提供具体优化建议
5. 以结构化格式输出',
  0.7,
  2000,
  1,
  JSON_ARRAY('salesData'),
  '【变量说明】
salesData: 销售人员数据（系统自动聚合），包括：
  - 销售人员基本信息
  - 客户跟进数据
  - AI功能使用情况
  - 成交数据
  - 效率指标（响应时间、跟进频率等）
  等综合数据'
);

-- ================================================================
-- 配置完成提示
-- ================================================================

SELECT
  '✅ AI提示词补充配置完成！' AS message,
  COUNT(*) AS new_configs
FROM ai_prompt_configs
WHERE scenario_key IN (
  'ai_training_conversation',
  'marketing_content_generate',
  'crm_problem_diagnosis',
  'crm_improvement_recommendation',
  'ai_efficiency_analysis'
);

SELECT
  scenario_category AS '场景分类',
  scenario_key AS '场景标识',
  scenario_name AS '场景名称',
  model_provider AS 'AI供应商',
  is_active AS '状态'
FROM ai_prompt_configs
ORDER BY scenario_category, scenario_key;
