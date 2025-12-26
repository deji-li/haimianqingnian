-- AI培训陪练系统初始数据脚本

-- 插入客户角色数据
INSERT INTO customer_personas (name, personality_type, characteristics, communication_style, decision_making_style, typical_objections, response_patterns, difficulty_settings) VALUES
('犹豫不决的李女士', 'hesitant', '{"age": "35-45", "occupation": "企业中层", "concerns": ["效果", "时间投入", "风险"], "keywords": ["我再考虑一下", "不太确定", "需要和家人商量"]}', 'casual', 'emotional',
'["价格太贵了", "效果不确定", "需要时间考虑", "和家人商量一下"]',
'{"initial_response": "interested_but_cautious", "objection_frequency": "high", "decision_speed": "slow", "trust_building": "required"}',
'{"response_delay": "3-5s", "objection_intensity": 0.7, "persuasion_difficulty": 0.8}'),

('精打细算的张先生', 'price_sensitive', '{"age": "30-40", "occupation": "个体经营者", "concerns": ["性价比", "投资回报", "额外费用"], "keywords": ["多少钱", "有没有优惠", "性价比如何"]}', 'direct', 'analytical',
'["价格太高", "有没有更便宜的", "能不能优惠", "投资回报周期"]',
'{"initial_response": "price_focused", "objection_frequency": "very_high", "decision_speed": "medium", "value_oriented": true}',
'{"response_delay": "2-4s", "objection_intensity": 0.9, "price_sensitivity": 0.95}'),

('专业理性的王总', 'professional', '{"age": "40-50", "occupation": "企业高管", "concerns": ["专业性", "数据支持", "长期价值"], "keywords": ["数据", "案例", "ROI", "专业性"]}', 'formal', 'analytical',
'["缺乏数据支持", "案例不够充分", "ROI不明确", "专业度不足"]',
'{"initial_response": "analytical", "objection_frequency": "medium", "decision_speed": "slow", "evidence_required": true}',
'{"response_delay": "4-6s", "objection_intensity": 0.6, "analytical_depth": 0.9}'),

('急躁直接的小刘', 'impatient', '{"age": "25-35", "occupation": "销售代表", "concerns": ["效率", "结果", "时间"], "keywords": ["直接说", "重点是什么", "多久有效"]}', 'direct', 'authoritative',
'["太复杂了", "直接说重点", "没时间听这些", "快速点"]',
'{"initial_response": "impatient", "objection_frequency": "low", "decision_speed": "fast", "results_oriented": true}',
'{"response_delay": "1-2s", "objection_intensity": 0.4, "patience_level": 0.3}'),

('爱比较的陈经理', 'comparative', '{"age": "35-45", "occupation": "采购经理", "concerns": ["竞品对比", "市场行情", "优势差异"], "keywords": ["其他家", "竞品", "对比一下", "差异"]}', 'technical', 'collaborative',
'["竞品更便宜", "其他家有更多功能", "为什么选你们不选别的", "给我个理由"]',
'{"initial_response": "comparative", "objection_frequency": "high", "decision_speed": "medium", "research_oriented": true}',
'{"response_delay": "3-4s", "objection_intensity": 0.8, "comparison_tendency": 0.9}');

-- 插入培训剧本数据
INSERT INTO training_scripts (title, description, scenario_type, customer_persona_id, source_type, script_content, training_goals, difficulty_level, max_rounds, success_criteria) VALUES
('首次接触培训', '针对新客户的首次沟通培训，建立信任和了解需求', 'first_contact', 1, 'manual',
'{"opening": {"customer_persona": "interested_but_cautious", "expected_message": "你们这个是什么？"}, "flow": [{"step": 1, "goal": "建立信任", "key_points": ["公司介绍", "成功案例"]}, {"step": 2, "goal": "了解需求", "key_points": ["询问现状", "挖掘痛点"]}, {"step": 3, "goal": "提供方案", "key_points": ["针对性建议", "价值展示"]}]}',
'["建立初步信任", "了解客户真实需求", "获得下次沟通机会"]',
2, 6,
'{"trust_level": 0.7, "needs_identified": true, "follow_up_scheduled": true}'),

('价格谈判策略', '处理客户对价格的异议，强调价值而非价格', 'price_negotiation', 2, 'manual',
'{"objection_handling": {"common_objections": ["太贵了", "竞品更便宜"], "value_proposition": ["ROI分析", "长期收益", "独特价值"]}, "negotiation_tactics": ["价值锚定", "对比分析", "分期方案"]}',
'["成功化解价格异议", "维护产品价值", "达成成交意向"]',
4, 5,
'{"price_objection_resolved": true, "value_communicated": true, "deal_progress": "positive"}'),

('异议处理实战', '处理各种类型客户异议的综合训练', 'objection_handling', 5, 'manual',
'{"objection_types": ["价格", "效果", "时间", "竞品", "信任"], "response_frameworks": ["倾听-理解-回应", "事实-情感-逻辑"], "practice_scenarios": [{"objection": "效果不确定", "best_practice": "案例佐证"}]}',
'["熟练处理3种以上异议", "运用标准回应框架", "保持积极沟通态度"]',
3, 7,
'{"objections_handled": 3, "framework_usage": "consistent", "customer_satisfaction": 0.8}'),

('关系建立技巧', '建立长期客户关系的沟通技巧培训', 'relationship_building', 1, 'manual',
'{"relationship_building": ["个性化关注", "持续价值提供", "信任建立"], "communication_tactics": ["情感共鸣", "专业权威", "长期陪伴"]}',
'["建立情感连接", "展示专业价值", "获得客户信任"]',
3, 8,
'{"emotional_connection": true, "value_demonstrated": true, "trust_level": 0.8}'),

('成交促成技巧', '识别成交信号并有效促成交易的技巧', 'closing_deal', 3, 'manual',
'{"closing_signals": ["询问细节", "讨论价格", "询问时间安排"], "closing_techniques": ["假设成交", "限时优惠", "选择成交"], "objection_handling": ["最后疑虑", "决策拖延"]}',
'["识别成交信号", "运用促成技巧", "成功完成交易"]',
5, 6,
'{"signals_identified": true, "techniques_applied": true, "deal_closed": true}');

-- 插入培训系统配置
INSERT INTO training_system_config (config_key, config_value, description) VALUES
('ai_model_settings', '{"provider": "deepseek", "temperature": 0.7, "max_tokens": 2000, "response_timeout": 30}', 'AI模型配置'),
('evaluation_weights', '{"goal_achievement": 40, "professionalism": 25, "efficiency": 15, "adaptability": 10, "customer_satisfaction": 10}', '评估权重配置'),
('session_settings', '{"max_rounds": 5, "response_delay": "normal", "auto_save": true, "real_time_evaluation": true}', '会话设置'),
('difficulty_levels', '{"1": "入门级", "2": "基础级", "3": "进阶级", "4": "高级级", "5": "专家级"}', '难度等级定义');

-- 插入AI提示词配置
INSERT INTO ai_prompt_configs (scenario_key, scenario_name, scenario_category, model_provider, prompt_content, system_prompt, temperature, max_tokens, is_active) VALUES
('training_script_generation', '培训剧本智能生成', '培训陪练', 'deepseek',
'【剧本生成需求】
场景类型：{{scenarioType}}
客户角色：{{customerPersona}}
难度等级：{{difficultyLevel}}
培训目标：{{trainingGoals}}
参考数据：{{referenceData}}

【生成要求】
请根据以上信息生成一个完整的销售培训剧本，包含：
1. 客户开场白和性格特点
2. 3-5个关键对话节点
3. 每个节点的客户可能异议
4. 推荐的销售回应策略
5. 成功标准和评估要点

输出格式：
{
  "customer_opening": "客户开场白",
  "conversation_flow": [
    {
      "round": 1,
      "customer_message": "客户消息",
      "objection_type": "异议类型",
      "sales_strategy": "销售策略",
      "expected_response": "期望回应"
    }
  ],
  "success_criteria": ["成功标准"],
  "difficulty_notes": "难度说明"
}',
'你是专业的销售培训专家，擅长根据不同客户角色和场景创建实战性强的培训剧本。剧本要真实、有挑战性、具备教学价值。', 0.7, 3000, 1),

('training_customer_persona', '培训客户角色扮演', '培训陪练', 'deepseek',
'【客户角色信息】
角色名称：{{personaName}}
性格类型：{{personalityType}}
沟通风格：{{communicationStyle}}
决策风格：{{decisionMakingStyle}}
典型异议：{{typicalObjections}}

【当前对话上下文】
培训场景：{{trainingScenario}}
当前轮次：{{currentRound}}
对话历史：{{conversationHistory}}
销售消息：{{salesMessage}}

【角色扮演要求】
请完全代入{{personaName}}的角色，根据其性格特点和当前对话情况，生成真实的客户回应。

要求：
1. 严格符合角色性格特征
2. 回应要自然真实
3. 适时提出合理异议
4. 根据销售回应调整态度
5. 保持角色的决策逻辑

输出格式：
{
  "message": "客户回应消息",
  "emotion": "当前情绪状态",
  "objection_type": "异议类型（如有）",
  "decision_signals": "决策信号",
  "response_strategy": "回应策略说明"
}',
'你是专业的角色扮演AI，能够准确模拟不同类型客户在销售场景中的真实反应。请确保回应符合角色设定，保持一致性和真实性。', 0.8, 2000, 1),

('training_evaluation', '培训表现评估分析', '培训陪练', 'deepseek',
'【评估信息】
会话ID：{{sessionId}}
对话历史：{{conversationHistory}}
培训目标：{{trainingGoals}}
客户角色：{{customerPersona}}
剧本内容：{{scriptContent}}

【评估维度】
1. 目标达成度 (40%)
2. 话术专业性 (25%)
3. 沟通效率 (15%)
4. 应变能力 (10%)
5. 客户体验 (10%)

【评估要求】
请全面分析销售在这段对话中的表现，给出具体的评分和改进建议。

输出格式：
{
  "overall_score": 总体评分,
  "dimension_scores": {
    "goal_achievement": 目标达成度评分,
    "professionalism": 专业性评分,
    "efficiency": 效率评分,
    "adaptability": 应变能力评分,
    "customer_satisfaction": 客户体验评分
  },
  "strengths": ["优势分析"],
  "improvements": ["改进建议"],
  "detailed_feedback": "详细反馈",
  "recommendations": ["推荐行动"]
}',
'你是专业的销售培训评估师，具备丰富的销售经验和培训评估能力。请客观、专业地评估销售表现，提供建设性的改进建议。', 0.3, 2500, 1);

SELECT '培训陪练系统初始数据插入完成！' as status;