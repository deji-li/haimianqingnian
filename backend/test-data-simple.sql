-- 测试数据导入脚本（简化版）
USE education_crm;

-- 1. 创建测试用户
INSERT INTO users (username, real_name, password, phone, email, status, role_id)
VALUES
('admin', '系统管理员', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '13800138000', 'admin@crm.com', 1, 1)
ON DUPLICATE KEY UPDATE real_name='系统管理员';

-- 2. 创建测试客户
INSERT INTO customers (real_name, phone, age, gender, source, status, intention_level, user_id)
VALUES
('张三', '13900000001', 28, '男', '线上推广', '新客户', 'A', 1),
('李四', '13900000002', 32, '女', '转介绍', '跟进中', 'B', 1)
ON DUPLICATE KEY UPDATE real_name=VALUES(real_name);

-- 3. 创建测试订单
INSERT INTO orders (order_no, customer_id, amount, status, product_name, user_id)
VALUES
('ORD001', 1, 5000.00, 'completed', 'Python课程', 1)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

SELECT '测试数据导入完成！' as message;
SELECT '用户名: admin, 密码: admin123' as login_info;
