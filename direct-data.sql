-- Clear all tables
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE permissions;
TRUNCATE TABLE department;
TRUNCATE TABLE campus;
TRUNCATE TABLE customers;
TRUNCATE TABLE enterprise_knowledge_base;
TRUNCATE TABLE dictionary;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert roles
INSERT INTO roles (id, name, code, description, status) VALUES
(1, '管理员', 'admin', '系统管理员，拥有所有权限', 1),
(2, '销售', 'sales', '销售人员，负责客户跟进', 1),
(3, '运营', 'operator', '运营人员，负责数据分析', 1),
(4, '教师', 'teacher', '教学人员，负责授课', 1);

-- Insert permissions
INSERT INTO permissions (code, name, description, module, status) VALUES
('customer:view', '查看客户', '查看客户列表和详情', 'customer', 1),
('customer:create', '创建客户', '添加新客户', 'customer', 1),
('customer:edit', '编辑客户', '修改客户信息', 'customer', 1),
('customer:delete', '删除客户', '删除客户信息', 'customer', 1),
('knowledge:view', '查看知识库', '查看知识库内容', 'knowledge', 1),
('knowledge:create', '创建知识', '添加新知识', 'knowledge', 1),
('order:view', '查看订单', '查看订单列表', 'order', 1),
('order:create', '创建订单', '创建新订单', 'order', 1);

-- Insert departments
INSERT INTO department (id, department_name, description, status) VALUES
(1, '销售部', '负责客户开发和订单签约', 1),
(2, '教学部', '负责课程授课和教学管理', 1),
(3, '财务部', '负责财务管理和报表统计', 1),
(4, '市场部', '负责市场推广和品牌建设', 1);

-- Insert campuses
INSERT INTO campus (id, campus_name, campus_code, address, contact_person, contact_phone, status) VALUES
(1, '朝阳校区', 'CY001', '北京市朝阳区建国路88号', '张老师', '13900000001', 1),
(2, '海淀校区', 'HD001', '北京市海淀区中关村大街1号', '李老师', '13900000002', 1),
(3, '西城校区', 'XC001', '北京市西城区金融街35号', '王老师', '13900000003', 1);

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, real_name, phone, email, role_id, status) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '系统管理员', '13800138000', 'admin@example.com', 1, 1);

-- Insert sales users
INSERT INTO users (username, password, real_name, phone, email, role_id, department_id, status) VALUES
('sales001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '张三', '13900001001', 'zhangsan@example.com', 2, 1, 1),
('sales002', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhub', '李四', '13900001002', 'lisi@example.com', 2, 1, 1);

-- Insert customers
INSERT INTO customers (wechat_nickname, wechat_id, phone, real_name, customer_intent, traffic_source, sales_id) VALUES
('张三', 'wx_zhangsan', '13900000001', '张三', '高意向', '线上推广', 2),
('李四', 'wx_lisi', '13900000002', '李四', '中意向', '朋友推荐', 2),
('王五', 'wx_wangwu', '13900000003', '王五', '低意向', '线下活动', 3),
('赵六', 'wx_zhaoliu', '13900000004', '赵六', '高意向', '线上推广', 2),
('孙七', 'wx_sunqi', '13900000005', '孙七', '中意向', '老客户介绍', 3),
('周八', 'wx_zhouba', '13900000006', '周八', '高意向', 'SEO搜索', 2),
('吴九', 'wx_wujiu', '13900000007', '吴九', '中意向', '抖音推广', 3),
('郑十', 'wx_zhengshi', '13900000008', '郑十', '低意向', '线下活动', 2);

-- Insert knowledge base
INSERT INTO enterprise_knowledge_base (title, content, keywords, scene_category, status) VALUES
('如何介绍课程优势', '我们的课程具有以下优势：1. 名师授课 2. 小班教学 3. 个性化辅导 4. 完善的课后服务', '课程,优势,介绍', '产品介绍', 'active'),
('价格异议处理话术', '针对价格异议，强调：1. 课程价值 2. 师资力量 3. 学习效果 4. 优惠活动', '价格,异议,话术', '异议处理', 'active'),
('试听课邀约技巧', '邀约试听课：1. 了解客户需求 2. 介绍试听内容 3. 强调免费体验 4. 确认时间地点', '试听,邀约,技巧', '客户邀约', 'active'),
('续费挽留技巧', '客户续费挽留：1. 回顾学习成果 2. 展示进步空间 3. 提供续费优惠 4. 强调持续性', '续费,挽留,技巧', '客户维护', 'active'),
('投诉处理流程', '处理客户投诉：1. 耐心倾听 2. 表示理解 3. 提出解决方案 4. 跟进处理结果', '投诉,处理,流程', '异议处理', 'active'),
('新客户首次沟通技巧', '首次沟通要点：1. 自我介绍 2. 了解需求 3. 建立信任 4. 引导下一步', '新客户,沟通,技巧', '客户开发', 'active'),
('老客户维护话术', '老客户维护要点：1. 定期回访 2. 生日祝福 3. 优惠活动 4. 推荐奖励', '老客户,维护,话术', '客户维护', 'active');

-- Insert dictionary data
INSERT INTO dictionary (dict_type, dict_label, dict_value, sort, status, remark) VALUES
('customer_intent', '高意向', '高意向', 1, 1, '客户意向度：高'),
('customer_intent', '中意向', '中意向', 2, 1, '客户意向度：中'),
('customer_intent', '低意向', '低意向', 3, 1, '客户意向度：低'),
('traffic_source', '线上推广', '线上推广', 1, 1, '流量来源：线上推广'),
('traffic_source', '线下活动', '线下活动', 2, 1, '流量来源：线下活动'),
('traffic_source', '朋友推荐', '朋友推荐', 3, 1, '流量来源：朋友推荐'),
('traffic_source', '老客户介绍', '老客户介绍', 4, 1, '流量来源：老客户介绍'),
('traffic_source', 'SEO搜索', 'SEO搜索', 5, 1, '流量来源：SEO搜索'),
('traffic_source', '抖音推广', '抖音推广', 6, 1, '流量来源：抖音推广');
