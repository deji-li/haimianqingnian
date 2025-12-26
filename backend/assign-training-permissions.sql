-- 给admin角色（ID=1）分配AI培训陪练的所有权限
-- 权限ID: 214-223

INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 214), -- training:script:view
(1, 215), -- training:script:create
(1, 216), -- training:session:view
(1, 217), -- training:session:create
(1, 218), -- training:session:manage
(1, 219), -- training:session:use
(1, 220), -- training:persona:view
(1, 221), -- training:stats:view
(1, 222), -- training:config:view
(1, 223); -- training:config:manage
