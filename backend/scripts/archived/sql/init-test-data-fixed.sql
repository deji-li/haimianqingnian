-- =====================================================
-- 教育培训CRM系统 - 修复版测试数据
-- 根据实际Entity字段创建
-- =====================================================

-- 设置正确的字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- =====================================================
-- 1. 插入部门数据
-- =====================================================
INSERT INTO department (id, department_name, description, status, create_time, update_time) VALUES
(1, '销售部', '负责客户开发和订单签约', 1, NOW(), NOW()),
(2, '教学部', '负责课程授课和教学管理', 1, NOW(), NOW()),
(3, '财务部', '负责财务管理和报表', 1, NOW(), NOW()),
(4, '市场部', '负责市场推广和品牌建设', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

-- =====================================================
-- 2. 插入校区数据
-- =====================================================
INSERT INTO campus (id, campus_name, campus_code, address, contact_person, contact_phone, status, create_time, update_time) VALUES
(1, '朝阳校区', 'CY001', '北京市朝阳区建国路88号', '张校长', '010-88888888', 1, NOW(), NOW()),
(2, '海淀校区', 'HD001', '北京市海淀区中关村大街1号', '李校长', '010-66666666', 1, NOW(), NOW()),
(3, '西城校区', 'XC001', '北京市西城区金融街35号', '王校长', '010-77777777', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE campus_name=VALUES(campus_name);

-- =====================================================
-- 3. 插入用户数据
-- =====================================================
-- 密码统一为: 123456
INSERT INTO users (id, username, password, real_name, phone, email, role_id, department_id, campus_id, status, create_time, update_time) VALUES
(2, 'manager1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '李明', '13800138001', 'manager1@example.com', 2, 1, 1, 1, NOW(), NOW()),
(3, 'sales1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '张伟', '13800138002', 'sales1@example.com', 3, 1, 1, 1, NOW(), NOW()),
(4, 'sales2', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '王芳', '13800138003', 'sales2@example.com', 3, 1, 1, 1, NOW(), NOW()),
(5, 'sales3', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '刘洋', '13800138004', 'sales3@example.com', 3, 1, 2, 1, NOW(), NOW()),
(6, 'finance1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '赵敏', '13800138005', 'finance1@example.com', 4, 3, NULL, 1, NOW(), NOW()),
(7, 'teacher1', '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC', '陈老师', '13800138006', 'teacher1@example.com', 5, 2, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE real_name=VALUES(real_name);

-- =====================================================
-- 4. 插入客户数据
-- =====================================================
INSERT INTO customers (id, wechat_id, wechat_nickname, phone, real_name, traffic_source, sales_id, customer_intent, lifecycle_stage, remark, create_time, update_time) VALUES
(1, 'wx_lixm001', '李晓明', '13900001111', '李晓明', '线上咨询', 3, '高', '客户', '非常有意向，预算充足', NOW(), NOW()),
(2, 'wx_wangll002', '王丽丽', '13900002222', '王丽丽', '朋友推荐', 3, '高', '线索', '已约定下周参观校区', NOW(), NOW()),
(3, 'wx_zhangq003', '张强', '13900003333', '张强', '线下地推', 4, '中', '线索', '在职想转行，需要周末班', NOW(), NOW()),
(4, 'wx_liumm004', '刘美美', '13900004444', '刘美美', '网络广告', 4, '高', '客户', '已签约学员', NOW(), NOW()),
(5, 'wx_zhaog005', '赵刚', '13900005555', '赵刚', '线上咨询', 5, '低', '线索', '预算有限，考虑中', NOW(), NOW()),
(6, 'wx_suntt006', '孙婷婷', '13900006666', '孙婷婷', '老学员推荐', 5, '高', '客户', '老学员强烈推荐', NOW(), NOW()),
(7, 'wx_zhouj007', '周杰', '13900007777', '周杰', '线下活动', 3, '中', '线索', '应届毕业生，待业中', NOW(), NOW()),
(8, 'wx_wuna008', '吴娜', '13900008888', '吴娜', '线上咨询', 4, '低', '线索', '联系不上，暂时无效', NOW(), NOW()),
(9, 'wx_zhengh009', '郑浩', '13900009999', '郑浩', '合作企业', 3, '高', '客户', '企业定制培训学员', NOW(), NOW()),
(10, 'wx_fengl010', '冯琳', '13900010000', '冯琳', '线上咨询', 4, '中', '线索', '有设计基础，想提升', NOW(), NOW())
ON DUPLICATE KEY UPDATE wechat_nickname=VALUES(wechat_nickname);

-- =====================================================
-- 5. 插入订单数据
-- =====================================================
INSERT INTO orders (id, order_no, customer_id, wechat_id, wechat_nickname, phone, sales_id, campus_id, course_name, payment_amount, payment_time, is_new_student, order_status, remark, create_time, update_time) VALUES
(1, 'ORD202510290001', 4, 'wx_liumm004', '刘美美', '13900004444', 4, 1, 'UI设计全栈班', 12800.00, NOW() - INTERVAL 5 DAY, 1, '上课中', '一次性付清，赠送设计软件', NOW() - INTERVAL 5 DAY, NOW()),
(2, 'ORD202510290002', 9, 'wx_zhengh009', '郑浩', '13900009999', 3, 1, 'Java架构师企业定制', 98000.00, NOW() - INTERVAL 7 DAY, 1, '上课中', '企业团体培训，10人', NOW() - INTERVAL 7 DAY, NOW()),
(3, 'ORD202510290003', 2, 'wx_wangll002', '王丽丽', '13900002222', 3, 1, 'Python数据分析', 5000.00, NOW() - INTERVAL 2 DAY, 1, '待上课', '已付定金5000元，余款分期', NOW() - INTERVAL 2 DAY, NOW()),
(4, 'ORD202510290004', 1, 'wx_lixm001', '李晓明', '13900001111', 3, 1, 'Java全栈开发', 16800.00, NOW(), 1, '待上课', '刚签约', NOW(), NOW())
ON DUPLICATE KEY UPDATE course_name=VALUES(course_name);

-- =====================================================
-- 6. 插入数据字典
-- =====================================================
INSERT INTO dictionary (dict_type, dict_code, dict_label, dict_value, sort_order, status, remark, create_time, update_time) VALUES
-- 客户来源
('customer_source', 'online', '线上咨询', 'online', 1, 1, '通过官网、APP等线上渠道咨询', NOW(), NOW()),
('customer_source', 'offline', '线下地推', 'offline', 2, 1, '线下活动、地推获客', NOW(), NOW()),
('customer_source', 'referral', '朋友推荐', 'referral', 3, 1, '老客户或朋友推荐', NOW(), NOW()),
('customer_source', 'ad', '网络广告', 'ad', 4, 1, '搜索引擎、社交媒体广告', NOW(), NOW()),
('customer_source', 'partner', '合作企业', 'partner', 5, 1, '企业合作渠道', NOW(), NOW()),

-- 客户意向
('customer_intent', 'high', '高', 'high', 1, 1, '意向强烈，近期可能签约', NOW(), NOW()),
('customer_intent', 'medium', '中', 'medium', 2, 1, '有一定意向，需要跟进', NOW(), NOW()),
('customer_intent', 'low', '低', 'low', 3, 1, '意向较弱，长期培养', NOW(), NOW()),

-- 生命周期阶段
('lifecycle_stage', 'lead', '线索', 'lead', 1, 1, '初步线索', NOW(), NOW()),
('lifecycle_stage', 'customer', '客户', 'customer', 2, 1, '已签约客户', NOW(), NOW()),
('lifecycle_stage', 'potential', '潜在客户', 'potential', 3, 1, '有意向但未签约', NOW(), NOW()),

-- 订单状态
('order_status', 'pending', '待上课', 'pending', 1, 1, NULL, NOW(), NOW()),
('order_status', 'in_progress', '上课中', 'in_progress', 2, 1, NULL, NOW(), NOW()),
('order_status', 'completed', '已完成', 'completed', 3, 1, NULL, NOW(), NOW()),
('order_status', 'refunded', '已退款', 'refunded', 4, 1, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE dict_label=VALUES(dict_label);

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
FROM users ORDER BY id;
SELECT '-----------------------------------' as separator;
SELECT CONCAT('用户数量: ', COUNT(*)) as 统计 FROM users;
SELECT CONCAT('客户数量: ', COUNT(*)) as 统计 FROM customers;
SELECT CONCAT('订单数量: ', COUNT(*)) as 统计 FROM orders;
SELECT CONCAT('部门数量: ', COUNT(*)) as 统计 FROM department;
SELECT CONCAT('校区数量: ', COUNT(*)) as 统计 FROM campus;
SELECT CONCAT('字典数量: ', COUNT(*)) as 统计 FROM dictionary;
