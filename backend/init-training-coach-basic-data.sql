-- AI培训陪练系统基础数据脚本（只插入必要字段）

-- 插入客户角色数据（简化版）
INSERT INTO customer_personas (name, personality_type, communication_style, decision_making_style, typical_objections, response_patterns, difficulty_settings) VALUES
('犹豫不决的李女士', 'hesitant', 'casual', 'emotional',
'["价格太贵了", "效果不确定", "需要时间考虑", "和家人商量一下"]',
'{"initial_response": "interested_but_cautious", "objection_frequency": "high", "decision_speed": "slow"}',
'{"response_delay": "3-5s", "objection_intensity": 0.7, "persuasion_difficulty": 0.8}'),

('精打细算的张先生', 'price_sensitive', 'direct', 'analytical',
'["价格太高", "有没有更便宜的", "能不能优惠", "投资回报周期"]',
'{"initial_response": "price_focused", "objection_frequency": "very_high", "decision_speed": "medium"}',
'{"response_delay": "2-4s", "objection_intensity": 0.9, "price_sensitivity": 0.95}'),

('专业理性的王总', 'professional', 'formal', 'analytical',
'["缺乏数据支持", "案例不够充分", "ROI不明确", "专业度不足"]',
'{"initial_response": "analytical", "objection_frequency": "medium", "decision_speed": "slow"}',
'{"response_delay": "4-6s", "objection_intensity": 0.6, "analytical_depth": 0.9}'),

('急躁直接的小刘', 'impatient', 'direct', 'authoritative',
'["太复杂了", "直接说重点", "没时间听这些", "快速点"]',
'{"initial_response": "impatient", "objection_frequency": "low", "decision_speed": "fast"}',
'{"response_delay": "1-2s", "objection_intensity": 0.4, "patience_level": 0.3}'),

('爱比较的陈经理', 'comparative', 'technical', 'collaborative',
'["竞品更便宜", "其他家有更多功能", "为什么选你们不选别的", "给我个理由"]',
'{"initial_response": "comparative", "objection_frequency": "high", "decision_speed": "medium"}',
'{"response_delay": "3-4s", "objection_intensity": 0.8, "comparison_tendency": 0.9}');

-- 插入培训剧本数据（简化版）
INSERT INTO training_scripts (title, scenario_type, customer_persona_id, source_type, script_content, training_goals, difficulty_level, max_rounds, success_criteria) VALUES
('首次接触培训', 'first_contact', 1, 'manual',
'{"opening": {"customer_persona": "interested_but_cautious"}, "flow": [{"step": 1, "goal": "建立信任"}, {"step": 2, "goal": "了解需求"}, {"step": 3, "goal": "提供方案"}]}',
'["建立初步信任", "了解客户真实需求", "获得下次沟通机会"]',
2, 6,
'{"trust_level": 0.7, "needs_identified": true, "follow_up_scheduled": true}'),

('价格谈判策略', 'price_negotiation', 2, 'manual',
'{"objection_handling": {"common_objections": ["太贵了", "竞品更便宜"]}, "negotiation_tactics": ["价值锚定", "对比分析"]}',
'["成功化解价格异议", "维护产品价值", "达成成交意向"]',
4, 5,
'{"price_objection_resolved": true, "value_communicated": true, "deal_progress": "positive"}'),

('异议处理实战', 'objection_handling', 5, 'manual',
'{"objection_types": ["价格", "效果", "时间", "竞品", "信任"], "response_frameworks": ["倾听-理解-回应"]}',
'["熟练处理3种以上异议", "运用标准回应框架", "保持积极沟通态度"]',
3, 7,
'{"objections_handled": 3, "framework_usage": "consistent", "customer_satisfaction": 0.8}');

-- 插入培训系统配置
INSERT INTO training_system_config (config_key, config_value) VALUES
('ai_model_settings', '{"provider": "deepseek", "temperature": 0.7, "max_tokens": 2000}'),
('evaluation_weights', '{"goal_achievement": 40, "professionalism": 25, "efficiency": 15, "adaptability": 10, "customer_satisfaction": 10}'),
('session_settings', '{"max_rounds": 5, "response_delay": "normal", "auto_save": true}');

-- 插入AI提示词配置
INSERT INTO ai_prompt_configs (scenario_key, scenario_name, scenario_category, model_provider, prompt_content, system_prompt, temperature, max_tokens, is_active) VALUES
('training_script_generation', '培训剧本智能生成', '培训陪练', 'deepseek',
'【剧本生成需求】
场景类型：{{scenarioType}}
客户角色：{{customerPersona}}
难度等级：{{difficultyLevel}}
培训目标：{{trainingGoals}}

请生成一个完整的销售培训剧本，包含客户开场白、对话节点和销售策略。

输出JSON格式包含conversation_flow和success_criteria。',
'你是专业的销售培训专家，擅长创建实战性强的培训剧本。', 0.7, 3000, 1),

('training_customer_persona', '培训客户角色扮演', '培训陪练', 'deepseek',
'【客户角色信息】
角色名称：{{personaName}}
性格类型：{{personalityType}}
销售消息：{{salesMessage}}
对话历史：{{conversationHistory}}

请完全代入客户角色，生成真实的回应。

输出JSON格式包含message、emotion、objection_type等字段。',
'你是专业的角色扮演AI，能够准确模拟不同类型客户的真实反应。', 0.8, 2000, 1),

('training_evaluation', '培训表现评估分析', '培训陪练', 'deepseek',
'【评估信息】
会话ID：{{sessionId}}
对话历史：{{conversationHistory}}
培训目标：{{trainingGoals}}

请分析销售表现，从目标达成度、专业性、效率、应变能力、客户体验等维度评分。

输出JSON格式包含overall_score、dimension_scores、strengths、improvements等。',
'你是专业的销售培训评估师，请客观评估销售表现并提供建设性建议。', 0.3, 2500, 1);

SELECT '培训陪练系统基础数据插入完成！' as status;