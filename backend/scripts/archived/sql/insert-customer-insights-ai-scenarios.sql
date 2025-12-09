-- 插入客户洞察AI场景配置（痛点分析和兴趣点挖掘）
-- 这两个场景用于从聊天记录中提取客户的痛点、兴趣点和需求关键词

USE education_crm;

-- 1. 痛点分析场景
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`
) VALUES (
  'pain_point_analysis',
  '客户痛点分析',
  'analysis',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业销售分析专家，擅长从客户对话中识别客户的痛点和困扰。

你的任务：
1. 深入分析客户在对话中表达的问题、困扰和不满
2. 识别客户明确提到的痛点（explicit pain points）
3. 发现客户隐含的潜在痛点（implicit pain points）
4. 对痛点进行分类和优先级排序

分析要求：
- 痛点必须基于对话中的实际证据
- 区分表面问题和深层痛点
- 关注教育培训行业常见痛点（学习效果、兴趣、方法、时间等）
- 输出格式为JSON',
  '请分析以下聊天记录，提取客户的痛点和困扰。

【客户信息】
微信昵称：{{customerName}}
意向等级：{{customerIntent}}
学生年级：{{studentGrade}}

【聊天记录】
{{chatContent}}

【分析要求】
请严格按照以下JSON格式输出（不要添加markdown格式符号）：

{
  "pain_points": [
    {
      "point": "痛点描述（简短明确）",
      "category": "分类（学习效果/学习兴趣/学习方法/时间管理/家庭教育/其他）",
      "severity": "严重程度（高/中/低）",
      "evidence": "对话中的证据（客户原话）",
      "type": "explicit或implicit"
    }
  ],
  "summary": "痛点总结（50字以内）",
  "priority_order": ["最重要的痛点", "次要痛点", ...]
}

注意：
1. 只提取真实存在的痛点，没有就返回空数组
2. 痛点描述要简洁（10字以内）
3. 必须标注是明确（explicit）还是隐含（implicit）的痛点
4. evidence字段必须引用客户在对话中的原话',
  0.3,
  2000,
  1
);

-- 2. 兴趣点挖掘场景
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`
) VALUES (
  'interest_point_mining',
  '客户兴趣点挖掘',
  'analysis',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业销售分析专家，擅长从客户对话中挖掘客户的兴趣点和关注点。

你的任务：
1. 识别客户在对话中表达的兴趣和关注点
2. 发现客户对哪些话题、方案、产品表现出好奇或兴趣
3. 分析客户的潜在需求和期待
4. 提取核心兴趣和次要兴趣

分析要求：
- 兴趣点必须基于对话中的实际证据
- 区分明确表达的兴趣和隐含的兴趣
- 关注教育培训行业特点（教学方法、师资、效果、价格等）
- 输出格式为JSON',
  '请分析以下聊天记录，提取客户的兴趣点和关注点。

【聊天记录】
{{chatContent}}

【分析要求】
请严格按照以下JSON格式输出（不要添加markdown格式符号）：

{
  "explicit_interests": [
    "明确表达的兴趣点1",
    "明确表达的兴趣点2"
  ],
  "implicit_interests": [
    "隐含的兴趣点1",
    "隐含的兴趣点2"
  ],
  "core_interests": [
    "核心兴趣1",
    "核心兴趣2"
  ],
  "interest_details": [
    {
      "interest": "兴趣点描述",
      "category": "分类（教学方法/师资力量/课程内容/学习效果/价格优惠/其他）",
      "intensity": "强度（高/中/低）",
      "evidence": "对话中的证据"
    }
  ],
  "recommended_topics": [
    "建议深入沟通的话题1",
    "建议深入沟通的话题2"
  ]
}

注意：
1. explicit_interests：客户明确提出问题或表达兴趣的点
2. implicit_interests：客户话语中隐含的潜在兴趣
3. core_interests：最重要的3-5个核心兴趣
4. 兴趣点描述要简洁明确
5. evidence必须引用对话中的实际内容',
  0.3,
  2000,
  1
);

-- 验证插入
SELECT
  id,
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  is_active
FROM ai_prompt_configs
WHERE scenario_key IN ('pain_point_analysis', 'interest_point_mining');
