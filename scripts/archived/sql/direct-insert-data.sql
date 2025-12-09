-- 清空旧数据
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE customers;
TRUNCATE TABLE department;
TRUNCATE TABLE campus;
TRUNCATE TABLE enterprise_knowledge_base;
TRUNCATE TABLE roles;
TRUNCATE TABLE permissions;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS=1;

-- 插入部门
INSERT INTO department (departmentName, description, status, createTime, updateTime) VALUES
('销售部', '负责客户开发和订单签约', 1, NOW(), NOW()),
('教学部', '负责课程授课和教学管理', 1, NOW(), NOW()),
('财务部', '负责财务管理和报表统计', 1, NOW(), NOW()),
('市场部', '负责市场推广和品牌建设', 1, NOW(), NOW());

-- 插入校区
INSERT INTO campus (campusName, address, contactPerson, contactPhone, status, createTime, updateTime) VALUES
('朝阳校区', '北京市朝阳区建国路88号', '张老师', '13900000001', 1, NOW(), NOW()),
('海淀校区', '北京市海淀区中关村大街1号', '李老师', '13900000002', 1, NOW(), NOW()),
('西城校区', '北京市西城区金融街35号', '王老师', '13900000003', 1, NOW(), NOW());

-- 插入客户
INSERT INTO customers (wechatNickname, wechatId, phone, realName, customerIntent, trafficSource, assignedSales, createTime, updateTime) VALUES
('张三', 'wx_zhangsan', '13900000001', '张三', '高意向', '线上推广', NULL, NOW(), NOW()),
('李四', 'wx_lisi', '13900000002', '李四', '中意向', '朋友推荐', NULL, NOW(), NOW()),
('王五', 'wx_wangwu', '13900000003', '王五', '低意向', '线下活动', NULL, NOW(), NOW()),
('赵六', 'wx_zhaoliu', '13900000004', '赵六', '高意向', '线上推广', NULL, NOW(), NOW()),
('孙七', 'wx_sunqi', '13900000005', '孙七', '中意向', '老客户介绍', NULL, NOW(), NOW());

-- 插入知识库
INSERT INTO enterprise_knowledge_base (title, content, keywords, sceneCategory, productCategory, customerType, questionType, priority, source, status, createTime, updateTime) VALUES
('如何介绍课程优势', '我们的课程具有以下优势：1. 名师授课 2. 小班教学 3. 个性化辅导 4. 完善的课后服务', '课程,优势,介绍', '产品介绍', '少儿英语', '新客户', '产品咨询', 95, 'manual', 'approved', NOW(), NOW()),
('价格异议处理话术', '针对价格异议，我们可以强调：1. 课程价值 2. 师资力量 3. 学习效果 4. 优惠活动', '价格,异议,话术', '异议处理', '少儿英语', '意向客户', '价格异议', 90, 'manual', 'approved', NOW(), NOW()),
('试听课邀约技巧', '邀约试听课时注意：1. 了解客户需求 2. 介绍试听内容 3. 强调免费体验 4. 确认时间地点', '试听,邀约,技巧', '客户邀约', '少儿英语', '新客户', '邀约话术', 85, 'manual', 'approved', NOW(), NOW()),
('续费挽留技巧', '客户续费挽留：1. 回顾学习成果 2. 展示进步空间 3. 提供续费优惠 4. 强调持续性', '续费,挽留,技巧', '客户维护', '少儿英语', '老客户', '续费挽留', 80, 'manual', 'approved', NOW(), NOW()),
('投诉处理流程', '处理投诉：1. 耐心倾听 2. 表示理解 3. 提出解决方案 4. 跟进处理结果', '投诉,处理,流程', '异议处理', '通用', '所有客户', '投诉处理', 95, 'manual', 'approved', NOW(), NOW());

-- 插入角色
INSERT INTO roles (roleName, roleCode, description, status, createTime, updateTime) VALUES
('管理员', 'admin', '系统管理员，拥有所有权限', 1, NOW(), NOW()),
('销售', 'sales', '销售人员，负责客户跟进', 1, NOW(), NOW()),
('运营', 'operator', '运营人员，负责数据分析', 1, NOW(), NOW()),
('教师', 'teacher', '教学人员，负责授课', 1, NOW(), NOW());

-- 插入权限
INSERT INTO permissions (code, name, description, category, status, createTime, updateTime) VALUES
('customer:view', '查看客户', '查看客户列表和详情', 'customer', 1, NOW(), NOW()),
('customer:create', '创建客户', '添加新客户', 'customer', 1, NOW(), NOW()),
('customer:edit', '编辑客户', '修改客户信息', 'customer', 1, NOW(), NOW()),
('knowledge:view', '查看知识库', '查看知识库内容', 'knowledge', 1, NOW(), NOW()),
('knowledge:create', '创建知识', '添加新知识', 'knowledge', 1, NOW(), NOW()),
('order:view', '查看订单', '查看订单列表', 'order', 1, NOW(), NOW()),
('order:create', '创建订单', '创建新订单', 'order', 1, NOW(), NOW());

-- 插入管理员用户 (密码: admin123)
INSERT INTO users (username, password, realName, phone, email, role, status, createTime, updateTime) VALUES
('admin', '$2b$10$YvQQ3hZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', '系统管理员', '13800138000', 'admin@example.com', 'admin', 1, NOW(), NOW());
