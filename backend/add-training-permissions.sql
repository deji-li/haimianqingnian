-- 添加AI培训陪练系统所需权限
-- 并分配给admin角色（ID=1）

-- 插入training模块的权限
INSERT INTO permissions (code, name, module, description, parent_id, status, create_time, update_time) VALUES
('training:script:view', '查看培训剧本', 'training', '查看培训剧本列表', NULL, 1, NOW(), NOW()),
('training:script:create', '创建培训剧本', 'training', '创建新的培训剧本', NULL, 1, NOW(), NOW()),
('training:session:view', '查看培训会话', 'training', '查看培训会话', NULL, 1, NOW(), NOW()),
('training:session:create', '创建培训会话', 'training', '创建新的培训会话', NULL, 1, NOW(), NOW()),
('training:session:manage', '管理培训会话', 'training', '管理培训会话（开始、暂停、恢复、结束）', NULL, 1, NOW(), NOW()),
('training:session:use', '使用培训会话', 'training', '使用培训会话进行角色扮演', NULL, 1, NOW(), NOW()),
('training:persona:view', '查看客户角色', 'training', '查看客户角色列表', NULL, 1, NOW(), NOW()),
('training:stats:view', '查看培训统计', 'training', '查看培训统计数据', NULL, 1, NOW(), NOW()),
('training:config:view', '查看培训配置', 'training', '查看AI培训配置', NULL, 1, NOW(), NOW()),
('training:config:manage', '管理培训配置', 'training', '管理AI培训配置', NULL, 1, NOW(), NOW());

-- 获取刚插入的权限ID并分配给admin角色
-- 注意：这里假设权限ID从60开始（因为现有ID最大是59）
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 60),  -- training:script:view
(1, 61),  -- training:script:create
(1, 62),  -- training:session:view
(1, 63),  -- training:session:create
(1, 64),  -- training:session:manage
(1, 65),  -- training:session:use
(1, 66),  -- training:persona:view
(1, 67),  -- training:stats:view
(1, 68),  -- training:config:view
(1, 69);  -- training:config:manage

-- 也可以分配给销售主管角色（ID=2），让他们可以使用培训功能
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 60),  -- training:script:view
(2, 62),  -- training:session:view
(2, 63),  -- training:session:create
(2, 65),  -- training:session:use
(2, 66),  -- training:persona:view
(2, 67);  -- training:stats:view
