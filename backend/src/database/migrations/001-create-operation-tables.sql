-- =====================================================
-- 运营管理模块 - 数据库表结构
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE education_crm;

-- =====================================================
-- 1. 运营账号表
-- =====================================================
CREATE TABLE IF NOT EXISTS `operation_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform_type` enum('小红书','抖音','视频号') NOT NULL COMMENT '平台类型',
  `account_name` varchar(100) NOT NULL COMMENT '账号名称',
  `account_id` varchar(100) DEFAULT NULL COMMENT '账号ID/链接',
  `campus_id` int NOT NULL COMMENT '关联校区ID',
  `operator_id` int NOT NULL COMMENT '负责运营人员ID',
  `account_type` varchar(50) DEFAULT '专业号' COMMENT '账号类型：专业号/企业号/个人号',
  `status` enum('正常','风险','封号','掉号') DEFAULT '正常' COMMENT '账号状态',
  `fans_count` int DEFAULT 0 COMMENT '粉丝量（累计）',
  `total_likes` int DEFAULT 0 COMMENT '总点赞量（累计）',
  `last_update_time` datetime DEFAULT NULL COMMENT '数据最后更新时间',
  `remark` text COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_operator` (`operator_id`),
  KEY `idx_platform_type` (`platform_type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营账号表';

-- =====================================================
-- 2. 运营日报记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS `operation_daily_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_date` date NOT NULL COMMENT '日报日期',
  `account_id` int NOT NULL COMMENT '账号ID',
  `operator_id` int NOT NULL COMMENT '运营人员ID',
  `update_count` int DEFAULT 0 COMMENT '更新次数（如3更）',
  `content_tags` varchar(255) DEFAULT NULL COMMENT '内容类型标签（逗号分隔）：拍课表,封面,课表',
  `view_min` int DEFAULT 0 COMMENT '浏览量最小值',
  `view_max` int DEFAULT 0 COMMENT '浏览量最大值',
  `play_min` int DEFAULT 0 COMMENT '播放量最小值（视频类）',
  `play_max` int DEFAULT 0 COMMENT '播放量最大值',
  `comment_min` int DEFAULT 0 COMMENT '评论数最小值',
  `comment_max` int DEFAULT 0 COMMENT '评论数最大值',
  `message_min` int DEFAULT 0 COMMENT '私信数最小值',
  `message_max` int DEFAULT 0 COMMENT '私信数最大值',
  `account_status_changed` tinyint DEFAULT 0 COMMENT '账号状态是否变化：0否1是',
  `new_status` enum('正常','风险','封号','掉号') DEFAULT NULL COMMENT '新状态（如有变化）',
  `remark` text COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_date_account` (`report_date`, `account_id`),
  KEY `idx_operator_date` (`operator_id`, `report_date`),
  KEY `idx_account` (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营日报记录表';

-- =====================================================
-- 3. 运营提成记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS `operation_commission_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operator_id` int NOT NULL COMMENT '运营人员ID',
  `customer_id` int NOT NULL COMMENT '客户ID',
  `order_id` int NOT NULL COMMENT '订单ID',
  `order_amount` decimal(10,2) NOT NULL COMMENT '订单金额',
  `commission_amount` decimal(10,2) NOT NULL DEFAULT 200.00 COMMENT '提成金额（固定200元）',
  `status` enum('待发放','已发放','已拒绝') DEFAULT '待发放' COMMENT '状态',
  `payment_date` date DEFAULT NULL COMMENT '发放日期',
  `approver_id` int DEFAULT NULL COMMENT '审核人ID',
  `remark` text COMMENT '备注',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order` (`order_id`),
  KEY `idx_operator` (`operator_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运营提成记录表';

-- =====================================================
-- 4. 修改customers表，增加运营引流字段
-- =====================================================
ALTER TABLE `customers`
ADD COLUMN `operator_id` int DEFAULT NULL COMMENT '引流运营人员ID' AFTER `sales_id`,
ADD COLUMN `traffic_platform` enum('小红书','抖音','视频号') DEFAULT NULL COMMENT '来源平台' AFTER `traffic_source`,
ADD COLUMN `traffic_city` enum('广州','上海','深圳','北京') DEFAULT NULL COMMENT '来源城市' AFTER `traffic_platform`,
ADD KEY `idx_operator` (`operator_id`);

-- =====================================================
-- 5. 在permissions表增加运营相关权限
-- =====================================================
INSERT INTO `permissions` (`code`, `name`, `module`, `description`, `status`) VALUES
-- 运营账号管理
('operation:account:view', '查看运营账号', 'operation', '查看运营账号列表和详情', 1),
('operation:account:create', '创建运营账号', 'operation', '创建新的运营账号', 1),
('operation:account:update', '更新运营账号', 'operation', '更新运营账号信息', 1),
('operation:account:delete', '删除运营账号', 'operation', '删除运营账号', 1),

-- 运营日报管理
('operation:report:view', '查看运营日报', 'operation', '查看运营日报数据', 1),
('operation:report:create', '填写运营日报', 'operation', '填写运营日报', 1),
('operation:report:update', '更新运营日报', 'operation', '更新运营日报', 1),
('operation:report:export', '导出运营日报', 'operation', '导出运营日报数据', 1),

-- 运营提成管理
('operation:commission:view', '查看运营提成', 'operation', '查看运营提成记录', 1),
('operation:commission:approve', '审核运营提成', 'operation', '审核运营提成发放', 1),
('operation:commission:export', '导出提成数据', 'operation', '导出提成数据', 1),

-- 运营数据报表
('operation:analytics:view', '查看运营数据', 'operation', '查看运营数据报表', 1),
('operation:analytics:all', '查看全部运营数据', 'operation', '查看所有运营人员数据（主管权限）', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- =====================================================
-- 6. 在roles表增加运营角色
-- =====================================================
INSERT INTO `roles` (`id`, `code`, `name`, `description`, `status`) VALUES
(6, 'operator', '运营人员', '负责内容运营和引流', 1),
(7, 'operator_manager', '运营主管', '运营团队管理', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- =====================================================
-- 7. 为运营人员分配权限
-- =====================================================
-- 运营人员权限（只能看自己）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 6, id FROM permissions
WHERE code IN (
  'operation:account:view',
  'operation:account:create',
  'operation:account:update',
  'operation:report:view',
  'operation:report:create',
  'operation:report:update',
  'operation:commission:view',
  'operation:analytics:view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 6 AND permission_id = permissions.id
);

-- 运营主管权限（可以看全部）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 7, id FROM permissions
WHERE code LIKE 'operation:%'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 7 AND permission_id = permissions.id
);

-- =====================================================
-- 8. 在department表增加运营部
-- =====================================================
INSERT INTO `department` (`id`, `department_name`, `description`, `status`) VALUES
(5, '运营部', '负责内容运营和线上引流', 1)
ON DUPLICATE KEY UPDATE department_name=VALUES(department_name);

SELECT '✅ 运营管理模块表结构创建完成！' as message;
