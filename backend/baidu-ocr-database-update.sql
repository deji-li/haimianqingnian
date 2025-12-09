-- 百度OCR功能数据库更新
-- 为ai_api_keys表添加百度OCR相关字段

-- 1. 更新provider枚举，添加baidu_ocr
ALTER TABLE ai_api_keys
MODIFY COLUMN provider ENUM('deepseek', 'doubao', 'baidu_ocr') NOT NULL COMMENT 'AI供应商';

-- 2. 添加百度OCR专用字段
ALTER TABLE ai_api_keys
ADD COLUMN secret_key VARCHAR(500) NULL COMMENT 'Secret Key（百度OCR专用）' AFTER model_name,
ADD COLUMN app_id VARCHAR(200) NULL COMMENT 'App ID（百度OCR专用）' AFTER secret_key;

-- 3. 创建百度OCR配置示例数据（可选，实际部署时可删除）
INSERT INTO ai_api_keys (provider, api_key, api_url, app_id, secret_key, is_active, remark, create_time, update_time)
VALUES (
  'baidu_ocr',
  'YOUR_BAIDU_API_KEY',
  'https://aip.baidubce.com/oauth/2.0/token',
  'YOUR_BAIDU_APP_ID',
  'YOUR_BAIDU_SECRET_KEY',
  0,
  '百度OCR配置示例，请填写实际的API密钥信息',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  api_key = VALUES(api_key),
  api_url = VALUES(api_url),
  app_id = VALUES(app_id),
  secret_key = VALUES(secret_key),
  remark = VALUES(remark),
  update_time = NOW();

-- 查询验证
SELECT * FROM ai_api_keys WHERE provider = 'baidu_ocr';