-- 设置正确的字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建权限表
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL COMMENT '权限代码',
  `name` varchar(100) NOT NULL COMMENT '权限名称',
  `module` varchar(50) NOT NULL COMMENT '所属模块',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `parent_id` int DEFAULT NULL COMMENT '父权限ID',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用 1-启用',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL COMMENT '角色ID',
  `permission_id` int NOT NULL COMMENT '权限ID',
  `create_time` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_role_id` (`role_id`),
  KEY `IDX_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 初始化权限数据

-- 客户管理权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('customer:view', '查看客户', 'customer', '查看客户列表和详情'),
('customer:create', '创建客户', 'customer', '创建新客户'),
('customer:update', '编辑客户', 'customer', '编辑客户信息'),
('customer:delete', '删除客户', 'customer', '删除客户'),
('customer:batch:assign', '批量分配销售', 'customer', '批量分配客户给销售'),
('customer:batch:update', '批量修改客户', 'customer', '批量修改客户意向等信息'),
('customer:batch:delete', '批量删除客户', 'customer', '批量删除客户'),
('customer:follow', '跟进客户', 'customer', '添加客户跟进记录'),
('customer:export', '导出客户', 'customer', '导出客户数据'),
('customer:import', '导入客户', 'customer', '导入客户数据');

-- 订单管理权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('order:view', '查看订单', 'order', '查看订单列表和详情'),
('order:create', '创建订单', 'order', '创建新订单'),
('order:update', '编辑订单', 'order', '编辑订单信息'),
('order:delete', '删除订单', 'order', '删除订单'),
('order:export', '导出订单', 'order', '导出订单数据'),
('order:import', '导入订单', 'order', '导入订单数据');

-- 用户管理权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('user:view', '查看用户', 'user', '查看用户列表和详情'),
('user:create', '创建用户', 'user', '创建新用户'),
('user:update', '编辑用户', 'user', '编辑用户信息'),
('user:delete', '删除用户', 'user', '删除用户'),
('user:reset-password', '重置密码', 'user', '重置用户密码');

-- 数据看板权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('dashboard:view', '查看数据看板', 'dashboard', '查看数据看板'),
('dashboard:all-data', '查看全部数据', 'dashboard', '查看全公司数据，不受数据权限限制');

-- 财务权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('finance:view', '查看财务报表', 'finance', '查看财务数据'),
('finance:commission', '查看提成', 'finance', '查看提成数据');

-- 系统管理权限
INSERT INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('system:role', '角色管理', 'system', '管理角色和权限'),
('system:department', '部门管理', 'system', '管理部门'),
('system:campus', '校区管理', 'system', '管理校区'),
('system:dictionary', '字典管理', 'system', '管理数据字典');

-- 为系统管理员分配所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  1, -- admin role id
  id
FROM permissions
WHERE NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 1
  AND permission_id = permissions.id
);

-- 为销售主管分配管理权限（除了系统管理）
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  2, -- sales_manager role id
  id
FROM permissions
WHERE module != 'system'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 2
  AND permission_id = permissions.id
);

-- 为销售顾问分配客户和订单相关权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  3, -- sales role id
  id
FROM permissions
WHERE code IN (
  'customer:view', 'customer:create', 'customer:update', 'customer:follow',
  'order:view', 'order:create', 'order:update',
  'dashboard:view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 3
  AND permission_id = permissions.id
);

-- 为财务人员分配财务和查看权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  4, -- finance role id
  id
FROM permissions
WHERE code IN (
  'customer:view', 'order:view',
  'finance:view', 'finance:commission',
  'dashboard:view', 'dashboard:all-data'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions
  WHERE role_id = 4
  AND permission_id = permissions.id
);
