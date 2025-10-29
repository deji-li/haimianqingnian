-- =====================================================
-- 教育培训CRM系统 - 完整测试数据
-- =====================================================
-- 包含：用户、角色、权限、客户、订单等完整业务数据
-- =====================================================

-- 设置正确的字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- =====================================================
-- 1. 插入部门数据
-- =====================================================
INSERT INTO departments (id, department_name, description, status, create_time, update_time) VALUES
(1, '销售部', '负责客户开发和订单签约', 1, NOW(), NOW()),
(2, '教学部', '负责课程授课和教学管理', 1, NOW(), NOW()),
(3, '财务部', '负责财务管理和报表', 1, NOW(), NOW()),
(4, '市场部', '负责市场推广和品牌建设', 1, NOW(), NOW());

-- =====================================================
-- 2. 插入校区数据
-- =====================================================
INSERT INTO campuses (id, campus_name, address, phone, contact_person, status, create_time, update_time) VALUES
(1, '朝阳校区', '北京市朝阳区建国路88号', '010-88888888', '张校长', 1, NOW(), NOW()),
(2, '海淀校区', '北京市海淀区中关村大街1号', '010-66666666', '李校长', 1, NOW(), NOW()),
(3, '西城校区', '北京市西城区金融街35号', '010-77777777', '王校长', 1, NOW(), NOW());

-- =====================================================
-- 3. 插入用户数据
-- =====================================================
-- 密码统一为: 123456
INSERT INTO users (id, username, password, real_name, phone, email, role_id, department_id, campus_id, status, create_time, update_time) VALUES
(1, 'admin', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '系统管理员', '13800138000', 'admin@example.com', 1, NULL, NULL, 1, NOW(), NOW()),
(2, 'manager1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '李明', '13800138001', 'manager1@example.com', 2, 1, 1, 1, NOW(), NOW()),
(3, 'sales1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '张伟', '13800138002', 'sales1@example.com', 3, 1, 1, 1, NOW(), NOW()),
(4, 'sales2', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '王芳', '13800138003', 'sales2@example.com', 3, 1, 1, 1, NOW(), NOW()),
(5, 'sales3', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '刘洋', '13800138004', 'sales3@example.com', 3, 1, 2, 1, NOW(), NOW()),
(6, 'finance1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '赵敏', '13800138005', 'finance1@example.com', 4, 3, NULL, 1, NOW(), NOW()),
(7, 'teacher1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '陈老师', '13800138006', 'teacher1@example.com', 5, 2, 1, 1, NOW(), NOW());

-- =====================================================
-- 4. 插入客户数据
-- =====================================================
INSERT INTO customers (id, name, gender, phone, email, wechat, source, intention_level, intention_course, sales_id, campus_id, status, tags, remark, create_time, update_time) VALUES
(1, '李晓明', 'male', '13900001111', 'lixm@example.com', 'lixm_wx', '线上咨询', 'high', 'Java全栈开发', 3, 1, 'potential', 'Java,全栈', '非常有意向，预算充足', NOW(), NOW()),
(2, '王丽丽', 'female', '13900002222', 'wangll@example.com', 'wangll_wx', '朋友推荐', 'high', 'Python数据分析', 3, 1, 'following', 'Python,数据分析', '已约定下周参观校区', NOW(), NOW()),
(3, '张强', 'male', '13900003333', 'zhangq@example.com', 'zhangq_wx', '线下地推', 'medium', '前端开发', 4, 1, 'potential', '前端,Vue', '在职想转行，需要周末班', NOW(), NOW()),
(4, '刘美美', 'female', '13900004444', 'liumm@example.com', 'liumm_wx', '网络广告', 'high', 'UI设计', 4, 2, 'customer', 'UI,设计', '已签约学员', NOW(), NOW()),
(5, '赵刚', 'male', '13900005555', 'zhaog@example.com', 'zhaog_wx', '线上咨询', 'low', 'Java基础', 5, 2, 'potential', 'Java', '预算有限，考虑中', NOW(), NOW()),
(6, '孙婷婷', 'female', '13900006666', 'suntt@example.com', 'suntt_wx', '老学员推荐', 'high', 'Python全栈', 5, 2, 'following', 'Python,推荐', '老学员强烈推荐', NOW(), NOW()),
(7, '周杰', 'male', '13900007777', 'zhouj@example.com', 'zhouj_wx', '线下活动', 'medium', '大数据开发', 3, 1, 'potential', '大数据', '应届毕业生，待业中', NOW(), NOW()),
(8, '吴娜', 'female', '13900008888', 'wuna@example.com', 'wuna_wx', '线上咨询', 'low', '前端基础', 4, 1, 'invalid', '前端', '联系不上，暂时无效', NOW(), NOW()),
(9, '郑浩', 'male', '13900009999', 'zhengh@example.com', 'zhengh_wx', '合作企业', 'high', 'Java架构师', 3, 1, 'customer', 'Java,架构', '企业定制培训学员', NOW(), NOW()),
(10, '冯琳', 'female', '13900010000', 'fengl@example.com', 'fengl_wx', '线上咨询', 'medium', 'UI进阶', 4, 2, 'following', 'UI,进阶', '有设计基础，想提升', NOW(), NOW());

-- =====================================================
-- 5. 插入客户跟进记录
-- =====================================================
INSERT INTO customer_follow_records (customer_id, user_id, follow_type, content, next_follow_time, create_time, update_time) VALUES
(1, 3, 'phone', '电话沟通，客户对Java课程很感兴趣，详细介绍了课程体系和就业情况', '2025-11-01 10:00:00', NOW(), NOW()),
(1, 3, 'wechat', '微信发送了课程资料和学员作品案例，客户表示需要考虑几天', '2025-11-03 14:00:00', NOW() - INTERVAL 2 DAY, NOW()),
(2, 3, 'visit', '客户到校参观，试听了一节Python课程，反馈很好，约定下周签约', '2025-11-02 15:00:00', NOW(), NOW()),
(3, 4, 'phone', '初次电话沟通，了解了客户基本情况和学习需求', '2025-11-01 16:00:00', NOW() - INTERVAL 3 DAY, NOW()),
(3, 4, 'wechat', '发送了前端课程介绍和学习路线图', '2025-11-02 10:00:00', NOW() - INTERVAL 1 DAY, NOW()),
(4, 4, 'visit', '客户签约成功，缴纳学费12800元', NULL, NOW() - INTERVAL 5 DAY, NOW()),
(6, 5, 'phone', '老学员推荐来的，已建立初步信任，详细介绍了Python全栈课程', '2025-11-01 09:00:00', NOW(), NOW()),
(7, 3, 'wechat', '添加微信好友，发送了大数据课程资料', '2025-11-02 14:00:00', NOW() - INTERVAL 1 DAY, NOW()),
(9, 3, 'visit', '企业HR带队参观，签订企业培训协议', NULL, NOW() - INTERVAL 7 DAY, NOW()),
(10, 4, 'phone', '电话沟通UI进阶课程内容，客户对项目实战很感兴趣', '2025-11-03 10:00:00', NOW(), NOW());

-- =====================================================
-- 6. 插入订单数据
-- =====================================================
INSERT INTO orders (id, order_no, customer_id, course_name, course_category, amount, paid_amount, payment_method, sales_id, status, contract_no, start_date, end_date, remark, create_time, update_time) VALUES
(1, 'ORD202510290001', 4, 'UI设计全栈班', 'UI设计', 12800.00, 12800.00, 'alipay', 4, 'completed', 'CT2025100001', '2025-11-01', '2026-05-01', '一次性付清，赠送设计软件', NOW() - INTERVAL 5 DAY, NOW()),
(2, 'ORD202510290002', 9, 'Java架构师企业定制', 'Java开发', 98000.00, 98000.00, 'bank_transfer', 3, 'completed', 'CT2025100002', '2025-11-05', '2026-02-05', '企业团体培训，10人', NOW() - INTERVAL 7 DAY, NOW()),
(3, 'ORD202510290003', 2, 'Python数据分析', 'Python开发', 15800.00, 5000.00, 'wechat', 3, 'pending', 'CT2025100003', '2025-11-10', '2026-05-10', '已付定金5000元，余款分期', NOW() - INTERVAL 2 DAY, NOW()),
(4, 'ORD202510290004', 1, 'Java全栈开发', 'Java开发', 16800.00, 0.00, '', 3, 'pending', '', NULL, NULL, '待签约', NOW(), NOW());

-- =====================================================
-- 7. 插入销售目标数据
-- =====================================================
INSERT INTO sales_targets (user_id, target_year, target_month, target_type, target_value, actual_value, unit, status, create_time, update_time) VALUES
(2, 2025, 10, 'revenue', 500000.00, 110800.00, 'yuan', 'in_progress', NOW(), NOW()),
(2, 2025, 11, 'revenue', 600000.00, 16800.00, 'yuan', 'in_progress', NOW(), NOW()),
(3, 2025, 10, 'revenue', 150000.00, 110800.00, 'yuan', 'in_progress', NOW(), NOW()),
(3, 2025, 11, 'revenue', 150000.00, 16800.00, 'yuan', 'in_progress', NOW(), NOW()),
(3, 2025, 10, 'customer_count', 10, 3, 'count', 'in_progress', NOW(), NOW()),
(3, 2025, 11, 'customer_count', 10, 1, 'count', 'in_progress', NOW(), NOW()),
(4, 2025, 10, 'revenue', 150000.00, 12800.00, 'yuan', 'in_progress', NOW(), NOW()),
(4, 2025, 11, 'revenue', 150000.00, 0.00, 'yuan', 'in_progress', NOW(), NOW()),
(5, 2025, 10, 'revenue', 120000.00, 0.00, 'yuan', 'in_progress', NOW(), NOW()),
(5, 2025, 11, 'revenue', 120000.00, 0.00, 'yuan', 'in_progress', NOW(), NOW());

-- =====================================================
-- 8. 插入提成方案数据
-- =====================================================
INSERT INTO commission_schemes (scheme_name, scheme_type, base_rate, tier_config, is_active, remark, create_time, update_time) VALUES
('标准销售提成方案', 'percentage', 8.00, '[{"min":0,"max":100000,"rate":8},{"min":100000,"max":200000,"rate":10},{"min":200000,"rate":12}]', 1, '阶梯式提成，业绩越高比例越高', NOW(), NOW()),
('新人保护期方案', 'percentage', 10.00, '[{"min":0,"rate":10}]', 1, '新入职员工前3个月统一10%提成', NOW(), NOW());

-- =====================================================
-- 9. 插入提成计算记录
-- =====================================================
INSERT INTO commission_calculations (user_id, order_id, scheme_id, order_amount, commission_rate, commission_amount, status, payment_date, create_time, update_time) VALUES
(4, 1, 1, 12800.00, 8.00, 1024.00, 'paid', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY, NOW()),
(3, 2, 1, 98000.00, 10.00, 9800.00, 'paid', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY, NOW()),
(3, 3, 1, 5000.00, 8.00, 400.00, 'pending', NULL, NOW() - INTERVAL 2 DAY, NOW());

-- =====================================================
-- 10. 插入数据字典
-- =====================================================
INSERT INTO dictionaries (dict_type, dict_code, dict_label, dict_value, sort_order, status, remark, create_time, update_time) VALUES
-- 客户来源
('customer_source', 'online', '线上咨询', 'online', 1, 1, '通过官网、APP等线上渠道咨询', NOW(), NOW()),
('customer_source', 'offline', '线下地推', 'offline', 2, 1, '线下活动、地推获客', NOW(), NOW()),
('customer_source', 'referral', '朋友推荐', 'referral', 3, 1, '老客户或朋友推荐', NOW(), NOW()),
('customer_source', 'ad', '网络广告', 'ad', 4, 1, '搜索引擎、社交媒体广告', NOW(), NOW()),
('customer_source', 'partner', '合作企业', 'partner', 5, 1, '企业合作渠道', NOW(), NOW()),

-- 意向等级
('intention_level', 'high', '高', 'high', 1, 1, '意向强烈，近期可能签约', NOW(), NOW()),
('intention_level', 'medium', '中', 'medium', 2, 1, '有一定意向，需要跟进', NOW(), NOW()),
('intention_level', 'low', '低', 'low', 3, 1, '意向较弱，长期培养', NOW(), NOW()),

-- 课程类别
('course_category', 'java', 'Java开发', 'java', 1, 1, 'Java相关课程', NOW(), NOW()),
('course_category', 'python', 'Python开发', 'python', 2, 1, 'Python相关课程', NOW(), NOW()),
('course_category', 'frontend', '前端开发', 'frontend', 3, 1, '前端相关课程', NOW(), NOW()),
('course_category', 'ui', 'UI设计', 'ui', 4, 1, 'UI/UX设计课程', NOW(), NOW()),
('course_category', 'bigdata', '大数据', 'bigdata', 5, 1, '大数据相关课程', NOW(), NOW()),

-- 支付方式
('payment_method', 'alipay', '支付宝', 'alipay', 1, 1, NULL, NOW(), NOW()),
('payment_method', 'wechat', '微信支付', 'wechat', 2, 1, NULL, NOW(), NOW()),
('payment_method', 'bank_transfer', '银行转账', 'bank_transfer', 3, 1, NULL, NOW(), NOW()),
('payment_method', 'cash', '现金', 'cash', 4, 1, NULL, NOW(), NOW()),
('payment_method', 'installment', '分期付款', 'installment', 5, 1, NULL, NOW(), NOW());

-- =====================================================
-- 完成标记
-- =====================================================
SELECT '✅ 测试数据初始化完成！' as message;
SELECT '-----------------------------------' as separator;
SELECT '用户账号信息（密码统一为: 123456）' as info;
SELECT '-----------------------------------' as separator;
SELECT username as 账号, real_name as 姓名,
  CASE role_id
    WHEN 1 THEN '系统管理员'
    WHEN 2 THEN '销售主管'
    WHEN 3 THEN '销售顾问'
    WHEN 4 THEN '财务人员'
    WHEN 5 THEN '授课老师'
  END as 角色
FROM users;
SELECT '-----------------------------------' as separator;
SELECT CONCAT('客户数量: ', COUNT(*)) as 统计 FROM customers;
SELECT CONCAT('订单数量: ', COUNT(*)) as 统计 FROM orders;
SELECT CONCAT('跟进记录: ', COUNT(*)) as 统计 FROM customer_follow_records;
