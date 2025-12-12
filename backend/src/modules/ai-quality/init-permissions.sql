-- AI老板助手权限配置脚本
-- 使用方法：在MySQL客户端中执行此脚本

-- 1. 插入权限
INSERT INTO permission (name, code, description, module, created_at, updated_at) VALUES
('客户洞察查看', 'ai-marketing:use', '查看AI客户洞察数据', 'AI营销', NOW(), NOW()),
('员工质检查看', 'ai-quality:view', '查看AI员工质检数据', 'AI质检', NOW(), NOW()),
('员工质检管理', 'ai-quality:manage', '管理AI员工质检配置', 'AI质检', NOW(), NOW());

-- 2. 查找超级管理员角色ID（通常是ID=1）
SET @admin_role_id = 1;

-- 3. 为超级管理员角色分配新权限
INSERT INTO role_permission (role_id, permission_id, created_at)
SELECT @admin_role_id, p.id, NOW()
FROM permission p
WHERE p.code IN ('ai-marketing:use', 'ai-quality:view', 'ai-quality:manage')
AND NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp.role_id = @admin_role_id AND rp.permission_id = p.id
);

-- 4. 显示配置结果
SELECT '权限配置完成' AS 提示;
SELECT '已分配的权限' AS 类型, p.name AS 权限名称, p.code AS 权限代码
FROM role_permission rp
JOIN permission p ON rp.permission_id = p.id
WHERE rp.role_id = @admin_role_id
AND p.code IN ('ai-marketing:use', 'ai-quality:view', 'ai-quality:manage');