-- =====================================================
-- 综合测试数据 - 根据实际表结构重写
-- =====================================================

-- 清空现有测试数据（保留admin用户）
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM commission_calculations WHERE id > 0;
DELETE FROM ai_chat_records WHERE id > 0;
DELETE FROM ai_customer_tags WHERE id > 0;
DELETE FROM customer_follow_records WHERE id > 0;
DELETE FROM orders WHERE id > 0;
DELETE FROM customers WHERE id > 0;
DELETE FROM notification WHERE id > 0;
DELETE FROM user_campus WHERE id > 0;
DELETE FROM users WHERE id > 1;
DELETE FROM commission_schemes WHERE id > 0;
DELETE FROM department WHERE id > 0;
DELETE FROM campus WHERE id > 0;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 部门和校区数据
-- =====================================================
INSERT INTO department (id, department_name, parent_id, manager_id, description, sort, status) VALUES
(1, '销售部', NULL, 1, '负责市场销售和客户开发', 1, 1),
(2, '市场部', NULL, 1, '负责市场推广和品牌建设', 2, 1),
(3, '教学部', NULL, 1, '负责教学管理和师资培训', 3, 1),
(4, '客服部', NULL, 1, '负责客户服务和售后支持', 4, 1),
(5, '销售一组', 1, 2, '销售部第一组', 1, 1),
(6, '销售二组', 1, 3, '销售部第二组', 2, 1);

INSERT INTO campus (id, campus_name, campus_code, address, contact_person, contact_phone, manager_id, description, sort, status) VALUES
(1, '海淀校区', 'HD001', '北京市海淀区中关村大街1号', '张校长', '010-12345678', 1, '海淀区旗舰校区', 1, 1),
(2, '朝阳校区', 'CY001', '北京市朝阳区建国路88号', '李校长', '010-23456789', 1, '朝阳区分校', 2, 1),
(3, '西城校区', 'XC001', '北京市西城区金融街19号', '王校长', '010-34567890', 1, '西城区分校', 3, 1),
(4, '东城校区', 'DC001', '北京市东城区王府井大街1号', '赵校长', '010-45678901', 1, '东城区分校', 4, 1);

-- =====================================================
-- 2. 用户数据（各种角色）
-- =====================================================
INSERT INTO users (id, username, password, real_name, phone, email, role_id, department_id, campus_id, status) VALUES
(2, 'sales_director', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '张总监', '13800000001', 'director@test.com', 2, 1, 1, 1),
(3, 'sales_manager1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '李经理', '13800000002', 'manager1@test.com', 2, 5, 1, 1),
(4, 'sales1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '王销售', '13800000003', 'sales1@test.com', 3, 5, 1, 1),
(5, 'sales2', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '赵销售', '13800000004', 'sales2@test.com', 3, 5, 1, 1),
(6, 'sales3', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '刘销售', '13800000005', 'sales3@test.com', 3, 6, 2, 1),
(7, 'sales4', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '陈销售', '13800000006', 'sales4@test.com', 3, 6, 2, 1),
(8, 'marketing1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '周市场', '13800000007', 'marketing1@test.com', 3, 2, 1, 1),
(9, 'service1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '吴客服', '13800000008', 'service1@test.com', 3, 4, 1, 1),
(10, 'teacher1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '郑老师', '13800000009', 'teacher1@test.com', 3, 3, 1, 1);

-- 用户校区关联
INSERT INTO user_campus (user_id, campus_id, is_primary) VALUES
(2, 1, 1), (2, 2, 0), (2, 3, 0), (2, 4, 0),
(3, 1, 1),
(4, 1, 1),
(5, 1, 1),
(6, 2, 1),
(7, 2, 1),
(8, 1, 1), (8, 2, 0);

-- =====================================================
-- 3. 客户数据
-- =====================================================
INSERT INTO customers (id, wechat_id, wechat_nickname, phone, real_name, traffic_source, traffic_platform, traffic_city,
    sales_id, customer_intent, lifecycle_stage, student_grade, student_age, family_economic_level,
    parent_role, location, estimated_value, quality_level, remark, next_follow_time) VALUES
-- 线索阶段
(1, 'wx_zhangsan', '阳光少年', '13900000001', '张三妈妈', '线上广告', '抖音', '北京', 4, '高', '线索', '六年级', 12, '中', '妈妈', '北京市海淀区', 12000.00, 'A', '家长对数学培训很感兴趣', DATE_ADD(NOW(), INTERVAL 1 DAY)),
(2, 'wx_lisi', '快乐学习', '13900000002', '李四爸爸', '老客户推荐', '小红书', '北京', 5, '中', '线索', '初三', 15, '中', '爸爸', '北京市朝阳区', 10000.00, 'B', '朋友推荐过来咨询', DATE_ADD(NOW(), INTERVAL 2 DAY)),
-- 意向阶段
(3, 'wx_wangwu', '好好学习', '13900000003', '王五妈妈', '线下活动', '抖音', '北京', 4, '高', '意向', '四年级', 10, '高', '妈妈', '北京市西城区', 15000.00, 'A', '已经试听一次，反馈很好', DATE_ADD(NOW(), INTERVAL 3 DAY)),
(4, 'wx_zhaoliu', '天天向上', '13900000004', '赵六家长', '自然到店', NULL, '北京', 5, '高', '意向', '高三', 16, '高', '妈妈', '北京市海淀区', 25000.00, 'A', '准备高考，需要冲刺辅导', DATE_ADD(NOW(), INTERVAL 2 DAY)),
-- 报价阶段
(5, 'wx_sunqi', '聪明宝宝', '13900000005', '孙七妈妈', '朋友圈广告', '视频号', '北京', 6, '中', '报价', '三年级', 8, '中', '妈妈', '北京市朝阳区', 9000.00, 'B', '已发送报价单，等待确认', DATE_ADD(NOW(), INTERVAL 3 DAY)),
-- 谈判阶段
(6, 'wx_zhouba', '未来之星', '13900000006', '周八爸爸', '线上广告', '抖音', '北京', 7, '高', '谈判', '初二', 14, '高', '爸爸', '北京市东城区', 22000.00, 'A', '正在商谈优惠方案', DATE_ADD(NOW(), INTERVAL 2 DAY)),
-- 成交阶段
(7, 'wx_wujiu', '学霸养成', '13900000007', '吴九家长', '老客户推荐', '小红书', '北京', 4, '高', '成交', '初一', 13, '高', '爸爸', '北京市海淀区', 16000.00, 'A', '已报名初中数学精品班', NULL),
(8, 'wx_zhengshi', '优等生', '13900000008', '郑十家长', '自然到店', NULL, '北京', 5, '高', '成交', '高三', 17, '高', '妈妈', '北京市西城区', 28000.00, 'A', '已报名高三冲刺班', NULL),
-- 更多客户
(9, 'wx_chenshier', '努力学', '13900000010', '陈十二', '线上广告', '抖音', '北京', 4, '中', '线索', '三年级', 9, '中', '妈妈', '北京市海淀区', 9000.00, 'B', '刚咨询，待跟进', DATE_ADD(NOW(), INTERVAL 1 DAY)),
(10, 'wx_weishisan', '好学生', '13900000011', '卫十三', '老客户推荐', '小红书', '北京', 5, '高', '意向', '初三', 15, '高', '爸爸', '北京市朝阳区', 20000.00, 'A', '已试听两次，意向强烈', DATE_ADD(NOW(), INTERVAL 2 DAY)),
(11, 'wx_jiangshisi', '学习王', '13900000012', '蒋十四', '自然到店', NULL, '北京', 7, '高', '报价', '高二', 16, '中', '妈妈', '北京市西城区', 14000.00, 'A', '已发报价，准备签约', DATE_ADD(NOW(), INTERVAL 1 DAY)),
(12, 'wx_yangshiliu', '拼搏者', '13900000014', '杨十六', '线上广告', '抖音', '北京', 4, '高', '成交', '高三', 17, '高', '妈妈', '北京市海淀区', 32000.00, 'A', '已报名高考全科冲刺', NULL),
(13, 'wx_heershi', '学习小达人', '13900000018', '何二十', '线上广告', '视频号', '北京', 5, '高', '成交', '五年级', 12, '中', '爸爸', '北京市朝阳区', 13000.00, 'A', '已报名小学全科班', NULL);

-- =====================================================
-- 4. 跟进记录
-- =====================================================
INSERT INTO customer_follow_records (customer_id, follow_content, follow_time, operator_id, next_follow_time) VALUES
-- 客户1的跟进
(1, '电话沟通，家长表示对数学培训很感兴趣，约定明天上门详谈', DATE_SUB(NOW(), INTERVAL 2 DAY), 4, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(1, '微信发送了课程介绍资料，家长表示很感兴趣', DATE_SUB(NOW(), INTERVAL 1 DAY), 4, DATE_ADD(NOW(), INTERVAL 1 DAY)),
-- 客户3的跟进
(3, '上门拜访，详细介绍了英语课程，家长很满意', DATE_SUB(NOW(), INTERVAL 10 DAY), 4, DATE_ADD(NOW(), INTERVAL 3 DAY)),
(3, '电话回访试听效果，家长反馈孩子很喜欢', DATE_SUB(NOW(), INTERVAL 8 DAY), 4, DATE_ADD(NOW(), INTERVAL 2 DAY)),
(3, '发送了优惠活动信息', DATE_SUB(NOW(), INTERVAL 5 DAY), 4, DATE_ADD(NOW(), INTERVAL 2 DAY)),
-- 客户4的跟进
(4, '电话沟通高考冲刺需求，家长很着急', DATE_SUB(NOW(), INTERVAL 15 DAY), 5, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(4, '带孩子来校区参观，介绍师资力量', DATE_SUB(NOW(), INTERVAL 13 DAY), 5, DATE_ADD(NOW(), INTERVAL 2 DAY)),
(4, '发送了往届学员高考成绩单', DATE_SUB(NOW(), INTERVAL 10 DAY), 5, DATE_ADD(NOW(), INTERVAL 1 DAY)),
-- 客户6的跟进
(6, '电话商谈价格，家长觉得有点贵', DATE_SUB(NOW(), INTERVAL 8 DAY), 7, DATE_ADD(NOW(), INTERVAL 2 DAY)),
(6, '申请了特殊优惠方案，等待审批', DATE_SUB(NOW(), INTERVAL 6 DAY), 7, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(6, '告知优惠已批准，家长表示会考虑', DATE_SUB(NOW(), INTERVAL 4 DAY), 7, DATE_ADD(NOW(), INTERVAL 3 DAY)),
-- 客户7的跟进
(7, '签约成功！报名初中数学精品班', DATE_SUB(NOW(), INTERVAL 30 DAY), 4, NULL),
(7, '开课后回访，家长反馈孩子很适应', DATE_SUB(NOW(), INTERVAL 20 DAY), 4, NULL),
-- 客户10的跟进
(10, '电话邀约试听', DATE_SUB(NOW(), INTERVAL 7 DAY), 5, DATE_ADD(NOW(), INTERVAL 1 DAY)),
(10, '第一次试听，孩子表现不错', DATE_SUB(NOW(), INTERVAL 5 DAY), 5, DATE_ADD(NOW(), INTERVAL 3 DAY)),
(10, '第二次试听，家长很满意', DATE_SUB(NOW(), INTERVAL 2 DAY), 5, DATE_ADD(NOW(), INTERVAL 2 DAY));

-- =====================================================
-- 5. 订单数据
-- =====================================================
INSERT INTO orders (id, order_no, customer_id, wechat_id, wechat_nickname, phone, sales_id, campus_id,
    course_name, payment_amount, payment_time, is_new_student, order_status, order_tag, remark,
    commission_scheme_id, commission_amount, commission_calculated_at) VALUES
-- 已完成订单
(1, 'ORD202501001', 7, 'wx_wujiu', '学霸养成', '13900000007', 4, 1,
    '初中数学精品班', 16000.00, DATE_SUB(NOW(), INTERVAL 30 DAY), 0, '上课中', '续费', '续费老客户，给予优惠',
    NULL, NULL, NULL),
(2, 'ORD202501002', 8, 'wx_zhengshi', '优等生', '13900000008', 5, 1,
    '高三全科冲刺班', 28000.00, DATE_SUB(NOW(), INTERVAL 25 DAY), 1, '上课中', '新签', '高考冲刺，全科辅导',
    NULL, NULL, NULL),
(3, 'ORD202501003', 12, 'wx_yangshiliu', '拼搏者', '13900000014', 4, 1,
    '高考全科冲刺套餐', 32000.00, DATE_SUB(NOW(), INTERVAL 40 DAY), 1, '上课中', '新签', '高三学生，冲刺985',
    NULL, NULL, NULL),
(4, 'ORD202501004', 13, 'wx_heershi', '学习小达人', '13900000018', 5, 1,
    '小学全科班', 13000.00, DATE_SUB(NOW(), INTERVAL 35 DAY), 1, '上课中', '新签', '小学全科辅导',
    NULL, NULL, NULL),
-- 短期课程
(5, 'ORD202501005', 7, 'wx_wujiu', '学霸养成', '13900000007', 4, 1,
    '寒假数学集训营', 4700.00, DATE_SUB(NOW(), INTERVAL 20 DAY), 0, '已完成', '续费', '寒假集训',
    NULL, NULL, NULL),
(6, 'ORD202501006', 8, 'wx_zhengshi', '优等生', '13900000008', 5, 1,
    '物理竞赛班', 11200.00, DATE_SUB(NOW(), INTERVAL 28 DAY), 0, '上课中', '续费', '物理竞赛辅导',
    NULL, NULL, NULL);

-- =====================================================
-- 6. 提成方案
-- =====================================================
INSERT INTO commission_schemes (id, name, type, rules, conditions, priority, status, created_by) VALUES
(1, '新签单提成-标准方案', 'percentage', '{"percentage": 5}', '{"orderTags": ["新签"], "minOrderAmount": 0}', 100, 1, 1),
(2, '续费单提成-标准方案', 'percentage', '{"percentage": 3}', '{"orderTags": ["续费"], "minOrderAmount": 0}', 90, 1, 1),
(3, '高额订单提成-阶梯方案', 'tiered',
    '{"tiers": [{"minAmount": 0, "maxAmount": 10000, "percentage": 4}, {"minAmount": 10000, "maxAmount": 20000, "percentage": 5}, {"minAmount": 20000, "maxAmount": null, "percentage": 6}]}',
    '{"minOrderAmount": 0}', 80, 1, 1),
(4, '高考冲刺班-固定提成', 'fixed', '{"amount": 2000}', '{"courses": ["高三全科冲刺班", "高考全科冲刺套餐"]}', 110, 1, 1);

-- =====================================================
-- 7. 提成计算记录
-- =====================================================
INSERT INTO commission_calculations (order_id, scheme_id, scheme_name, order_amount, commission_amount,
    calculation_rule, sales_id, status, settle_time, remark) VALUES
(1, 2, '续费单提成-标准方案', 16000.00, 480.00, '{"percentage": 3}', 4, 'paid', DATE_SUB(NOW(), INTERVAL 10 DAY), '已结算提成'),
(5, 2, '续费单提成-标准方案', 4700.00, 141.00, '{"percentage": 3}', 4, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY), '已结算提成'),
(2, 4, '高考冲刺班-固定提成', 28000.00, 2000.00, '{"amount": 2000}', 5, 'pending', NULL, '等待财务结算'),
(3, 4, '高考冲刺班-固定提成', 32000.00, 2000.00, '{"amount": 2000}', 4, 'pending', NULL, '等待财务结算'),
(4, 1, '新签单提成-标准方案', 13000.00, 650.00, '{"percentage": 5}', 5, 'pending', NULL, '等待财务结算'),
(6, 2, '续费单提成-标准方案', 11200.00, 336.00, '{"percentage": 3}', 5, 'pending', NULL, '等待财务结算');

-- =====================================================
-- 8. AI聊天分析记录
-- =====================================================
INSERT INTO ai_chat_records (customer_id, wechat_id, chat_date, images, ocr_text,
    ai_analysis_result, quality_level, risk_level, intention_score, estimated_value, analysis_status) VALUES
(1, 'wx_zhangsan', '2025-01-08',
    '["http://example.com/chat1.jpg"]',
    '家长：孩子数学成绩一直不理想\n顾问：我们有专业的数学老师\n家长：费用大概多少\n顾问：根据课时不同，8000-15000不等',
    '{"communicationSummary": "家长咨询数学辅导，关注费用和师资", "customerProfile": {"parentRole": "妈妈", "studentGrade": "六年级", "familyEconomicLevel": "中等", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["数学成绩提升", "专业师资", "合理价格"], "intentionLevel": "中等", "riskFactors": ["价格敏感"], "nextSteps": ["发送师资介绍", "提供试听课程", "制定个性化方案"]}',
    'A', '低', 75, 12000.00, '已完成'),
(3, 'wx_wangwu', '2025-01-01',
    '["http://example.com/chat2.jpg"]',
    '家长：试听课孩子很喜欢\n顾问：我们的外教很专业\n家长：什么时候能开始正式上课\n顾问：随时可以开班',
    '{"communicationSummary": "试听效果好，家长意向强烈", "customerProfile": {"parentRole": "爸爸", "studentGrade": "四年级", "familyEconomicLevel": "良好", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["优质外教", "尽快开班", "效果保障"], "intentionLevel": "高", "riskFactors": [], "nextSteps": ["尽快安排签约", "确定开班时间", "安排课表"]}',
    'A', '无风险', 90, 15000.00, '已完成'),
(4, 'wx_zhaoliu', '2024-12-27',
    '["http://example.com/chat3.jpg"]',
    '家长：高考还有半年，很焦虑\n顾问：我们有高考冲刺班\n家长：能保证提高多少分\n顾问：往年平均提高50-80分',
    '{"communicationSummary": "高三家长，高考焦虑，需要冲刺辅导", "customerProfile": {"parentRole": "妈妈", "studentGrade": "高三", "familyEconomicLevel": "良好", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["快速提分", "高考冲刺", "效果保障"], "intentionLevel": "高", "riskFactors": ["效果预期高"], "nextSteps": ["展示成功案例", "安排测评", "定制冲刺方案"]}',
    'A', '中', 85, 25000.00, '已完成'),
(10, 'wx_weishisan', '2025-01-04',
    '["http://example.com/chat4.jpg"]',
    '家长：朋友推荐过来的\n顾问：欢迎！您孩子几年级\n家长：初三，理科有点弱\n顾问：我们有理科培优班',
    '{"communicationSummary": "朋友推荐，初三学生，理科需要提升", "customerProfile": {"parentRole": "妈妈", "studentGrade": "初三", "familyEconomicLevel": "中上", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["理科成绩提升", "中考备考", "口碑好的机构"], "intentionLevel": "中高", "riskFactors": [], "nextSteps": ["安排试听", "介绍师资", "提供优惠方案"]}',
    'A', '低', 80, 18000.00, '已完成');

-- =====================================================
-- 9. AI客户标签
-- =====================================================
INSERT INTO ai_customer_tags (customer_id, tag_name, tag_category, confidence, source) VALUES
(1, '价格敏感', 'risk', 0.85, 'ai_analysis'),
(1, '关注师资', 'need', 0.90, 'ai_analysis'),
(1, '数学辅导需求', 'need', 0.95, 'ai_analysis'),
(1, '中等收入家庭', 'profile', 0.80, 'ai_analysis'),
(3, '高意向客户', 'quality', 0.95, 'ai_analysis'),
(3, '试听效果好', 'behavior', 0.90, 'ai_analysis'),
(3, '英语培训需求', 'need', 0.95, 'ai_analysis'),
(3, '决策快', 'behavior', 0.85, 'ai_analysis'),
(3, '经济条件好', 'profile', 0.88, 'ai_analysis'),
(4, '高考冲刺需求', 'need', 0.98, 'ai_analysis'),
(4, '焦虑型家长', 'profile', 0.92, 'ai_analysis'),
(4, '效果导向', 'behavior', 0.90, 'ai_analysis'),
(4, '预算充足', 'profile', 0.85, 'ai_analysis'),
(4, '高意向', 'quality', 0.95, 'ai_analysis'),
(10, '朋友推荐', 'source', 0.95, 'ai_analysis'),
(10, '理科培优需求', 'need', 0.90, 'ai_analysis'),
(10, '中考备考', 'need', 0.92, 'ai_analysis'),
(10, '信任度高', 'behavior', 0.88, 'ai_analysis'),
(10, '经济条件中上', 'profile', 0.82, 'ai_analysis');

-- =====================================================
-- 10. 通知消息
-- =====================================================
INSERT INTO notification (user_id, type, title, content, link, is_read) VALUES
(4, 'task', '客户跟进提醒', '客户"张三"需要在今天跟进，请及时联系', '/customer/detail/1', 0),
(4, 'order', '新订单通知', '客户"吴九"的订单已支付成功', '/order/list', 1),
(5, 'task', '客户跟进提醒', '客户"赵六"明天需要跟进', '/customer/detail/4', 0),
(5, 'order', '订单支付提醒', '客户"郑十"的订单已支付', '/order/list', 1),
(2, 'system', '系统通知', '本月销售目标完成率75%，请继续努力', '/dashboard', 0),
(3, 'system', '团队通知', '销售一组本月业绩排名第一，继续加油！', '/team-leaderboard', 1),
(6, 'task', '客户跟进提醒', '客户"孙七"报价已发送3天，请跟进', '/customer/detail/5', 0),
(7, 'task', '客户跟进提醒', '客户"周八"正在谈判中，请尽快推进', '/customer/detail/6', 0);

-- =====================================================
-- 完成
-- =====================================================
SELECT '测试数据创建完成！' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS customer_count FROM customers;
SELECT COUNT(*) AS order_count FROM orders;
SELECT COUNT(*) AS follow_count FROM customer_follow_records;
SELECT COUNT(*) AS ai_chat_count FROM ai_chat_records;
SELECT COUNT(*) AS ai_tag_count FROM ai_customer_tags;
SELECT COUNT(*) AS commission_count FROM commission_calculations;
