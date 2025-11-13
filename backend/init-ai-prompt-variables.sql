-- ================================================================
-- AI提示词变量配置初始化脚本
-- 为所有AI功能配置完整的变量字段
-- 每个变量独立一条记录，方便管理和调整
-- ================================================================

USE education_crm;

-- ================================================================
-- 1. AI聊天分析类
-- ================================================================

-- 1.1 聊天记录深度分析 (chat_deep_analysis)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'chat_deep_analysis',
  'chatText',
  '聊天记录',
  '微信聊天记录的完整文本内容，包含销售和客户的对话',
  'text',
  1,
  1,
  '销售：您好，了解到您对我们的课程感兴趣\n客户：是的，想了解一下...',
  1,
  '必填字段'
FROM ai_prompt_configs WHERE scenario_key = 'chat_deep_analysis' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'chat_deep_analysis',
  'customerInfo',
  '客户基础信息',
  '客户的基础信息，包括姓名、昵称、意向等级、生命周期等（可选）',
  'text',
  0,
  1,
  '客户姓名：张三\n微信昵称：阳光少年\n意向等级：A级\n生命周期：意向客户',
  2,
  '可选字段'
FROM ai_prompt_configs WHERE scenario_key = 'chat_deep_analysis' AND model_provider = 'deepseek';

-- 1.2 聊天OCR识别 (chat_ocr_extract)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'chat_ocr_extract',
  'imagePath',
  '图片路径',
  '微信聊天截图的文件路径，需要清晰可读',
  'text',
  1,
  1,
  '/uploads/chat_screenshot_20250113.png',
  1,
  '必填字段'
FROM ai_prompt_configs WHERE scenario_key = 'chat_ocr_extract' AND model_provider = 'doubao';

-- ================================================================
-- 2. 销售话术类（4个场景共用相同变量）
-- ================================================================

-- 2.1 开场白话术 (sales_script_opening)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_opening',
  'customerName',
  '客户姓名',
  '客户的姓名或微信昵称',
  'text',
  1,
  1,
  '张三',
  1,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_opening' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_opening',
  'customerIntent',
  '意向等级',
  '客户的意向等级分类',
  'text',
  1,
  1,
  'A级/B级/C级/高意向/中等意向/低意向/无意向',
  2,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_opening' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_opening',
  'lifecycleStage',
  '生命周期',
  '客户当前所处的生命周期阶段',
  'text',
  1,
  1,
  '新客户/意向客户/成交客户/流失客户',
  3,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_opening' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_opening',
  'scriptType',
  '话术类型',
  '系统自动填充的话术类型标识',
  'text',
  1,
  1,
  '开场白',
  4,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_opening' AND model_provider = 'deepseek';

-- 2.2 价值主张话术 (sales_script_value)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_value',
  'customerName',
  '客户姓名',
  '客户的姓名或微信昵称',
  'text',
  1,
  1,
  '张三',
  1,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_value' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_value',
  'customerIntent',
  '意向等级',
  '客户的意向等级分类',
  'text',
  1,
  1,
  'A级/B级/C级/高意向/中等意向/低意向/无意向',
  2,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_value' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_value',
  'lifecycleStage',
  '生命周期',
  '客户当前所处的生命周期阶段',
  'text',
  1,
  1,
  '新客户/意向客户/成交客户/流失客户',
  3,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_value' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_value',
  'scriptType',
  '话术类型',
  '系统自动填充的话术类型标识',
  'text',
  1,
  1,
  '价值主张',
  4,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_value' AND model_provider = 'deepseek';

-- 2.3 异议处理话术 (sales_script_objection)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_objection',
  'customerName',
  '客户姓名',
  '客户的姓名或微信昵称',
  'text',
  1,
  1,
  '张三',
  1,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_objection' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_objection',
  'customerIntent',
  '意向等级',
  '客户的意向等级分类',
  'text',
  1,
  1,
  'A级/B级/C级/高意向/中等意向/低意向/无意向',
  2,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_objection' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_objection',
  'lifecycleStage',
  '生命周期',
  '客户当前所处的生命周期阶段',
  'text',
  1,
  1,
  '新客户/意向客户/成交客户/流失客户',
  3,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_objection' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_objection',
  'scriptType',
  '话术类型',
  '系统自动填充的话术类型标识',
  'text',
  1,
  1,
  '异议处理',
  4,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_objection' AND model_provider = 'deepseek';

-- 2.4 促成话术 (sales_script_closing)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_closing',
  'customerName',
  '客户姓名',
  '客户的姓名或微信昵称',
  'text',
  1,
  1,
  '张三',
  1,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_closing' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_closing',
  'customerIntent',
  '意向等级',
  '客户的意向等级分类',
  'text',
  1,
  1,
  'A级/B级/C级/高意向/中等意向/低意向/无意向',
  2,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_closing' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_closing',
  'lifecycleStage',
  '生命周期',
  '客户当前所处的生命周期阶段',
  'text',
  1,
  1,
  '新客户/意向客户/成交客户/流失客户',
  3,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_closing' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'sales_script_closing',
  'scriptType',
  '话术类型',
  '系统自动填充的话术类型标识',
  'text',
  1,
  1,
  '促成话术',
  4,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'sales_script_closing' AND model_provider = 'deepseek';

-- ================================================================
-- 3. 客户运营类
-- ================================================================

-- 3.1 客户挽回话术 (customer_recovery_script)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'customer_recovery_script',
  'customerName',
  '客户姓名',
  '流失客户的姓名或昵称',
  'text',
  1,
  1,
  '李四',
  1,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'customer_recovery_script' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'customer_recovery_script',
  'customerIntent',
  '原意向等级',
  '客户流失前的意向等级',
  'text',
  1,
  1,
  'A级/B级/C级',
  2,
  '客户信息'
FROM ai_prompt_configs WHERE scenario_key = 'customer_recovery_script' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'customer_recovery_script',
  'reason',
  '流失原因',
  '客户流失的主要原因',
  'text',
  0,
  1,
  '价格因素/时间不合适/竞品选择/无回应',
  3,
  '业务信息'
FROM ai_prompt_configs WHERE scenario_key = 'customer_recovery_script' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'customer_recovery_script',
  'lastFollowTime',
  '上次跟进时间',
  '最后一次跟进客户的时间',
  'date',
  0,
  1,
  '2025-01-10',
  4,
  '业务信息'
FROM ai_prompt_configs WHERE scenario_key = 'customer_recovery_script' AND model_provider = 'deepseek';

-- ================================================================
-- 4. AI训练类
-- ================================================================

-- 4.1 AI对话训练 (ai_training_conversation)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'ai_training_conversation',
  'scenario',
  '训练场景',
  '销售话术练习的具体场景',
  'text',
  1,
  1,
  '首次电话沟通/价格异议处理/课程介绍',
  1,
  '训练设置'
FROM ai_prompt_configs WHERE scenario_key = 'ai_training_conversation' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'ai_training_conversation',
  'conversationHistory',
  '对话历史',
  '之前轮次的对话记录（系统自动拼接）',
  'text',
  1,
  1,
  '销售：您好，了解到您对我们的课程感兴趣\n客户：是的，想了解一下价格',
  2,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'ai_training_conversation' AND model_provider = 'deepseek';

-- ================================================================
-- 5. 营销工具类
-- ================================================================

-- 5.1 营销文案生成 (marketing_content_generate)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'instruction',
  '文案类型指令',
  '系统根据选择自动填充的文案类型',
  'text',
  1,
  1,
  '生成一条适合发朋友圈的营销文案',
  1,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'painPoints',
  '客户痛点',
  '目标客户的痛点列表，多个用换行分隔',
  'text',
  0,
  1,
  '孩子学习成绩不理想\n找不到好的培训机构\n担心学费太贵',
  2,
  '内容要素'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'needs',
  '客户需求',
  '目标客户的需求列表，多个用换行分隔',
  'text',
  0,
  1,
  '提升孩子成绩\n个性化辅导\n灵活的上课时间',
  3,
  '内容要素'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'interests',
  '客户兴趣点',
  '目标客户的兴趣点列表，多个用换行分隔',
  'text',
  0,
  1,
  '名师教学\n小班授课\n试听课程',
  4,
  '内容要素'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'purpose',
  '发布目的',
  '发布这条营销内容的主要目的',
  'text',
  0,
  1,
  '引流/转化/品牌宣传/活动推广',
  5,
  '风格设置'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'style',
  '风格要求',
  '文案的写作风格要求',
  'text',
  0,
  1,
  '专业/亲切/幽默/激励',
  6,
  '风格设置'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'wordCount',
  '字数要求',
  '文案的字数限制要求',
  'text',
  0,
  1,
  '100字以内/200-300字/500-800字',
  7,
  '风格设置'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'marketing_content_generate',
  'tips',
  '注意事项',
  '系统根据文案类型自动填充的注意事项',
  'text',
  1,
  1,
  '要求：简洁有力，引发共鸣，包含适当emoji',
  8,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'marketing_content_generate' AND model_provider = 'deepseek';

-- ================================================================
-- 6. CRM分析类
-- ================================================================

-- 6.1 CRM问题诊断 (crm_problem_diagnosis)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'crm_problem_diagnosis',
  'keyMetrics',
  '关键指标数据',
  '系统自动计算并拼接的关键业务指标',
  'text',
  1,
  1,
  '转化率：15.5%\n平均响应时间：2.3小时\n高质量线索比例：28%',
  1,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'crm_problem_diagnosis' AND model_provider = 'deepseek';

-- 6.2 CRM改进建议 (crm_improvement_recommendation)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'crm_improvement_recommendation',
  'problems',
  '问题列表',
  '由问题诊断功能自动生成的问题列表',
  'array',
  1,
  1,
  '1. 客户响应时间过长\n2. 高质量线索转化率偏低\n3. 跟进频率不够',
  1,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'crm_improvement_recommendation' AND model_provider = 'deepseek';

-- 6.3 AI人效分析 (ai_efficiency_analysis)
INSERT IGNORE INTO `ai_prompt_variables`
(`prompt_config_id`, `scenario_key`, `variable_key`, `variable_name`, `variable_description`, `data_type`, `is_required`, `is_active`, `example_value`, `display_order`, `category`)
SELECT
  id,
  'ai_efficiency_analysis',
  'salesData',
  '销售数据',
  '系统自动聚合的销售人员综合数据',
  'json',
  1,
  1,
  '包括：销售信息、客户跟进数据、AI使用情况、成交数据、效率指标等',
  1,
  '系统自动'
FROM ai_prompt_configs WHERE scenario_key = 'ai_efficiency_analysis' AND model_provider = 'deepseek';

-- ================================================================
-- 配置完成提示
-- ================================================================

SELECT
  '✅ AI提示词变量配置初始化完成！' AS message,
  COUNT(*) AS total_variables
FROM ai_prompt_variables;

SELECT
  scenario_key AS '场景标识',
  COUNT(*) AS '变量数量'
FROM ai_prompt_variables
GROUP BY scenario_key
ORDER BY scenario_key;
