-- 企业知识库修复脚本
-- 修复数据库结构和数据映射问题

-- 1. 检查并创建企业知识库相关表
CREATE TABLE IF NOT EXISTS `enterprise_knowledge_base` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '知识标题/问题',
  `content` TEXT NOT NULL COMMENT '知识内容/答案',
  `keywords` VARCHAR(500) NULL COMMENT '关键词(逗号分隔)',
  `summary` VARCHAR(500) NULL COMMENT 'AI生成的摘要',

  -- 4维度分���
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `product_category` VARCHAR(50) NULL COMMENT '产品分类',
  `customer_type` VARCHAR(50) NULL COMMENT '客户类型',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',

  -- AI相关评分
  `relevance_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI相关度评分(0-100)',
  `quality_score` DECIMAL(5,2) DEFAULT 0 COMMENT '内容质量评分(0-100)',

  -- 使用统计
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `positive_feedback_count` INT DEFAULT 0 COMMENT '正反馈次数',
  `negative_feedback_count` INT DEFAULT 0 COMMENT '负反馈次数',
  `last_used_time` DATETIME NULL COMMENT '最后使用时间',

  -- 来源信息
  `source_type` ENUM('manual', 'ai_mining', 'industry_recommend', 'file_import') DEFAULT 'manual',
  `source_id` INT NULL COMMENT '来源记录ID',
  `creator_id` INT NULL COMMENT '创建人ID',

  -- 状态管理
  `status` ENUM('active', 'inactive', 'pending_review', 'auto_disabled') DEFAULT 'active',
  `priority` INT DEFAULT 0 COMMENT '优先级(0-100)',

  -- 关联产品
  `related_product_ids` JSON NULL COMMENT '关联的产品ID列表',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 索引
  INDEX `idx_scene_category` (`scene_category`),
  INDEX `idx_product_category` (`product_category`),
  INDEX `idx_customer_type` (`customer_type`),
  INDEX `idx_question_type` (`question_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_source_type` (`source_type`),
  INDEX `idx_quality_score` (`quality_score`),
  INDEX `idx_usage_count` (`usage_count`),
  FULLTEXT INDEX `idx_search_content` (`title`, `content`, `keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业知识库主表';

-- 2. 检查并创建知识库待审核表
CREATE TABLE IF NOT EXISTS `knowledge_pending_review` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `question` VARCHAR(500) NOT NULL COMMENT '挖掘的问题',
  `answer` TEXT NOT NULL COMMENT '挖掘的答案',
  `keywords` VARCHAR(500) NULL COMMENT 'AI提取的关键词',

  -- 4维度分类(AI自动分类)
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `product_category` VARCHAR(50) NULL COMMENT '产品分类',
  `customer_type` VARCHAR(50) NULL COMMENT '客户类型',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',

  -- AI评分
  `ai_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI质量评分(0-100)',
  `confidence_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI置信度(0-100)',

  -- 来源信息
  `source_type` ENUM('chat_mining', 'industry_recommend') NULL COMMENT '来源类型',
  `source_chat_record_id` INT NULL COMMENT '来源聊天记录ID',
  `mining_reason` TEXT NULL COMMENT '挖掘理由',

  -- 审核状态
  `review_status` ENUM('pending', 'approved', 'rejected', 'auto_approved') DEFAULT 'pending',
  `reviewer_id` INT NULL COMMENT '审核人ID',
  `review_time` DATETIME NULL COMMENT '审核时间',
  `review_comment` VARCHAR(500) NULL COMMENT '审核意见',

  -- 批次信息
  `mining_batch_id` VARCHAR(50) NULL COMMENT '挖掘批次ID',
  `mining_time` DATETIME NULL COMMENT '挖掘时间',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 索引
  INDEX `idx_review_status` (`review_status`),
  INDEX `idx_ai_score` (`ai_score`),
  INDEX `idx_mining_batch` (`mining_batch_id`),
  INDEX `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI挖掘待审核表';

-- 3. 检查并创建行业问题库表
CREATE TABLE IF NOT EXISTS `industry_question_library` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,

  -- 行业分类
  `industry_name` VARCHAR(100) NOT NULL COMMENT '行业名称',
  `industry_sub_category` VARCHAR(100) NULL COMMENT '行业细分',

  -- 问答内容
  `question` VARCHAR(500) NOT NULL COMMENT '常见问题',
  `answer_template` TEXT NULL COMMENT '答案模板(可包含变量)',

  -- 分类
  `scene_category` VARCHAR(50) NULL COMMENT '场景分类',
  `question_type` VARCHAR(50) NULL COMMENT '问题类型',

  -- 来源
  `source_type` ENUM('system_preset', 'ai_generate') DEFAULT 'system_preset',

  -- 使用统计
  `usage_count` INT DEFAULT 0 COMMENT '被使用次数',

  -- 状态
  `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- 索引
  INDEX `idx_industry` (`industry_name`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='行业问题库表';

-- 4. 检查并创建企业基本信息表
CREATE TABLE IF NOT EXISTS `enterprise_basic_info` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_name` VARCHAR(200) NULL COMMENT '公司名称',
  `industry` VARCHAR(100) NULL COMMENT '所属行业',
  `business_scope` TEXT NULL COMMENT '经营范围',
  `products` JSON NULL COMMENT '产品列表',
  `basic_info` TEXT NULL COMMENT '企业基本信息',
  `creator_id` INT NULL COMMENT '创建人ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_company_name` (`company_name`),
  INDEX `idx_industry` (`industry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业基本信息表';

-- 5. 检查并创建知识库反馈表
CREATE TABLE IF NOT EXISTS `knowledge_feedback` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `knowledge_id` INT NOT NULL COMMENT '知识库ID',
  `user_id` INT NULL COMMENT '用户ID',
  `feedback_type` ENUM('positive', 'negative') NOT NULL COMMENT '反馈类型',
  `feedback_reason` TEXT NULL COMMENT '反馈原因',
  `feedback_context` JSON NULL COMMENT '反馈上下文',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_knowledge_id` (`knowledge_id`),
  INDEX `idx_feedback_type` (`feedback_type`),
  FOREIGN KEY (`knowledge_id`) REFERENCES `enterprise_knowledge_base`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库反馈表';

-- 6. 检查并创建知识库使用日志表
CREATE TABLE IF NOT EXISTS `knowledge_usage_log` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NULL COMMENT '用户ID',
  `customer_id` INT NULL COMMENT '客户ID',
  `knowledge_id` INT NULL COMMENT '知识库ID',
  `function_type` ENUM('AI_ASSISTANT', 'CUSTOMER_ANALYSIS', 'MARKETTING_ADVICE', 'KNOWLEDGE_MINING') NULL COMMENT '使用功能',
  `query` TEXT NULL COMMENT '查询内容',
  `response` TEXT NULL COMMENT 'AI响应内容',
  `has_knowledge` BOOLEAN DEFAULT FALSE COMMENT '是否使用了知识库',
  `response_strategy` ENUM('KNOWLEDGE_BASED', 'KNOWLEDGE_ENHANCED', 'GENERAL_AI') NULL COMMENT '响应策略',
  `confidence` DECIMAL(3,2) NULL COMMENT '置信度(0-1)',
  `usage_time` DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_knowledge_id` (`knowledge_id`),
  INDEX `idx_function_type` (`function_type`),
  INDEX `idx_usage_time` (`usage_time`),
  FOREIGN KEY (`knowledge_id`) REFERENCES `enterprise_knowledge_base`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库使用日志表';

-- 7. 修复字段映射问题
-- 确保enterprise_knowledge_base表的source_id字段正确映射
ALTER TABLE `enterprise_knowledge_base`
ADD COLUMN `source_id` INT NULL COMMENT '来源记录ID(如chat_record_id)' AFTER `source_type`;

-- 8. 添加缺失的外键约束
-- 注意：MySQL不支持IF NOT EXISTS语法，这里使用先检查的方式
SET @constraint_exists = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE constraint_schema = DATABASE()
    AND table_name = 'enterprise_knowledge_base'
    AND constraint_name = 'fk_enterprise_knowledge_creator'
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `enterprise_knowledge_base` ADD CONSTRAINT `fk_enterprise_knowledge_creator` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL',
    'SELECT "Constraint already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. 插入初始行业问题数据
INSERT IGNORE INTO `industry_question_library`
(`industry_name`, `industry_sub_category`, `question`, `answer_template`, `scene_category`, `question_type`, `source_type`) VALUES
('教育', 'K12教育', '你们的教育理念是什么？', '我们秉承【个性化教育】的理念，注重【因材施教】，通过【科学的评估体系】为每个学生制定专属的学习计划。', '企业介绍', '理念咨询', 'system_preset'),
('教育', 'K12教育', '课程收费标准如何？', '我们的课程收费根据【课程类型】和【课时长度】而定：\n1. 【一对一课程】：【具体价格】元/小时\n2. 【小组课程】：【具体价格】元/小时\n3. 【班级课程】：【具体价格】元/月\n\n具体价格请咨询课程顾问。', '价格咨询', '费用咨询', 'system_preset'),
('教育', 'K12教育', '师资力量怎么样？', '我们的师资团队由【资深教师】组成：\n- 【教学经验】：平均【X】年以上教学经验\n- 【学历背景】：【本科】及以上学历，【X】%拥有研究生学历\n- **专业认证**：【相关教师资格证】持有率【X】%\n- **培训体系**：定期参加【专业培训】和【教研活动】', '师资咨询', '教学咨询', 'system_preset'),
('教育', 'K12教育', '学习效果如何保证？', '我们通过【多维保障体系】确保学习效果：\n1. **个性化方案**：基于【入学测评】制定【个性化学习计划】\n2. **过程监控**：【定期测评】+【学习报告】+【家长沟通】\n3. **师资保障**：【专业教师】+【教学督导】+【质量监控】\n4. **效果承诺**：【不满意免费重读】+【学习效果保障】', '效果咨询', '服务保障', 'system_preset'),
('教育', 'K12教育', '试听课怎么安排？', '试听课安排流程：\n1. **预约**：通过【电话/微信】预约试听时间\n2. **评估**：【专业老师】进行【水平测评】\n3. **试听**：【45分钟】试听课程，【体验教学风格】\n4. **反馈**：试听结束后提供【学习建议】和【课程方案】\n\n试听完全【免费】，不收取任何费用。', '体验咨询', '课程咨询', 'system_preset');

-- 10. 插入示例企业基本信息
INSERT IGNORE INTO `enterprise_basic_info`
(`company_name`, `industry`, `business_scope`, `products`, `creator_id`) VALUES
('示例教育机构', '教育培训', '专注于K12教育、素质教育、职业教育',
 JSON_ARRAY('学科辅导', '素质教育', '艺术培训', '国际课程'), 1);

-- 11. 创建默认知识库数据
INSERT IGNORE INTO `enterprise_knowledge_base`
(`title`, `content`, `scene_category`, `product_category`, `customer_type`, `question_type`, `source_type`, `creator_id`, `priority`, `quality_score`) VALUES
('关于我们', '【机构名称】是一家专注于【K12教育】的专业教育机构，致力于为学生提供【高质量】的教育服务。', '企业介绍', '通用', '全部客户', '企业信息', 'manual', 1, 80, 90),
('联系我们', '📞 联系电话：【电话号码】\n📍 校区地址：【详细地址】\n🕐 营业时间：【营业时间】\n🌐 官方网站：【网站地址】', '服务咨询', '通用', '全部客户', '联系方式', 'manual', 1, 70, 85);

-- 执行完成提示
SELECT '企业知识库数据库结构修复完成！' AS status;