// 创建测试数据的SQL脚本
const testSQL = `
-- 1. 插入SOP规则
INSERT IGNORE INTO ai_sop_rules (id, name, description, keywords, check_type, is_active, created_at) VALUES
(1, '礼貌问候', '聊天开始时需要礼貌问候', '你好,您好,早上好,下午好,晚上好', 'contain', 1, NOW()),
(2, '自我介绍', '需要介绍自己和公司', '我是,我是来自,我来自,介绍一下', 'contain', 1, NOW()),
(3, '了解需求', '需要主动询问客户需求', '您需要,什么需求,想了解,希望了解', 'contain', 1, NOW()),
(4, '产品介绍', '需要介绍相关产品', '我们的产品,这个课程,我们的服务', 'contain', 1, NOW()),
(5, '价格说明', '需要说明价格或费用', '价格,费用,学费,收费', 'contain', 1, NOW()),
(6, '异议处理', '需要处理客户异议', '理解,明白,确实是的', 'contain', 1, NOW()),
(7, '后续跟进', '需要安排后续跟进', '下次联系,明天联系,后续', 'contain', 1, NOW());

-- 2. 插入违规规则
INSERT IGNORE INTO ai_violation_rules (id, name, description, keywords, severity, is_active, created_at) VALUES
(1, '过度承诺', '过度承诺或保证效果', '保证,一定,绝对,100%,肯定能', 'high', 1, NOW()),
(2, '侮辱谩骂', '使用不礼貌或侮辱性语言', '傻瓜,笨蛋,神经病,去死', 'high', 1, NOW()),
(3, '态度恶劣', '态度恶劣或消极', '随便你,爱买不买,不想理你', 'high', 1, NOW()),
(4, '泄露隐私', '泄露公司或其他客户隐私', '其他客户,隐私信息,内部消息', 'medium', 1, NOW()),
(5, '强制推销', '强制推销或施压', '必须买,一定要买,赶紧买', 'medium', 1, NOW()),
(6, '虚假宣传', '虚假宣传或夸大', '全国第一,全球领先,最好', 'medium', 1, NOW());

-- 3. 插入测试聊天记录（模拟个人微信）
INSERT IGNORE INTO ai_chat_records (
  id, user_id, customer_id, chat_date, chat_type, chat_content,
  message_count, ai_analysis_result, created_at
) VALUES
(1, 1, 1, '2025-01-10 10:00:00', 'text',
'客户：你好，想了解一下你们的课程\n销售：您好！我是来自教育机构的张老师，很高兴为您服务。请问您想了解哪方面的课程呢？',
2, JSON_OBJECT(
  'painPoints', ['课程咨询', '学习需求'],
  'interests', ['课程内容'],
  'qualityLevel', 'B',
  'intentScore', 70,
  'riskLevel', 'low'
), NOW()),

(2, 1, 1, '2025-01-10 10:05:00', 'text',
'客户：我想学习编程，有相关课程吗？\n销售：我们有Python、Java、前端开发等多种编程课程。您对哪方面比较感兴趣？价格方面，我们的课程是3999元起，包含3个月的系统学习。',
2, JSON_OBJECT(
  'painPoints', ['编程学习'],
  'interests', ['Python', 'Java', '前端开发'],
  'qualityLevel', 'A',
  'intentScore', 85,
  'riskLevel', 'low'
), NOW()),

(3, 1, 2, '2025-01-10 11:00:00', 'text',
'客户：你们的价格太贵了\n销售：我理解您的考虑。相比其他机构，我们的课程包含更多实战项目，而且有专业老师一对一辅导。很多学员学习后都成功找到了好工作。保证您100%满意！',
2, JSON_OBJECT(
  'painPoints', ['价格敏感'],
  'objections', ['价格贵'],
  'qualityLevel', 'C',
  'intentScore', 60,
  'riskLevel', 'high'
), NOW());

-- 4. 插入质检记录
INSERT IGNORE INTO ai_staff_quality_records (
  id, chat_record_id, user_id, customer_id, chat_date,
  sop_items, sop_score, sop_completed, violation_items, violation_count,
  message_count, response_time, high_intent_customer, service_attitude_score,
  created_at
) VALUES
(1, 1, 1, 1, '2025-01-10 10:00:00',
JSON_OBJECT(
  '礼貌问候', JSON_OBJECT('completed', true, 'detail', '使用了您好'),
  '自我介绍', JSON_OBJECT('completed', true, 'detail', '介绍了自己'),
  '了解需求', JSON_OBJECT('completed', true, 'detail', '询问了需求'),
  '产品介绍', JSON_OBJECT('completed', false, 'detail', '未详细介绍'),
  '价格说明', JSON_OBJECT('completed', false, 'detail', '未提及价格'),
  '异议处理', JSON_OBJECT('completed', false, 'detail', '无异议'),
  '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 57, 0, JSON_ARRAY(), 0, 2, 30, 0, 4, NOW()),

(2, 2, 1, 1, '2025-01-10 10:05:00',
JSON_OBJECT(
  '礼貌问候', JSON_OBJECT('completed', true, 'detail', '已有问候'),
  '自我介绍', JSON_OBJECT('completed', true, 'detail', '已介绍'),
  '了解需求', JSON_OBJECT('completed', true, 'detail', '询问了具体方向'),
  '产品介绍', JSON_OBJECT('completed', true, 'detail', '介绍了多种课程'),
  '价格说明', JSON_OBJECT('completed', true, 'detail', '说明了价格'),
  '异议处理', JSON_OBJECT('completed', false, 'detail', '无异议'),
  '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 86, 1, JSON_ARRAY(), 0, 2, 25, 1, 5, NOW()),

(3, 3, 1, 2, '2025-01-10 11:00:00',
JSON_OBJECT(
  '礼貌问候', JSON_OBJECT('completed', true, 'detail', '已有对话基础'),
  '自我介绍', JSON_OBJECT('completed', true, 'detail', '已介绍'),
  '了解需求', JSON_OBJECT('completed', true, 'detail', '了解价格顾虑'),
  '产品介绍', JSON_OBJECT('completed', true, 'detail', '解释了价值'),
  '价格说明', JSON_OBJECT('completed', true, 'detail', '说明了价格'),
  '异议处理', JSON_OBJECT('completed', true, 'detail', '处理了价格异议'),
  '后续跟进', JSON_OBJECT('completed', false, 'detail', '未安排跟进')
), 86, 1, JSON_ARRAY('过度承诺'), 1, 2, 20, 0, 3, NOW());

-- 5. 插入客户洞察数据
INSERT IGNORE INTO ai_customer_insights (
  id, customer_id, user_id, insight_type, content, mention_count,
  source, is_active, created_at
) VALUES
(1, 1, 1, 'question', '想了解课程信息', 1, 'chat_analysis', 1, NOW()),
(2, 1, 1, 'interest', '编程课程', 1, 'chat_analysis', 1, NOW()),
(3, 1, 1, 'interest', 'Python', 1, 'chat_analysis', 1, NOW()),
(4, 1, 1, 'interest', 'Java', 1, 'chat_analysis', 1, NOW()),
(5, 1, 1, 'interest', '前端开发', 1, 'chat_analysis', 1, NOW()),
(6, 2, 1, 'objection', '价格太贵', 1, 'chat_analysis', 1, NOW()),
(7, 2, 1, 'pain_point', '价格敏感', 1, 'chat_analysis', 1, NOW());
`;

console.log('测试数据SQL脚本：');
console.log(testSQL);
console.log('\n请将这些SQL复制到MySQL客户端中执行，以创建测试数据。');