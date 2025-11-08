-- 添加AI分析得到的客户画像字段到customers表

-- 学生信息
ALTER TABLE `customers`
ADD COLUMN `student_grade` VARCHAR(50) NULL COMMENT '学生年级' AFTER `remark`,
ADD COLUMN `student_age` INT NULL COMMENT '学生年龄' AFTER `student_grade`;

-- 家庭信息
ALTER TABLE `customers`
ADD COLUMN `family_economic_level` ENUM('高', '中', '低') NULL COMMENT '家庭经济水平' AFTER `student_age`,
ADD COLUMN `decision_maker_role` VARCHAR(100) NULL COMMENT '决策角色' AFTER `family_economic_level`,
ADD COLUMN `parent_role` VARCHAR(50) NULL COMMENT '家长身份' AFTER `decision_maker_role`;

-- 地理位置
ALTER TABLE `customers`
ADD COLUMN `location` VARCHAR(100) NULL COMMENT '所在地区' AFTER `parent_role`;

-- 商机评估
ALTER TABLE `customers`
ADD COLUMN `estimated_value` DECIMAL(10,2) NULL COMMENT '预估成交金额' AFTER `location`,
ADD COLUMN `quality_level` ENUM('A', 'B', 'C', 'D') NULL COMMENT 'AI评估质量等级' AFTER `estimated_value`;

-- AI分析的详细信息（JSON格式存储）
ALTER TABLE `customers`
ADD COLUMN `ai_profile` JSON NULL COMMENT 'AI分析的客户画像（需求、痛点、兴趣等）' AFTER `quality_level`;

-- 最后分析时间
ALTER TABLE `customers`
ADD COLUMN `last_ai_analysis_time` DATETIME NULL COMMENT '最后一次AI分析时间' AFTER `ai_profile`;
