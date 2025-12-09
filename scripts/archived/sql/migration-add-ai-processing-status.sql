-- 添加AI处理状态字段到customers表

ALTER TABLE `customers`
ADD COLUMN `ai_processing_status` ENUM('pending', 'processing', 'completed', 'failed') NULL COMMENT 'AI识别处理状态：pending-待处理，processing-识别中，completed-已完成，failed-失败' AFTER `last_ai_analysis_time`,
ADD COLUMN `ai_processing_error` TEXT NULL COMMENT 'AI识别失败原因' AFTER `ai_processing_status`;
