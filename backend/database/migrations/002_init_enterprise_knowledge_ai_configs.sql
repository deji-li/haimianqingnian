-- ========================================
-- 企业知识库AI配置初始化脚本
-- 创建时间: 2025-01-15
-- 用途: 初始化企业知识库所需的8个AI场景配置
-- ========================================

-- ========================================
-- 场景1: knowledge_qa_extraction - Q&A提取
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `model_name`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`,
  `version`
) VALUES (
  'knowledge_qa_extraction',
  '知识库Q&A提取',
  'enterprise_knowledge',
  'deepseek',
  'deepseek-chat',
  '从以下销售-客户对话中提取有价值的常见问题和标准答案。

对话内容:
{{chatText}}

客户信息:
- 微信昵称: {{customerName}}
- 意向等级: {{customerIntent}}

要求:
1. 问题要具有普遍性,不是针对个人的特定情况
2. 答案要专业、准确、完整
3. 提取3-10个Q&A对
4. 每个Q&A给出质量评分(0-100)
5. 说明推荐理由

输出JSON格式:
{
  "qa_pairs": [
    {
      "question": "问题内容",
      "answer": "答案内容",
      "score": 85,
      "reason": "推荐理由",
      "keywords": ["关键词1", "关键词2"]
    }
  ]
}

只输出JSON，不要其他说明。',
  '你是一个专业的教育行业知识提取专家，善于从销售对话中提取有价值的通用问题和答案。你的任务是识别具有普遍性的问题和规范化的答案，帮助企业建立知识库。',
  0.3,
  2000,
  '["chatText", "customerName", "customerIntent"]',
  'chatText: 聊天记录文本; customerName: 客户昵称; customerIntent: 客户意向等级',
  1,
  1
);

-- 对应变量配置
INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `default_value`,
  `example_value`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_qa_extraction', 'chatText', '聊天记录文本', '微信聊天记录OCR识别后的文本内容', 'string', 1, NULL, '客户:你们的课程怎么收费?\n销售:我们有多种套餐...', 1, 1),
('knowledge_qa_extraction', 'customerName', '客户昵称', '客户的微信昵称', 'string', 0, '未知客户', '张女士', 2, 1),
('knowledge_qa_extraction', 'customerIntent', '客户意向等级', '客户的意向等级（高/中/低）', 'string', 0, '中', '高', 3, 1);

-- ========================================
-- 场景2: knowledge_classification - 智能分类
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_classification',
  '知识库智能分类',
  'enterprise_knowledge',
  'deepseek',
  '请对以下知识点进行多维度分类:

问题: {{question}}
答案: {{answer}}

请从以下4个维度进行分类:

1. **场景分类** (sceneCategory):
   - 首次沟通
   - 产品介绍
   - 价格咨询
   - 异议处理
   - 售后服务
   - 其他

2. **产品分类** (productCategory):
   - 自动识别产品名称，如果没有则为null

3. **客户类型** (customerType):
   - 新客
   - 老客
   - 高意向
   - 中意向
   - 低意向

4. **问题类型** (questionType):
   - 产品问题
   - 价格问题
   - 服务问题
   - 效果问题
   - 师资问题
   - 其他

输出JSON格式:
{
  "sceneCategory": "价格咨询",
  "productCategory": "小学数学辅导",
  "customerType": "高意向",
  "questionType": "价格问题",
  "confidence": 0.95
}

只输出JSON，不要其他说明。',
  '你是一个专业的知识库分类专家，能够准确地对知识点进行多维度分类。',
  0.2,
  500,
  '["question", "answer"]',
  'question: 问题内容; answer: 答案内容',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_classification', 'question', '问题内容', '知识点的问题内容', 'string', 1, 1, 1),
('knowledge_classification', 'answer', '答案内容', '知识点的答案内容', 'string', 1, 2, 1);

-- ========================================
-- 场景3: knowledge_semantic_scoring - 语义评分
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_semantic_scoring',
  '知识库语义评分',
  'enterprise_knowledge',
  'deepseek',
  '用户提问: {{userQuestion}}

候选知识库:
{{knowledgeList}}

请评估每个知识库条目与用户问题的相关度，按照相关度从高到低排序。

评分标准:
- 90-100: 完全匹配，可以直接回答用户问题
- 70-89: 高度相关，可以结合AI优化后回答
- 50-69: 部分相关，可以作为参考
- 0-49: 相关度低，不建议使用

输出JSON格式:
{
  "rankings": [
    {
      "knowledgeId": 1,
      "score": 95,
      "matchReason": "问题和答案都高度匹配用户提问，可直接使用"
    },
    {
      "knowledgeId": 3,
      "score": 82,
      "matchReason": "部分匹配，需要补充细节"
    }
  ]
}

只输出JSON，不要其他说明。',
  '你是一个语义相似度评估专家，能够准确评估知识库内容与用户问题的相关程度。',
  0.3,
  1000,
  '["userQuestion", "knowledgeList"]',
  'userQuestion: 用户的问题; knowledgeList: 候选知识库列表(JSON字符串)',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_semantic_scoring', 'userQuestion', '用户问题', '用户提出的问题', 'string', 1, 1, 1),
('knowledge_semantic_scoring', 'knowledgeList', '候选知识库列表', '格式化的候选知识库列表', 'string', 1, 2, 1);

-- ========================================
-- 场景4: knowledge_usage_decision - 使用决策
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_usage_decision',
  '知识库使用决策',
  'enterprise_knowledge',
  'deepseek',
  '用户问题: {{userQuestion}}

知识库搜索结果:
最佳匹配: {{topKnowledge}}
匹配分数: {{topScore}}

请判断应该如何使用知识库:

1. **use_knowledge** (直接使用知识库):
   - 条件: 匹配分数>=90，内容完整准确
   - 直接返回知识库答案

2. **hybrid** (混合模式):
   - 条件: 匹配分数70-89，内容基本相关
   - 以知识库为基础，AI优化扩展

3. **use_ai_generate** (AI生成):
   - 条件: 匹配分数<70，知识库无相关内容
   - 完全由AI生成答案

输出JSON格式:
{
  "decision": "hybrid",
  "reason": "知识库内容相关度高，但需要针对具体情况补充细节",
  "confidence": 0.85
}

只输出JSON，不要其他说明。',
  '你是一个智能决策助手，能够根据知识库匹配情况做出最优决策。',
  0.2,
  500,
  '["userQuestion", "topKnowledge", "topScore"]',
  'userQuestion: 用户问题; topKnowledge: 最佳匹配的知识库内容; topScore: 匹配分数',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_usage_decision', 'userQuestion', '用户问题', '用户提出的问题', 'string', 1, 1, 1),
('knowledge_usage_decision', 'topKnowledge', '最佳匹配知识', '匹配度最高的知识库内容', 'string', 1, 2, 1),
('knowledge_usage_decision', 'topScore', '匹配分数', '匹配度分数(0-100)', 'number', 1, 3, 1);

-- ========================================
-- 场景5: knowledge_optimization - 优化建议
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_optimization',
  '知识库优化建议',
  'enterprise_knowledge',
  'deepseek',
  '知识点信息:
标题: {{knowledgeTitle}}
内容: {{knowledgeContent}}

负反馈统计: 共收到 {{feedbackCount}} 条负反馈

反馈详情:
{{feedbackDetails}}

请分析问题并提供优化建议:

1. **问题分析**
   - 为什么收到这些负反馈?
   - 主要问题是什么?

2. **优化建议**
   - 如何改进标题?
   - 如何改进内容?
   - 需要补充哪些信息?

3. **优化后的答案**
   - 提供一个改进后的完整答案

输出JSON格式:
{
  "analysis": "问题分析内容",
  "suggestions": [
    "建议1",
    "建议2",
    "建议3"
  ],
  "improvedTitle": "优化后的标题",
  "improvedAnswer": "优化后的完整答案"
}

只输出JSON，不要其他说明。',
  '你是一个知识库内容优化专家，能够根据用户反馈提供专业的优化建议。',
  0.4,
  2000,
  '["knowledgeTitle", "knowledgeContent", "feedbackCount", "feedbackDetails"]',
  'knowledgeTitle: 知识标题; knowledgeContent: 知识内容; feedbackCount: 负反馈次数; feedbackDetails: 反馈详情',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_optimization', 'knowledgeTitle', '知识标题', '知识点的标题', 'string', 1, 1, 1),
('knowledge_optimization', 'knowledgeContent', '知识内容', '知识点的内容', 'string', 1, 2, 1),
('knowledge_optimization', 'feedbackCount', '负反馈次数', '该知识点收到的负反馈次数', 'number', 1, 3, 1),
('knowledge_optimization', 'feedbackDetails', '反馈详情', '负反馈的详细信息列表', 'string', 1, 4, 1);

-- ========================================
-- 场景6: knowledge_industry_questions - 行业问题生成
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_industry_questions',
  '行业问题生成',
  'enterprise_knowledge',
  'deepseek',
  '请为以下行业生成常见的客户问题和标准答案:

行业名称: {{industryName}}
行业描述: {{industryDescription}}
企业类型: {{companyType}}

要求:
1. 生成 {{questionCount}} 个常见问题
2. 问题要涵盖不同场景(产品、价格、服务、效果等)
3. 答案要专业、通用，可以作为模板使用
4. 每个问题标注场景分类和问题类型

输出JSON格式:
{
  "questions": [
    {
      "question": "问题内容",
      "answer": "答案模板",
      "sceneCategory": "场景分类",
      "questionType": "问题类型",
      "priority": 1
    }
  ]
}

只输出JSON，不要其他说明。',
  '你是一个教育行业专家，熟悉各类教育机构的运营和销售，能够生成专业的行业常见问题和标准答案。',
  0.5,
  3000,
  '["industryName", "industryDescription", "companyType", "questionCount"]',
  'industryName: 行业名称; industryDescription: 行业描述; companyType: 企业类型; questionCount: 生成问题数量',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `default_value`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_industry_questions', 'industryName', '行业名称', '企业所属行业名称', 'string', 1, NULL, 1, 1),
('knowledge_industry_questions', 'industryDescription', '行业描述', '行业的详细描述', 'string', 0, '', 2, 1),
('knowledge_industry_questions', 'companyType', '企业类型', '企业类型说明', 'string', 0, '', 3, 1),
('knowledge_industry_questions', 'questionCount', '生成数量', '需要生成的问题数量', 'number', 0, '10', 4, 1);

-- ========================================
-- 场景7: knowledge_company_info_generate - 企业信息AI生成
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_company_info_generate',
  '企业信息AI生成',
  'enterprise_knowledge',
  'deepseek',
  '请根据用户提供的关键信息，生成完整的企业基本信息:

用户输入:
{{userInput}}

请生成以下内容:

1. **企业介绍** (200-300字)
   - 公司定位
   - 核心业务
   - 服务特色

2. **核心优势** (3-5条)
   - 每条50-100字

3. **成功案例** (2-3个)
   - 每个案例100-150字

输出JSON格式:
{
  "companyIntro": "企业介绍内容",
  "coreAdvantages": [
    "优势1",
    "优势2",
    "优势3"
  ],
  "successCases": [
    {
      "title": "案例标题",
      "content": "案例内容"
    }
  ]
}

只输出JSON，不要其他说明。',
  '你是一个专业的企业文案撰写专家，能够根据简要信息生成专业、吸引人的企业介绍内容。',
  0.7,
  2000,
  '["userInput"]',
  'userInput: 用户提供的关键信息(可以是关键词、简短描述等)',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_company_info_generate', 'userInput', '用户输入', '用户提供的企业关键信息', 'string', 1, 1, 1);

-- ========================================
-- 场景8: knowledge_quality_scoring - 质量评分
-- ========================================
INSERT INTO `ai_prompt_configs` (
  `scenario_key`,
  `scenario_name`,
  `scenario_category`,
  `model_provider`,
  `prompt_content`,
  `system_prompt`,
  `temperature`,
  `max_tokens`,
  `variables`,
  `variable_description`,
  `is_active`
) VALUES (
  'knowledge_quality_scoring',
  '知识质量评分',
  'enterprise_knowledge',
  'deepseek',
  '请对以下知识点进行质量评分:

问题: {{question}}
答案: {{answer}}
关键词: {{keywords}}

评分标准:
1. **通用性** (30分): 问题是否具有普遍性，不是针对个人
2. **准确性** (30分): 答案是否专业、准确
3. **完整性** (20分): 答案是否完整，包含必要信息
4. **清晰度** (20分): 表述是否清晰易懂

输出JSON格式:
{
  "totalScore": 85,
  "scores": {
    "universality": 27,
    "accuracy": 28,
    "completeness": 18,
    "clarity": 19
  },
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1"],
  "suggestions": ["改进建议1", "改进建议2"]
}

只输出JSON，不要其他说明。',
  '你是一个知识质量评估专家，能够客观评估知识点的质量并提供建设性意见。',
  0.3,
  1000,
  '["question", "answer", "keywords"]',
  'question: 问题内容; answer: 答案内容; keywords: 关键词',
  1
);

INSERT INTO `ai_prompt_variables` (
  `scenario_key`,
  `variable_key`,
  `variable_name`,
  `variable_description`,
  `data_type`,
  `is_required`,
  `display_order`,
  `is_active`
) VALUES
('knowledge_quality_scoring', 'question', '问题内容', '知识点的问题', 'string', 1, 1, 1),
('knowledge_quality_scoring', 'answer', '答案内容', '知识点的答案', 'string', 1, 2, 1),
('knowledge_quality_scoring', 'keywords', '关键词', '知识点关键词', 'string', 0, 3, 1);
