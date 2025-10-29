-- =====================================================
-- 教育培训CRM系统 - 数据库初始化脚本
-- =====================================================
-- 用途：快速创建数据库和用户
-- 使用方法：mysql -u root -p < init-database.sql
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS education_crm
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 显示创建结果
SELECT CONCAT('✓ 数据库 education_crm 创建成功') AS Status;

-- 创建专用用户（可选，也可以直接使用 root）
CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY '123456';

-- 授予权限
GRANT ALL PRIVILEGES ON education_crm.* TO 'crm_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示授权结果
SELECT CONCAT('✓ 用户 crm_user 创建成功并已授权') AS Status;

-- 切换到新数据库
USE education_crm;

-- 显示当前数据库
SELECT DATABASE() AS '当前数据库';

-- 显示完成信息
SELECT '✓ 数据库初始化完成！' AS Status;
SELECT '提示：TypeORM 会自动创建所有数据表' AS Info;
SELECT '下一步：启动后端服务 (npm run start:dev)' AS NextStep;
