-- ========================================
-- 知识库模块字典数据
-- ========================================

-- 1. 场景分类 (scene_category)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_scene_category', '产品介绍', '产品介绍', 1, 1, '知识库场景分类'),
('knowledge_scene_category', '售后服务', '售后服务', 2, 1, '知识库场景分类'),
('knowledge_scene_category', '营销活动', '营销活动', 3, 1, '知识库场景分类'),
('knowledge_scene_category', '常见问题', '常见问题', 4, 1, '知识库场景分类'),
('knowledge_scene_category', '技术支持', '技术支持', 5, 1, '知识库场景分类'),
('knowledge_scene_category', '价格政策', '价格政策', 6, 1, '知识库场景分类'),
('knowledge_scene_category', '合作政策', '合作政策', 7, 1, '知识库场景分类'),
('knowledge_scene_category', '其他', '其他', 8, 1, '知识库场景分类');

-- 2. 客户类型 (customer_type)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_customer_type', '新客户', '新客户', 1, 1, '知识库客户类型'),
('knowledge_customer_type', '老客户', '老客户', 2, 1, '知识库客户类型'),
('knowledge_customer_type', '潜在客户', '潜在客户', 3, 1, '知识库客户类型'),
('knowledge_customer_type', 'VIP客户', 'VIP客户', 4, 1, '知识库客户类型');

-- 3. 问题类型 (question_type)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_question_type', '咨询类', '咨询类', 1, 1, '知识库问题类型'),
('knowledge_question_type', '投诉类', '投诉类', 2, 1, '知识库问题类型'),
('knowledge_question_type', '建议类', '建议类', 3, 1, '知识库问题类型'),
('knowledge_question_type', '技术类', '技术类', 4, 1, '知识库问题类型');

-- 4. 反馈场景 (feedback_scene)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_feedback_scene', 'AI话术助手', 'ai_chat', 1, 1, '知识反馈场景'),
('knowledge_feedback_scene', '知识搜索', 'knowledge_search', 2, 1, '知识反馈场景'),
('knowledge_feedback_scene', 'AI分析', 'ai_analysis', 3, 1, '知识反馈场景'),
('knowledge_feedback_scene', 'AI推荐', 'ai_recommendation', 4, 1, '知识反馈场景');

-- 5. 数据源类型 (source_type)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_source_type', '聊天记录挖掘', 'chat_mining', 1, 1, '知识挖掘数据源类型'),
('knowledge_source_type', '行业推荐', 'industry_recommend', 2, 1, '知识挖掘数据源类型'),
('knowledge_source_type', 'AI话术对话记录', 'ai_chat', 3, 1, '知识挖掘数据源类型'),
('knowledge_source_type', '手动录入', 'manual_input', 4, 1, '知识挖掘数据源类型');

-- 6. 审核状态 (review_status)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_review_status', '待审核', 'pending', 1, 1, '知识审核状态'),
('knowledge_review_status', '已通过', 'approved', 2, 1, '知识审核状态'),
('knowledge_review_status', '已拒绝', 'rejected', 3, 1, '知识审核状态');

-- 7. 知识状态 (knowledge_status)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_status', '启用', 'active', 1, 1, '知识库状态'),
('knowledge_status', '禁用', 'inactive', 2, 1, '知识库状态'),
('knowledge_status', '自动禁用', 'auto_disabled', 3, 1, '知识库状态');

-- 8. 反馈原因 (feedback_reason)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_feedback_reason', '内容不相关', '内容不相关', 1, 1, '知识反馈原因'),
('knowledge_feedback_reason', '答案不准确', '答案不准确', 2, 1, '知识反馈原因'),
('knowledge_feedback_reason', '内容过时', '内容过时', 3, 1, '知识反馈原因'),
('knowledge_feedback_reason', '表述不清晰', '表述不清晰', 4, 1, '知识反馈原因'),
('knowledge_feedback_reason', '缺少关键信息', '缺少关键信息', 5, 1, '知识反馈原因'),
('knowledge_feedback_reason', '其他问题', '其他问题', 6, 1, '知识反馈原因');

-- 9. 处理结果 (handle_result)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_handle_result', '已优化知识内容', '已优化知识内容', 1, 1, '反馈处理结果'),
('knowledge_handle_result', '已添加新知识', '已添加新知识', 2, 1, '反馈处理结果'),
('knowledge_handle_result', '知识已禁用', '知识已禁用', 3, 1, '反馈处理结果'),
('knowledge_handle_result', '反馈不合理', '反馈不合理', 4, 1, '反馈处理结果'),
('knowledge_handle_result', '其他处理', '其他处理', 5, 1, '反馈处理结果');

-- 10. 使用场景 (usage_scene)
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('knowledge_usage_scene', '知识搜索', 'knowledge_search', 1, 1, '知识使用场景'),
('knowledge_usage_scene', 'AI话术助手', 'ai_chat', 2, 1, '知识使用场景'),
('knowledge_usage_scene', 'AI分析', 'ai_analysis', 3, 1, '知识使用场景'),
('knowledge_usage_scene', 'AI推荐', 'ai_recommendation', 4, 1, '知识使用场景'),
('knowledge_usage_scene', '手动使用', 'manual', 5, 1, '知识使用场景');
