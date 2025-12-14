-- 添加企业微信聊天记录文本内容字段
-- 用于AI分析和质检

ALTER TABLE wework_chat_records
ADD COLUMN text_content TEXT NULL COMMENT '提取的文本内容，用于AI分析';

-- 添加索引以优化查询性能
CREATE INDEX idx_wework_text_content ON wework_chat_records(text_content(100));

-- 验证字段添加成功
SELECT '✅ text_content字段添加成功' AS status;

-- 查看表结构
DESCRIBE wework_chat_records;