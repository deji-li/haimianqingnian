-- ============================================
-- 添加新权限点 - 系统优化Phase 1
-- ============================================
-- 创建时间: 2025-12-26
-- 说明: 为知识库、培训陪练、企业微信、AI功能等模块添加权限控制
-- 执行前请备份数据库！

USE education_crm;

-- ============================================
-- 1. 企业知识库权限 (9个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('knowledge:base:view', '查看知识库', '企业知识库', '查看知识库列表和详情', NOW(), NOW()),
('knowledge:base:create', '创建知识库', '企业知识库', '创建新的知识库', NOW(), NOW()),
('knowledge:base:update', '更新知识库', '企业知识库', '更新知识库信息', NOW(), NOW()),
('knowledge:base:delete', '删除知识库', '企业知识库', '删除知识库', NOW(), NOW()),
('knowledge:document:upload', '上传文档', '企业知识库', '上传文档到知识库', NOW(), NOW()),
('knowledge:search:use', '智能搜索', '企业知识库', '使用智能搜索功能', NOW(), NOW()),
('knowledge:mining:use', '知识挖掘', '企业知识库', '使用知识挖掘功能', NOW(), NOW()),
('knowledge:analytics:view', '知识分析', '企业知识库', '查看知识分析报告', NOW(), NOW()),
('knowledge:feedback:manage', '负反馈管理', '企业知识库', '管理负反馈', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 2. AI培训陪练权限 (12个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('training:script:view', '查看培训剧本', 'AI培训陪练', '查看培训剧本列表', NOW(), NOW()),
('training:script:create', '创建培训剧本', 'AI培训陪练', '创建新的培训剧本', NOW(), NOW()),
('training:script:update', '更新培训剧本', 'AI培训陪练', '更新培训剧本', NOW(), NOW()),
('training:script:delete', '删除培训剧本', 'AI培训陪练', '删除培训剧本', NOW(), NOW()),
('training:session:start', '开始培训会话', 'AI培训陪练', '开始新的培训会话', NOW(), NOW()),
('training:session:view', '查看培训会话', 'AI培训陪练', '查看培训会话记录', NOW(), NOW()),
('training:evaluation:view', '查看培训评估', 'AI培训陪练', '查看培训评估报告', NOW(), NOW()),
('training:persona:manage', '管理客户角色', 'AI培训陪练', '管理客户角色设定', NOW(), NOW()),
('training:analytics:view', '查看培训分析', 'AI培训陪练', '查看培训数据分析', NOW(), NOW()),
('training:record:export', '导出培训记录', 'AI培训陪练', '导出培训记录', NOW(), NOW()),
('training:script:ai-generate', 'AI生成剧本', 'AI培训陪练', '使用AI生成剧本', NOW(), NOW()),
('training:script:publish', '发布剧本', 'AI培训陪练', '发布培训剧本', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 3. 企业微信集成权限 (8个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('wework:config:view', '查看企业微信配置', '企业微信', '查看企业微信配置', NOW(), NOW()),
('wework:config:update', '更新企业微信配置', '企业微信', '更新企业微信配置', NOW(), NOW()),
('wework:sync:execute', '执行同步', '企业微信', '执行企业微信数据同步', NOW(), NOW()),
('wework:sync:logs', '查看同步日志', '企业微信', '查看同步日志', NOW(), NOW()),
('wework:contacts:view', '查看联系人', '企业微信', '查看企业微信联系人', NOW(), NOW()),
('wework:contacts:import', '导入联系人', '企业微信', '导入联系人到CRM', NOW(), NOW()),
('wework:chat:view', '查看聊天记录', '企业微信', '查看聊天记录', NOW(), NOW()),
('wework:chat:analysis', '聊天分析', '企业微信', '进行聊天分析', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 4. 数据分析权限 (6个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('analytics:dashboard:view', '查看数据看板', '数据分析', '查看数据看板', NOW(), NOW()),
('analytics:personal:view', '查看个人统计', '数据分析', '查看个人统计数据', NOW(), NOW()),
('analytics:team:view', '查看团队统计', '数据分析', '查看团队统计数据', NOW(), NOW()),
('analytics:funnel:view', '查看销售漏斗', '数据分析', '查看销售漏斗', NOW(), NOW()),
('analytics:advanced:use', '高级分析', '数据分析', '使用高级分析功能', NOW(), NOW()),
('analytics:export', '导出分析数据', '数据分析', '导出分析数据', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 5. AI功能权限 (8个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('ai:script:deal-assist', 'AI帮你谈单', 'AI话术助手', '使用AI谈单助手', NOW(), NOW()),
('ai:script:reply-assist', 'AI帮你回复', 'AI话术助手', '使用AI回复助手', NOW(), NOW()),
('ai:script:opening', '开场白生成', 'AI话术助手', '使用AI生成开场白', NOW(), NOW()),
('ai:script:polish', '话术润色', 'AI话术助手', '使用AI润色话术', NOW(), NOW()),
('ai:marketing:use', 'AI营销助手', 'AI营销', '使用AI营销助手', NOW(), NOW()),
('ai:boss:customer-insight', '客户洞察', 'AI老板助手', '使用AI客户洞察', NOW(), NOW()),
('ai:boss:staff-quality', '员工质检', 'AI老板助手', '使用AI员工质检', NOW(), NOW()),
('ai:tools:ocr', 'OCR识别', 'AI工具', '使用OCR识别功能', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 6. 系统管理权限补充 (4个)
-- ============================================

INSERT INTO permissions (code, name, category, description, created_at, updated_at) VALUES
('system:ai-config:view', '查看AI配置', '系统管理', '查看AI配置', NOW(), NOW()),
('system:ai-config:update', '更新AI配置', '系统管理', '更新AI配置', NOW(), NOW()),
('system:business-config:view', '查看业务配置', '系统管理', '查看业务配置', NOW(), NOW()),
('system:business-config:update', '更新业务配置', '系统管理', '更新业务配置', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

-- ============================================
-- 验证结果
-- ============================================

-- 查看新增的权限
SELECT
  category AS '权限类别',
  COUNT(*) AS '权限数量'
FROM permissions
WHERE code IN (
  -- 知识库
  'knowledge:base:view', 'knowledge:base:create', 'knowledge:base:update', 'knowledge:base:delete',
  'knowledge:document:upload', 'knowledge:search:use', 'knowledge:mining:use',
  'knowledge:analytics:view', 'knowledge:feedback:manage',
  -- 培训陪练
  'training:script:view', 'training:script:create', 'training:script:update', 'training:script:delete',
  'training:session:start', 'training:session:view', 'training:evaluation:view',
  'training:persona:manage', 'training:analytics:view', 'training:record:export',
  'training:script:ai-generate', 'training:script:publish',
  -- 企业微信
  'wework:config:view', 'wework:config:update', 'wework:sync:execute', 'wework:sync:logs',
  'wework:contacts:view', 'wework:contacts:import', 'wework:chat:view', 'wework:chat:analysis',
  -- 数据分析
  'analytics:dashboard:view', 'analytics:personal:view', 'analytics:team:view',
  'analytics:funnel:view', 'analytics:advanced:use', 'analytics:export',
  -- AI功能
  'ai:script:deal-assist', 'ai:script:reply-assist', 'ai:script:opening', 'ai:script:polish',
  'ai:marketing:use', 'ai:boss:customer-insight', 'ai:boss:staff-quality', 'ai:tools:ocr',
  -- 系统管理
  'system:ai-config:view', 'system:ai-config:update',
  'system:business-config:view', 'system:business-config:update'
)
GROUP BY category
ORDER BY category;

-- 显示总数
SELECT '新增权限总数' AS '统计项', COUNT(*) AS '数量'
FROM permissions
WHERE code LIKE 'knowledge:%'
   OR code LIKE 'training:%'
   OR code LIKE 'wework:%'
   OR (code LIKE 'analytics:%' AND code NOT IN ('analytics:view'))
   OR (code LIKE 'ai:%' AND code NOT IN ('ai:use'))
   OR code IN ('system:ai-config:view', 'system:ai-config:update',
               'system:business-config:view', 'system:business-config:update');

COMMIT;

-- ============================================
-- 执行说明
-- ============================================
--
-- 1. 执行前备份数据库:
--    mysqldump -u root -p education_crm > backup_before_permissions.sql
--
-- 2. 执行此脚本:
--    mysql -u root -p education_crm < add-new-permissions.sql
--
-- 3. 验证结果:
--    - 应该看到6个权限类别
--    - 总计约47个新权限
--
-- 4. 如需回滚:
--    DELETE FROM permissions WHERE code LIKE 'knowledge:%';
--    DELETE FROM permissions WHERE code LIKE 'training:%';
--    DELETE FROM permissions WHERE code LIKE 'wework:%';
--    DELETE FROM permissions WHERE code LIKE 'analytics:%' AND code != 'analytics:view';
--    DELETE FROM permissions WHERE code LIKE 'ai:%' AND code != 'ai:use';
--    DELETE FROM permissions WHERE code IN ('system:ai-config:view', 'system:ai-config:update',
--                                            'system:business-config:view', 'system:business-config:update');
--
-- ============================================
