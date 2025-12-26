-- AI培训陪练系统简化数据插入脚本

-- 1. 插入客户角色数据
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

-- 2. 插入简化的培训剧本数据（暂时不包含复杂的dialogue_flow）
INSERT INTO training_scripts (title, scenario, difficulty, source_type, customer_background, training_goal, key_objections, standard_scripts, max_rounds, status) VALUES
('首次接触培训', '首次接触', '普通', '手动创建',
'客户对企业产品初步感兴趣，但犹豫不决，需要建立信任和了解需求',
'["建立初步信任", "了解客户真实需求", "获得下次沟通机会"]',
'["效果不确定", "需要时间考虑", "和家人商量"]',
'["开场白：热情介绍公司和产品", "需求挖掘：询问现状和痛点", "价值展示：分享成功案例", "行动建议：提供资料和下次沟通时间"]',
6, '已发布'),

('价格谈判策略', '价格谈判', '困难', '手动创建',
'客户对价格敏感，认为产品太贵，需要通过价值分析来化解价格异议',
'["成功化解价格异议", "维护产品价值", "达成成交意向"]',
'["价格太高", "竞品更便宜", "投资回报不明确"]',
'["价值分析：ROI计算", "对比分析：竞品劣势", "方案优化：分期付款", "增值服务：配套支持"]',
5, '已发布'),

('异议处理实战', '异议处理', '普通', '手动创建',
'各种类型的客户异议处理训练，包括价格、效果、时间、竞品等方面',
'["熟练处理3种以上异议", "运用标准回应框架", "保持积极沟通态度"]',
'["效果不确定", "没时间", "其他产品更好", "需要和家人商量"]',
'["倾听理解：先认同客户感受", "事实回应：用数据和案例", "情感共鸣：理解客户立场", "方案解决：提供具体建议"]',
7, '已发布'),

('关系建立技巧', '关系维护', '普通', '手动创建',
'建立长期客户关系，通过个性化关注和持续价值提供来获得客户信任',
'["建立情感连接", "展示专业价值", "获得客户信任"]',
'["不需要", "暂时不感兴趣", "已有合作方"]',
'["个性化关注：记住客户细节", "持续价值：定期分享有用信息", "专业权威：提供行业洞察", "情感连接：关心客户业务"]',
8, '已发布');

SELECT '培训陪练系统基础数据插入完成！' as status;