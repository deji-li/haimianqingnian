-- ========================================
-- 教育培训CRM+OA+OKR系统 - 数据库初始化脚本
-- ========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. 角色表
-- ========================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `code` VARCHAR(50) NOT NULL COMMENT '角色代码',
  `permissions` JSON DEFAULT NULL COMMENT '权限配置',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- ========================================
-- 2. 部门表
-- ========================================
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `name` VARCHAR(50) NOT NULL COMMENT '部门名称',
  `parent_id` INT(11) DEFAULT 0 COMMENT '父部门ID',
  `sort_order` INT(11) DEFAULT 0 COMMENT '排序',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- ========================================
-- 3. 校区表
-- ========================================
DROP TABLE IF EXISTS `campuses`;
CREATE TABLE `campuses` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '校区ID',
  `name` VARCHAR(100) NOT NULL COMMENT '校区名称',
  `region` VARCHAR(50) DEFAULT NULL COMMENT '所属地区',
  `address` VARCHAR(255) DEFAULT NULL COMMENT '详细地址',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：1-正常 0-停用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校区表';

-- ========================================
-- 4. 用户表
-- ========================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `role_id` INT(11) NOT NULL COMMENT '角色ID',
  `department_id` INT(11) DEFAULT NULL COMMENT '部门ID',
  `campus_id` INT(11) DEFAULT NULL COMMENT '校区ID',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_department_id` (`department_id`),
  KEY `idx_campus_id` (`campus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================================
-- 5. 客户表（核心表）
-- ========================================
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  `wechat_nickname` VARCHAR(100) DEFAULT NULL COMMENT '微信昵称',
  `wechat_id` VARCHAR(100) NOT NULL COMMENT '微信号',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `traffic_source` VARCHAR(50) DEFAULT NULL COMMENT '流量来源：抖音/小红书/百度/朋友圈等',
  `operator_id` INT(11) DEFAULT NULL COMMENT '获取流量的运营人员ID',
  `sales_id` INT(11) NOT NULL COMMENT '对接销售ID',
  `sales_wechat` VARCHAR(100) DEFAULT NULL COMMENT '对接销售微信号',
  `customer_intent` ENUM('高','中','低') DEFAULT '中' COMMENT '客户意向度',
  `next_follow_time` DATETIME DEFAULT NULL COMMENT '下次回访时间',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wechat_id` (`wechat_id`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_next_follow_time` (`next_follow_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- ========================================
-- 6. 客户跟进记录表
-- ========================================
DROP TABLE IF EXISTS `customer_follow_records`;
CREATE TABLE `customer_follow_records` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `customer_id` INT(11) NOT NULL COMMENT '客户ID',
  `follow_content` TEXT NOT NULL COMMENT '跟进内容',
  `follow_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '跟进时间',
  `operator_id` INT(11) NOT NULL COMMENT '跟进人ID',
  `next_follow_time` DATETIME DEFAULT NULL COMMENT '下次跟进时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_follow_time` (`follow_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户跟进记录表';

-- ========================================
-- 7. 订单表（核心表）
-- ========================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(50) NOT NULL COMMENT '订单号',
  `customer_id` INT(11) DEFAULT NULL COMMENT '客户ID',
  `wechat_id` VARCHAR(100) DEFAULT NULL COMMENT '微信号（冗余字段）',
  `wechat_nickname` VARCHAR(100) DEFAULT NULL COMMENT '微信昵称（冗余字段）',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号（冗余字段）',
  `sales_id` INT(11) NOT NULL COMMENT '销售ID',
  `campus_id` INT(11) DEFAULT NULL COMMENT '校区ID',
  `course_name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `payment_amount` DECIMAL(10,2) NOT NULL COMMENT '付款金额',
  `payment_time` DATETIME NOT NULL COMMENT '支付时间',
  `is_new_student` TINYINT(1) DEFAULT 1 COMMENT '是否新学员：1-是 0-否',
  `order_status` ENUM('待上课','上课中','已完成','已退款') DEFAULT '待上课' COMMENT '订单状态',
  `teacher_name` VARCHAR(50) DEFAULT NULL COMMENT '授课老师',
  `region` VARCHAR(50) DEFAULT NULL COMMENT '所属地区',
  `distributor_sales` VARCHAR(50) DEFAULT NULL COMMENT '分销销售',
  `remark` TEXT DEFAULT NULL COMMENT '备注',
  `data_source` ENUM('手工录入','小程序导入') DEFAULT '手工录入' COMMENT '数据来源',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_wechat_id` (`wechat_id`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_campus_id` (`campus_id`),
  KEY `idx_payment_time` (`payment_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ========================================
-- 8. 财务统计表
-- ========================================
DROP TABLE IF EXISTS `financial_statistics`;
CREATE TABLE `financial_statistics` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `date` DATE NOT NULL COMMENT '统计日期',
  `sales_id` INT(11) DEFAULT NULL COMMENT '销售ID（NULL表示全部）',
  `campus_id` INT(11) DEFAULT NULL COMMENT '校区ID（NULL表示全部）',
  `total_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '总收入',
  `order_count` INT(11) DEFAULT 0 COMMENT '订单数',
  `new_student_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '新学员收入',
  `old_student_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '老学员收入',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_sales_campus` (`date`,`sales_id`,`campus_id`),
  KEY `idx_date` (`date`),
  KEY `idx_sales_id` (`sales_id`),
  KEY `idx_campus_id` (`campus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务统计表';

-- ========================================
-- 9. OKR目标表
-- ========================================
DROP TABLE IF EXISTS `okr_objectives`;
CREATE TABLE `okr_objectives` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '目标ID',
  `user_id` INT(11) DEFAULT NULL COMMENT '用户ID（个人目标）',
  `team_id` INT(11) DEFAULT NULL COMMENT '团队ID（团队目标）',
  `quarter` TINYINT(1) NOT NULL COMMENT '季度：1-4',
  `year` INT(11) NOT NULL COMMENT '年份',
  `objective` TEXT NOT NULL COMMENT '目标描述',
  `weight` DECIMAL(5,2) DEFAULT 100.00 COMMENT '权重',
  `status` ENUM('进行中','已完成','已取消') DEFAULT '进行中' COMMENT '状态',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_year_quarter` (`year`,`quarter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OKR目标表';

-- ========================================
-- 10. OKR关键结果表
-- ========================================
DROP TABLE IF EXISTS `okr_key_results`;
CREATE TABLE `okr_key_results` (
  `id` INT(11) NOT NULL AUTO_INCREMENT COMMENT '关键结果ID',
  `objective_id` INT(11) NOT NULL COMMENT '目标ID',
  `key_result` TEXT NOT NULL COMMENT '关键结果描述',
  `target_value` DECIMAL(10,2) NOT NULL COMMENT '目标值',
  `current_value` DECIMAL(10,2) DEFAULT 0.00 COMMENT '当前值',
  `completion_rate` DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN `target_value` = 0 THEN 0 ELSE (`current_value` / `target_value` * 100) END) STORED COMMENT '完成率（%）',
  `unit` VARCHAR(20) DEFAULT NULL COMMENT '单位：元/单/人等',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_objective_id` (`objective_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OKR关键结果表';

-- ========================================
-- 初始化数据
-- ========================================

-- 1. 角色数据
INSERT INTO `roles` (`name`, `code`, `description`, `permissions`) VALUES
('超级管理员', 'admin', '拥有所有权限', '["*"]'),
('校区主管', 'campus_manager', '管理本校区所有数据', '["customer:view", "order:view", "finance:view"]'),
('销售主管', 'sales_manager', '管理本部门销售数据', '["customer:view", "order:view"]'),
('销售', 'sales', '仅查看自己的客户和订单', '["customer:own", "order:own"]'),
('运营', 'operation', '查看流量数据', '["customer:view"]'),
('财务', 'finance', '查看财务报表', '["finance:view", "order:view"]');

-- 2. 部门数据
INSERT INTO `departments` (`name`, `parent_id`, `sort_order`) VALUES
('销售部', 0, 1),
('运营部', 0, 2),
('教务部', 0, 3),
('财务部', 0, 4);

-- 3. 校区数据
INSERT INTO `campuses` (`name`, `region`, `address`, `phone`, `status`) VALUES
('北京朝阳校区', '北京', '北京市朝阳区xxx路xxx号', '010-12345678', 1),
('北京海淀校区', '北京', '北京市海淀区xxx路xxx号', '010-87654321', 1),
('上海浦东校区', '上海', '上海市浦东新区xxx路xxx号', '021-12345678', 1);

-- 4. 用户数据（密码都是 123456 的 bcrypt 加密：$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2）
INSERT INTO `users` (`username`, `password`, `real_name`, `phone`, `email`, `role_id`, `department_id`, `campus_id`, `status`) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2', '系统管理员', '13800138000', 'admin@education.com', 1, NULL, NULL, 1),
('sales01', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2', '张三', '13800138001', 'zhangsan@education.com', 4, 1, 1, 1),
('sales02', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2', '李四', '13800138002', 'lisi@education.com', 4, 1, 2, 1),
('campus01', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2', '王五', '13800138003', 'wangwu@education.com', 2, NULL, 1, 1),
('finance01', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW2', '赵六', '13800138004', 'zhaoliu@education.com', 6, 4, NULL, 1);

-- 5. 客户数据（10条测试数据）
INSERT INTO `customers` (`wechat_nickname`, `wechat_id`, `phone`, `real_name`, `traffic_source`, `operator_id`, `sales_id`, `customer_intent`, `next_follow_time`) VALUES
('微信用户001', 'wx_user001', '13900000001', '陈一', '抖音', 2, 2, '高', '2025-10-28 10:00:00'),
('微信用户002', 'wx_user002', '13900000002', '陈二', '小红书', 2, 2, '中', '2025-10-29 14:00:00'),
('微信用户003', 'wx_user003', '13900000003', '陈三', '百度', 3, 3, '高', '2025-10-28 15:00:00'),
('微信用户004', 'wx_user004', '13900000004', '陈四', '朋友圈', 2, 2, '低', '2025-10-30 10:00:00'),
('微信用户005', 'wx_user005', '13900000005', '陈五', '抖音', 3, 3, '中', '2025-10-29 11:00:00'),
('微信用户006', 'wx_user006', '13900000006', '陈六', '小红书', 2, 2, '高', '2025-10-28 09:00:00'),
('微信用户007', 'wx_user007', '13900000007', '陈七', '百度', 3, 3, '中', '2025-10-30 16:00:00'),
('微信用户008', 'wx_user008', '13900000008', '陈八', '抖音', 2, 2, '高', '2025-10-28 13:00:00'),
('微信用户009', 'wx_user009', '13900000009', '陈九', '朋友圈', 3, 3, '低', '2025-10-31 10:00:00'),
('微信用户010', 'wx_user010', '13900000010', '陈十', '小红书', 2, 2, '中', '2025-10-29 15:00:00');

-- 6. 客户跟进记录数据
INSERT INTO `customer_follow_records` (`customer_id`, `follow_content`, `operator_id`, `next_follow_time`) VALUES
(1, '首次联系，客户对课程很感兴趣，约定明天详聊', 2, '2025-10-28 10:00:00'),
(1, '详细介绍了课程内容，客户表示考虑一下', 2, '2025-10-30 10:00:00'),
(2, '客户咨询价格，已发送详细资料', 2, '2025-10-29 14:00:00'),
(3, '客户很满意，准备下单', 3, NULL),
(5, '客户还在犹豫，需要再跟进', 3, '2025-10-29 11:00:00');

-- 7. 订单数据（20条测试数据）
INSERT INTO `orders` (`order_no`, `customer_id`, `wechat_id`, `wechat_nickname`, `phone`, `sales_id`, `campus_id`, `course_name`, `payment_amount`, `payment_time`, `is_new_student`, `order_status`, `teacher_name`, `data_source`) VALUES
('ORD202510270001', 1, 'wx_user001', '微信用户001', '13900000001', 2, 1, '少儿编程基础班', 3980.00, '2025-10-20 10:30:00', 1, '上课中', '刘老师', '手工录入'),
('ORD202510270002', 1, 'wx_user001', '微信用户001', '13900000001', 2, 1, '少儿编程进阶班', 4980.00, '2025-10-25 14:20:00', 0, '待上课', '刘老师', '手工录入'),
('ORD202510270003', 2, 'wx_user002', '微信用户002', '13900000002', 2, 1, '数学思维训练', 2980.00, '2025-10-21 09:15:00', 1, '上课中', '王老师', '手工录入'),
('ORD202510270004', 3, 'wx_user003', '微信用户003', '13900000003', 3, 2, '英语口语强化', 5980.00, '2025-10-22 16:40:00', 1, '已完成', '李老师', '手工录入'),
('ORD202510270005', 4, 'wx_user004', '微信用户004', '13900000004', 2, 1, '少儿编程基础班', 3980.00, '2025-10-23 11:25:00', 1, '上课中', '刘老师', '手工录入'),
('ORD202510270006', 5, 'wx_user005', '微信用户005', '13900000005', 3, 2, '数学思维训练', 2980.00, '2025-10-24 13:50:00', 1, '待上课', '王老师', '手工录入'),
('ORD202510270007', 6, 'wx_user006', '微信用户006', '13900000006', 2, 1, '少儿编程进阶班', 4980.00, '2025-10-25 15:30:00', 1, '上课中', '刘老师', '手工录入'),
('ORD202510270008', 7, 'wx_user007', '微信用户007', '13900000007', 3, 2, '英语口语强化', 5980.00, '2025-10-26 10:10:00', 1, '待上课', '李老师', '手工录入'),
('ORD202510270009', 8, 'wx_user008', '微信用户008', '13900000008', 2, 1, '数学思维训练', 2980.00, '2025-10-27 09:20:00', 1, '上课中', '王老师', '手工录入'),
('ORD202510270010', 9, 'wx_user009', '微信用户009', '13900000009', 3, 2, '少儿编程基础班', 3980.00, '2025-10-20 14:45:00', 1, '已完成', '刘老师', '手工录入'),
('ORD202510270011', 10, 'wx_user010', '微信用户010', '13900000010', 2, 1, '英语口语强化', 5980.00, '2025-10-21 16:15:00', 1, '上课中', '李老师', '手工录入'),
('ORD202510270012', 1, 'wx_user001', '微信用户001', '13900000001', 2, 1, '数学竞赛班', 6980.00, '2025-10-22 10:00:00', 0, '待上课', '王老师', '手工录入'),
('ORD202510270013', 3, 'wx_user003', '微信用户003', '13900000003', 3, 2, '少儿编程进阶班', 4980.00, '2025-10-23 13:30:00', 0, '上课中', '刘老师', '手工录入'),
('ORD202510270014', 5, 'wx_user005', '微信用户005', '13900000005', 3, 2, '英语阅读写作', 4580.00, '2025-10-24 11:20:00', 0, '已完成', '李老师', '手工录入'),
('ORD202510270015', 6, 'wx_user006', '微信用户006', '13900000006', 2, 1, '数学思维训练', 2980.00, '2025-10-25 09:40:00', 0, '上课中', '王老师', '手工录入'),
('ORD202510270016', 8, 'wx_user008', '微信用户008', '13900000008', 2, 1, '少儿编程基础班', 3980.00, '2025-10-26 15:10:00', 0, '待上课', '刘老师', '手工录入'),
('ORD202510270017', 2, 'wx_user002', '微信用户002', '13900000002', 2, 1, '英语口语强化', 5980.00, '2025-10-27 10:50:00', 0, '上课中', '李老师', '手工录入'),
('ORD202510270018', 4, 'wx_user004', '微信用户004', '13900000004', 2, 1, '数学竞赛班', 6980.00, '2025-10-20 14:25:00', 0, '已完成', '王老师', '手工录入'),
('ORD202510270019', 7, 'wx_user007', '微信用户007', '13900000007', 3, 2, '少儿编程进阶班', 4980.00, '2025-10-21 11:35:00', 0, '上课中', '刘老师', '手工录入'),
('ORD202510270020', 9, 'wx_user009', '微信用户009', '13900000009', 3, 2, '数学思维训练', 2980.00, '2025-10-22 16:00:00', 0, '待上课', '王老师', '手工录入');

-- 8. OKR目标数据
INSERT INTO `okr_objectives` (`user_id`, `quarter`, `year`, `objective`, `weight`, `status`) VALUES
(2, 4, 2025, 'Q4销售业绩目标：完成50万营收', 100.00, '进行中'),
(3, 4, 2025, 'Q4销售业绩目标：完成45万营收', 100.00, '进行中');

-- 9. OKR关键结果数据
INSERT INTO `okr_key_results` (`objective_id`, `key_result`, `target_value`, `current_value`, `unit`) VALUES
(1, '新签约客户数达到30人', 30.00, 8.00, '人'),
(1, '总营收达到50万', 500000.00, 120000.00, '元'),
(1, '客户满意度达到95%', 95.00, 0.00, '%'),
(2, '新签约客户数达到25人', 25.00, 7.00, '人'),
(2, '总营收达到45万', 450000.00, 100000.00, '元');

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 初始化完成
-- ========================================
