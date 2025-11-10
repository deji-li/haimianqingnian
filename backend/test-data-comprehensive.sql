-- =====================================================
-- 综合测试数据 - 包含各种身份、订单、客户等
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
DELETE FROM users WHERE id > 1; -- 保留admin
DELETE FROM commission_schemes WHERE id > 0;
DELETE FROM department WHERE id > 0;
DELETE FROM campus WHERE id > 0;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. 部门和校区数据
-- =====================================================
INSERT INTO department (id, department_name, parent_id, leader_id, sort, status, create_time, update_time) VALUES
(1, '销售部', NULL, 1, 1, 1, NOW(), NOW()),
(2, '市场部', NULL, 1, 2, 1, NOW(), NOW()),
(3, '教学部', NULL, 1, 3, 1, NOW(), NOW()),
(4, '客服部', NULL, 1, 4, 1, NOW(), NOW()),
(5, '销售一组', 1, 2, 1, 1, NOW(), NOW()),
(6, '销售二组', 1, 3, 2, 1, NOW(), NOW());

INSERT INTO campus (id, campus_name, address, phone, principal_id, status, create_time, update_time) VALUES
(1, '海淀校区', '北京市海淀区中关村大街1号', '010-12345678', 1, 1, NOW(), NOW()),
(2, '朝阳校区', '北京市朝阳区建国路88号', '010-23456789', 1, 1, NOW(), NOW()),
(3, '西城校区', '北京市西城区金融街19号', '010-34567890', 1, 1, NOW(), NOW()),
(4, '东城校区', '北京市东城区王府井大街1号', '010-45678901', 1, 1, NOW(), NOW());

-- =====================================================
-- 2. 用户数据（各种角色）
-- =====================================================
-- 密码都是: 123456 (bcrypt hash)
INSERT INTO users (id, username, password, real_name, phone, email, role_id, department_id, campus_id, status, create_time, update_time) VALUES
-- 销售总监
(2, 'sales_director', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '张总监', '13800000001', 'director@test.com', 2, 1, 1, 1, NOW(), NOW()),
-- 销售经理
(3, 'sales_manager1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '李经理', '13800000002', 'manager1@test.com', 2, 5, 1, 1, NOW(), NOW()),
-- 销售顾问
(4, 'sales1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '王销售', '13800000003', 'sales1@test.com', 3, 5, 1, 1, NOW(), NOW()),
(5, 'sales2', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '赵销售', '13800000004', 'sales2@test.com', 3, 5, 1, 1, NOW(), NOW()),
(6, 'sales3', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '刘销售', '13800000005', 'sales3@test.com', 3, 6, 2, 1, NOW(), NOW()),
(7, 'sales4', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '陈销售', '13800000006', 'sales4@test.com', 3, 6, 2, 1, NOW(), NOW()),
-- 市场专员
(8, 'marketing1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '周市场', '13800000007', 'marketing1@test.com', 3, 2, 1, 1, NOW(), NOW()),
-- 客服
(9, 'service1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '吴客服', '13800000008', 'service1@test.com', 3, 4, 1, 1, NOW(), NOW()),
-- 教师
(10, 'teacher1', '$2b$10$rQ4Z5vxGXJ7y5VN9pQ5zDO7KqLhF3cqZRQQJqYwJ8fNqJ5Z8J8J8J', '郑老师', '13800000009', 'teacher1@test.com', 3, 3, 1, 1, NOW(), NOW());

-- 用户校区关联（多对多）
INSERT INTO user_campus (user_id, campus_id, create_time, update_time) VALUES
(2, 1, NOW(), NOW()), (2, 2, NOW(), NOW()), (2, 3, NOW(), NOW()), (2, 4, NOW(), NOW()),
(3, 1, NOW(), NOW()),
(4, 1, NOW(), NOW()),
(5, 1, NOW(), NOW()),
(6, 2, NOW(), NOW()),
(7, 2, NOW(), NOW()),
(8, 1, NOW(), NOW()), (8, 2, NOW(), NOW());

-- =====================================================
-- 3. 客户数据（各种阶段和状态）
-- =====================================================
INSERT INTO customers (id, name, phone, wechat_id, wechat_nickname, gender, age, source, stage, level,
    tags, intention_course, budget, region, address, contact_time, remark,
    sales_id, department_id, campus_id, status, create_time, update_time) VALUES
-- 线索阶段
(1, '张三', '13900000001', 'wx_zhangsan', '阳光少年', 'male', 12, '线上广告', 'lead', 'A',
    '数学,英语', '小学数学', '10000-15000', '海淀区', '北京市海淀区xx小区', '晚上7-9点', '家长对数学培训很感兴趣',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(2, '李四', '13900000002', 'wx_lisi', '快乐学习', 'female', 15, '老客户推荐', 'lead', 'B',
    '物理,化学', '初中物理', '8000-12000', '朝阳区', '北京市朝阳区yy小区', '周末全天', '朋友推荐过来咨询',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
-- 意向阶段
(3, '王五', '13900000003', 'wx_wangwu', '好好学习', 'male', 10, '线下活动', 'opportunity', 'A',
    '英语,数学', '小学英语', '12000-18000', '西城区', '北京市西城区zz小区', '下午4-6点', '已经试听一次，反馈很好',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(4, '赵六', '13900000004', 'wx_zhaoliu', '天天向上', 'male', 16, '自然到店', 'opportunity', 'A',
    '数学,物理', '高中数学', '15000-20000', '海淀区', '北京市海淀区aa小区', '周末', '准备高考，需要冲刺辅导',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
-- 报价阶段
(5, '孙七', '13900000005', 'wx_sunqi', '聪明宝宝', 'female', 8, '朋友圈广告', 'quotation', 'B',
    '语文,数学', '小学语文', '8000-10000', '朝阳区', '北京市朝阳区bb小区', '晚上', '已发送报价单，等待确认',
    6, 6, 2, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
-- 谈判阶段
(6, '周八', '13900000006', 'wx_zhouba', '未来之星', 'male', 14, '线上广告', 'negotiation', 'A',
    '英语,数学,物理', '初中全科', '20000-25000', '东城区', '北京市东城区cc小区', '随时', '正在商谈优惠方案',
    7, 6, 2, 1, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
-- 成交阶段
(7, '吴九', '13900000007', 'wx_wujiu', '学霸养成', 'female', 13, '老客户推荐', 'deal', 'A',
    '数学,英语', '初中数学', '15000-18000', '海淀区', '北京市海淀区dd小区', '周末', '已报名初中数学精品班',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(8, '郑十', '13900000008', 'wx_zhengshi', '优等生', 'male', 17, '自然到店', 'deal', 'A',
    '数学,物理,化学', '高中全科', '25000-30000', '西城区', '北京市西城区ee小区', '晚上', '已报名高三冲刺班',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
-- 已流失
(9, '冯十一', '13900000009', 'wx_fengshiyi', '不想学习', 'male', 11, '线下活动', 'lost', 'C',
    '数学', '小学数学', '5000-8000', '朝阳区', '北京市朝阳区ff小区', '不确定', '价格太贵，选择了其他机构',
    6, 6, 2, 0, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
-- 更多测试客户
(10, '陈十二', '13900000010', 'wx_chenshier', '努力学', 'female', 9, '线上广告', 'lead', 'B',
    '英语', '小学英语', '8000-10000', '海淀区', '北京市海淀区gg小区', '周末', '刚咨询，待跟进',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(11, '卫十三', '13900000011', 'wx_weishisan', '好学生', 'male', 15, '老客户推荐', 'opportunity', 'A',
    '数学,物理,化学', '初中理科', '18000-22000', '朝阳区', '北京市朝阳区hh小区', '晚上', '已试听两次，意向强烈',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(12, '蒋十四', '13900000012', 'wx_jiangshisi', '学习王', 'female', 16, '自然到店', 'quotation', 'A',
    '英语,数学', '高中英语', '12000-15000', '西城区', '北京市西城区ii小区', '随时', '已发报价，准备签约',
    7, 6, 2, 1, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(13, '韩十五', '13900000013', 'wx_hanshiwu', '小天才', 'male', 7, '朋友圈广告', 'lead', 'C',
    '思维', '幼小衔接', '5000-8000', '东城区', '北京市东城区jj小区', '周末', '家长还在考虑',
    6, 6, 2, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(14, '杨十六', '13900000014', 'wx_yangshiliu', '拼搏者', 'female', 17, '线上广告', 'deal', 'A',
    '数学,物理,化学,英语', '高三冲刺', '30000-35000', '海淀区', '北京市海淀区kk小区', '全天', '已报名高考全科冲刺',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
(15, '朱十七', '13900000015', 'wx_zhushiqi', '小学霸', 'male', 13, '线下活动', 'opportunity', 'B',
    '数学,英语', '初中数学', '10000-12000', '朝阳区', '北京市朝阳区ll小区', '晚上7-9点', '试听后觉得不错',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(16, '秦十八', '13900000016', 'wx_qinshiba', '优秀生', 'female', 14, '老客户推荐', 'negotiation', 'A',
    '英语,数学', '初中英语', '14000-16000', '西城区', '北京市西城区mm小区', '周末', '正在谈优惠',
    7, 6, 2, 1, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(17, '许十九', '13900000017', 'wx_xushijiu', '棒棒哒', 'male', 11, '自然到店', 'lead', 'B',
    '数学', '小学数学', '7000-9000', '海淀区', '北京市海淀区nn小区', '下午', '家长第一次咨询',
    4, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(18, '何二十', '13900000018', 'wx_heershi', '学习小达人', 'female', 12, '线上广告', 'deal', 'A',
    '数学,英语', '小学全科', '12000-14000', '朝阳区', '北京市朝阳区oo小区', '晚上', '已报名小学全科班',
    5, 5, 1, 1, DATE_SUB(NOW(), INTERVAL 35 DAY), NOW());

-- =====================================================
-- 4. 跟进记录
-- =====================================================
INSERT INTO customer_follow_records (customer_id, user_id, follow_type, content, next_follow_time, create_time, update_time) VALUES
-- 客户1的跟进
(1, 4, 'phone', '电话沟通，家长表示对数学培训很感兴趣，约定明天上门详谈', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(1, 4, 'wechat', '微信发送了课程介绍资料', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
-- 客户3的跟进
(3, 4, 'visit', '上门拜访，详细介绍了英语课程，家长很满意', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, 4, 'phone', '电话回访试听效果，家长反馈孩子很喜欢', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(3, 4, 'wechat', '发送了优惠活动信息', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
-- 客户4的跟进
(4, 5, 'phone', '电话沟通高考冲刺需求，家长很着急', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, 5, 'visit', '带孩子来校区参观，介绍师资力量', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(4, 5, 'wechat', '发送了往届学员高考成绩单', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
-- 客户6的跟进
(6, 7, 'phone', '电话商谈价格，家长觉得有点贵', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(6, 7, 'wechat', '申请了特殊优惠方案，等待审批', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(6, 7, 'phone', '告知优惠已批准，家长表示会考虑', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
-- 客户7的跟进
(7, 4, 'visit', '签约成功！报名初中数学精品班', NULL, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(7, 4, 'phone', '开课后回访，家长反馈孩子很适应', NULL, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
-- 客户11的跟进
(11, 5, 'phone', '电话邀约试听', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, 5, 'visit', '第一次试听，孩子表现不错', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(11, 5, 'visit', '第二次试听，家长很满意', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- =====================================================
-- 5. 订单数据（各种状态和金额）
-- =====================================================
INSERT INTO orders (id, order_no, customer_id, sales_id, course_name, course_category,
    class_hours, original_amount, discount_amount, payment_amount, payment_method, payment_status,
    order_tag, start_date, end_date, campus_id, remark, status,
    commission_scheme_id, commission_amount, commission_calculated_at,
    create_time, update_time) VALUES
-- 已支付订单
(1, 'ORD202501001', 7, 4, '初中数学精品班', '学科辅导', 60, 18000.00, 2000.00, 16000.00, 'wechat', 'paid',
    '续费', '2025-02-01', '2025-07-31', 1, '续费老客户，给予优惠', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(2, 'ORD202501002', 8, 5, '高三全科冲刺班', '高考冲刺', 100, 30000.00, 2000.00, 28000.00, 'alipay', 'paid',
    '新签', '2025-01-15', '2025-06-15', 1, '高考冲刺，全科辅导', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(3, 'ORD202501003', 14, 4, '高考全科冲刺套餐', '高考冲刺', 120, 35000.00, 3000.00, 32000.00, 'bank', 'paid',
    '新签', '2024-12-01', '2025-06-10', 1, '高三学生，冲刺985', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
(4, 'ORD202501004', 18, 5, '小学全科班', '学科辅导', 80, 14000.00, 1000.00, 13000.00, 'wechat', 'paid',
    '新签', '2024-12-10', '2025-06-30', 1, '小学全科辅导', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
-- 待支付订单
(5, 'ORD202501005', 6, 7, '初中全科培优班', '学科辅导', 90, 24000.00, 2000.00, 22000.00, 'wechat', 'pending',
    '新签', '2025-02-15', '2025-08-15', 2, '已签约，等待支付', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(6, 'ORD202501006', 12, 7, '高中英语强化班', '学科辅导', 50, 15000.00, 1500.00, 13500.00, 'alipay', 'pending',
    '新签', '2025-02-20', '2025-07-20', 2, '等待家长付款', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
-- 已取消订单
(7, 'ORD202501007', 9, 6, '小学数学基础班', '学科辅导', 40, 8000.00, 500.00, 7500.00, 'wechat', 'cancelled',
    '新签', '2024-11-01', '2025-01-31', 2, '客户觉得太贵，选择了其他机构', 0,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
-- 部分支付订单
(8, 'ORD202501008', 11, 5, '初中理科培优班', '学科辅导', 80, 20000.00, 1500.00, 18500.00, 'wechat', 'partial',
    '新签', '2025-02-10', '2025-08-10', 1, '已支付定金5000元', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
-- 更多不同金额的订单
(9, 'ORD202501009', 7, 4, '寒假数学集训营', '短期集训', 20, 5000.00, 300.00, 4700.00, 'wechat', 'paid',
    '续费', '2025-01-20', '2025-02-10', 1, '寒假集训', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(10, 'ORD202501010', 8, 5, '物理竞赛班', '竞赛培训', 40, 12000.00, 800.00, 11200.00, 'alipay', 'paid',
    '续费', '2025-01-10', '2025-05-10', 1, '物理竞赛辅导', 1,
    NULL, NULL, NULL,
    DATE_SUB(NOW(), INTERVAL 28 DAY), NOW());

-- =====================================================
-- 6. 提成方案
-- =====================================================
INSERT INTO commission_schemes (id, name, type, rules, conditions, priority, status, created_by, create_time, update_time) VALUES
(1, '新签单提成-标准方案', 'percentage', '{"percentage": 5}',
    '{"orderTags": ["新签"], "minOrderAmount": 0}', 100, 1, 1, NOW(), NOW()),
(2, '续费单提成-标准方案', 'percentage', '{"percentage": 3}',
    '{"orderTags": ["续费"], "minOrderAmount": 0}', 90, 1, 1, NOW(), NOW()),
(3, '高额订单提成-阶梯方案', 'tiered',
    '{"tiers": [{"minAmount": 0, "maxAmount": 10000, "percentage": 4}, {"minAmount": 10000, "maxAmount": 20000, "percentage": 5}, {"minAmount": 20000, "maxAmount": null, "percentage": 6}]}',
    '{"minOrderAmount": 0}', 80, 1, 1, NOW(), NOW()),
(4, '高考冲刺班-固定提成', 'fixed', '{"amount": 2000}',
    '{"courses": ["高三全科冲刺班", "高考全科冲刺套餐"]}', 110, 1, 1, NOW(), NOW());

-- =====================================================
-- 7. 提成计算记录
-- =====================================================
INSERT INTO commission_calculations (order_id, scheme_id, scheme_name, order_amount, commission_amount,
    calculation_rule, sales_id, status, settle_time, remark, created_at, updated_at) VALUES
-- 已结算
(1, 2, '续费单提成-标准方案', 16000.00, 480.00, '{"percentage": 3}', 4, 'paid',
    DATE_SUB(NOW(), INTERVAL 10 DAY), '已结算提成', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(9, 2, '续费单提成-标准方案', 4700.00, 141.00, '{"percentage": 3}', 4, 'paid',
    DATE_SUB(NOW(), INTERVAL 5 DAY), '已结算提成', DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
-- 待结算
(2, 4, '高考冲刺班-固定提成', 28000.00, 2000.00, '{"amount": 2000}', 5, 'pending',
    NULL, '等待财务结算', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(3, 4, '高考冲刺班-固定提成', 32000.00, 2000.00, '{"amount": 2000}', 4, 'pending',
    NULL, '等待财务结算', DATE_SUB(NOW(), INTERVAL 40 DAY), NOW()),
(4, 1, '新签单提成-标准方案', 13000.00, 650.00, '{"percentage": 5}', 5, 'pending',
    NULL, '等待财务结算', DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),
(10, 2, '续费单提成-标准方案', 11200.00, 336.00, '{"percentage": 3}', 5, 'pending',
    NULL, '等待财务结算', DATE_SUB(NOW(), INTERVAL 28 DAY), NOW());

-- =====================================================
-- 8. AI聊天分析记录
-- =====================================================
INSERT INTO ai_chat_records (customer_id, wechat_id, chat_date, images, ocr_text,
    ai_analysis_result, quality_level, risk_level, intention_score, estimated_value,
    analysis_status, error_message, create_time, update_time) VALUES
(1, 'wx_zhangsan', '2025-01-08',
    '["http://example.com/chat1.jpg"]',
    '家长：孩子数学成绩一直不理想\n顾问：我们有专业的数学老师\n家长：费用大概多少\n顾问：根据课时不同，8000-15000不等',
    '{"communicationSummary": "家长咨询数学辅导，关注费用和师资", "customerProfile": {"parentRole": "妈妈", "studentGrade": "六年级", "familyEconomicLevel": "中等", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["数学成绩提升", "专业师资", "合理价格"], "intentionLevel": "中等", "riskFactors": ["价格敏感"], "nextSteps": ["发送师资介绍", "提供试听课程", "制定个性化方案"]}',
    'A', '低', 75, 12000.00, '已完成', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(3, 'wx_wangwu', '2025-01-01',
    '["http://example.com/chat2.jpg"]',
    '家长：试听课孩子很喜欢\n顾问：我们的外教很专业\n家长：什么时候能开始正式上课\n顾问：随时可以开班',
    '{"communicationSummary": "试听效果好，家长意向强烈", "customerProfile": {"parentRole": "爸爸", "studentGrade": "四年级", "familyEconomicLevel": "良好", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["优质外教", "尽快开班", "效果保障"], "intentionLevel": "高", "riskFactors": [], "nextSteps": ["尽快安排签约", "确定开班时间", "安排课表"]}',
    'A', '无风险', 90, 15000.00, '已完成', NULL, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(4, 'wx_zhaoliu', '2024-12-27',
    '["http://example.com/chat3.jpg"]',
    '家长：高考还有半年，很焦虑\n顾问：我们有高考冲刺班\n家长：能保证提高多少分\n顾问：往年平均提高50-80分',
    '{"communicationSummary": "高三家长，高考焦虑，需要冲刺辅导", "customerProfile": {"parentRole": "妈妈", "studentGrade": "高三", "familyEconomicLevel": "良好", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["快速提分", "高考冲刺", "效果保障"], "intentionLevel": "高", "riskFactors": ["效果预期高"], "nextSteps": ["展示成功案例", "安排测评", "定制冲刺方案"]}',
    'A', '中', 85, 25000.00, '已完成', NULL, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(11, 'wx_weishisan', '2025-01-04',
    '["http://example.com/chat4.jpg"]',
    '家长：朋友推荐过来的\n顾问：欢迎！您孩子几年级\n家长：初三，理科有点弱\n顾问：我们有理科培优班',
    '{"communicationSummary": "朋友推荐，初三学生，理科需要提升", "customerProfile": {"parentRole": "妈妈", "studentGrade": "初三", "familyEconomicLevel": "中上", "decisionMakerRole": "主要决策者"}, "customerNeeds": ["理科成绩提升", "中考备考", "口碑好的机构"], "intentionLevel": "中高", "riskFactors": [], "nextSteps": ["安排试听", "介绍师资", "提供优惠方案"]}',
    'A', '低', 80, 18000.00, '已完成', NULL, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW());

-- =====================================================
-- 9. AI客户标签
-- =====================================================
INSERT INTO ai_customer_tags (customer_id, tag_name, tag_category, confidence, source, create_time, update_time) VALUES
-- 客户1的标签
(1, '价格敏感', 'risk', 0.85, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(1, '关注师资', 'need', 0.90, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(1, '数学辅导需求', 'need', 0.95, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(1, '中等收入家庭', 'profile', 0.80, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
-- 客户3的标签
(3, '高意向客户', 'quality', 0.95, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, '试听效果好', 'behavior', 0.90, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, '英语培训需求', 'need', 0.95, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, '决策快', 'behavior', 0.85, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(3, '经济条件好', 'profile', 0.88, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
-- 客户4的标签
(4, '高考冲刺需求', 'need', 0.98, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, '焦虑型家长', 'profile', 0.92, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, '效果导向', 'behavior', 0.90, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, '预算充足', 'profile', 0.85, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, '高意向', 'quality', 0.95, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
-- 客户11的标签
(11, '朋友推荐', 'source', 0.95, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, '理科培优需求', 'need', 0.90, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, '中考备考', 'need', 0.92, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, '信任度高', 'behavior', 0.88, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, '经济条件中上', 'profile', 0.82, 'ai_analysis', DATE_SUB(NOW(), INTERVAL 7 DAY), NOW());

-- =====================================================
-- 10. 通知消息
-- =====================================================
INSERT INTO notification (user_id, type, title, content, link, is_read, create_time, update_time) VALUES
(4, 'task', '客户跟进提醒', '客户"张三"需要在今天跟进，请及时联系', '/customer/detail/1', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), NOW()),
(4, 'order', '新订单通知', '客户"吴九"的订单已支付成功', '/order/list', 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(5, 'task', '客户跟进提醒', '客户"赵六"明天需要跟进', '/customer/detail/4', 0, DATE_SUB(NOW(), INTERVAL 5 HOUR), NOW()),
(5, 'order', '订单支付提醒', '客户"郑十"的订单已支付', '/order/list', 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(2, 'system', '系统通知', '本月销售目标完成率75%，请继续努力', '/dashboard', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, 'system', '团队通知', '销售一组本月业绩排名第一，继续加油！', '/team-leaderboard', 1, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(6, 'task', '客户跟进提醒', '客户"孙七"报价已发送3天，请跟进', '/customer/detail/5', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW()),
(7, 'task', '客户跟进提醒', '客户"周八"正在谈判中，请尽快推进', '/customer/detail/6', 0, DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW());

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
