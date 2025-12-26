-- 添加跟进提醒相关权限
USE education_crm;

-- 插入跟进提醒权限
INSERT INTO permissions (name, code, module, description, status)
VALUES
('查看跟进配置', 'system:follow-up:view', 'system', '查看跟进提醒配置', 1),
('更新跟进配置', 'system:follow-up:update', 'system', '更新跟进提醒配置', 1),
('管理跟进任务', 'system:follow-up:manage', 'system', '管理跟进提醒任务', 1)
ON DUPLICATE KEY UPDATE update_time = NOW();

-- 为管理员角色分配跟进提醒权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, p.id
FROM permissions p
WHERE p.code IN (
  'system:follow-up:view',
  'system:follow-up:update',
  'system:follow-up:manage'
)
ON DUPLICATE KEY UPDATE role_id = role_id;

-- 为销售角色分配查看和管理自己任务的权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, p.id
FROM permissions p
WHERE p.code IN (
  'system:follow-up:view',
  'system:follow-up:manage'
)
ON DUPLICATE KEY UPDATE role_id = role_id;

SELECT '✓ 跟进提醒权限添加完成！' as message;
