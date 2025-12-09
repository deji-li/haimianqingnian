-- ========================================
-- 完整更新AI功能权限
-- ========================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 删除旧的不匹配的权限
DELETE FROM `permissions` WHERE `code` LIKE 'ai-%';

-- 添加完整的AI功能权限
INSERT IGNORE INTO `permissions` (`code`, `name`, `module`, `description`) VALUES
-- AI聊天分析权限
('ai:chat:view', 'AI聊天记录查看', 'ai', '查看AI聊天记录分析'),
('ai:chat:upload', 'AI聊天记录上传', 'ai', '上传聊天截图进行分析'),
('ai:chat:delete', 'AI聊天记录删除', 'ai', '删除聊天记录'),

-- AI知识库权限
('ai:knowledge:view', 'AI知识库查看', 'ai', '查看AI知识库内容'),
('ai:knowledge:create', 'AI知识库创建', 'ai', '创建知识库条目'),
('ai:knowledge:edit', 'AI知识库编辑', 'ai', '编辑知识库内容'),
('ai:knowledge:delete', 'AI知识库删除', 'ai', '删除知识库条目'),

-- AI工具权限
('ai:script:view', 'AI话术库查看', 'ai', '查看AI话术库'),
('ai:script:use', 'AI话术库使用', 'ai', '使用AI话术生成'),
('ai:risk:view', 'AI风险预警查看', 'ai', '查看AI风险预警'),
('ai:risk:handle', 'AI风险处理', 'ai', '处理风险预警'),
('ai:recovery:view', 'AI挽回建议查看', 'ai', '查看AI挽回建议'),
('ai:training:use', 'AI培训使用', 'ai', '使用AI培训功能'),

-- AI营销权限
('ai:marketing:view', 'AI营销查看', 'ai', '查看AI营销内容'),
('ai:marketing:use', 'AI营销使用', 'ai', '使用AI营销助手'),

-- AI人效分析权限
('ai:analytics:view', 'AI人效分析查看', 'ai', '查看AI人效分析'),

-- AI诊断报告权限
('ai:report:view', 'AI报告查看', 'ai', '查看AI诊断报告'),
('ai:report:generate', 'AI报告生成', 'ai', '生成AI诊断报告');

-- 为超级管理员（admin）分配所有AI权限
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

-- 为销售经理（sales_manager）分配所有AI权限
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

-- 为销售顾问（sales）分配查看和使用权限（不包括删除、编辑等管理权限）
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT
  3, -- sales role id
  p.id
FROM permissions p
WHERE p.code IN (
  'ai:chat:view',
  'ai:chat:upload',
  'ai:knowledge:view',
  'ai:script:view',
  'ai:script:use',
  'ai:risk:view',
  'ai:recovery:view',
  'ai:training:use',
  'ai:marketing:view',
  'ai:marketing:use',
  'ai:report:view'
)
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp
  WHERE rp.role_id = 3
  AND rp.permission_id = p.id
);

SELECT '✅ AI功能权限更新成功！' AS message;
SELECT COUNT(*) AS '新增权限数量' FROM permissions WHERE module = 'ai';
