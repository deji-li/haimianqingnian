-- 为ai_api_keys表添加secret_key字段（支持百度OCR）
-- 并更新provider枚举类型以支持baidu

-- 1. 添加secret_key字段
ALTER TABLE `ai_api_keys` 
ADD COLUMN `secret_key` VARCHAR(500) NULL COMMENT 'API密钥Secret（百度OCR专用）' 
AFTER `api_key`;

-- 2. 修改provider字段的枚举类型,添加'baidu'
ALTER TABLE `ai_api_keys` 
MODIFY COLUMN `provider` ENUM('deepseek', 'doubao', 'baidu') NOT NULL COMMENT 'AI供应商';

-- 注意:
-- 执行此脚本后,需要在系统设置页面添加百度OCR配置
-- 或者执行 insert-baidu-ocr-config.sql 脚本添加配置
