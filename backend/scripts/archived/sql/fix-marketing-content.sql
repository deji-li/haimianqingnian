-- 修复营销文案库中的类型和分类显示
UPDATE ai_marketing_content_library
SET
  content_type = CASE content_type
    WHEN 'moments' THEN '朋友圈文案'
    WHEN 'wechat' THEN '微信群发文案'
    WHEN 'douyin' THEN '抖音营销文案'
    WHEN 'xiaohongshu' THEN '小红书营销文案'
    WHEN 'video_script' THEN '短视频拍摄脚本'
    WHEN 'official' THEN '公众号推文'
    ELSE content_type
  END,
  title = CASE
    WHEN content_type = 'moments' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('朋友圈文案 - ', purpose)
    WHEN content_type = 'moments'
      THEN CONCAT('朋友圈文案 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    WHEN content_type = 'wechat' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('微信群发文案 - ', purpose)
    WHEN content_type = 'wechat'
      THEN CONCAT('微信群发文案 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    WHEN content_type = 'douyin' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('抖音营销文案 - ', purpose)
    WHEN content_type = 'douyin'
      THEN CONCAT('抖音营销文案 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    WHEN content_type = 'xiaohongshu' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('小红书营销文案 - ', purpose)
    WHEN content_type = 'xiaohongshu'
      THEN CONCAT('小红书营销文案 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    WHEN content_type = 'video_script' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('短视频拍摄脚本 - ', purpose)
    WHEN content_type = 'video_script'
      THEN CONCAT('短视频拍摄脚本 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    WHEN content_type = 'official' AND (purpose IS NOT NULL AND purpose != '')
      THEN CONCAT('公众号推文 - ', purpose)
    WHEN content_type = 'official'
      THEN CONCAT('公众号推文 - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
    ELSE title
  END,
  category = COALESCE(NULLIF(category, ''), purpose, '其他')
WHERE content_type IN ('moments', 'wechat', 'douyin', 'xiaohongshu', 'video_script', 'official');

-- 显示更新后的记录
SELECT id, title, content_type, category, create_time
FROM ai_marketing_content_library
ORDER BY create_time DESC
LIMIT 10;
