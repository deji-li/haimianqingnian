-- ========================================
-- 企业知识库业务数据表创建脚本
-- 创建时间: 2025-01-15
-- 用途: 创建企业知识库所需的6个业务数据表
-- ========================================

-- ========================================
-- 表1: enterprise_knowledge_base - 企业知识库主表
-- ========================================
CREATE TABLE IF NOT EXISTS `enterprise_knowledge_base` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 基本信息
  `title` VARCHAR(200) NOT NULL COMMENT '知识标题/问题',
  `content` TEXT NOT NULL COMMENT '知识内容/答案',
  `keywords` VARCHAR(500) COMMENT '关键词(逗号分隔)',
  `summary` VARCHAR(500) COMMENT 'AI生成的摘要',

  -- 4维度分类
  `scene_category` VARCHAR(50) COMMENT '场景分类:首次沟通|产品介绍|价格咨询|异议处理|售后服务|其他',
  `product_category` VARCHAR(50) COMMENT '产品分类:产品ID或分类名',
  `customer_type` VARCHAR(50) COMMENT '客户类型:新客|老客|高意向|中意向|低意向',
  `question_type` VARCHAR(50) COMMENT '问题类型:产品问题|价格问题|服务问题|效果问题|师资问题|其他',

  -- AI相关
  `relevance_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI相关度评分(0-100)',
  `quality_score` DECIMAL(5,2) DEFAULT 0 COMMENT '内容质量评分(0-100)',

  -- 使用统计
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `positive_feedback_count` INT DEFAULT 0 COMMENT '正反馈次数',
  `negative_feedback_count` INT DEFAULT 0 COMMENT '负反馈次数',
  `last_used_time` DATETIME COMMENT '最后使用时间',

  -- 来源信息
  `source_type` ENUM('manual', 'ai_mining', 'industry_recommend', 'file_import') DEFAULT 'manual' COMMENT '来源类型',
  `source_id` INT COMMENT '来源记录ID(如chat_record_id)',
  `creator_id` INT COMMENT '创建人ID',

  -- 状态管理
  `status` ENUM('active', 'inactive', 'pending_review', 'auto_disabled') DEFAULT 'active' COMMENT '状态',
  `priority` INT DEFAULT 0 COMMENT '优先级(0-100)',

  -- 关联产品
  `related_product_ids` JSON COMMENT '关联的产品ID列表',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 索引
  INDEX `idx_scene_category` (`scene_category`),
  INDEX `idx_product_category` (`product_category`),
  INDEX `idx_customer_type` (`customer_type`),
  INDEX `idx_question_type` (`question_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_source_type` (`source_type`),
  FULLTEXT INDEX `idx_fulltext` (`title`, `content`, `keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业知识库主表';

-- ========================================
-- 表2: knowledge_feedback - 知识库负反馈表
-- ========================================
CREATE TABLE IF NOT EXISTS `knowledge_feedback` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 关联信息
  `knowledge_id` INT NOT NULL COMMENT '知识库ID',
  `user_id` INT NOT NULL COMMENT '反馈用户ID',
  `customer_id` INT COMMENT '关联客户ID',

  -- 反馈场景
  `feedback_scene` ENUM('ai_chat', 'knowledge_search', 'ai_analysis', 'ai_recommendation') COMMENT '反馈场景',
  `function_name` VARCHAR(100) COMMENT '具体功能名称',
  `conversation_topic` VARCHAR(200) COMMENT '对话主题',

  -- 反馈内容
  `feedback_type` ENUM('positive', 'negative') DEFAULT 'negative' COMMENT '反馈类型',
  `feedback_reason` VARCHAR(500) COMMENT '反馈原因',
  `feedback_detail` TEXT COMMENT '详细反馈内容',
  `conversation_context` JSON COMMENT '完整对话上下文',

  -- AI分析
  `ai_analysis` TEXT COMMENT 'AI对该反馈的分析',
  `optimization_suggestion` TEXT COMMENT 'AI生成的优化建议',

  -- 处理状态
  `handled` TINYINT DEFAULT 0 COMMENT '是否已处理',
  `handler_id` INT COMMENT '处理人ID',
  `handle_time` DATETIME COMMENT '处理时间',
  `handle_result` VARCHAR(500) COMMENT '处理结果',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  -- 索引
  INDEX `idx_knowledge_id` (`knowledge_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_feedback_scene` (`feedback_scene`),
  INDEX `idx_handled` (`handled`),
  INDEX `idx_feedback_type` (`feedback_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库负反馈表';

-- ========================================
-- 表3: knowledge_pending_review - AI挖掘待审核表
-- ========================================
CREATE TABLE IF NOT EXISTS `knowledge_pending_review` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 挖掘的问答
  `question` VARCHAR(500) NOT NULL COMMENT '挖掘的问题',
  `answer` TEXT NOT NULL COMMENT '挖掘的答案',
  `keywords` VARCHAR(500) COMMENT 'AI提取的关键词',

  -- 4维度分类(AI自动分类)
  `scene_category` VARCHAR(50) COMMENT '场景分类',
  `product_category` VARCHAR(50) COMMENT '产品分类',
  `customer_type` VARCHAR(50) COMMENT '客户类型',
  `question_type` VARCHAR(50) COMMENT '问题类型',

  -- AI评分
  `ai_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI质量评分(0-100)',
  `confidence_score` DECIMAL(5,2) DEFAULT 0 COMMENT 'AI置信度(0-100)',

  -- 来源信息
  `source_type` ENUM('chat_mining', 'industry_recommend') COMMENT '来源类型',
  `source_chat_record_id` INT COMMENT '来源聊天记录ID',
  `mining_reason` TEXT COMMENT '挖掘理由(AI说明为什么推荐这个)',

  -- 审核状态
  `review_status` ENUM('pending', 'approved', 'rejected', 'auto_approved') DEFAULT 'pending' COMMENT '审核状态',
  `reviewer_id` INT COMMENT '审核人ID',
  `review_time` DATETIME COMMENT '审核时间',
  `review_comment` VARCHAR(500) COMMENT '审核意见',

  -- 批次信息(用于定时任务挖掘)
  `mining_batch_id` VARCHAR(50) COMMENT '挖掘批次ID',
  `mining_time` DATETIME COMMENT '挖掘时间',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  -- 索引
  INDEX `idx_review_status` (`review_status`),
  INDEX `idx_ai_score` (`ai_score`),
  INDEX `idx_mining_batch` (`mining_batch_id`),
  INDEX `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI挖掘待审核表';

-- ========================================
-- 表4: enterprise_basic_info - 企业基本信息表
-- ========================================
CREATE TABLE IF NOT EXISTS `enterprise_basic_info` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 企业基本信息
  `company_name` VARCHAR(200) COMMENT '企业名称',
  `industry` VARCHAR(100) COMMENT '所属行业',
  `company_intro` TEXT COMMENT '企业介绍',
  `founding_year` INT COMMENT '成立年份',
  `company_scale` VARCHAR(50) COMMENT '公司规模',

  -- 联系方式
  `contact_info` JSON COMMENT '联系方式(电话、地址、官网等)',

  -- 企业优势
  `core_advantages` TEXT COMMENT '核心优势',
  `success_cases` TEXT COMMENT '成功案例',
  `certifications` JSON COMMENT '资质证书列表',

  -- 行业知识
  `industry_knowledge` TEXT COMMENT '行业知识/趋势',
  `competitor_analysis` TEXT COMMENT '竞品分析',

  -- 常见FAQ
  `customer_faq` JSON COMMENT '客户常见问答列表[{q,a}]',

  -- 录入方式记录
  `input_method` ENUM('manual', 'file_upload', 'ai_generate') COMMENT '录入方式',

  -- 状态
  `is_completed` TINYINT DEFAULT 0 COMMENT '是否完成首次创建',
  `completion_step` INT DEFAULT 0 COMMENT '完成到第几步(1-4)',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业基本信息表(首次创建知识库时填写)';

-- ========================================
-- 表5: industry_question_library - 行业问题库表
-- ========================================
CREATE TABLE IF NOT EXISTS `industry_question_library` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 行业分类
  `industry_name` VARCHAR(100) NOT NULL COMMENT '行业名称:教育|医疗|电商|金融等',
  `industry_sub_category` VARCHAR(100) COMMENT '行业细分:K12教育|职业教育等',

  -- 问答内容
  `question` VARCHAR(500) NOT NULL COMMENT '常见问题',
  `answer_template` TEXT COMMENT '答案模板(可包含变量)',

  -- 分类
  `scene_category` VARCHAR(50) COMMENT '场景分类',
  `question_type` VARCHAR(50) COMMENT '问题类型',

  -- 来源
  `source_type` ENUM('system_preset', 'ai_generate') DEFAULT 'system_preset' COMMENT '来源类型',

  -- 使用统计
  `usage_count` INT DEFAULT 0 COMMENT '被使用次数',

  -- 状态
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  -- 索引
  INDEX `idx_industry` (`industry_name`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业问题库表(预置+AI生成)';

-- ========================================
-- 表6: knowledge_usage_log - 知识库使用日志表
-- ========================================
CREATE TABLE IF NOT EXISTS `knowledge_usage_log` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',

  -- 查询信息
  `user_id` INT NOT NULL COMMENT '使用者ID',
  `customer_id` INT COMMENT '关联客户ID',
  `query_text` VARCHAR(500) NOT NULL COMMENT '查询问题',

  -- 知识库结果
  `matched_knowledge_ids` JSON COMMENT '匹配到的知识库ID列表',
  `knowledge_scores` JSON COMMENT '各知识库的评分',

  -- AI决策
  `ai_decision` ENUM('use_knowledge', 'use_ai_generate', 'hybrid') COMMENT 'AI决策结果',
  `ai_decision_reason` TEXT COMMENT 'AI决策理由',

  -- 最终输出
  `final_answer` TEXT COMMENT '最终输出的答案',

  -- 使用场景
  `usage_scene` VARCHAR(100) COMMENT '使用场景',

  -- 反馈
  `feedback_id` INT COMMENT '关联的反馈ID(如果有)',

  -- 时间字段
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  -- 索引
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_customer_id` (`customer_id`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_usage_scene` (`usage_scene`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库AI调用日志表';

-- ========================================
-- 预置数据: 教育行业常见问题
-- ========================================
INSERT INTO `industry_question_library` (
  `industry_name`,
  `industry_sub_category`,
  `question`,
  `answer_template`,
  `scene_category`,
  `question_type`,
  `source_type`
) VALUES
('教育', 'K12教育', '你们的课程怎么收费?', '我们有多种套餐可选，具体价格根据课程类型、课时数量而定。建议您留下联系方式，我们的课程顾问会为您详细介绍适合孩子的套餐方案。', '价格咨询', '价格问题', 'system_preset'),
('教育', 'K12教育', '一对一和班课有什么区别?', '一对一是老师针对孩子的学习情况进行个性化辅导，进度可以灵活调整。班课是小班教学，一般3-6人，孩子之间可以互动学习。建议根据孩子的性格和学习需求选择。', '产品介绍', '产品问题', 'system_preset'),
('教育', 'K12教育', '老师的资质怎么样?', '我们的老师都具有教师资格证，且有多年教学经验。部分老师来自重点学校，熟悉各年级考点和教学大纲。您可以先试听一节课，满意再报名。', '产品介绍', '师资问题', 'system_preset'),
('教育', 'K12教育', '效果怎么保证?', '我们有完善的教学体系和跟踪机制，每节课后都会有学习反馈，定期进行测试评估。如果孩子成绩没有提升，我们会调整教学方案，确保学习效果。', '异议处理', '效果问题', 'system_preset'),
('教育', 'K12教育', '可以试听吗?', '当然可以！我们提供免费试听课，您可以先带孩子来体验一节课，了解我们的教学风格和内容，满意再报名。', '首次沟通', '服务问题', 'system_preset'),
('教育', 'K12教育', '上课时间怎么安排?', '我们的上课时间非常灵活，可以根据您和孩子的时间安排。工作日晚上、周末都可以，具体时间我们会和您协商确定。', '首次沟通', '服务问题', 'system_preset'),
('教育', 'K12教育', '如果缺课怎么办?', '如果因为特殊情况需要请假，请提前告知我们，课时可以顺延或补课。我们会尽量配合您的时间安排。', '售后服务', '服务问题', 'system_preset'),
('教育', 'K12教育', '报名后可以退费吗?', '报名后如果对课程不满意，在规定期限内可以申请退费。具体退费政策我们会在合同中明确说明，保障您的权益。', '价格咨询', '价格问题', 'system_preset');
