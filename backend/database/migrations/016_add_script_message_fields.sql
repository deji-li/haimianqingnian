-- 添加AI话术助手消息表的使用统计字段
-- 用于支持反馈和使用记录功能

USE `education_crm`;

-- 添加使用统计相关字段到 ai_script_message 表
-- 先检查列是否已存在，如果不存在则添加
SET @check_usage_count = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'ai_script_message'
  AND COLUMN_NAME = 'usage_count'
);

SET @sql_usage_count = IF(@check_usage_count = 0,
  'ALTER TABLE `ai_script_message` ADD COLUMN `usage_count` INT NOT NULL DEFAULT 0 COMMENT ''使用次数'' AFTER `processing_time`',
  'SELECT ''Column usage_count already exists'' AS msg'
);
PREPARE stmt FROM @sql_usage_count;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @check_success_usage = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'ai_script_message'
  AND COLUMN_NAME = 'success_usage_count'
);

SET @sql_success_usage = IF(@check_success_usage = 0,
  'ALTER TABLE `ai_script_message` ADD COLUMN `success_usage_count` INT NOT NULL DEFAULT 0 COMMENT ''成功使用次数'' AFTER `usage_count`',
  'SELECT ''Column success_usage_count already exists'' AS msg'
);
PREPARE stmt FROM @sql_success_usage;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @check_is_featured = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'ai_script_message'
  AND COLUMN_NAME = 'is_featured'
);

SET @sql_is_featured = IF(@check_is_featured = 0,
  'ALTER TABLE `ai_script_message` ADD COLUMN `is_featured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT ''是否为精选话术'' AFTER `success_usage_count`',
  'SELECT ''Column is_featured already exists'' AS msg'
);
PREPARE stmt FROM @sql_is_featured;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加索引以提升查询性能
SET @check_index = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = 'education_crm'
  AND TABLE_NAME = 'ai_script_message'
  AND INDEX_NAME = 'idx_is_featured'
);

SET @sql_index = IF(@check_index = 0,
  'ALTER TABLE `ai_script_message` ADD INDEX `idx_is_featured` (`is_featured`)',
  'SELECT ''Index idx_is_featured already exists'' AS msg'
);
PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 为已有的高置信度消息自动标记为精选
UPDATE `ai_script_message`
SET `is_featured` = 1
WHERE `confidence_score` >= 0.8 AND `role` = 'assistant' AND `is_featured` = 0;
