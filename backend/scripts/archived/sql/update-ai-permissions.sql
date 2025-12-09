-- ========================================
-- 添加AI功能权限（v2.0.0新增）
-- ========================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 添加AI功能权限
INSERT IGNORE INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
('ai-chat:view', 'AI聊天分析', 'ai', '查看和使用AI聊天记录分析'),
('ai-knowledge:view', 'AI知识库', 'ai', '查看和使用AI知识库'),
('ai-tools:view', 'AI工具中心', 'ai', '查看和使用AI工具中心'),
('ai-marketing:use', 'AI营销助手', 'ai', '使用AI营销助手生成营销文案'),
('ai-analytics:view', 'AI人效分析', 'ai', '查看AI人效分析看板'),
('ai:report:view', 'AI诊断报告', 'ai', '查看和生成AI诊断报告');

-- 为超级管理员（admin）分配所有新增AI权限
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  1, -- admin role id
  p.id
FROM permissions p
WHERE p.module = 'ai'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = 1
  AND rp.permission_id = p.id
);

-- 为销售经理（sales_manager）分配所有新增AI权限
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  2, -- sales_manager role id
  p.id
FROM permissions p
WHERE p.module = 'ai'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = 2
  AND rp.permission_id = p.id
);

-- 为销售顾问（sales）分配AI查看权限（不包括AI人效分析）
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  3, -- sales role id
  p.id
FROM permissions p
WHERE p.code IN (
  'ai-chat:view',
  'ai-knowledge:view',
  'ai-tools:view',
  'ai-marketing:use',
  'ai:report:view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = 3
  AND rp.permission_id = p.id
);

SELECT '✅ AI功能权限添加成功！' AS message;
