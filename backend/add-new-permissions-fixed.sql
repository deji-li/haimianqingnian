-- ============================================
-- 添加新权限点 - 系统优化Phase 1 (修正版)
-- ============================================
-- 创建时间: 2025-12-26
-- 说明: 为知识库、培训陪练、企业微信、AI功能等模块添加权限控制
-- 执行前请备份数据库！

USE education_crm;

-- ============================================
-- 1. 企业知识库权限 (9个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('knowledge:base:view', '查看知识库', 'knowledge', '查看知识库列表和详情'),
('knowledge:base:create', '创建知识库', 'knowledge', '创建新的知识库'),
('knowledge:base:update', '更新知识库', 'knowledge', '更新知识库信息'),
('knowledge:base:delete', '删除知识库', 'knowledge', '删除知识库'),
('knowledge:document:upload', '上传文档', 'knowledge', '上传文档到知识库'),
('knowledge:search:use', '智能搜索', 'knowledge', '使用智能搜索功能'),
('knowledge:mining:use', '知识挖掘', 'knowledge', '使用知识挖掘功能'),
('knowledge:analytics:view', '知识分析', 'knowledge', '查看知识分析报告'),
('knowledge:feedback:manage', '负反馈管理', 'knowledge', '管理负反馈')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 2. AI培训陪练权限 (12个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('training:script:view', '查看培训剧本', 'training', '查看培训剧本列表'),
('training:script:create', '创建培训剧本', 'training', '创建新的培训剧本'),
('training:script:update', '更新培训剧本', 'training', '更新培训剧本'),
('training:script:delete', '删除培训剧本', 'training', '删除培训剧本'),
('training:session:start', '开始培训会话', 'training', '开始新的培训会话'),
('training:session:view', '查看培训会话', 'training', '查看培训会话记录'),
('training:evaluation:view', '查看培训评估', 'training', '查看培训评估报告'),
('training:persona:manage', '管理客户角色', 'training', '管理客户角色设定'),
('training:analytics:view', '查看培训分析', 'training', '查看培训数据分析'),
('training:record:export', '导出培训记录', 'training', '导出培训记录'),
('training:script:ai-generate', 'AI生成剧本', 'training', '使用AI生成剧本'),
('training:script:publish', '发布剧本', 'training', '发布培训剧本')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 3. 企业微信集成权限 (8个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('wework:config:view', '查看企业微信配置', 'wework', '查看企业微信配置'),
('wework:config:update', '更新企业微信配置', 'wework', '更新企业微信配置'),
('wework:sync:execute', '执行同步', 'wework', '执行企业微信数据同步'),
('wework:sync:logs', '查看同步日志', 'wework', '查看同步日志'),
('wework:contacts:view', '查看联系人', 'wework', '查看企业微信联系人'),
('wework:contacts:import', '导入联系人', 'wework', '导入联系人到CRM'),
('wework:chat:view', '查看聊天记录', 'wework', '查看聊天记录'),
('wework:chat:analysis', '聊天分析', 'wework', '进行聊天分析')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 4. 数据分析权限 (6个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('analytics:dashboard:view', '查看数据看板', 'analytics', '查看数据看板'),
('analytics:personal:view', '查看个人统计', 'analytics', '查看个人统计数据'),
('analytics:team:view', '查看团队统计', 'analytics', '查看团队统计数据'),
('analytics:funnel:view', '查看销售漏斗', 'analytics', '查看销售漏斗'),
('analytics:advanced:use', '高级分析', 'analytics', '使用高级分析功能'),
('analytics:export', '导出分析数据', 'analytics', '导出分析数据')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 5. AI功能权限 (8个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('ai:script:deal-assist', 'AI帮你谈单', 'ai', '使用AI谈单助手'),
('ai:script:reply-assist', 'AI帮你回复', 'ai', '使用AI回复助手'),
('ai:script:opening', '开场白生成', 'ai', '使用AI生成开场白'),
('ai:script:polish', '话术润色', 'ai', '使用AI润色话术'),
('ai:marketing:use', 'AI营销助手', 'ai', '使用AI营销助手'),
('ai:boss:customer-insight', '客户洞察', 'ai', '使用AI客户洞察'),
('ai:boss:staff-quality', '员工质检', 'ai', '使用AI员工质检'),
('ai:tools:ocr', 'OCR识别', 'ai', '使用OCR识别功能')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 6. 系统管理权限补充 (4个)
-- ============================================

INSERT INTO permissions (code, name, module, description) VALUES
('system:ai-config:view', '查看AI配置', 'system', '查看AI配置'),
('system:ai-config:update', '更新AI配置', 'system', '更新AI配置'),
('system:business-config:view', '查看业务配置', 'system', '查看业务配置'),
('system:business-config:update', '更新业务配置', 'system', '更新业务配置')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description);

-- ============================================
-- 验证结果
-- ============================================

-- 查看新增的权限
SELECT
  module AS '权限模块',
  COUNT(*) AS '权限数量'
FROM permissions
WHERE code LIKE 'knowledge:%'
   OR code LIKE 'training:%'
   OR code LIKE 'wework:%'
   OR code LIKE 'analytics:%'
   OR code LIKE 'ai:%'
   OR code IN ('system:ai-config:view', 'system:ai-config:update',
               'system:business-config:view', 'system:business-config:update')
GROUP BY module
ORDER BY module;

-- 显示总数
SELECT '新增权限总数' AS '统计项', COUNT(*) AS '数量'
FROM permissions
WHERE code LIKE 'knowledge:%'
   OR code LIKE 'training:%'
   OR code LIKE 'wework:%'
   OR code LIKE 'analytics:%'
   OR code LIKE 'ai:%'
   OR code IN ('system:ai-config:view', 'system:ai-config:update',
               'system:business-config:view', 'system:business-config:update');

-- ============================================
-- 执行说明
-- ============================================
--
-- 1. 执行前备份数据库:
--    mysqldump -u root -p education_crm > backup_before_permissions.sql
--
-- 2. 执行此脚本:
--    mysql -u root -p education_crm < add-new-permissions-fixed.sql
--
-- 3. 验证结果:
--    - 应该看到6个权限模块
--    - 总计47个新权限
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
