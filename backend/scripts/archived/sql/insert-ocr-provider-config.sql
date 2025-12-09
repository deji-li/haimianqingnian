-- 添加OCR提供商选择配置到business_config表
-- 用于AI话术助手在豆包OCR和百度OCR之间切换

INSERT INTO `business_config` (
  `config_key`,
  `config_name`,
  `config_value`,
  `config_category`,
  `config_type`,
  `description`,
  `is_system`,
  `create_time`,
  `update_time`
) VALUES (
  'ocr_provider',
  'OCR服务提供商',
  'doubao',  -- 默认使用豆包OCR，可选值: doubao | baidu
  'ai',
  'select',
  'AI话术助手使用的OCR识别服务提供商。可选值: doubao(豆包OCR) 或 baidu(百度OCR高精度版)',
  1,  -- 系统配置
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  `config_value` = VALUES(`config_value`),
  `updated_time` = NOW();

-- 注意事项:
-- 1. 默认使用豆包OCR (doubao)
-- 2. 切换到百度OCR需要先配置百度API密钥
-- 3. 修改config_value为'baidu'即可切换到百度OCR
-- 4. 修改后立即生效（有1分钟缓存）

-- 查看当前配置:
-- SELECT * FROM business_config WHERE config_key = 'ocr_provider';

-- 切换到百度OCR:
-- UPDATE business_config SET config_value = 'baidu' WHERE config_key = 'ocr_provider';

-- 切换回豆包OCR:
-- UPDATE business_config SET config_value = 'doubao' WHERE config_key = 'ocr_provider';
