-- 完全禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 删除旧的技巧数据
DELETE FROM ai_script_technique;

-- 删除旧的场景数据
DELETE FROM ai_script_scenario;

-- 插入场景数据
INSERT INTO ai_script_scenario (function_type, scenario_name, scene_category, scenario_desc, sort_order, is_active) VALUES
-- 帮你谈单 - 9个场景
('deal_assist', '产品介绍', 'GENERAL_GUIDE', '向客户介绍产品特性和价值', 1, 1),
('deal_assist', '破除犹豫', 'OBJECTION_HANDLING', '帮助客户克服购买犹豫', 2, 1),
('deal_assist', '建立信任', 'GENERAL_GUIDE', '建立客户信任关系', 3, 1),
('deal_assist', '挖掘需求', 'GENERAL_GUIDE', '深入了解客户真实需求', 4, 1),
('deal_assist', '塑造价值', 'GENERAL_GUIDE', '突出产品价值和竞争优势', 5, 1),
('deal_assist', '异议处理', 'OBJECTION_HANDLING', '处理客户的各种异议', 6, 1),
('deal_assist', '价格谈判', 'OBJECTION_HANDLING', '处理价格相关的谈判', 7, 1),
('deal_assist', '应对拒绝', 'OBJECTION_HANDLING', '妥善应对客户拒绝', 8, 1),
('deal_assist', '促成交易', 'GENERAL_GUIDE', '最终促成交易完成', 9, 1),

-- 帮你回复 - 使用相同的9个场景
('reply_assist', '产品介绍', 'GENERAL_GUIDE', '回复客户关于产品的问题', 1, 1),
('reply_assist', '破除犹豫', 'OBJECTION_HANDLING', '消除客户购买犹豫的回复', 2, 1),
('reply_assist', '建立信任', 'GENERAL_GUIDE', '通过回复建立信任关系', 3, 1),
('reply_assist', '挖掘需求', 'GENERAL_GUIDE', '通过回复了解客户需求', 4, 1),
('reply_assist', '塑造价值', 'GENERAL_GUIDE', '通过回复展示产品价值', 5, 1),
('reply_assist', '异议处理', 'OBJECTION_HANDLING', '回复客户的异议和疑虑', 6, 1),
('reply_assist', '价格谈判', 'OBJECTION_HANDLING', '回复客户关于价格的问题', 7, 1),
('reply_assist', '应对拒绝', 'OBJECTION_HANDLING', '应对客户拒绝的回复话术', 8, 1),
('reply_assist', '促成交易', 'GENERAL_GUIDE', '通过回复促成交', 9, 1),

-- 开场白生成 - 10个场景
('opening_lines', '祝福问候', 'GENERAL_GUIDE', '发送祝福和问候语', 1, 1),
('opening_lines', '自我介绍', 'GENERAL_GUIDE', '专业地介绍自己和产品', 2, 1),
('opening_lines', '需求探询', 'GENERAL_GUIDE', '探索客户需求的提问', 3, 1),
('opening_lines', '消除顾虑', 'OBJECTION_HANDLING', '提前消除客户的顾虑', 4, 1),
('opening_lines', '互动提问', 'GENERAL_GUIDE', '引发互动的提问方式', 5, 1),
('opening_lines', '传达价值', 'GENERAL_GUIDE', '快速传达产品价值', 6, 1),
('opening_lines', '挖掘兴趣', 'GENERAL_GUIDE', '激发客户兴趣的表达', 7, 1),
('opening_lines', '分享趋势', 'GENERAL_GUIDE', '分享行业趋势和见解', 8, 1),
('opening_lines', '引导深入', 'GENERAL_GUIDE', '引导客户深入交流', 9, 1),
('opening_lines', '情感链接', 'GENERAL_GUIDE', '建立情感连接的表达', 10, 1);

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 插入技巧数据（只插入几个作为示例）
INSERT INTO ai_script_technique (scenario_id, technique_name, technique_desc, prompt_template, sort_order, is_active) VALUES
-- 产品介绍场景 (deal_assist, scenario_id=1)
(1, '产品亮点', '突出产品独特优势的话术', '突出产品的核心优势和独特卖点', 1, 1),
(1, '需求匹配', '用客户需求匹配产品功能优势的话术', '将客户需求与产品功能精准匹配', 2, 1),
(1, '竞品对比', '对比竞品差异，凸显优势的话术', '客观对比同类产品，突出我方优势', 3, 1),

-- 建立信任场景 (deal_assist, scenario_id=3)
(3, '专业介绍', '用专业知识讲解产品的话术', '使用专业术语展示产品价值', 1, 1),
(3, '分享案例', '分享成功案例促成交的话术', '分享真实案例证明产品价值', 2, 1),
(3, '共鸣话题', '用共同点痛点拉近关系的话术', '寻找共同经历建立情感连接', 3, 1),

-- 祝福问候场景 (opening_lines, scenario_id=19)
(19, '工作祝福', '个性化祝贺客户职业成就的话术', '根据客户职业背景给予真诚祝福', 1, 1),
(19, '健康祝愿', '传递健康祝愿，加深客户情感联系的话术', '表达对客户健康的美好祝愿', 2, 1),
(19, '家庭幸福', '传递家庭幸福祝愿的话术', '祝福客户家庭幸福', 3, 1);

SELECT '✅ 数据更新完成！' as result;