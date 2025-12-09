-- ========================================
-- AI营销助手字典数据
-- 创建时间：2025-11-20
-- ========================================

-- ========================================
-- 1. 朋友圈发圈目的 (marketing_purpose_moments)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_purpose_moments', '唤醒客户', '唤醒客户', 1, 1, '朋友圈发圈目的'),
('marketing_purpose_moments', '促进产品销售', '促进产品销售', 2, 1, '朋友圈发圈目的'),
('marketing_purpose_moments', '宣传产品和服务', '宣传产品和服务', 3, 1, '朋友圈发圈目的'),
('marketing_purpose_moments', '建立品牌形象', '建立品牌形象', 4, 1, '朋友圈发圈目的'),
('marketing_purpose_moments', '推广营销活动', '推广营销活动', 5, 1, '朋友圈发圈目的');

-- ========================================
-- 2. 微信群发目的 (marketing_purpose_wechat)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_purpose_wechat', '二次跟进', '二次跟进', 1, 1, '微信群发目的'),
('marketing_purpose_wechat', '唤醒客户', '唤醒客户', 2, 1, '微信群发目的'),
('marketing_purpose_wechat', '节日问候', '节日问候', 3, 1, '微信群发目的'),
('marketing_purpose_wechat', '优惠促销', '优惠促销', 4, 1, '微信群发目的'),
('marketing_purpose_wechat', '产品上新', '产品上新', 5, 1, '微信群发目的');

-- ========================================
-- 3. 风格要求 (marketing_style) - 所有场景通用
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_style', '正常', '正常', 1, 1, '营销文案风格'),
('marketing_style', '幽默', '幽默', 2, 1, '营销文案风格'),
('marketing_style', '深情', '深情', 3, 1, '营销文案风格'),
('marketing_style', '热情', '热情', 4, 1, '营销文案风格'),
('marketing_style', '急迫', '急迫', 5, 1, '营销文案风格'),
('marketing_style', '深沉', '深沉', 6, 1, '营销文案风格'),
('marketing_style', '亲切', '亲切', 7, 1, '营销文案风格'),
('marketing_style', '共情', '共情', 8, 1, '营销文案风格'),
('marketing_style', '说服', '说服', 9, 1, '营销文案风格'),
('marketing_style', '鼓励', '鼓励', 10, 1, '营销文案风格'),
('marketing_style', '崇敬', '崇敬', 11, 1, '营销文案风格');

-- ========================================
-- 4. 抖音内容要求 (marketing_content_requirement)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_content_requirement', '尽量口语化的表述', '尽量口语化的表述', 1, 1, '抖音营销内容要求'),
('marketing_content_requirement', '引用名言或权威数据，增强信任感', '引用名言或权威数据，增强信任感', 2, 1, '抖音营销内容要求'),
('marketing_content_requirement', '与其他同行对比，强调优势', '与其他同行对比，强调优势', 3, 1, '抖音营销内容要求'),
('marketing_content_requirement', '以我的视角深入场景描述体验', '以我的视角深入场景描述体验', 4, 1, '抖音营销内容要求');

-- ========================================
-- 5. 朋友圈/微信字数要求 (marketing_wordcount_moments)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_wordcount_moments', '20字以内', '20字以内', 1, 1, '朋友圈/微信字数要求'),
('marketing_wordcount_moments', '20-50字', '20-50字', 2, 1, '朋友圈/微信字数要求'),
('marketing_wordcount_moments', '50-100字', '50-100字', 3, 1, '朋友圈/微信字数要求'),
('marketing_wordcount_moments', '100-200字', '100-200字', 4, 1, '朋友圈/微信字数要求'),
('marketing_wordcount_moments', '200-500字', '200-500字', 5, 1, '朋友圈/微信字数要求'),
('marketing_wordcount_moments', '500-1000字', '500-1000字', 6, 1, '朋友圈/微信字数要求');

-- ========================================
-- 6. 小红书字数要求 (marketing_wordcount_xiaohongshu)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_wordcount_xiaohongshu', '200字以内', '200字以内', 1, 1, '小红书字数要求'),
('marketing_wordcount_xiaohongshu', '200-500字', '200-500字', 2, 1, '小红书字数要求'),
('marketing_wordcount_xiaohongshu', '500-1000字', '500-1000字', 3, 1, '小红书字数要求'),
('marketing_wordcount_xiaohongshu', '1000-1500字', '1000-1500字', 4, 1, '小红书字数要求');

-- ========================================
-- 7. 公众号字数要求 (marketing_wordcount_official)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_wordcount_official', '500字以内', '500字以内', 1, 1, '公众号字数要求'),
('marketing_wordcount_official', '500-1000字', '500-1000字', 2, 1, '公众号字数要求'),
('marketing_wordcount_official', '1000-2000字', '1000-2000字', 3, 1, '公众号字数要求'),
('marketing_wordcount_official', '2000-3000字', '2000-3000字', 4, 1, '公众号字数要求'),
('marketing_wordcount_official', '3000-5000字', '3000-5000字', 5, 1, '公众号字数要求');

-- ========================================
-- 8. 营销场景类型 (marketing_scene_type)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_scene_type', '朋友圈文案', 'moments', 1, 1, '营销场景类型'),
('marketing_scene_type', '微信群发文案', 'wechat', 2, 1, '营销场景类型'),
('marketing_scene_type', '抖音营销文案', 'douyin', 3, 1, '营销场景类型'),
('marketing_scene_type', '小红书营销文案', 'xiaohongshu', 4, 1, '营销场景类型'),
('marketing_scene_type', '短视频拍摄脚本', 'video_script', 5, 1, '营销场景类型'),
('marketing_scene_type', '公众号推文', 'official', 6, 1, '营销场景类型');

-- ========================================
-- 9. 反馈类型 (marketing_feedback_type)
-- ========================================
INSERT INTO `dictionary` (`dict_type`, `dict_label`, `dict_value`, `sort`, `status`, `remark`) VALUES
('marketing_feedback_type', '内容不准确', '内容不准确', 1, 1, '文案反馈类型'),
('marketing_feedback_type', '风格不对', '风格不对', 2, 1, '文案反馈类型'),
('marketing_feedback_type', '太短了', '太短了', 3, 1, '文案反馈类型'),
('marketing_feedback_type', '太长了', '太长了', 4, 1, '文案反馈类型'),
('marketing_feedback_type', '其他问题', '其他问题', 5, 1, '文案反馈类型');

-- ========================================
-- 完成
-- ========================================
-- 说明：
-- 1. 共添加9类字典数据，共46条记录
-- 2. 涵盖AI营销助手的所有配置选项
-- 3. 所有字典项默认启用（status = 1）
-- 4. 用于前端下拉选择和数据验证
-- ========================================
