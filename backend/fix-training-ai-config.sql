-- 修复培训陪练AI配置缺失问题
-- 插入training_script_generation等场景的AI提示词配置

-- 1. 先检查是否存在，如果存在则更新，否则插入
-- 剧本生成配置
INSERT INTO ai_prompt_configs (scenario_key, scenario_name, scenario_category, model_provider, prompt_content, system_prompt, temperature, max_tokens, is_active)
VALUES (
  'training_script_generation',
  '培训剧本智能生成',
  '培训陪练',
  'deepseek',
  '【剧本生成需求】
场景类型：{{scenarioType}}
客户角色：{{customerPersona}}
难度等级：{{difficultyLevel}}
培训目标：{{trainingGoals}}
对话内容：{{chatContent}}
知识内容：{{knowledgeContent}}

请生成一个完整的销售培训剧本，要求：
1. 包含客户背景设定
2. 设定培训目标
3. 列出可能的关键异议
4. 提供标准话术参考
5. 设计对话流程（至少3-5轮）

输出JSON格式：
{
  "customer_background": "客户背景描述",
  "training_goal": "培训目标",
  "key_objections": ["异议1", "异议2"],
  "standard_scripts": ["话术1", "话术2"],
  "dialogue_flow": {
    "round_1": {
      "customer": "客户第一句话",
      "guidance": "给销售的指导"
    },
    "round_2": {
      "customer": "客户第二句话",
      "guidance": "给销售的指导"
    }
  },
  "max_rounds": 6
}',
  '你是专业的销售培训专家，擅长创建实战性强的培训剧本。你能够根据不同场景、难度和客户特征，设计出既有挑战性又符合实际的培训内容。',
  0.7,
  3000,
  1
)
ON DUPLICATE KEY UPDATE
  scenario_name = '培训剧本智能生成',
  prompt_content = VALUES(prompt_content),
  system_prompt = VALUES(system_prompt),
  temperature = 0.7,
  max_tokens = 3000,
  is_active = 1;

-- 2. 客户角色扮演配置
INSERT INTO ai_prompt_configs (scenario_key, scenario_name, scenario_category, model_provider, prompt_content, system_prompt, temperature, max_tokens, is_active)
VALUES (
  'training_customer_persona',
  '培训客户角色扮演',
  '培训陪练',
  'deepseek',
  '【客户角色信息】
角色名称：{{personaName}}
性格类型：{{personalityType}}
销售消息：{{salesMessage}}
对话历史：{{conversationHistory}}
当前轮次：{{currentRound}}

请完全代入客户角色，生成真实、自然的回应。

输出JSON格式：
{
  "message": "客户回复内容",
  "emotion": "当前情绪",
  "objection_type": "异议类型（如有）",
  "interest_level": 1-10的兴趣评分
}',
  '你是专业的角色扮演AI，能够准确模拟不同类型客户的真实反应。你会根据客户性格、对话历史和销售话术，给出符合人物设定的自然回应。',
  0.8,
  2000,
  1
)
ON DUPLICATE KEY UPDATE
  scenario_name = '培训客户角色扮演',
  prompt_content = VALUES(prompt_content),
  system_prompt = VALUES(system_prompt),
  temperature = 0.8,
  max_tokens = 2000,
  is_active = 1;

-- 3. 培训评估配置
INSERT INTO ai_prompt_configs (scenario_key, scenario_name, scenario_category, model_provider, prompt_content, system_prompt, temperature, max_tokens, is_active)
VALUES (
  'training_evaluation',
  '培训表现评估分析',
  '培训陪练',
  'deepseek',
  '【评估信息】
会话ID：{{sessionId}}
对话历史：{{conversationHistory}}
培训目标：{{trainingGoals}}

请从以下维度分析销售表现：
1. 目标达成度（40分）
2. 专业性（25分）
3. 效率（15分）
4. 应变能力（10分）
5. 客户体验（10分）

输出JSON格式：
{
  "overall_score": 85.5,
  "goal_achievement_score": 36,
  "professionalism_score": 22,
  "efficiency_score": 12,
  "adaptability_score": 8,
  "customer_satisfaction_score": 7.5,
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进建议1", "改进建议2"],
  "recommendations": ["推荐行动1", "推荐行动2"]
}',
  '你是专业的销售培训评估师，能够客观评估销售表现并提供建设性建议。你会结合培训目标和对话内容，给出全面、具体的评估报告。',
  0.3,
  2500,
  1
)
ON DUPLICATE KEY UPDATE
  scenario_name = '培训表现评估分析',
  prompt_content = VALUES(prompt_content),
  system_prompt = VALUES(system_prompt),
  temperature = 0.3,
  max_tokens = 2500,
  is_active = 1;

-- 验证插入结果
SELECT scenario_key, scenario_name, model_provider, is_active
FROM ai_prompt_configs
WHERE scenario_key IN ('training_script_generation', 'training_customer_persona', 'training_evaluation');
