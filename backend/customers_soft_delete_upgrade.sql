-- 客户表软删除字段升级
-- 创建时间: 2025-12-03
-- 用途: 为客户表添加软删除字段，提高数据安全性

ALTER TABLE `customers`
ADD COLUMN `is_deleted` tinyint(1) DEFAULT 0 COMMENT '是否删除: 0-未删除, 1-已删除',
ADD COLUMN `deleted_at` datetime NULL COMMENT '���除时间',
ADD COLUMN `deleted_reason` varchar(255) NULL COMMENT '删除原因',
ADD COLUMN `deleted_by` int NULL COMMENT '删除人ID';

-- 添加软删除相关索引
ALTER TABLE `customers`
ADD INDEX `idx_is_deleted` (`is_deleted`) COMMENT '软删除状态索引',
ADD INDEX `idx_deleted_at` (`deleted_at`) COMMENT '删除时间索引';

-- 添加外键约束（如果需要）
ALTER TABLE `customers`
ADD CONSTRAINT `fk_customers_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;