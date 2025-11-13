-- ================================================================
-- AI提示词配置初始化脚本
-- 仅插入不存在的配置，不会覆盖已有配置
-- 使用 INSERT IGNORE 确保不覆盖用户修改
-- ================================================================

USE education_crm;

-- ================================================================
-- 1. AI聊天分析功能
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
  'AI聊天分析',
  'chat_deep_analysis',
  '聊天记录深度分析',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业CRM专家和销售心理学分析师，擅长通过聊天记录深度分析客户意图、需求痛点和成交可能性。',
  '请对以下聊天记录进行20+维度的深度分析：

聊天记录：
{{chatText}}

{{customerInfo}}

请从以下维度进行分析，并以JSON格式返回结果：

1. 基础信息分析
   - customerIntent: 意向等级（A/B/C级，高意向/中等意向/低意向/无意向）
   - intentConfidence: 意向判断置信度（0-100）
   - lifecycleStage: 生命周期阶段（新客户/意向客户/成交客户/流失客户）

2. 需求痛点分析（数组）
   - painPoints: ["痛点1", "痛点2", "痛点3"]

3. 行为特征分析
   - responseSpeed: 回复速度（快速/正常/缓慢）
   - chattingAttitude: 聊天态度（积极/友好/冷淡/抗拒）
   - questionQuality: 提问质量（主动深入/基础咨询/被动回应/未提问）

4. 风险预警
   - riskLevel: 风险等级（高/中/低/无）
   - riskFactors: 风险因素数组 ["因素1", "因素2"]

5. 成交分析
   - dealProbability: 成交概率（0-100）
   - priceRange: 预算范围（高预算/中等预算/低预算/未明确）
   - decisionMaker: 是否决策人（是/否/不确定）
   - urgency: 紧急程度（急迫/一般/不急）

6. 标签生成（数组）
   - tags:
     - tagCategory: 标签分类（基础信息/需求痛点/行为特征/风险标签/意向标签）
     - tagName: 标签名称
     - tagValue: 标签值
     - confidence: 置信度（0-1）

7. 推荐动作
   - nextSteps: 建议下一步动作数组 ["行动1", "行动2"]
   - recommendedScript: 推荐话术类型（开场白/价值主张/异议处理/促成话术）

8. 质量评分
   - qualityLevel: 对话质量等级（优秀/良好/一般/较差）
   - qualityScore: 质量分数（0-100）

返回完整的JSON对象，不要添加其他说明文字。',
  0.3,
  4000,
  1,
  JSON_ARRAY('chatText', 'customerInfo'),
  '【变量说明】
chatText: 聊天记录文本内容，必填
customerInfo: 客户基础信息（可选），格式示例：客户姓名、微信昵称、意向等级、生命周期'
);

-- ================================================================
-- 2. AI话术生成功能
-- ================================================================

-- 2.1 开场白话术
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
  '销售话术',
  'sales_script_opening',
  '开场白话术生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。',
  '请为以下客户生成{{scriptType}}话术：

客户信息：
- 客户姓名：{{customerName}}
- 意向等级：{{customerIntent}}
- 生命周期：{{lifecycleStage}}

要求：
1. 话术要自然、亲切、专业
2. 符合教育培训行业特点
3. 针对客户情况个性化定制
4. 100字以内
5. 直接输出话术内容，不要其他说明
6. 开场白要引起客户兴趣，建立信任',
  0.7,
  500,
  1,
  JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，如A级/B级/C级/高意向/中等意向/低意向
lifecycleStage: 生命周期，如新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
);

-- 2.2 价值主张话术
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
  '销售话术',
  'sales_script_value',
  '价值主张话术生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。',
  '请为以下客户生成{{scriptType}}话术：

客户信息：
- 客户姓名：{{customerName}}
- 意向等级：{{customerIntent}}
- 生命周期：{{lifecycleStage}}

要求：
1. 话术要自然、亲切、专业
2. 符合教育培训行业特点
3. 针对客户情况个性化定制
4. 150字以内
5. 直接输出话术内容，不要其他说明
6. 突出产品核心价值和客户能获得的具体好处
7. 结合客户痛点和需求',
  0.7,
  500,
  1,
  JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，如A级/B级/C级/高意向/中等意向/低意向
lifecycleStage: 生命周期，如新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
);

-- 2.3 异议处理话术
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
  '销售话术',
  'sales_script_objection',
  '异议处理话术生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。',
  '请为以下客户生成{{scriptType}}话术：

客户信息：
- 客户姓名：{{customerName}}
- 意向等级：{{customerIntent}}
- 生命周期：{{lifecycleStage}}

要求：
1. 话术要自然、亲切、专业
2. 符合教育培训行业特点
3. 针对客户情况个性化定制
4. 150字以内
5. 直接输出话术内容，不要其他说明
6. 针对常见异议（价格贵、没时间、再考虑）提供应对策略
7. 采用同理心+价值重塑的方式',
  0.7,
  500,
  1,
  JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，如A级/B级/C级/高意向/中等意向/低意向
lifecycleStage: 生命周期，如新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
);

-- 2.4 促成话术
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
  '销售话术',
  'sales_script_closing',
  '促成话术生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训销售话术专家，擅长根据客户画像生成个性化的销售话术。',
  '请为以下客户生成{{scriptType}}话术：

客户信息：
- 客户姓名：{{customerName}}
- 意向等级：{{customerIntent}}
- 生命周期：{{lifecycleStage}}

要求：
1. 话术要自然、亲切、专业
2. 符合教育培训行业特点
3. 针对客户情况个性化定制
4. 100字以内
5. 直接输出话术内容，不要其他说明
6. 创造紧迫感，给出明确的行动指引
7. 提供优惠或福利刺激成交',
  0.7,
  500,
  1,
  JSON_ARRAY('customerName', 'customerIntent', 'lifecycleStage', 'scriptType'),
  '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 意向等级，如A级/B级/C级/高意向/中等意向/低意向
lifecycleStage: 生命周期，如新客户/意向客户/成交客户/流失客户
scriptType: 话术类型（系统自动填充）'
);

-- ================================================================
-- 3. 客户挽回话术
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
  '客户运营',
  'customer_recovery_script',
  '流失客户挽回话术',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训客户关系专家，擅长通过个性化话术挽回流失客户。',
  '请为以下流失客户生成挽回话术：

客户信息：
- 客户姓名：{{customerName}}
- 意向等级：{{customerIntent}}
- 流失原因：{{reason}}
- 上次跟进时间：{{lastFollowTime}}

要求：
1. 真诚表达关心，重建信任
2. 了解流失原因，提供解决方案
3. 提供专属福利或优惠吸引回归
4. 150字以内
5. 直接输出话术内容，不要其他说明',
  0.7,
  500,
  1,
  JSON_ARRAY('customerName', 'customerIntent', 'reason', 'lastFollowTime'),
  '【变量说明】
customerName: 客户姓名或昵称，必填
customerIntent: 原意向等级，如A级/B级/C级
reason: 流失原因，如价格因素/时间不合适/竞品选择/无回应
lastFollowTime: 上次跟进时间，格式YYYY-MM-DD'
);

-- ================================================================
-- 配置完成提示
-- ================================================================

SELECT
  '✅ AI提示词配置初始化完成！' AS message,
  COUNT(*) AS total_configs
FROM ai_prompt_configs
WHERE is_active = 1;

SELECT
  scenario_category AS '场景分类',
  scenario_key AS '场景标识',
  scenario_name AS '场景名称',
  model_provider AS 'AI供应商',
  is_active AS '状态'
FROM ai_prompt_configs
ORDER BY scenario_category, scenario_key;
