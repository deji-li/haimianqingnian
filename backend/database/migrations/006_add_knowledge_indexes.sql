-- 企业知识库性能优化索引
-- 创建时间: 2025-01-15
-- 用途: 提升知识库查询、统计、反馈等功能的性能

-- ============================================
-- 1. enterprise_knowledge_base 表索引
-- ============================================

-- 状态索引（查询active/inactive等状态时使用）
CREATE INDEX idx_ekb_status ON enterprise_knowledge_base(status);

-- 场景分类索引（按场景筛选时使用）
CREATE INDEX idx_ekb_scene_category ON enterprise_knowledge_base(sceneCategory);

-- 产品分类索引（按产品筛选时使用）
CREATE INDEX idx_ekb_product_category ON enterprise_knowledge_base(productCategory);

-- 负反馈次数索引（查询高负反馈知识时使用）
CREATE INDEX idx_ekb_negative_count ON enterprise_knowledge_base(negativeFeedbackCount);

-- 使用次数索引（查询热门知识时使用）
CREATE INDEX idx_ekb_usage_count ON enterprise_knowledge_base(usageCount);

-- 创建时间索引（按时间排序时使用）
CREATE INDEX idx_ekb_create_time ON enterprise_knowledge_base(createTime);

-- 更新时间索引（按更新时间排序时使用）
CREATE INDEX idx_ekb_update_time ON enterprise_knowledge_base(updateTime);

-- 优先级索引（按优先级排序时使用）
CREATE INDEX idx_ekb_priority ON enterprise_knowledge_base(priority);

-- 组合索引：状态+优先级+使用次数（智能搜索时使用）
CREATE INDEX idx_ekb_status_priority_usage ON enterprise_knowledge_base(status, priority, usageCount);

-- 组合索引：状态+场景分类（分类查询时使用）
CREATE INDEX idx_ekb_status_scene ON enterprise_knowledge_base(status, sceneCategory);

-- ============================================
-- 2. knowledge_feedback 表索引
-- ============================================

-- 知识库ID索引（查询某条知识的反馈时使用）
CREATE INDEX idx_kf_knowledge_id ON knowledge_feedback(knowledgeId);

-- 反馈场景索引（按场景统计时使用）
CREATE INDEX idx_kf_scene ON knowledge_feedback(feedbackScene);

-- 是否处理索引（查询待处理反馈时使用）
CREATE INDEX idx_kf_handled ON knowledge_feedback(handled);

-- 创建时间索引（按时间排序时使用）
CREATE INDEX idx_kf_create_time ON knowledge_feedback(createTime);

-- 用户ID索引（查询某用户的反馈时使用）
CREATE INDEX idx_kf_user_id ON knowledge_feedback(userId);

-- 客户ID索引（查询某客户的反馈时使用）
CREATE INDEX idx_kf_customer_id ON knowledge_feedback(customerId);

-- 组合索引：知识库ID+是否处理（查询某知识的待处理反馈）
CREATE INDEX idx_kf_knowledge_handled ON knowledge_feedback(knowledgeId, handled);

-- ============================================
-- 3. knowledge_pending_review 表索引
-- ============================================

-- 审核状态索引（查询待审核列表时使用）
CREATE INDEX idx_kpr_status ON knowledge_pending_review(reviewStatus);

-- AI分数索引（按分数排序时使用）
CREATE INDEX idx_kpr_score ON knowledge_pending_review(aiScore);

-- 挖掘批次ID索引（按批次查询时使用）
CREATE INDEX idx_kpr_batch ON knowledge_pending_review(miningBatchId);

-- 创建时间索引（按时间排序时使用）
CREATE INDEX idx_kpr_create_time ON knowledge_pending_review(createTime);

-- 来源类型索引（按来源筛选时使用）
CREATE INDEX idx_kpr_source_type ON knowledge_pending_review(sourceType);

-- 组合索引：审核状态+AI分数（待审核列表排序）
CREATE INDEX idx_kpr_status_score ON knowledge_pending_review(reviewStatus, aiScore);

-- ============================================
-- 4. knowledge_usage_log 表索引
-- ============================================

-- 知识库ID索引（查询某知识的使用日志时使用）
CREATE INDEX idx_kul_knowledge_id ON knowledge_usage_log(knowledgeId);

-- 使用场景索引（按场景统计时使用）
CREATE INDEX idx_kul_scene ON knowledge_usage_log(usageScene);

-- 创建时间索引（按时间统计时使用）
CREATE INDEX idx_kul_create_time ON knowledge_usage_log(createTime);

-- 用户ID索引（查询某用户的使用记录时使用）
CREATE INDEX idx_kul_user_id ON knowledge_usage_log(userId);

-- 客户ID索引（查询某客户的使用记录时使用）
CREATE INDEX idx_kul_customer_id ON knowledge_usage_log(customerId);

-- 组合索引：知识库ID+创建时间（查询某知识的使用趋势）
CREATE INDEX idx_kul_knowledge_time ON knowledge_usage_log(knowledgeId, createTime);

-- 组合索引：使用场景+创建时间（按场景统计趋势）
CREATE INDEX idx_kul_scene_time ON knowledge_usage_log(usageScene, createTime);

-- ============================================
-- 5. enterprise_basic_info 表索引
-- ============================================

-- 企业名称索引（查询企业信息时使用）
CREATE INDEX idx_ebi_company_name ON enterprise_basic_info(companyName);

-- 行业索引（按行业筛选时使用）
CREATE INDEX idx_ebi_industry ON enterprise_basic_info(industry);

-- ============================================
-- 6. industry_question_library 表索引
-- ============================================

-- 行业索引（按行业查询时使用）
CREATE INDEX idx_iql_industry ON industry_question_library(industry);

-- 分类索引（按分类查询时使用）
CREATE INDEX idx_iql_category ON industry_question_library(category);

-- 重要程度索引（按重要程度排序时使用）
CREATE INDEX idx_iql_importance ON industry_question_library(importance);

-- 使用次数索引（按使用次数排序时使用）
CREATE INDEX idx_iql_usage_count ON industry_question_library(usageCount);

-- 组合索引：行业+重要程度+使用次数（热门行业问题查询）
CREATE INDEX idx_iql_industry_imp_usage ON industry_question_library(industry, importance, usageCount);

-- ============================================
-- 索引创建完成
-- ============================================

-- 查看所有索引
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM
    INFORMATION_SCHEMA.STATISTICS
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN (
        'enterprise_knowledge_base',
        'knowledge_feedback',
        'knowledge_pending_review',
        'knowledge_usage_log',
        'enterprise_basic_info',
        'industry_question_library'
    )
ORDER BY
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
