-- ========================================
-- AI配置字段映射词典数据
-- 包含：AI场景、模型、字段映射类型、数据类型、字段名称等
-- 创建时间：2025-11-20
-- ========================================

-- ========================================
-- 1. AI场景分类 (ai_scenario_category)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_scenario_category', 'AI话术助手', 'AI话术助手', 1, 1, 'AI场景分类'),
('ai_scenario_category', '企业知识库', '企业知识库', 2, 1, 'AI场景分类'),
('ai_scenario_category', '智能分析', '智能分析', 3, 1, 'AI场景分类'),
('ai_scenario_category', '内容生成', '内容生成', 4, 1, 'AI场景分类');

-- ========================================
-- 2. AI模型提供商 (ai_model_provider)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_model_provider', 'DeepSeek', 'deepseek', 1, 1, 'AI模型提供商'),
('ai_model_provider', '豆包', 'doubao', 2, 1, 'AI模型提供商'),
('ai_model_provider', 'OpenAI', 'openai', 3, 1, 'AI模型提供商'),
('ai_model_provider', '通义千问', 'qwen', 4, 1, 'AI模型提供商');

-- ========================================
-- 3. 字段映射类型 (ai_mapping_type)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_mapping_type', '直接映射', 'direct', 1, 1, '字段1:1直接映射'),
('ai_mapping_type', '转换映射', 'transform', 2, 1, '通过规则转换映射'),
('ai_mapping_type', 'AI提取', 'ai_extract', 3, 1, '使用AI提取和映射');

-- ========================================
-- 4. 数据类型 (ai_data_type)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_data_type', '字符串', 'string', 1, 1, 'AI字段数据类型'),
('ai_data_type', '数字', 'number', 2, 1, 'AI字段数据类型'),
('ai_data_type', '布尔值', 'boolean', 3, 1, 'AI字段数据类型'),
('ai_data_type', '对象', 'object', 4, 1, 'AI字段数据类型'),
('ai_data_type', '数组', 'array', 5, 1, 'AI字段数据类型'),
('ai_data_type', '日期', 'date', 6, 1, 'AI字段数据类型');

-- ========================================
-- 5. AI话术功能类型 (ai_script_function_type)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_script_function_type', '客户挖掘', '客户挖掘', 1, 1, 'AI话术助手功能类型'),
('ai_script_function_type', '需求引导', '需求引导', 2, 1, 'AI话术助手功能类型'),
('ai_script_function_type', '异议处理', '异议处理', 3, 1, 'AI话术助手功能类型'),
('ai_script_function_type', '促成成交', '促成成交', 4, 1, 'AI话术助手功能类型');

-- ========================================
-- 6. AI场景键值列表 (ai_scenario_list)
-- 用于UI下拉选择和场景识别
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
-- AI话术助手场景
('ai_scenario_list', '混合话术生成（知识库+AI）', 'ai_script_mixed', 1, 1, 'AI场景：AI话术助手'),
('ai_scenario_list', '纯AI话术生成', 'ai_script_pure', 2, 1, 'AI场景：AI话术助手'),

-- 企业知识库场景
('ai_scenario_list', '知识语义评分与排序', 'knowledge_semantic_scoring', 10, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '生成企业基础信息', 'knowledge_company_info_generate', 11, 1, 'AI场景：企业知识库'),
('ai_scenario_list', 'Q&A提取', 'knowledge_qa_extraction', 12, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '知识自动分类', 'knowledge_classification', 13, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '知识质量评分', 'knowledge_quality_scoring', 14, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '生成行业常见问题', 'knowledge_industry_questions', 15, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '知识反馈优化', 'knowledge_optimization', 16, 1, 'AI场景：企业知识库'),
('ai_scenario_list', '知识使用决策', 'knowledge_usage_decision', 17, 1, 'AI场景：企业知识库');

-- ========================================
-- 7. 字段名称中文映射 (ai_field_name)
-- 用于UI显示字段的中文名称
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
-- AI话术助手字段
('ai_field_name', '用户输入', 'userInput', 1, 1, 'AI字段：用户输入的需求或问题'),
('ai_field_name', '参考内容', 'referenceContent', 2, 1, 'AI字段：知识库参考内容'),
('ai_field_name', '场景信息', 'scenarioInfo', 3, 1, 'AI字段：销售场景信息'),
('ai_field_name', '技巧信息', 'techniqueInfo', 4, 1, 'AI字段：使用技巧信息'),
('ai_field_name', '功能类型', 'functionType', 5, 1, 'AI字段：功能类型（客户挖掘/需求引导等）'),

-- 企业知识库字段
('ai_field_name', '用户问题', 'userQuestion', 10, 1, 'AI字段：用户提出的问题'),
('ai_field_name', '知识库列表', 'knowledgeList', 11, 1, 'AI字段：候选知识库条目列表'),
('ai_field_name', '对话上下文', 'conversationContext', 12, 1, 'AI字段：对话历史上下文'),
('ai_field_name', '公司名称', 'companyName', 13, 1, 'AI字段：企业公司名称'),
('ai_field_name', '所属行业', 'industry', 14, 1, 'AI字段：企业所属行业'),
('ai_field_name', '用户提示', 'userPrompt', 15, 1, 'AI字段：用户补充说明'),
('ai_field_name', '聊天内容', 'chatContent', 16, 1, 'AI字段：聊天记录内容'),
('ai_field_name', '客户背景', 'customerContext', 17, 1, 'AI字段：客户背景信息'),
('ai_field_name', '问题', 'question', 18, 1, 'AI字段：用户问题内容'),
('ai_field_name', '回答', 'answer', 19, 1, 'AI字段：对应的回答内容'),
('ai_field_name', '生成数量', 'count', 20, 1, 'AI字段：需要生成的数量'),
('ai_field_name', '特定场景', 'specificScenario', 21, 1, 'AI字段：特定业务场景'),
('ai_field_name', '知识库回答', 'knowledgeAnswer', 22, 1, 'AI字段：知识库当前的回答'),
('ai_field_name', '反馈原因', 'feedbackReason', 23, 1, 'AI字段：用户反馈的原因');

-- ========================================
-- 8. AI响应格式类型 (ai_response_format)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_response_format', 'JSON格式', 'json', 1, 1, 'AI响应格式类型'),
('ai_response_format', '纯文本', 'text', 2, 1, 'AI响应格式类型'),
('ai_response_format', 'Markdown', 'markdown', 3, 1, 'AI响应格式类型'),
('ai_response_format', '结构化文本', 'structured_text', 4, 1, 'AI响应格式类型');

-- ========================================
-- 9. Temperature建议值 (ai_temperature_level)
-- 用于UI提示和快捷设置
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_temperature_level', '精确模式（0.2）', '0.2', 1, 1, '适合分类、评分等需要准确判断的场景'),
('ai_temperature_level', '平衡模式（0.3）', '0.3', 2, 1, '适合话术生成、内容优化等场景'),
('ai_temperature_level', '标准模式（0.5）', '0.5', 3, 1, '适合一般内容生成'),
('ai_temperature_level', '创意模式（0.7）', '0.7', 4, 1, '适合创意内容生成、头脑风暴'),
('ai_temperature_level', '高创意模式（0.9）', '0.9', 5, 1, '适合需要高度创新的场景');

-- ========================================
-- 10. AI配置状态 (ai_config_status)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_config_status', '启用', 'active', 1, 1, 'AI配置状态'),
('ai_config_status', '禁用', 'inactive', 2, 1, 'AI配置状态'),
('ai_config_status', '测试中', 'testing', 3, 1, 'AI配置状态'),
('ai_config_status', '已废弃', 'deprecated', 4, 1, 'AI配置状态');

-- ========================================
-- 11. AI调用结果状态 (ai_call_status)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_call_status', '成功', 'success', 1, 1, 'AI调用结果状态'),
('ai_call_status', '失败', 'failed', 2, 1, 'AI调用结果状态'),
('ai_call_status', '超时', 'timeout', 3, 1, 'AI调用结果状态'),
('ai_call_status', '限流', 'rate_limited', 4, 1, 'AI调用结果状态'),
('ai_call_status', '参数错误', 'invalid_params', 5, 1, 'AI调用结果状态');

-- ========================================
-- 12. 字段是否必填 (ai_field_required)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('ai_field_required', '必填', '1', 1, 1, 'AI字段是否必填'),
('ai_field_required', '选填', '0', 2, 1, 'AI字段是否必填');

-- ========================================
-- 完成
-- ========================================
-- 说明：
-- 1. 共添加12类字典数据，涵盖AI配置的所有关键字段
-- 2. 包含场景、模型、字段映射、数据类型等核心分类
-- 3. 提供完整的中英文字段名称映射
-- 4. 所有字典项默认启用（status = 1）
-- 5. 可用于前端下拉选择、数据验证、UI展示等场景
-- ========================================
