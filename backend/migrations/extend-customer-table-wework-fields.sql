-- 为customers表添加企业微信集成字段
-- Migration: extend_customer_table_wework_fields
-- Date: 2024-12-08

-- 添加企业微信外部联系人ID字段（唯一索引）
ALTER TABLE customers
ADD COLUMN wework_external_userid VARCHAR(64) NULL COMMENT '企业微信外部联系人ID',
ADD UNIQUE INDEX idx_wework_external_userid (wework_external_userid);

-- 添加企业微信跟进成员ID字段
ALTER TABLE customers
ADD COLUMN wework_follow_userid VARCHAR(64) NULL COMMENT '企业微信跟进成员userid';

-- 添加企业微信客户标签字段
ALTER TABLE customers
ADD COLUMN wework_tags JSON NULL COMMENT '企业微信客户标签';

-- 添加企业微信数据同步时间字段
ALTER TABLE customers
ADD COLUMN wework_sync_time DATETIME NULL COMMENT '企业微信数据同步时间',
ADD INDEX idx_wework_sync_time (wework_sync_time);

-- 添加企业微信聊天记录数量字段
ALTER TABLE customers
ADD COLUMN wework_chat_count INT DEFAULT 0 COMMENT '企业微信聊天记录数量';

-- 添加最后企业微信聊天时间字段
ALTER TABLE customers
ADD COLUMN wework_last_chat_time DATETIME NULL COMMENT '最后企业微信聊天时间',
ADD INDEX idx_wework_last_chat_time (wework_last_chat_time);

-- 创建组合索引用于查询优化
ALTER TABLE customers
ADD INDEX idx_wework_fields (wework_external_userid, wework_sync_time),
ADD INDEX idx_wework_chat_stats (wework_chat_count, wework_last_chat_time);

-- 更新现有数据：如果有客户来源是企业微信，设置默认值
UPDATE customers
SET wework_sync_time = NOW()
WHERE source = 'wework' OR source = '企业微信';

-- 添加表注释（如果需要）
ALTER TABLE customers COMMENT = '客户表 - 包含企业微信集成字段';