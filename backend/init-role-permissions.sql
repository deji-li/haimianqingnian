-- 初始化角色权限关联数据

-- 为系统管理员(admin, role_id=1)分配所有权限
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

-- 为销售主管(sales_manager, role_id=2)分配管理权限（除了系统管理）
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

-- 为销售顾问(sales, role_id=3)分配客户和订单相关权限
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

-- 为财务人员(finance, role_id=4)分配财务和查看权限
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
