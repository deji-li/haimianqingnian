-- 添加百度OCR API配置到数据库
-- 使用方法: 在MySQL中执行此脚本,或在系统设置页面手动配置

INSERT INTO `ai_api_keys` (
  `provider`,
  `provider_name`,
  `api_key`,
  `secret_key`,
  `api_url`,
  `endpoint_id`,
  `model_name`,
  `description`,
  `is_active`,
  `created_at`,
  `updated_at`
) VALUES (
  'baidu',
  '百度OCR',
  'your_baidu_api_key',  -- 请替换为实际的百度OCR API Key
  'your_baidu_secret_key',  -- 请替换为实际的百度OCR Secret Key
  '',  -- 百度OCR不需要自定义API URL
  '',  -- 百度OCR不需要Endpoint ID
  '',  -- 百度OCR不需要Model Name
  '百度OCR高精度文字识别服务，用于识别微信聊天截图',
  1,  -- 启用状态
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  `api_key` = VALUES(`api_key`),
  `secret_key` = VALUES(`secret_key`),
  `updated_at` = NOW();

-- 注意事项:
-- 1. 请将 'your_baidu_api_key' 和 'your_baidu_secret_key' 替换为您的实际密钥
-- 2. 百度OCR密钥获取地址: https://console.bce.baidu.com/ai/#/ai/ocr/overview/index
-- 3. 确保开通了"通用文字识别-高精度版"服务
-- 4. 如需删除此配置,可执行: DELETE FROM ai_api_keys WHERE provider = 'baidu';
