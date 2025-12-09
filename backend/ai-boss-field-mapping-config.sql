-- ========================================
-- AI老板助手 - 字段映射配置
-- ========================================

USE education_crm;

-- 插入AI老板综合分析的字段映射配置
INSERT INTO `ai_field_mapping_configs` (
  `mapping_scenario`,
  `scenario_name`,
  `source_field`,
  `target_field`,
  `mapping_type`,
  `transform_rule`,
  `data_type`,
  `default_value`,
  `is_required`,
  `is_active`,
  `display_order`,
  `remark`
) VALUES
-- 必需字段
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'chatText', 'chatText', 'direct', NULL, 'string', NULL, 1, 1, 1, '聊天记录文本'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'userId', 'userId', 'direct', NULL, 'number', NULL, 1, 1, 2, '员工ID'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'userRole', 'userRole', 'direct', NULL, 'string', NULL, 1, 1, 3, '员工角色'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'customerId', 'customerId', 'direct', NULL, 'number', NULL, 1, 1, 4, '客户ID'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'customerIntent', 'customerIntent', 'direct', NULL, 'string', NULL, 1, 1, 5, '客户意向度'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'lifecycleStage', 'lifecycleStage', 'direct', NULL, 'string', NULL, 1, 1, 6, '生命周期阶段'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'sopRules', 'sopRules', 'transform', 'JSON.stringify', 'json', '[]', 1, 1, 7, 'SOP规则JSON字符串'),
('ai_boss_comprehensive_analysis', 'AI老板综合分析', 'violationRules', 'violationRules', 'transform', 'JSON.stringify', 'json', '[]', 1, 1, 8, '违规规则JSON字符串');

SELECT '✅ AI老板助手字段映射配置成功！' AS message;
SELECT mapping_scenario, scenario_name, COUNT(*) as field_count
FROM ai_field_mapping_configs
WHERE mapping_scenario = 'ai_boss_comprehensive_analysis'
GROUP BY mapping_scenario, scenario_name;
