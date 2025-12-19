-- 创建智能融合AI提示词配置
-- 用于实现智能融合场景、技巧、知识库的AI话术生成

INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  prompt_content,
  system_prompt,
  temperature,
  max_tokens,
  is_active,
  create_time
) VALUES (
  'ai_script_intelligent_fusion',
  'AI话术智能融合生成',
  '销售话术',
  'deepseek',
  '【用户输入】
{{userInput}}

【沟通场景】
场景名称：{{scenarioName}}
场景特点：{{scenarioDescription}}
场景匹配度：{{scenarioMatchScore}}

【销售技巧】
技巧名称：{{techniqueName}}
技巧要点：{{techniqueDescription}}
技巧匹配度：{{techniqueMatchScore}}

【知识库参考】
{{knowledgeContent}}
知识相关度：{{knowledgeRelevanceScore}}

【权重配置】
- 场景权重：{{scenarioWeight}}
- 技巧权重：{{techniqueWeight}}
- 知识库权重：{{knowledgeWeight}}
- AI联想权重：{{aiWeight}}

【任务要求】
你是专业的销售顾问，请根据以上信息和权重配置，智能融合生成销售话术。

具体要求：
1. **智能融合**：根据权重配置，合理融合场景特点、销售技巧和知识库内容
2. **高权重因素优先**：权重高的因素应在话术中更明显地体现
3. **自然流畅**：融合要自然，避免生硬拼凑
4. **实战导向**：话术直接可用，贴近真实场景
5. **长度控制**：回复简洁有力，控制在200字以内

输出格式（JSON）：
{
  "thinkingProcess": "简要说明如何融合各因素（50字以内）",
  "scriptSuggestion": "精炼实用的销售话术（150字以内）",
  "keyPoints": ["要点1（30字以内）", "要点2（30字以内）"],
  "confidenceScore": 0.85
}',
  '你是专业的销售话术专家，擅长智能融合场景、技巧和知识库，生成精炼实用的销售话术。请确保回复简洁、专业、可操作。',
  '0.3',
  2000,
  1,
  NOW()
);

-- 更新 ai_script_pure 提示词，优化为更灵活的配置
UPDATE ai_prompt_configs
SET
  prompt_content = '【用户输入】
{{userInput}}

【沟通场景】
{{scenarioInfo}}

【销售技巧】
{{techniqueInfo}}

【知识库参考】
{{referenceContent}}

【任务要求】
你是专业的销售顾问，请根据场景和技巧要求，参考知识库内容，生成销售话术。

具体要求：
1. **场景适配**：充分体现场景特点
2. **技巧运用**：灵活运用销售技巧
3. **知识参考**：适当参考知识库内容
4. **语言精练**：控制在200字以内
5. **实战导向**：直接可用

输出格式：
【思考过程】
（简要分析，50字以内）

【话术建议】
（精炼实用的销售话术，150字以内）

【优化要点】
（1-2个关键执行要点，每点30字以内）',
  system_prompt = '你是专业的销售话术专家，擅长根据场景和技巧生成实用话术。'
WHERE scenario_key = 'ai_script_pure' AND model_provider = 'deepseek';

-- 验证配置是否插入成功
SELECT scenario_key, scenario_name, is_active, model_provider
FROM ai_prompt_configs
WHERE scenario_key IN ('ai_script_intelligent_fusion', 'ai_script_pure');
