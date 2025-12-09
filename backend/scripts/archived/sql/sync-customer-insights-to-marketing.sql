-- 手动同步客户59和60的洞察数据到 AI营销助手的 ai_customer_insights 表
-- 这个SQL脚本用于将 customers 表中的痛点/兴趣点/需求同步到 ai_customer_insights 表

USE education_crm;

-- 删除客户59和60原有的自动生成洞察数据（保留手动添加的）
DELETE FROM ai_customer_insights
WHERE customer_id IN (59, 60)
  AND source = 'chat_analysis';

-- 客户59的洞察数据（user_id = 1）
-- 痛点
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(59, 1, 'pain_point', '课程地址不明确', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'pain_point', '拼单机制复杂', 1, 'chat_analysis', 1, NOW(), NOW());

-- 兴趣点
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(59, 1, 'interest', '声乐课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'interest', '羽毛球课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'interest', '化妆课程', 1, 'chat_analysis', 1, NOW(), NOW());

-- 需求（从 need_keywords 提取）
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(59, 1, 'need', '浦东花木附近夜校课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'need', '初中生适用课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'need', '课程地址', 1, 'chat_analysis', 1, NOW(), NOW()),
(59, 1, 'need', '拼单机制', 1, 'chat_analysis', 1, NOW(), NOW());

-- 客户60的洞察数据（user_id = 1）
-- 痛点
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(60, 1, 'pain_point', '课程地址不明确', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'pain_point', '团课拼单流程复杂', 1, 'chat_analysis', 1, NOW(), NOW());

-- 兴趣点
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(60, 1, 'interest', '声乐课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'interest', '羽毛球课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'interest', '化妆课程', 1, 'chat_analysis', 1, NOW(), NOW());

-- 需求（从 need_keywords 提取）
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active, create_time, update_time)
VALUES
(60, 1, 'need', '浦东花木附近夜校课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'need', '初中生适用课程', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'need', '课程地址', 1, 'chat_analysis', 1, NOW(), NOW()),
(60, 1, 'need', '拼单流程', 1, 'chat_analysis', 1, NOW(), NOW());

-- 验证插入结果
SELECT
  customer_id,
  insight_type,
  content,
  mention_count,
  source
FROM ai_customer_insights
WHERE customer_id IN (59, 60)
ORDER BY customer_id, insight_type, id;
