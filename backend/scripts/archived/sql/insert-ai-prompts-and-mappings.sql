-- ========================================
-- AI提示词配置 - 完整梳理
-- 包含：AI话术助手 + 企业知识库
-- 创建时间：2025-11-20
-- ========================================

-- ========================================
-- 第一部分：AI话术助手配置（2个场景）
-- ========================================

-- 1. 混合话术生成（使用企业知识库+AI）
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'ai_script_mixed',
  '混合话术生成（知识库+AI）',
  'AI话术助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的销售话术助手。',
  '【用户需求】
{{userInput}}

【企业知识库参考】
{{referenceContent}}
{{scenarioInfo}}{{techniqueInfo}}

【任务要求】
1. 优先使用知识库中的准确信息
2. 可以适当优化和扩展，使话术更完善、更自然
3. 保持专业、真诚的沟通风格
4. 符合{{functionType}}的使用场景

请按以下格式输出：

【思考过程】
（简要说明你的分析思路，2-3句话）

【推荐话术】
（生成的完整话术内容，直接可用）

【改进建议】
1. （第一条建议）
2. （第二条建议）
3. （第三条建议）',
  0.3,
  2000,
  '["userInput", "referenceContent", "scenarioInfo", "techniqueInfo", "functionType"]',
  'userInput: 用户输入的需求描述\nreferenceContent: 企业知识库参考内容\nscenarioInfo: 销售场景信息（可选）\ntechniqueInfo: 使用技巧信息（可选）\nfunctionType: 功能类型（客户挖掘/需求引导/异议处理/促成成交）',
  1,
  1
);

-- 2. 纯AI话术生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'ai_script_pure',
  '纯AI话术生成',
  'AI话术助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的销售话术助手。',
  '【用户需求】
{{userInput}}
{{scenarioInfo}}{{techniqueInfo}}

【任务要求】
1. 生成专业、实用的{{functionType}}话术
2. 语言自然流畅，符合实际对话场景
3. 结合场景和技巧要求，贴近实战
4. 保持真诚、专业的沟通风格

请按以下格式输出：

【思考过程】
（分析用户需求和场景特点，3-4句话）

【推荐话术】
（生成的完整话术内容，直接可用）

【改进建议】
1. （第一条优化建议）
2. （第二条优化建议）
3. （第三条优化建议）',
  0.3,
  2000,
  '["userInput", "scenarioInfo", "techniqueInfo", "functionType"]',
  'userInput: 用户输入的需求描述\nscenarioInfo: 销售场景信息（可选）\ntechniqueInfo: 使用技巧信息（可选）\nfunctionType: 功能类型（客户挖掘/需求引导/异议处理/促成成交）',
  1,
  1
);

-- ========================================
-- 第二部分：企业知识库配置（8个场景）
-- ========================================

-- 1. 知识语义评分与排序
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_semantic_scoring',
  '知识语义评分与排序',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的知识库智能检索助手，能够准确理解用户问题并匹配最相关的知识条目。',
  '【用户问题】
{{userQuestion}}

【候选知识库列表】
{{knowledgeList}}

【任务要求】
1. 分析用户问题的核心意图
2. 评估每个知识条目与问题的相关性
3. 给每个知识条目打分（0-100分）
4. 说明匹配原因

请按以下JSON格式输出：
{
  "rankings": [
    {
      "knowledgeId": 1,
      "score": 95,
      "matchReason": "完全匹配用户问题的核心需求"
    },
    {
      "knowledgeId": 2,
      "score": 75,
      "matchReason": "部分相关，包含有用的参考信息"
    }
  ]
}',
  0.2,
  1500,
  '["userQuestion", "knowledgeList"]',
  'userQuestion: 用户提出的问题\nknowledgeList: 候选知识库条目列表（格式：序号. 标题+内容摘要）',
  1,
  1
);

-- 2. 生成企业基础信息
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_company_info_generate',
  '生成企业基础信息',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的企业信息分析专家，能够根据用户提供的信息生成标准化的企业基础资料。',
  '【企业信息】
公司名称：{{companyName}}
所属行业：{{industry}}

【用户补充说明】
{{userPrompt}}

【任务要求】
请根据以上信息，生成企业基础信息档案，包括：
1. 公司简介（companyDescription）- 200字左右
2. 主营业务（mainBusiness）- 100字左右
3. 核心优势（advantages）- 列举3-5个要点
4. 产品/服务（productServices）- 列举主要产品或服务

请按以下JSON格式输出：
{
  "companyDescription": "公司简介内容",
  "mainBusiness": "主营业务内容",
  "advantages": "优势1；优势2；优势3",
  "productServices": "产品1；产品2；产品3"
}',
  0.5,
  2000,
  '["companyName", "industry", "userPrompt"]',
  'companyName: 公司名称\nindustry: 所属行业\nuserPrompt: 用户补充的企业信息说明',
  1,
  1
);

-- 3. Q&A提取
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_qa_extraction',
  'Q&A提取',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的对话分析专家，能够从客服聊天记录中提取有价值的问答对（Q&A）。',
  '【聊天记录】
{{chatContent}}

【客户上下文】
{{customerContext}}

【任务要求】
1. 识别聊天中客户提出的明确问题
2. 提取对应的客服回答
3. 评估问答的价值和质量
4. 为每个Q&A分类并评分

请按以下JSON格式输出：
{
  "qaList": [
    {
      "question": "客户的问题",
      "answer": "客服的回答",
      "category": "问题分类（产品咨询/价格询问/售后服务等）",
      "confidence": 85,
      "reason": "提取此Q&A的原因"
    }
  ]
}',
  0.3,
  2500,
  '["chatContent", "customerContext"]',
  'chatContent: 聊天记录文本内容\ncustomerContext: 客户背景信息（JSON格式）',
  1,
  1
);

-- 4. 知识分类
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_classification',
  '知识自动分类',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的知识分类专家，能够准确分析问答内容并进行多维度分类。',
  '【问题】
{{question}}

【回答】
{{answer}}

【任务要求】
请对此问答进行多维度分类：
1. 场景分类（sceneCategory）：产品咨询/价格询问/售后服务/技术支持/其他
2. 产品分类（productCategory）：根据问答内容识别涉及的产品类别
3. 问题类型（questionType）：咨询/投诉/建议/求助
4. 重要程度（importance）：高/中/低

请按以下JSON格式输出：
{
  "sceneCategory": "产品咨询",
  "productCategory": "具体产品名称",
  "questionType": "咨询",
  "importance": "中"
}',
  0.2,
  1000,
  '["question", "answer"]',
  'question: 用户的问题\nanswer: 对应的回答',
  1,
  1
);

-- 5. 质量评分
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_quality_scoring',
  '知识质量评分',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的知识质量评估专家，能够客观评价问答的质量和价值。',
  '【问题】
{{question}}

【回答】
{{answer}}

【评分标准】
1. 准确性：回答是否准确、完整
2. 实用性：是否具有实际参考价值
3. 清晰度：表达是否清晰易懂
4. 完整性：是否全面回答了问题

请给出综合评分（0-100分）。

请按以下JSON格式输出：
{
  "score": 85,
  "reason": "回答准确完整，表达清晰，具有较高参考价值"
}',
  0.2,
  800,
  '["question", "answer"]',
  'question: 用户的问题\nanswer: 对应的回答',
  1,
  1
);

-- 6. 生成行业问题
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_industry_questions',
  '生成行业常见问题',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的行业研究专家，熟悉各行业客户的典型问题和需求。',
  '【目标行业】
{{industry}}

【生成数量】
{{count}}

{{#if specificScenario}}
【特定场景】
{{specificScenario}}
{{/if}}

【任务要求】
请生成该行业客户最常问的典型问题，要求：
1. 问题具有代表性和普遍性
2. 贴近实际业务场景
3. 覆盖不同业务环节
4. 问题表述自然、口语化

请按以下JSON格式输出：
{
  "questions": [
    {
      "question": "问题内容",
      "category": "问题分类",
      "frequency": "high|medium|low",
      "scenario": "适用场景"
    }
  ]
}',
  0.7,
  2500,
  '["industry", "count", "specificScenario"]',
  'industry: 目标行业\ncount: 需要生成的问题数量\nspecificScenario: 特定业务场景（可选）',
  1,
  1
);

-- 7. 反馈优化
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_optimization',
  '知识反馈优化',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的知识优化专家，能够根据用户反馈改进知识库内容。',
  '【用户问题】
{{userQuestion}}

【当前知识库回答】
{{knowledgeAnswer}}

【用户反馈】
{{feedbackReason}}

【任务要求】
请分析用户反馈，并提供优化建议：
1. 问题分析：当前回答存在什么问题
2. 优化建议：如何改进可以更好地满足需求
3. 改进后的回答：提供优化后的完整答案

请按以下JSON格式输出：
{
  "problemAnalysis": "问题分析",
  "optimizationSuggestions": ["建议1", "建议2", "建议3"],
  "improvedAnswer": "改进后的完整回答",
  "confidence": 85
}',
  0.4,
  2000,
  '["userQuestion", "knowledgeAnswer", "feedbackReason"]',
  'userQuestion: 用户的原始问题\nknowledgeAnswer: 知识库当前的回答\nfeedbackReason: 用户反馈的原因',
  1,
  1
);

-- 8. 知识使用决策
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'knowledge_usage_decision',
  '知识使用决策',
  '企业知识库',
  'deepseek',
  'deepseek-chat',
  '你是一个智能决策助手，能够判断在当前对话中是否需要引用知识库内容。',
  '【用户问题】
{{userQuestion}}

【候选知识库】
{{knowledgeList}}

【对话上下文】
{{conversationContext}}

【任务要求】
请分析判断：
1. 是否需要使用知识库（shouldUse: true/false）
2. 如果需要，选择哪几条知识（selectedIds）
3. 如何整合知识库内容回答问题（suggestion）
4. 决策理由（reason）

请按以下JSON格式输出：
{
  "shouldUse": true,
  "selectedIds": [1, 3],
  "suggestion": "建议如何使用这些知识库内容来回答问题",
  "reason": "选择这些知识的原因",
  "confidence": 90
}',
  0.3,
  1500,
  '["userQuestion", "knowledgeList", "conversationContext"]',
  'userQuestion: 用户当前的问题\nknowledgeList: 候选知识库条目\nconversationContext: 对话历史上下文',
  1,
  1
);

-- ========================================
-- 第三部分：字段映射配置
-- ========================================

-- AI话术助手 - 混合话术生成的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('ai_script_mixed', '混合话术生成', 'userInput', 'userInput', 'direct', 'string', 1, 1, 1, '用户输入的话术需求'),
  ('ai_script_mixed', '混合话术生成', 'referenceContent', 'referenceContent', 'direct', 'string', 1, 1, 2, '知识库参考内容'),
  ('ai_script_mixed', '混合话术生成', 'scenarioInfo', 'scenarioInfo', 'direct', 'string', 0, 1, 3, '销售场景信息'),
  ('ai_script_mixed', '混合话术生成', 'techniqueInfo', 'techniqueInfo', 'direct', 'string', 0, 1, 4, '使用技巧信息'),
  ('ai_script_mixed', '混合话术生成', 'functionType', 'functionType', 'direct', 'string', 1, 1, 5, '功能类型');

-- AI话术助手 - 纯AI话术生成的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('ai_script_pure', '纯AI话术生成', 'userInput', 'userInput', 'direct', 'string', 1, 1, 1, '用户输入的话术需求'),
  ('ai_script_pure', '纯AI话术生成', 'scenarioInfo', 'scenarioInfo', 'direct', 'string', 0, 1, 2, '销售场景信息'),
  ('ai_script_pure', '纯AI话术生成', 'techniqueInfo', 'techniqueInfo', 'direct', 'string', 0, 1, 3, '使用技巧信息'),
  ('ai_script_pure', '纯AI话术生成', 'functionType', 'functionType', 'direct', 'string', 1, 1, 4, '功能类型');

-- 企业知识库 - 语义评分的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_semantic_scoring', '知识语义评分', 'userQuestion', 'userQuestion', 'direct', 'string', 1, 1, 1, '用户提出的问题'),
  ('knowledge_semantic_scoring', '知识语义评分', 'knowledgeList', 'knowledgeList', 'direct', 'string', 1, 1, 2, '候选知识库列表');

-- 企业知识库 - 生成企业信息的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_company_info_generate', '生成企业基础信息', 'companyName', 'companyName', 'direct', 'string', 1, 1, 1, '公司名称'),
  ('knowledge_company_info_generate', '生成企业基础信息', 'industry', 'industry', 'direct', 'string', 1, 1, 2, '所属行业'),
  ('knowledge_company_info_generate', '生成企业基础信息', 'userPrompt', 'userPrompt', 'direct', 'string', 0, 1, 3, '用户补充说明');

-- 企业知识库 - Q&A提取的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_qa_extraction', 'Q&A提取', 'chatContent', 'chatContent', 'direct', 'string', 1, 1, 1, '聊天记录内容'),
  ('knowledge_qa_extraction', 'Q&A提取', 'customerContext', 'customerContext', 'direct', 'string', 0, 1, 2, '客户背景信息');

-- 企业知识库 - 知识分类的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_classification', '知识自动分类', 'question', 'question', 'direct', 'string', 1, 1, 1, '用户问题'),
  ('knowledge_classification', '知识自动分类', 'answer', 'answer', 'direct', 'string', 1, 1, 2, '对应回答');

-- 企业知识库 - 质量评分的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_quality_scoring', '知识质量评分', 'question', 'question', 'direct', 'string', 1, 1, 1, '用户问题'),
  ('knowledge_quality_scoring', '知识质量评分', 'answer', 'answer', 'direct', 'string', 1, 1, 2, '对应回答');

-- 企业知识库 - 生成行业问题的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_industry_questions', '生成行业常见问题', 'industry', 'industry', 'direct', 'string', 1, 1, 1, '目标行业'),
  ('knowledge_industry_questions', '生成行业常见问题', 'count', 'count', 'direct', 'number', 1, 1, 2, '生成数量'),
  ('knowledge_industry_questions', '生成行业常见问题', 'specificScenario', 'specificScenario', 'direct', 'string', 0, 1, 3, '特定场景');

-- 企业知识库 - 反馈优化的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_optimization', '知识反馈优化', 'userQuestion', 'userQuestion', 'direct', 'string', 1, 1, 1, '用户原始问题'),
  ('knowledge_optimization', '知识反馈优化', 'knowledgeAnswer', 'knowledgeAnswer', 'direct', 'string', 1, 1, 2, '知识库当前回答'),
  ('knowledge_optimization', '知识反馈优化', 'feedbackReason', 'feedbackReason', 'direct', 'string', 1, 1, 3, '用户反馈原因');

-- 企业知识库 - 知识使用决策的字段映射
INSERT INTO ai_field_mapping_configs (
  mapping_scenario,
  scenario_name,
  source_field,
  target_field,
  mapping_type,
  data_type,
  is_required,
  is_active,
  display_order,
  remark
) VALUES
  ('knowledge_usage_decision', '知识使用决策', 'userQuestion', 'userQuestion', 'direct', 'string', 1, 1, 1, '用户当前问题'),
  ('knowledge_usage_decision', '知识使用决策', 'knowledgeList', 'knowledgeList', 'direct', 'string', 1, 1, 2, '候选知识库列表'),
  ('knowledge_usage_decision', '知识使用决策', 'conversationContext', 'conversationContext', 'direct', 'string', 0, 1, 3, '对话上下文');

-- ========================================
-- 完成
-- ========================================
-- 说明：
-- 1. 共添加了10个AI提示词配置（2个AI话术助手 + 8个企业知识库）
-- 2. 每个配置都包含完整的提示词内容和变量说明
-- 3. 所有字段映射配置已完整添加
-- 4. 所有配置默认启用（is_active = 1）
-- ========================================
