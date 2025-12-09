-- 客户合并操作日志表
-- 创建时间: 2025-12-03
-- 用途: 记录客户合并操作，提供数据审计和回溯功能

CREATE TABLE `customer_merge_logs` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `source_customer_id` int NOT NULL COMMENT '源客户ID（被合并的临时客户）',
  `target_customer_id` int NOT NULL COMMENT '目标客户ID（保留的正式客户）',
  `order_no` varchar(50) NOT NULL COMMENT '关联订单号',
  `merge_type` enum('order_binding','customer_sync','manual_merge') NOT NULL COMMENT '合并类型: order_binding-订单绑定合并, customer_sync-客户同步合并, manual_merge-手动合并',
  `merge_data` json NULL COMMENT '合并的数据快照（包含源客户的所有重要信息）',
  `created_by` int NOT NULL COMMENT '操作人ID（系统自动或手动操作的用户ID）',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `ip_address` varchar(45) NULL COMMENT '操作IP地址',
  `user_agent` text NULL COMMENT '用户代理信息',
  `merge_reason` varchar(255) NULL COMMENT '合并原因说明',
  `is_successful` tinyint(1) DEFAULT 1 COMMENT '是否成功: 1-成功, 0-失败',
  `error_message` text NULL COMMENT '错误信息（失败时记录）',
  `rollback_possible` tinyint(1) DEFAULT 1 COMMENT '是否可回滚: 1-可回滚, 0-不可回滚',
  `rollback_data` json NULL COMMENT '回滚数据备份',
  PRIMARY KEY (`id`),
  KEY `idx_target_customer` (`target_customer_id`) COMMENT '目标客户索引',
  KEY `idx_source_customer` (`source_customer_id`) COMMENT '源客户索引',
  KEY `idx_order_no` (`order_no`) COMMENT '订单号索引',
  KEY `idx_merge_type_created` (`merge_type`, `created_at`) COMMENT '合并类型和时间索引',
  KEY `idx_created_by` (`created_by`) COMMENT '操作人索引',
  CONSTRAINT `fk_merge_logs_source_customer` FOREIGN KEY (`source_customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_merge_logs_target_customer` FOREIGN KEY (`target_customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_merge_logs_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户合并操作日志表 - 记录所有客户合并操作的详细日志';