-- 数据库清理脚本
-- 删除现有数据以便重新同步

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 删除订单相关数据
DELETE FROM orders;

-- 删除客户相关数据
DELETE FROM customers;

-- 删除老师相关数据
DELETE FROM teachers;

-- 删除临时订单表数据（如果存在）
DROP TABLE IF EXISTS temporary_orders;

-- 重置自增ID
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE customers AUTO_INCREMENT = 1;
ALTER TABLE teachers AUTO_INCREMENT = 1;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

SELECT '数据库清理完成' as status;