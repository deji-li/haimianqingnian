-- AI老板助手数据库初始化脚本（修正版本）
-- 该脚本与现有的数据库表结构完全匹配

-- ===============================================================
-- 1. SOP质检规则初始化
-- ===============================================================
INSERT INTO ai_sop_rules (rule_name, rule_description, check_keywords, rule_category, rule_order, is_active) VALUES
('礼貌问候', '聊天开始时需要礼貌问候', JSON_ARRAY('你好', '您好', '早上好', '下午好', '晚上好'), 'greeting', 1, 1),
('自我介绍', '需要介绍自己和公司', JSON_ARRAY('我是', '我是来自', '我来自', '介绍一下'), 'intro', 2, 1),
('了解需求', '需要主动询问客户需求', JSON_ARRAY('您需要', '什么需求', '想了解', '希望了解'), 'needs_analysis', 3, 1),
('产品介绍', '需要介绍相关产品', JSON_ARRAY('我们的产品', '这个课程', '我们的服务', '我们有'), 'product_intro', 4, 1),
('价格说明', '需要说明价格或费用', JSON_ARRAY('价格', '费用', '学费', '收费'), 'pricing', 5, 1),
('异议处理', '需要处理客户异议', JSON_ARRAY('理解', '明白', '确实是的', '我理解'), 'objection_handling', 6, 1),
('后续跟进', '需要安排后续跟进', JSON_ARRAY('下次联系', '明天联系', '后续', '跟进'), 'follow_up', 7, 1);

-- ===============================================================
-- 2. 违规质检规则初始化
-- ===============================================================
INSERT INTO ai_violation_rules (rule_name, violation_type, keywords, severity, description, is_active) VALUES
('过度承诺', 'over_promise', JSON_ARRAY('保证', '一定', '绝对', '100%', '肯定能'), '高', '过度承诺或保证效果', 1),
('侮辱谩骂', 'insult', JSON_ARRAY('傻瓜', '笨蛋', '神经病', '去死', '垃圾'), '高', '使用不礼貌或侮辱性语言', 1),
('态度恶劣', 'bad_attitude', JSON_ARRAY('随便你', '爱买不买', '不想理你', '你看着办'), '高', '态度恶劣或消极', 1),
('泄露隐私', 'privacy_leak', JSON_ARRAY('其他客户', '隐私信息', '内部消息', '保密'), '中', '泄露公司或其他客户隐私', 1),
('强制推销', 'hard_sell', JSON_ARRAY('必须买', '一定要买', '赶紧买', '马上买'), '中', '强制推销或施压', 1),
('虚假宣传', 'false_claim', JSON_ARRAY('全国第一', '全球领先', '最好', '最强'), '中', '虚假宣传或夸大', 1);

-- ===============================================================
-- 3. 测试数据：创建样本客户
-- ===============================================================
INSERT INTO customer (real_name, phone, wechat_id, user_id) VALUES
('张三', '13800138001', 'test_customer_1', 1),
('李四', '13800138002', 'test_customer_2', 1)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ===============================================================
-- 4. 测试数据：创建聊天记录
-- ===============================================================
INSERT INTO ai_chat_records (user_id, customer_id, chat_date, chat_type, chat_content, message_count) VALUES
(1, 1, '2025-01-12 10:00:00', 'text', '客户：你好，想了解一下你们的课程\n销售：您好！我是来自教育机构的张老师，很高兴为您服务。请问您想了解哪方面的课程呢？', 2),
(1, 1, '2025-01-12 10:05:00', 'text', '客户：我想学习Python编程\n销售：我们有专业的Python课程，包含基础语法、项目实战等内容。价格是3999元，您可以考虑一下。', 2),
(1, 2, '2025-01-12 11:00:00', 'text', '客户：你们的价格太贵了，能不能便宜点？\n销售：我理解您的考虑。我们保证您100%学会，学不会全额退款。这个价格真的很划算。', 2);

-- ===============================================================
-- 5. 测试数据：创建质检记录
-- ===============================================================
INSERT INTO ai_staff_quality_records (chat_record_id, user_id, customer_id, chat_date, sop_items, sop_completed_count, sop_total_count, sop_score, violations, violation_count, message_count, response_time_avg, high_intent_customer) VALUES
(1, 1, 1, '2025-01-12', JSON_OBJECT('礼貌问候', true, '自我介绍', true, '了解需求', true, '产品介绍', false, '价格说明', false, '异议处理', false, '后续跟进', false), 3, 7, 57, JSON_ARRAY(), 0, 2, 30, 0),
(2, 1, 1, '2025-01-12', JSON_OBJECT('礼貌问候', true, '自我介绍', true, '了解需求', true, '产品介绍', true, '价格说明', true, '异议处理', false, '后续跟进', false), 5, 7, 86, JSON_ARRAY(), 0, 2, 25, 1),
(3, 1, 2, '2025-01-12', JSON_OBJECT('礼貌问候', false, '自我介绍', false, '了解需求', true, '产品介绍', true, '价格说明', true, '异议处理', true, '后续跟进', false), 4, 7, 57, JSON_ARRAY('过度承诺'), 1, 2, 20, 0);

-- ===============================================================
-- 6. 测试数据：创建客户洞察
-- ===============================================================
INSERT INTO ai_customer_insights (customer_id, user_id, insight_type, content, mention_count, source, is_active) VALUES
(1, 1, 'question', '想了解课程信息', 1, 'chat_analysis', 1),
(1, 1, 'interest', 'Python编程', 1, 'chat_analysis', 1),
(1, 1, 'need', '学习编程技能', 1, 'chat_analysis', 1),
(2, 1, 'objection', '价格太贵', 1, 'chat_analysis', 1),
(2, 1, 'pain_point', '预算有限', 1, 'chat_analysis', 1),
(2, 1, 'focus_point', '价格优惠', 1, 'chat_analysis', 1);

-- ===============================================================
-- 7. 验证插入结果
-- ===============================================================
SELECT '数据初始化完成！' AS 消息;
SELECT CONCAT('SOP规则: ', COUNT(*), ' 条') AS 统计 FROM ai_sop_rules WHERE is_active = 1
UNION ALL
SELECT CONCAT('违规规则: ', COUNT(*), ' 条') FROM ai_violation_rules WHERE is_active = 1
UNION ALL
SELECT CONCAT('质检记录: ', COUNT(*), ' 条') FROM ai_staff_quality_records
UNION ALL
SELECT CONCAT('客户洞察: ', COUNT(*), ' 条') FROM ai_customer_insights WHERE is_active = 1;