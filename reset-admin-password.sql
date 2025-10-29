-- 重置admin密码为 123456
USE education_crm;

-- 更新admin用户的密码
UPDATE users SET password = '$2b$10$44E7McQ/M/X8BooxGksJge4ip7XcgiMdu5zkZ/nBLN3i8NvPbulPC' WHERE username = 'admin';

-- 验证更新
SELECT id, username, real_name, phone, email, role_id, status
FROM users
WHERE username = 'admin';

SELECT '✅ admin密码已重置为: 123456' as message;
