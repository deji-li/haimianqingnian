-- =====================================================
-- 企业知识库系统 - 数据库完整更新脚本（安全版本）
-- 版本: v1.0.0
-- 日期: 2025-11-17
-- 说明: 包含所有表结构、索引和初始数据，支持重复执行
-- =====================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 创建企业知识库核心表
-- =====================================================

-- 企业知识库主表
CREATE TABLE IF NOT EXISTS `enterprise_knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(200) NOT NULL COMMENT '知识标题',
  `content` text NOT NULL COMMENT '知识内容',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词（逗号分隔）',
  `sceneCategory` varchar(50) NOT NULL COMMENT '场景分类（产品介绍、售后服务、营销活动等）',
  `productCategory` varchar(50) DEFAULT NULL COMMENT '产品分类',
  `customerType` varchar(50) DEFAULT NULL COMMENT '客户类型（新客户、老客户、潜在客户等）',
  `questionType` varchar(50) DEFAULT NULL COMMENT '问题类型（咨询类、投诉类、建议类等）',
  `priority` int DEFAULT 50 COMMENT '优先级（1-100，越大越优先）',
  `sourceType` varchar(50) NOT NULL DEFAULT 'manual' COMMENT '来源类型（manual手动创建、ai_mining AI挖掘、industry_import行业导入、batch_import批量导入）',
  `sourceId` int DEFAULT NULL COMMENT '来源记录ID（如挖掘批次ID）',
  `status` varchar(20) NOT NULL DEFAULT 'active' COMMENT '状态（active启用、inactive禁用）',
  `usageCount` int DEFAULT 0 COMMENT '使用次数',
  `negativeFeedbackCount` int DEFAULT 0 COMMENT '负反馈次数',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业知识库主表';

-- 企业基础信息表
CREATE TABLE IF NOT EXISTS `enterprise_basic_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `companyName` varchar(200) NOT NULL COMMENT '企业名称',
  `industry` varchar(100) NOT NULL COMMENT '所属行业',
  `companySize` varchar(50) DEFAULT NULL COMMENT '企业规模',
  `contactPerson` varchar(100) DEFAULT NULL COMMENT '联系人',
  `contactPhone` varchar(50) DEFAULT NULL COMMENT '联系电话',
  `contactEmail` varchar(100) DEFAULT NULL COMMENT '联系邮箱',
  `address` varchar(500) DEFAULT NULL COMMENT '企业地址',
  `mainProducts` json DEFAULT NULL COMMENT '主营产品（JSON数组）',
  `customerTypes` json DEFAULT NULL COMMENT '客户类型（JSON数组）',
  `businessModel` varchar(100) DEFAULT NULL COMMENT '业务模式',
  `marketPosition` varchar(100) DEFAULT NULL COMMENT '市场定位',
  `competitiveAdvantages` json DEFAULT NULL COMMENT '竞争优势（JSON数组）',
  `initializationStatus` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '初始化状态（pending待初始化、step1_completed第1步完成、step2_completed第2步完成、completed已完成）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业基础信息表';

-- =====================================================
-- 2. 创建知识挖掘相关表
-- =====================================================

-- 知识挖掘批次表
CREATE TABLE IF NOT EXISTS `knowledge_mining_batch` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceType` varchar(50) NOT NULL COMMENT '数据源类型（ai_chat AI对话、customer_feedback客户反馈、tickets工单等）',
  `sourceIds` json DEFAULT NULL COMMENT '数据源ID列表（JSON数组）',
  `dateRange` json NOT NULL COMMENT '时间范围（{startDate, endDate}）',
  `status` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '状态（pending待处理、processing处理中、completed已完成、failed失败）',
  `totalCount` int DEFAULT 0 COMMENT '总记录数',
  `extractedCount` int DEFAULT 0 COMMENT '已提取数量',
  `approvedCount` int DEFAULT 0 COMMENT '已通过数量',
  `rejectedCount` int DEFAULT 0 COMMENT '已拒绝数量',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识挖掘批次表';

-- 挖掘候选知识表
CREATE TABLE IF NOT EXISTS `knowledge_mining_candidate` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `batchId` int NOT NULL COMMENT '挖掘批次ID',
  `sourceType` varchar(50) NOT NULL COMMENT '数据源类型',
  `sourceId` int NOT NULL COMMENT '数据源记录ID',
  `extractedTitle` varchar(200) NOT NULL COMMENT '提取的标题',
  `extractedContent` text NOT NULL COMMENT '提取的内容',
  `extractedKeywords` varchar(500) DEFAULT NULL COMMENT '提取的关键词',
  `sceneCategory` varchar(50) DEFAULT NULL COMMENT '场景分类',
  `productCategory` varchar(50) DEFAULT NULL COMMENT '产品分类',
  `customerType` varchar(50) DEFAULT NULL COMMENT '客户类型',
  `questionType` varchar(50) DEFAULT NULL COMMENT '问题类型',
  `confidenceScore` int NOT NULL COMMENT 'AI置信度评分（0-100）',
  `scoreReason` text DEFAULT NULL COMMENT '评分理由',
  `reviewStatus` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '审核状态（pending待审核、approved已通过、rejected已拒绝）',
  `reviewTime` datetime DEFAULT NULL COMMENT '审核时间',
  `rejectReason` varchar(500) DEFAULT NULL COMMENT '拒绝原因',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_batch_id` (`batchId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='挖掘候选知识表';

-- =====================================================
-- 3. 创建知识反馈表
-- =====================================================

CREATE TABLE IF NOT EXISTS `knowledge_feedback` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `knowledgeId` int NOT NULL COMMENT '知识库ID',
  `feedbackScene` varchar(100) NOT NULL COMMENT '反馈场景（客户咨询、AI对话、智能搜索等）',
  `userQuestion` text NOT NULL COMMENT '用户问题',
  `knowledgeAnswer` text NOT NULL COMMENT '知识库返回的答案',
  `feedbackReason` varchar(200) NOT NULL COMMENT '反馈原因（内容不相关、信息过时、表述不清等）',
  `expectedAnswer` text DEFAULT NULL COMMENT '期望的答案',
  `customerId` int DEFAULT NULL COMMENT '客户ID（如果是客户反馈）',
  `handled` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已处理',
  `handleResult` varchar(200) DEFAULT NULL COMMENT '处理结果',
  `optimizationAction` text DEFAULT NULL COMMENT '优化措施',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识负反馈表';

-- =====================================================
-- 4. 创建知识使用日志表
-- =====================================================

CREATE TABLE IF NOT EXISTS `knowledge_usage_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `knowledgeId` int NOT NULL COMMENT '知识库ID',
  `usageScene` varchar(100) NOT NULL COMMENT '使用场景（ai_chat AI对话、intelligent_search智能搜索、script_recommendation话术推荐等）',
  `userId` int DEFAULT NULL COMMENT '使用用户ID',
  `customerId` int DEFAULT NULL COMMENT '相关客户ID',
  `queryText` text DEFAULT NULL COMMENT '查询文本',
  `matchScore` int DEFAULT NULL COMMENT '匹配评分（0-100）',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识使用日志表';

-- =====================================================
-- 5. 创建行业问题库表
-- =====================================================

CREATE TABLE IF NOT EXISTS `industry_question_library` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `industry` varchar(100) NOT NULL COMMENT '行业',
  `category` varchar(100) NOT NULL COMMENT '问题分类',
  `question` text NOT NULL COMMENT '问题内容',
  `suggestedAnswer` text DEFAULT NULL COMMENT '建议答案',
  `keywords` varchar(500) DEFAULT NULL COMMENT '关键词',
  `priority` int DEFAULT 50 COMMENT '优先级',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行业问题库表';

-- =====================================================
-- 6. 创建AI字段映射配置表
-- =====================================================

CREATE TABLE IF NOT EXISTS `ai_field_mapping_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sourceEntity` varchar(100) NOT NULL COMMENT '源实体名称（如Customer、AiChatRecord）',
  `targetField` varchar(100) NOT NULL COMMENT '目标字段名称',
  `mappingType` varchar(50) NOT NULL COMMENT '映射类型（direct直接映射、transform转换映射、ai_extract AI提取）',
  `sourceField` varchar(100) DEFAULT NULL COMMENT '源字段名称（direct和transform类型使用）',
  `transformFunction` varchar(100) DEFAULT NULL COMMENT '转换函数名称（transform类型使用）',
  `aiExtractPrompt` text DEFAULT NULL COMMENT 'AI提取提示词（ai_extract类型使用）',
  `defaultValue` text DEFAULT NULL COMMENT '默认值（当映射失败时使用）',
  `isActive` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `createTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_target` (`sourceEntity`, `targetField`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI字段映射配置表';

-- =====================================================
-- 7. 添加性能优化索引（38个）- 使用存储过程安全创建
-- =====================================================

DELIMITER //

-- 创建安全添加索引的存储过程
DROP PROCEDURE IF EXISTS add_index_if_not_exists//
CREATE PROCEDURE add_index_if_not_exists(
    IN tableName VARCHAR(100),
    IN indexName VARCHAR(100),
    IN indexColumns VARCHAR(255)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = tableName
      AND index_name = indexName;

    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX `', indexName, '` ON `', tableName, '`(', indexColumns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//

DELIMITER ;

-- 企业知识库表索引 (14个)
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_status', '`status`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_scene_category', '`sceneCategory`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_product_category', '`productCategory`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_customer_type', '`customerType`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_question_type', '`questionType`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_source_type', '`sourceType`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_priority', '`priority`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_usage_count', '`usageCount`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_negative_feedback', '`negativeFeedbackCount`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_create_time', '`createTime`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_status_priority', '`status`, `priority`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_status_usage', '`status`, `usageCount`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_status_priority_usage', '`status`, `priority`, `usageCount`');
CALL add_index_if_not_exists('enterprise_knowledge_base', 'idx_ekb_scene_status', '`sceneCategory`, `status`');

-- 知识反馈表索引 (8个)
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_knowledge_id', '`knowledgeId`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_feedback_scene', '`feedbackScene`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_handled', '`handled`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_create_time', '`createTime`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_customer_id', '`customerId`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_knowledge_handled', '`knowledgeId`, `handled`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_knowledge_time', '`knowledgeId`, `createTime`');
CALL add_index_if_not_exists('knowledge_feedback', 'idx_kf_scene_handled', '`feedbackScene`, `handled`');

-- 知识使用日志表索引 (7个)
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_knowledge_id', '`knowledgeId`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_usage_scene', '`usageScene`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_user_id', '`userId`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_customer_id', '`customerId`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_create_time', '`createTime`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_knowledge_time', '`knowledgeId`, `createTime`');
CALL add_index_if_not_exists('knowledge_usage_log', 'idx_kul_scene_time', '`usageScene`, `createTime`');

-- 挖掘候选知识表索引 (4个)
CALL add_index_if_not_exists('knowledge_mining_candidate', 'idx_kmc_review_status', '`reviewStatus`');
CALL add_index_if_not_exists('knowledge_mining_candidate', 'idx_kmc_confidence_score', '`confidenceScore`');
CALL add_index_if_not_exists('knowledge_mining_candidate', 'idx_kmc_batch_review', '`batchId`, `reviewStatus`');
CALL add_index_if_not_exists('knowledge_mining_candidate', 'idx_kmc_source_type', '`sourceType`');

-- 挖掘批次表索引 (3个)
CALL add_index_if_not_exists('knowledge_mining_batch', 'idx_kmb_status', '`status`');
CALL add_index_if_not_exists('knowledge_mining_batch', 'idx_kmb_source_type', '`sourceType`');
CALL add_index_if_not_exists('knowledge_mining_batch', 'idx_kmb_create_time', '`createTime`');

-- 行业问题库表索引 (2个)
CALL add_index_if_not_exists('industry_question_library', 'idx_iql_industry', '`industry`');
CALL add_index_if_not_exists('industry_question_library', 'idx_iql_category', '`category`');

-- 清理存储过程
DROP PROCEDURE IF EXISTS add_index_if_not_exists;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 企业知识库系统数据库更新完成！' as message;
SELECT '📊 已创建7个表，38个索引' as status;
SELECT '🎉 系统已就绪，可以开始使用！' as ready;
