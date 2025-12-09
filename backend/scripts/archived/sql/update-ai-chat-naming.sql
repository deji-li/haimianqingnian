-- ========================================
-- 统一命名为"AI话术助手"的数据库更新脚本
-- ========================================

-- 1. 更新反馈场景字典：AI聊天 → AI话术助手
UPDATE `dictionary`
SET `dict_label` = 'AI话术助手'
WHERE `dict_type` = 'knowledge_feedback_scene'
  AND `dict_value` = 'ai_chat';

-- 2. 更新数据源类型字典：AI对话记录 → AI话术对话记录
UPDATE `dictionary`
SET `dict_label` = 'AI话术对话记录'
WHERE `dict_type` = 'knowledge_source_type'
  AND `dict_value` = 'ai_chat';

-- 3. 更新使用场景字典：AI聊天 → AI话术助手
UPDATE `dictionary`
SET `dict_label` = 'AI话术助手'
WHERE `dict_type` = 'knowledge_usage_scene'
  AND `dict_value` = 'ai_chat';

-- 验证更新结果
SELECT dict_type, dict_label, dict_value
FROM `dictionary`
WHERE dict_value = 'ai_chat'
ORDER BY dict_type;
