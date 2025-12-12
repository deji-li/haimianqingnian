-- AI质检模块初始化数据脚本
-- 使用方法：在MySQL客户端中执行此脚本

-- 1. 清理已有数据（可选）
-- DELETE FROM ai_staff_quality_records;
-- DELETE FROM ai_sop_rules;
-- DELETE FROM ai_violation_rules;

-- 2. 插入SOP规则
INSERT INTO ai_sop_rules (name, description, keywords, check_type, is_active, created_at, updated_at) VALUES
('礼貌问候', '聊天开始时需要礼貌问候', '你好,您好,早上好,下午好,晚上好,Hi,Hello', 'contain', 1, NOW(), NOW()),
('自我介绍', '需要介绍自己和公司', '我是,我是来自,我来自,介绍一下,我是机构的,我是公司的', 'contain', 1, NOW(), NOW()),
('了解需求', '需要主动询问客户需求', '您需要,什么需求,想了解,希望了解,您想,您希望,您的需求是', 'contain', 1, NOW(), NOW()),
('产品介绍', '需要介绍相关产品', '我们的产品,这个课程,我们的服务,我们有,课程包含,产品特点', 'contain', 1, NOW(), NOW()),
('价格说明', '需要说明价格或费用', '价格,费用,学费,收费,费用是,价格是,只需,只需要', 'contain', 1, NOW(), NOW()),
('异议处理', '需要处理客户异议', '理解,明白,确实是的,我理解,您说得对,您考虑的很有道理', 'contain', 1, NOW(), NOW()),
('后续跟进', '需要安排后续跟进', '下次联系,明天联系,后续,跟进,保持联系,回头联系', 'contain', 1, NOW(), NOW());

-- 3. 插入违规规则
INSERT INTO ai_violation_rules (name, description, keywords, severity, is_active, created_at, updated_at) VALUES
('过度承诺', '过度承诺或保证效果', '保证,一定,绝对,100%,肯定能,一定能,包过,包学会,包就业', 'high', 1, NOW(), NOW()),
('侮辱谩骂', '使用不礼貌或侮辱性语言', '傻瓜,笨蛋,神经病,去死,滚,垃圾,废物,傻逼,他妈的', 'high', 1, NOW(), NOW()),
('态度恶劣', '态度恶劣或消极', '随便你,爱买不买,不想理你,你看着办,无语,呵呵,鄙视,懒得理你', 'high', 1, NOW(), NOW()),
('泄露隐私', '泄露公司或其他客户隐私', '其他客户,隐私信息,内部消息,保密,听说,我们有个客户', 'medium', 1, NOW(), NOW()),
('强制推销', '强制推销或施压', '必须买,一定要买,赶紧买,马上买,今天必须,仅剩最后,名额有限', 'medium', 1, NOW(), NOW()),
('虚假宣传', '虚假宣传或夸大', '全国第一,全球领先,最好,最强,第一品牌,绝对领先,无人能比', 'medium', 1, NOW(), NOW());

-- 4. 显示插入结果
SELECT 'SOP规则插入完成，共' AS 提示, COUNT(*) AS 数量 FROM ai_sop_rules WHERE is_active = 1
UNION ALL
SELECT '违规规则插入完成，共' AS 提示, COUNT(*) AS 数量 FROM ai_violation_rules WHERE is_active = 1;