-- 测试数据导入脚本（最简版）
USE education_crm;

-- 1. 创建测试管理员用户
-- 密码: admin123 (bcrypt hash)
INSERT INTO users (username, real_name, password, phone, role_id)
VALUES
('admin', '系统管理员', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138000', 1)
ON DUPLICATE KEY UPDATE real_name='系统管理员';

-- 2. 创建测试客户
INSERT INTO customers (wechat_id, real_name, phone, sales_id, source, gender, age)
VALUES
('TEST001', '张三', '13900000001', 1, '线上推广', '男', 28),
('TEST002', '李四', '13900000002', 1, '转介绍', '女', 32)
ON DUPLICATE KEY UPDATE real_name=VALUES(real_name);

SELECT '✓ 测试数据导入完成！' as message;
SELECT '登录信息: 用户名 admin, 密码 admin123' as login_info;
