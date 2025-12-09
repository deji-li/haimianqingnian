-- 更新提成计算记录表，添加状态、结算时间、备注等字段

-- 添加状态字段
ALTER TABLE `commission_calculations`
ADD COLUMN `status` ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '提成状态：pending-待结算，paid-已结算，cancelled-已取消' AFTER `sales_id`;

-- 添加结算时间字段
ALTER TABLE `commission_calculations`
ADD COLUMN `settle_time` DATETIME NULL COMMENT '结算时间' AFTER `status`;

-- 添加备注字段
ALTER TABLE `commission_calculations`
ADD COLUMN `remark` TEXT NULL COMMENT '备注信息' AFTER `settle_time`;

-- 重命名 calculate_time 为 created_at
ALTER TABLE `commission_calculations`
CHANGE COLUMN `calculate_time` `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';

-- 添加 updated_at 字段
ALTER TABLE `commission_calculations`
ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `created_at`;

-- 添加状态索引
ALTER TABLE `commission_calculations`
ADD INDEX `idx_status` (`status`);

-- 添加结算时间索引
ALTER TABLE `commission_calculations`
ADD INDEX `idx_settle_time` (`settle_time`);
