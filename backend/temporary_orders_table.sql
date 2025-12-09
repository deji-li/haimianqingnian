-- 临时订单表（处理未同步的订单号）
-- 创建时间: 2025-12-03
-- 用途: 支持订单预绑定功能，解决海绵API同步延迟问题

CREATE TABLE `temporary_orders` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `customer_id` int NOT NULL COMMENT '绑定客户ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `status` enum('pending','synced','expired') NOT NULL DEFAULT 'pending' COMMENT '状态: pending-等待同步, synced-已同步, expired-已过期',
  `created_by` int NOT NULL COMMENT '创建人ID（销售人员ID）',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `synced_at` datetime NULL COMMENT '同步完成时间',
  `order_id` int NULL COMMENT '实际订单ID（同步后填写）',
  `sync_attempts` int DEFAULT 0 COMMENT '同步尝试次数',
  `last_sync_attempt` datetime NULL COMMENT '最后同步尝试时间',
  `notes` text NULL COMMENT '备注信息',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`) COMMENT '订单号唯一索引',
  KEY `idx_customer_status` (`customer_id`, `status`) COMMENT '客户状态联合索引',
  KEY `idx_status_created` (`status`, `created_at`) COMMENT '状态创建时间索引',
  KEY `idx_created_by` (`created_by`) COMMENT '创建人索引',
  CONSTRAINT `fk_temp_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_temp_orders_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='临时订单表 - 用于处理海绵API同步延迟的订单预绑定';