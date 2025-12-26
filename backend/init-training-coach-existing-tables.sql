-- AI培训陪练系统现有表结构数据初始化脚本

-- 插入客户角色数据到customer_personas表
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

-- 插入培训剧本数据到现有表结构
INSERT INTO training_scripts (title, scenario, difficulty, source_type, customer_background, training_goal, key_objections, standard_scripts, dialogue_flow, max_rounds, status) VALUES
('首次接触培训', '首次接触', '普通', '手动创建',
'客户对企业产品初步感兴趣，但犹豫不决，需要建立信任和了解需求',
'["建立初步信任", "了解客户真实需求", "获得下次沟通机会"]',
'["效果不确定", "需要时间考虑", "和家人商量"]',
'["开场白：热情介绍公司和产品", "需求挖掘：询问现状和痛点", "价值展示：分享成功案例", "行动建议：提供资料和下次沟通时间"]',
'{"round_1": {"customer": "你们这个是什么？"}, "round_2": {"objection": "效果不确定"}, "round_3": {"customer": "我考虑一下"}}',
6, '已发布'),

('价格谈判策略', '价格谈判', '困难', '手动创建',
'客户对价格敏感，认为产品太贵，需要通过价值分析来化解价格异议',
'["成功化解价格异议", "维护产品价值", "达成成交意向"]',
'["价格太高", "竞品更便宜", "投资回报不明确"]',
'["价值分析：ROI计算", "对比分析：竞品劣势", "方案优化：分期付款", "增值服务：配套支持"]',
'{"round_1": {"customer": "价格太贵了"}, "round_2": {"objection": "竞品便宜很多"}, "round_3": {"customer": "给我个理由选你们"}',
5, '已发布'),

('异议处理实战', '异议处理', '普通', '手动创建',
'各种类型的客户异议处理训练，包括价格、效果、时间、竞品等方面',
'["熟练处理3种以上异议", "运用标准回应框架", "保持积极沟通态度"]',
'["效果不确定", "没时间", "其他产品更好", "需要和家人商量"]',
'["倾听理解：先认同客户感受", "事实回应：用数据和案例", "情感共鸣：理解客户立场", "方案解决：提供具体建议"]',
'{"round_1": {"customer": "效果不确定"}, "round_2": {"objection": "没时间培训"}, "round_3": {"customer": "其他产品更好"}',
7, '已发布'),

('关系建立技巧', '关系维护', '普通', '手动创建',
'建立长期客户关系，通过个性化关注和持续价值提供来获得客户信任',
'["建立情感连接", "展示专业价值", "获得客户信任"]',
'["不需要", "暂时不感兴趣", "已有合作方"]',
'["个性化关注：记住客户细节", "持续价值：定期分享有用信息", "专业权威：提供行业洞察", "情感连接：关心客户业务"]',
'{"round_1": {"customer": "暂时不需要"}, "round_2": {"objection": "已有合作方"}, "round_3": {"customer": "感谢关注"}',
8, '已发布');

-- 插入AI提示词配置到现有ai_prompt_configs表
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

-- 插入系统配置到training_system_config表
INSERT INTO training_system_config (config_key, config_value) VALUES
('ai_model_settings', '{"provider": "deepseek", "temperature": 0.7, "max_tokens": 2000}'),
('evaluation_weights', '{"goal_achievement": 40, "professionalism": 25, "efficiency": 15, "adaptability": 10, "customer_satisfaction": 10}'),
('session_settings', '{"max_rounds": 5, "response_delay": "normal", "auto_save": true}');

SELECT '培训陪练系统数据初始化完成（使用现有表结构）！' as status;