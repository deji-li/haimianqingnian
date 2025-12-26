-- 测试数据导入脚本
-- 用于系统功能测试

USE education_crm;

-- 1. 创建测试用户（如果不存在）
INSERT INTO users (username, real_name, password, phone, email, status, role_id)
VALUES
('test_admin', '测试管理员', '$2b$10$abcdefghijklmnopqrstuvwxyz', '13800138000', 'admin@test.com', 1, 1),
('test_sales', '测试销售', '$2b$10$abcdefghijklmnopqrstuvwxyz', '13800138001', 'sales@test.com', 1, 2),
('test_teacher', '测试老师', '$2b$10$abcdefghijklmnopqrstuvwxyz', '13800138002', 'teacher@test.com', 1, 4)
ON DUPLICATE KEY UPDATE real_name=VALUES(real_name);

-- 2. 创建测试客户
INSERT INTO customers (real_name, phone, age, gender, source, status, intention_level, user_id, created_at, updated_at)
VALUES
('张三', '13900000001', 28, '男', '线上推广', '新客户', 'A', 2, NOW(), NOW()),
('李四', '13900000002', 32, '女', '转介绍', '跟进中', 'B', 2, NOW(), NOW()),
('王五', '13900000003', 25, '男', '地推活动', '意向客户', 'A', 2, NOW(), NOW()),
('赵六', '13900000004', 35, '女', '线上推广', '新客户', 'C', 2, NOW(), NOW()),
('钱七', '13900000005', 30, '男', '老客户推荐', '成交客户', 'A', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE real_name=VALUES(real_name);

-- 3. 创建测试订���
INSERT INTO orders (order_no, customer_id, amount, status, product_name, user_id, created_at, updated_at)
VALUES
('ORD20251226001', 1, 5000.00, 'completed', 'Python入门课程', 2, NOW(), NOW()),
('ORD20251226002', 2, 8000.00, 'pending', 'Java高级课程', 2, NOW(), NOW()),
('ORD20251226003', 3, 3000.00, 'processing', '数据分析基础', 2, NOW(), NOW()),
('ORD20251226004', 5, 12000.00, 'completed', '全栈开发培训', 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- 4. 创建测试老师
INSERT INTO teachers (name, phone, specialty, introduction, status, created_at, updated_at)
VALUES
('张老师', '13800000001', 'Python', '10年Python开发经验', 1, NOW(), NOW()),
('李老师', '13800000002', 'Java', '前阿里巴巴架构师', 1, NOW(), NOW()),
('王老师', '13800000003', '数据分析', '数据科学专家', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. 创建AI配置（测试用）
INSERT INTO ai_prompt_configs (code, name, scenario, technique, system_prompt, variables, is_active, created_at, updated_at)
VALUES
('test_script_mixed', '测试混合话术', '首次沟通', '建立信任', '你是一个专业的销售助手，请根据客户需求生成合适的话术。', '[]', 1, NOW(), NOW()),
('test_marketing_copy', '测试营销文案', '朋友圈营销', '吸引关注', '生成吸引人的营销文案。', '[]', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. 创建企业知识库测试数据
INSERT INTO enterprise_knowledge_base (title, category, content, tags, quality_score, priority, status, created_at, updated_at)
VALUES
('Python课程介绍', '产品知识', 'Python是一种广泛使用的高级编程语言，适合初学者学习。', 'Python,课程,编程', 90, 10, 'active', NOW(), NOW()),
('Java课程大纲', '产品知识', 'Java课程涵盖基础语法、面向对象、集合框架、IO流、多线程等内容。', 'Java,课程,大纲', 85, 9, 'active', NOW(), NOW()),
('销售话术模板', '销售技巧', '您好，我是XX教育的课程顾问，请问您对编程感兴趣吗？', '话术,销售', 80, 8, 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- 7. 创建培训陪练测试数据
INSERT INTO training_scripts (title, scenario, difficulty, source_type, customer_background, training_goal, key_objections, standard_scripts, dialogue_flow, max_rounds, status, created_at, updated_at)
VALUES
('首次沟通训练', 'first_contact', '普通', 'AI生成', '30岁女性，想转行学编程', '建立信任，了解需求', '["时间不够", "担心学不会"]', '{"开场": "您好，我是课程顾问"}', '{}', 6, 'published', NOW(), NOW()),
('价格谈判训练', 'price_negotiation', '困难', 'AI生成', '35岁男性，想提升技能但预算有限', '展示价值，促成报名', '["价格太贵", "再考虑一下"]', '{"开场": "我理解您的顾虑"}', '{}', 8, 'published', NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. 创建客户角色测试数据
INSERT INTO customer_personas (name, gender, age_range, personality_type, communication_style, decision_making_style, typical_objections, budget_range, purchase_intent, created_at, updated_at)
VALUES
('谨慎型客户', '女', '25-35', '谨慎型', '详细询问', '理性决策', '["需要考虑", "对比其他"]', '5000-10000', '中等', NOW(), NOW()),
('冲动型客户', '男', '20-30', '热情型', '快速决策', '感性决策', '["现在就要"]', '10000-20000', '高', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. 创建AI营销场景测试数据
INSERT INTO ai_marketing_scenarios (name, description, target_audience, content_type, template_id, is_active, created_at, updated_at)
VALUES
('朋友圈推广', '用于微信朋友圈的课程推广文案', '转行人群', '文本', 1, 1, NOW(), NOW()),
('短视频脚本', '抖音/快手等短视频平台的营销脚本', '零基础学员', '视频', 2, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 10. 更新用户权限（确保测试用户有权限）
-- 为测试用户分配超级管理员角色（拥有所有权限）
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username IN ('test_admin', 'test_sales', 'test_teacher')
AND r.code = 'super_admin'
ON DUPLICATE KEY UPDATE user_id=user_id;

-- 显示导入结果
SELECT '测试数据导入完成！' as message;
SELECT COUNT(*) as user_count FROM users WHERE username LIKE 'test_%';
SELECT COUNT(*) as customer_count FROM customers WHERE phone LIKE '139000%';
SELECT COUNT(*) as order_count FROM orders WHERE order_no LIKE 'ORD20251226%';
SELECT COUNT(*) as teacher_count FROM teachers WHERE phone LIKE '13800000%';
SELECT COUNT(*) as knowledge_count FROM enterprise_knowledge_base WHERE tags LIKE '%测试%';
