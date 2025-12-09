-- ================================================================
-- AI提示词变量配置更新脚本
-- 为所有AI提示词配置添加变量信息，方便前端管理和调整
-- ================================================================

USE education_crm;

-- ================================================================
-- 1. 聊天分析类
-- ================================================================

-- 1.1 聊天记录深度分析
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('chatText', 'customerInfo'),
  `variable_description` = '【变量说明】
chatText: 聊天记录文本内容，必填
customerInfo: 客户基础信息（可选），格式示例：
  - 客户姓名：张三
  - 微信昵称：阳光少年
  - 意向等级：A级
  - 生命周期：意向客户'
WHERE `scenario_key` = 'chat_deep_analysis' AND `model_provider` = 'deepseek';

-- 1.2 聊天OCR识别
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('imagePath'),
  `variable_description` = '【变量说明】
imagePath: 微信聊天截图的文件路径，必填
注意：图片需要清晰可读，支持常见图片格式'
WHERE `scenario_key` = 'chat_ocr_extract' AND `model_provider` = 'doubao';

-- ================================================================
-- 2. 销售话术类
-- ================================================================

-- 2.1 开场白话术
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  `variable_description` = '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向
lifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
WHERE `scenario_key` = 'sales_script_opening' AND `model_provider` = 'deepseek';

-- 2.2 价值主张话术
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  `variable_description` = '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向
lifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
WHERE `scenario_key` = 'sales_script_value' AND `model_provider` = 'deepseek';

-- 2.3 异议处理话术
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  `variable_description` = '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向
lifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
WHERE `scenario_key` = 'sales_script_objection' AND `model_provider` = 'deepseek';

-- 2.4 促成话术
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  `variable_description` = '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，可选值：A级/B级/C级/高意向/中等意向/低意向/无意向
lifecycleStage: 生命周期阶段，可选值：新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
WHERE `scenario_key` = 'sales_script_closing' AND `model_provider` = 'deepseek';

-- ================================================================
-- 3. 客户运营类
-- ================================================================

-- 3.1 客户挽回话术
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('customerName', 'customerIntent', 'reason', 'lastFollowTime'),
  `variable_description` = '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 原意向等级，可选值：A级/B级/C级
reason: 流失原因，例如：价格因素/时间不合适/竞品选择/无回应
lastFollowTime: 上次跟进时间，格式：YYYY-MM-DD'
WHERE `scenario_key` = 'customer_recovery_script' AND `model_provider` = 'deepseek';

-- ================================================================
-- 4. AI训练类
-- ================================================================

-- 4.1 AI对话训练
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('scenario', 'conversationHistory'),
  `variable_description` = '【变量说明】
scenario: 训练场景，例如：首次电话沟通/价格异议处理/课程介绍
conversationHistory: 对话历史记录，格式：
  销售：您好...
  客户：...
  （系统自动拼接）'
WHERE `scenario_key` = 'ai_training_conversation' AND `model_provider` = 'deepseek';

-- ================================================================
-- 5. 营销工具类
-- ================================================================

-- 5.1 营销文案生成
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('instruction', 'painPoints', 'needs', 'interests', 'purpose', 'style', 'wordCount', 'tips'),
  `variable_description` = '【变量说明】
instruction: 文案类型指令（系统根据选择自动填充）
  - 朋友圈文案
  - 微信群发文案
  - 抖音营销文案
  - 小红书营销文案
  - 短视频拍摄脚本
  - 公众号推文

painPoints: 客户痛点列表，多个用换行分隔
needs: 客户需求列表，多个用换行分隔
interests: 客户兴趣点列表，多个用换行分隔
purpose: 发布目的，例如：引流/转化/品牌宣传
style: 风格要求，例如：专业/亲切/幽默/激励
wordCount: 字数要求，例如：100字以内/500-800字
tips: 注意事项（系统根据文案类型自动填充）'
WHERE `scenario_key` = 'marketing_content_generate' AND `model_provider` = 'deepseek';

-- ================================================================
-- 6. CRM分析类
-- ================================================================

-- 6.1 CRM问题诊断
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('keyMetrics'),
  `variable_description` = '【变量说明】
keyMetrics: 关键指标数据（系统自动计算），包括：
  - 转化率：客户成交率
  - 平均响应时间：销售响应客户的平均时长
  - 高质量线索比例：A/B级客户占比
  - 新增客户数
  - 成交客户数
  等多维度数据'
WHERE `scenario_key` = 'crm_problem_diagnosis' AND `model_provider` = 'deepseek';

-- 6.2 CRM改进建议
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('problems'),
  `variable_description` = '【变量说明】
problems: 问题列表（由问题诊断功能自动生成），格式：
  1. 问题1描述
  2. 问题2描述
  3. 问题3描述
  ...'
WHERE `scenario_key` = 'crm_improvement_recommendation' AND `model_provider` = 'deepseek';

-- 6.3 AI人效分析
UPDATE `ai_prompt_configs`
SET
  `variables` = JSON_ARRAY('salesData'),
  `variable_description` = '【变量说明】
salesData: 销售人员数据（系统自动聚合），包括：
  - 销售人员信息
  - 客户跟进数据
  - AI功能使用情况
  - 成交数据
  - 效率指标
  等综合数据'
WHERE `scenario_key` = 'ai_efficiency_analysis' AND `model_provider` = 'deepseek';

-- ================================================================
-- 查看更新结果
-- ================================================================

SELECT
  '✅ AI提示词变量配置更新完成！' AS message,
  COUNT(*) AS updated_configs
FROM ai_prompt_configs
WHERE variables IS NOT NULL;

SELECT
  scenario_category AS '场景分类',
  scenario_key AS '场景标识',
  scenario_name AS '场景名称',
  JSON_LENGTH(variables) AS '变量数量',
  CASE
    WHEN variable_description IS NOT NULL THEN '已配置'
    ELSE '未配置'
  END AS '变量说明'
FROM ai_prompt_configs
ORDER BY scenario_category, scenario_key;
