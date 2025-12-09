-- 手动聚合客户59和60的洞察数据
-- 这个SQL脚本用于从 ai_customer_tags 表中提取痛点、兴趣点和需求,并更新到 customers 表

USE education_crm;

-- 客户59
UPDATE customers
SET
  pain_points = JSON_ARRAY('课程地址不明确', '拼单机制复杂'),
  interest_points = JSON_ARRAY('声乐课程', '羽毛球课程', '化妆课程'),
  need_keywords = JSON_ARRAY('浦东花木附近夜校课程', '初中生适用课程', '课程地址', '拼单机制')
WHERE id = 59;

-- 客户60
UPDATE customers
SET
  pain_points = JSON_ARRAY('课程地址不明确', '团课拼单流程复杂'),
  interest_points = JSON_ARRAY('声乐课程', '羽毛球课程', '化妆课程'),
  need_keywords = JSON_ARRAY('浦东花木附近夜校课程', '初中生适用课程', '课程地址', '拼单流程')
WHERE id = 60;

-- 验证更新结果
SELECT
  id,
  wechat_nickname,
  pain_points,
  interest_points,
  need_keywords
FROM customers
WHERE id IN (59, 60);
