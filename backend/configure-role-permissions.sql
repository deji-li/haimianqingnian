-- ============================================
-- 角色权限配置 - Week 2
-- ============================================
-- 创建时间: 2025-12-26
-- 说明: 为8种角色配置权限
-- 执行前请备份数据库！
--
-- 角色列表:
-- 1. super_admin - 超级管理员 (所有权限)
-- 2. admin - 系统管理员 (管理权限)
-- 3. sales_manager - 销售主管 (销售+团队管理)
-- 4. sales - 销售顾问 (客户+订单)
-- 5. operator - 运营人员 (运营+统计)
-- 6. finance - 财务人员 (财务数据)
-- 7. trainer - 培训师 (培训陪练)
-- 8. teacher - 授课老师 (基础查看)
--
-- ============================================

USE education_crm;

-- ============================================
-- 第一步：添加新角色 (如果不存在)
-- ============================================

INSERT INTO roles (code, name, description, status) VALUES
('super_admin', '超级管理员', '拥有系统所有权限', 1),
('operator', '运营人员', '运营管理与数据统计', 1),
('trainer', '培训师', '培训陪练管理', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 第二步：清除现有角色权限配置 (可选)
-- ============================================
-- ⚠️ 警告：这将删除所有现有角色权限配置！
-- ⚠️ 如需保留现有配置，请注释掉以下语句

-- DELETE FROM role_permissions WHERE role_id IN (
--   (SELECT id FROM roles WHERE code = 'admin'),
--   (SELECT id FROM roles WHERE code = 'sales_manager'),
--   (SELECT id FROM roles WHERE code = 'sales'),
--   (SELECT id FROM roles WHERE code = 'finance'),
--   (SELECT id FROM roles WHERE code = 'teacher')
-- );

-- ============================================
-- 第三步：为各角色分配权限
-- ============================================

-- ==================== 1. 超级管理员 (super_admin) ====================
-- 拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'super_admin'),
  p.id
FROM permissions p
WHERE p.status = 1
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 2. 系统管理员 (admin) ====================
-- 拥有管理权限，但不含超级管理员专属功能
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'admin'),
  p.id
FROM permissions p
WHERE p.status = 1
  -- 排除超级管理员专属功能
  AND p.code NOT LIKE 'super:%'
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 3. 销售主管 (sales_manager) ====================
-- 客户管理 + 订单管理 + 销售工具 + 团队管理 + 数据分析

-- 删除现有配置
DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE code = 'sales_manager');

-- 添加权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'sales_manager'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 客户管理
    p.module = 'customer'
    -- 订单管理
    OR p.module = 'order'
    -- 销售工具
    OR p.module IN ('ai', 'workspace')
    -- 数据分析
    OR p.module = 'analytics'
    -- 目标管理
    OR p.module = 'target'
    -- 团队管理
    OR p.code IN ('user:view', 'user:update')
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 4. 销售顾问 (sales) ====================
-- 客户管理 + 订单管理 + 销售工具 (个人数据)

-- 删除现有配置
DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE code = 'sales');

-- 添加权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'sales'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 客户管理 (仅查看和更新)
    p.code IN ('customer:view', 'customer:update', 'customer:follow:view', 'customer:follow:add')
    -- 订单管理 (仅查看)
    OR p.code IN ('order:view', 'order:create', 'order:update')
    -- 销售工具
    OR p.module IN ('ai', 'workspace')
    OR p.code = 'dashboard:view'
    -- 个人数据
    OR p.code = 'analytics:personal:view'
    -- 目标管理 (查看)
    OR p.code = 'target:view'
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 5. 运营人员 (operator) ====================
-- 运营管理 + 数据统计 + 客户分析

INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'operator'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 运营管理
    p.module = 'operation'
    -- 自动化
    OR p.module = 'automation'
    -- 数据分析
    OR p.module = 'analytics'
    -- 客户查看
    OR p.code = 'customer:view'
    -- 仪表盘
    OR p.code = 'dashboard:view'
    -- 知识库 (查看)
    OR p.code LIKE 'knowledge:%:view'
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 6. 财务人员 (finance) ====================
-- 财务数据 + 订单查看

-- 删除现有配置
DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE code = 'finance');

-- 添加权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'finance'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 财务管理
    p.module = 'finance'
    -- 订单查看
    OR p.code = 'order:view'
    -- 客户查看
    OR p.code = 'customer:view'
    -- 数据分析
    OR p.module = 'analytics'
    -- 仪表盘
    OR p.code = 'dashboard:view'
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 7. 培训师 (trainer) ====================
-- 培训陪练 + 知识库管理

INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'trainer'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 培训陪练 (全部权限)
    p.module = 'training'
    -- 知识库管理
    OR p.module = 'knowledge'
    -- AI功能 (话术助手)
    OR p.code LIKE 'ai:script:%'
    -- 客户查看
    OR p.code = 'customer:view'
    -- 仪表盘
    OR p.code = 'dashboard:view'
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ==================== 8. 授课老师 (teacher) ====================
-- 基础查看权限 (学员、课程相关)

-- 删除现有配置
DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE code = 'teacher');

-- 添加权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
  (SELECT id FROM roles WHERE code = 'teacher'),
  p.id
FROM permissions p
WHERE p.status = 1
  AND (
    -- 客户查看
    p.code = 'customer:view'
    -- 订单查看
    OR p.code = 'order:view'
    -- 仪表盘
    OR p.code = 'dashboard:view'
    -- 个人统计
    OR p.code = 'analytics:personal:view'
    -- 知识库查看
    OR p.code = 'knowledge:base:view'
    OR p.code = 'knowledge:search:use'
  )
ON DUPLICATE KEY UPDATE role_id = role_id;

-- ============================================
-- 第四步：验证配置结果
-- ============================================

-- 查看每个角色的权限数量
SELECT
  r.code AS '角色代码',
  r.name AS '角色名称',
  COUNT(rp.permission_id) AS '权限数量'
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.code, r.name
ORDER BY r.id;

-- 查看各角色的模块权限分布
SELECT
  r.name AS '角色',
  p.module AS '模块',
  COUNT(*) AS '权限数量'
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
GROUP BY r.name, p.module
ORDER BY r.name, p.module;

-- 统计总配置数
SELECT
  '角色总数' AS '统计项',
  COUNT(*) AS '数量'
FROM roles
WHERE status = 1

UNION ALL

SELECT
  '角色权限配置总数',
  COUNT(*)
FROM role_permissions;

COMMIT;

-- ============================================
-- 执行说明
-- ============================================
--
-- 1. 执行前备份数据库:
--    mysqldump -u root -p education_crm > backup_before_role_config.sql
--
-- 2. 执行此脚本:
--    mysql -u root -p education_crm < configure-role-permissions.sql
--
-- 3. 验证结果:
--    - 超级管理员应该有242个权限
--    - 系统管理员应该有约240个权限
--    - 其他角色应该有相应数量的权限
--
-- 4. 如需回滚:
--    -- 恢复备份
--    mysql -u root -p education_crm < backup_before_role_config.sql
--
--    -- 或手动删除配置
--    DELETE FROM role_permissions WHERE role_id IN (
--      SELECT id FROM roles WHERE code IN ('super_admin', 'operator', 'trainer')
--    );
--
-- 5. 测试验证:
--    - 以不同角色登录系统
--    - 验证权限是否生效
--    - 确认无越权访问
--
-- ============================================
