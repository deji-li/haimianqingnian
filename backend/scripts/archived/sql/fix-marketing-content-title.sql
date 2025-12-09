-- 修复营销文案库中的标题显示
-- 基于已经更新的中文类型和purpose字段来生成正确的标题

UPDATE ai_marketing_content_library
SET title = CASE
  -- 如果有purpose，使用 "类型 - purpose" 格式
  WHEN (purpose IS NOT NULL AND purpose != '')
    THEN CONCAT(content_type, ' - ', purpose)
  -- 如果没有purpose，使用 "类型 - 日期" 格式
  ELSE CONCAT(content_type, ' - ', DATE_FORMAT(create_time, '%Y/%m/%d'))
END
WHERE content_type IN ('朋友圈文案', '微信群发文案', '抖音营销文案', '小红书营销文案', '短视频拍摄脚本', '公众号推文')
  AND (title LIKE 'moments%' OR title LIKE 'wechat%' OR title LIKE 'douyin%'
       OR title LIKE 'xiaohongshu%' OR title LIKE 'video_script%' OR title LIKE 'official%');

-- 显示更新后的记录
SELECT id, title, content_type, category, create_time
FROM ai_marketing_content_library
ORDER BY create_time DESC
LIMIT 10;
