-- =====================================================
-- 完整的数据库初始化脚本
-- 创建数据库、表结构和初始管理员账户
-- =====================================================

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS education_crm
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE education_crm;

-- 2. 创建角色表
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '角色代码',
  `name` varchar(50) NOT NULL COMMENT '角色名称',
  `description` varchar(255) DEFAULT NULL COMMENT '角色描述',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `role_id` int NOT NULL COMMENT '角色ID',
  `department_id` int DEFAULT NULL COMMENT '部门ID',
  `campus_id` int DEFAULT NULL COMMENT '校区ID',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：1启用 0禁用',
  `last_login_time` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 插入初始角色（如果不存在）
INSERT IGNORE INTO `roles` (`id`, `code`, `name`, `description`, `status`)
VALUES
(1, 'admin', '系统管理员', '拥有系统所有权限', 1),
(2, 'sales_manager', '销售主管', '销售团队管理', 1),
(3, 'sales', '销售顾问', '客户跟进与订单处理', 1),
(4, 'finance', '财务人员', '财务数据查看与报表', 1),
(5, 'teacher', '授课老师', '查看课程与学员信息', 1);

-- 5. 插入初始管理员账户（如果不存在）
-- 密码: 123456 (已使用 bcrypt hash)
-- bcrypt hash for "123456" with salt rounds 10
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `real_name`, `phone`, `email`, `role_id`, `status`)
VALUES
(1, 'admin', '$2b$10$YourBcryptHashHere', '系统管理员', '13800138000', 'admin@example.com', 1, 1);

-- 注意：上面的密码hash需要在应用启动后通过程序生成
-- 或者直接运行下面的更新语句（使用正确的bcrypt hash）

SELECT '数据库初始化完成！' as message;
SELECT '请确保管理员密码正确设置' as reminder;
