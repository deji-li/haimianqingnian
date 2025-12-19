-- AI老板助手完整初始化脚本
-- 执行前请确保已登录到MySQL数据库

-- ===============================================================
-- 1. SOP质检规则初始化
-- ===============================================================
INSERT IGNORE INTO ai_sop_rules (name, description, keywords, check_type, is_active, created_at, updated_at) VALUES
('礼貌问候', '聊天开始时需要礼貌问候', '你好,您好,早上好,下午好,晚上好,Hi,Hello', 'contain', 1, NOW(), NOW()),
('自我介绍', '需要介绍自己和公司', '我是,我是来自,我来自,介绍一下,我是机构的,我是公司的', 'contain', 1, NOW(), NOW()),
('了解需求', '需要主动询问客户需求', '您需要,什么需求,想了解,希望了解,您想,您希望,您的需求是', 'contain', 1, NOW(), NOW()),
('产品介绍', '需要介绍相关产品', '我们的产品,这个课程,我们的服务,我们有,课程包含,产品特点', 'contain', 1, NOW(), NOW()),
('价格说明', '需要说明价格或费用', '价格,费用,学费,收费,费用是,价格是,只需,只需要', 'contain', 1, NOW(), NOW()),
('异议处理', '需要处理客户异议', '理解,明白,确实是的,我理解,您说得对,您考虑的很有道理', 'contain', 1, NOW(), NOW()),
('后续跟进', '需要安排后续跟进', '下次联系,明天联系,后续,跟进,保持联系,回头联系', 'contain', 1, NOW(), NOW());

-- ===============================================================
-- 2. 违规质检规则初始化
-- ===============================================================
INSERT IGNORE INTO ai_violation_rules (name, description, keywords, severity, is_active, created_at, updated_at) VALUES
('过度承诺', '过度承诺或保证效果', '保证,一定,绝对,100%,肯定能,一定能,包过,包学会,包就业', 'high', 1, NOW(), NOW()),
('侮辱谩骂', '使用不礼貌或侮辱性语言', '傻瓜,笨蛋,神经病,去死,滚,垃圾,废物,傻逼,他妈的', 'high', 1, NOW(), NOW()),
('态度恶劣', '态度恶劣或消极', '随便你,爱买不买,不想理你,你看着办,无语,呵呵,鄙视,懒得理你', 'high', 1, NOW(), NOW()),
('泄露隐私', '泄露公司或其他客户隐私', '其他客户,隐私信息,内部消息,保密,听说,我们有个客户', 'medium', 1, NOW(), NOW()),
('强制推销', '强制推销或施压', '必须买,一定要买,赶紧买,马上买,今天必须,仅剩最后,名额有限', 'medium', 1, NOW(), NOW()),
('虚假宣传', '虚假宣传或夸大', '全国第一,全球领先,最好,最强,第一品牌,绝对领先,无人能比', 'medium', 1, NOW(), NOW());

-- ===============================================================
-- 3. 权限配置
-- ===============================================================
-- 插入权限
INSERT IGNORE INTO permission (name, code, description, module, created_at, updated_at) VALUES
('客户洞察查看', 'ai-marketing:use', '查看AI客户洞察数据', 'AI营销', NOW(), NOW()),
('员工质检查看', 'ai-quality:view', '查看AI员工质检数据', 'AI质检', NOW(), NOW()),
('员工质检管理', 'ai-quality:manage', '管理AI员工质检配置', 'AI质检', NOW(), NOW());

-- 为超级管理员（role_id=1）分配权限
INSERT IGNORE INTO role_permission (role_id, permission_id, created_at)
SELECT 1, p.id, NOW()
FROM permission p
WHERE p.code IN ('ai-marketing:use', 'ai-quality:view', 'ai-quality:manage');

-- ===============================================================
-- 4. 示例数据（可选）
-- ===============================================================

-- 创建示例客户（如果不存在）
INSERT IGNORE INTO customer (id, real_name, phone, wechat_id, user_id, created_at, updated_at) VALUES
(9999, '测试客户-张三', '13800138001', 'test_customer_1', 1, NOW(), NOW()),
(10000, '测试客户-李四', '13800138002', 'test_customer_2', 1, NOW(), NOW());

-- 创建示例聊天记录
INSERT IGNORE INTO ai_chat_records (
    id, user_id, customer_id, chat_date, chat_type, chat_content,
    message_count, ai_analysis_result, created_at, updated_at
) VALUES
(1001, 1, 9999, '2025-01-12 10:00:00', 'text',
'客户：你好，想了解一下你们的课程\n销售：您好！我是来自教育机构的张老师，很高兴为您服务。请问您想了解哪方面的课程呢？',
2, JSON_OBJECT(
    'painPoints', JSON_ARRAY('课程咨询'),
    'interests', JSON_ARRAY('课程内容'),
    'qualityLevel', 'B',
    'intentScore', 70,
    'riskLevel', 'low'
), NOW(), NOW()),

(1002, 1, 9999, '2025-01-12 10:05:00', 'text',
'客户：我想学习Python编程\n销售：我们有专业的Python课程，包含基础语法、项目实战等内容。价格是3999元，您可以考虑一下。',
2, JSON_OBJECT(
    'painPoints', JSON_ARRAY('编程学习'),
    'interests', JSON_ARRAY('Python'),
    'objections', JSON_ARRAY('价格考虑'),
    'qualityLevel', 'A',
    'intentScore', 85,
    'riskLevel', 'medium'
), NOW(), NOW()),

(1003, 1, 10000, '2025-01-12 11:00:00', 'text',
'客户：你们的价格太贵了，能不能便宜点？\n销售：我理解您的考虑。我们保证您100%学会，学不会全额退款。这个价格真的很划算。',
2, JSON_OBJECT(
    'painPoints', JSON_ARRAY('价格敏感'),
    'objections', JSON_ARRAY('价格贵'),
    'qualityLevel', 'C',
    'intentScore', 60,
    'riskLevel', 'high'
), NOW(), NOW());

-- 创建质检记录
INSERT IGNORE INTO ai_staff_quality_records (
    id, chat_record_id, user_id, customer_id, chat_date,
    sop_items, sop_score, sop_completed,
    violation_items, violation_count,
    message_count, response_time, high_intent_customer,
    service_attitude_score, created_at, updated_at
) VALUES
(1001, 1001, 1, 9999, '2025-01-12 10:00:00',
JSON_OBJECT(
    '礼貌问候', JSON_OBJECT('completed', true, 'detail', '使用了您好'),
    '自我介绍', JSON_OBJECT('completed', true, 'detail', '介绍了自己'),
    '了解需求', JSON_OBJECT('completed', true, 'detail', '询问了需求'),
    '产品介绍', JSON_OBJECT('completed', false, 'detail', '未详细介绍'),
    '价格说明', JSON_OBJECT('completed', false, 'detail', '未提及价格'),
    '异议处理', JSON_OBJECT('completed', false, 'detail', '无异议'),
    '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 57, 0,
JSON_ARRAY(), 0,
2, 30, 0, 4, NOW(), NOW()),

(1002, 1002, 1, 9999, '2025-01-12 10:05:00',
JSON_OBJECT(
    '礼貌问候', JSON_OBJECT('completed', true, 'detail', '已有问候'),
    '自我介绍', JSON_OBJECT('completed', true, 'detail', '已介绍'),
    '了解需求', JSON_OBJECT('completed', true, 'detail', '询问了具体方向'),
    '产品介绍', JSON_OBJECT('completed', true, 'detail', '介绍了课程'),
    '价格说明', JSON_OBJECT('completed', true, 'detail', '说明了价格'),
    '异议处理', JSON_OBJECT('completed', false, 'detail', '无异议'),
    '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 86, 1,
JSON_ARRAY(), 0,
2, 25, 1, 5, NOW(), NOW()),

(1003, 1003, 1, 10000, '2025-01-12 11:00:00',
JSON_OBJECT(
    '礼貌问候', JSON_OBJECT('completed', false, 'detail', '缺少礼貌问候'),
    '自我介绍', JSON_OBJECT('completed', false, 'detail', '未介绍自己'),
    '了解需求', JSON_OBJECT('completed', true, 'detail', '了解了价格顾虑'),
    '产品介绍', JSON_OBJECT('completed', true, 'detail', '解释了价值'),
    '价格说明', JSON_OBJECT('completed', true, 'detail', '说明了价格'),
    '异议处理', JSON_OBJECT('completed', true, 'detail', '处理了异议'),
    '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 57, 0,
JSON_ARRAY('过度承诺'), 1,
2, 20, 0, 3, NOW(), NOW());

-- 创建客户洞察数据
INSERT IGNORE INTO ai_customer_insights (
    id, customer_id, user_id, insight_type, content, mention_count,
    source, is_active, created_at, updated_at
) VALUES
(10001, 9999, 1, 'question', '想了解课程信息', 1, 'chat_analysis', 1, NOW(), NOW()),
(10002, 9999, 1, 'interest', 'Python编程', 1, 'chat_analysis', 1, NOW(), NOW()),
(10003, 9999, 1, 'need', '学习编程技能', 1, 'chat_analysis', 1, NOW(), NOW()),
(10004, 10000, 1, 'objection', '价格太贵', 1, 'chat_analysis', 1, NOW(), NOW()),
(10005, 10000, 1, 'pain_point', '预算有限', 1, 'chat_analysis', 1, NOW(), NOW()),
(10006, 10000, 1, 'focus', '价格优惠', 1, 'chat_analysis', 1, NOW(), NOW());

-- ===============================================================
-- 5. 验证初始化结果
-- ===============================================================
SELECT '初始化完成！数据统计如下：' AS 消息
UNION ALL
SELECT CONCAT('SOP规则：', COUNT(*), ' 条') FROM ai_sop_rules WHERE is_active = 1
UNION ALL
SELECT CONCAT('违规规则：', COUNT(*), ' 条') FROM ai_violation_rules WHERE is_active = 1
UNION ALL
SELECT CONCAT('相关权限：', COUNT(*), ' 个') FROM permission WHERE code LIKE 'ai-%'
UNION ALL
SELECT CONCAT('质检记录：', COUNT(*), ' 条') FROM ai_staff_quality_records
UNION ALL
SELECT CONCAT('客户洞察：', COUNT(*), ' 条') FROM ai_customer_insights WHERE is_active = 1;