-- ================================================================
-- AI营销助手 - 场景化提示词配置
-- 为AI营销助手的6个营销场景创建专门的提示词
-- 使用 INSERT IGNORE 确保不覆盖已有配置
-- ================================================================

USE education_crm;

-- ================================================================
-- 1. 朋友圈文案生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_moments',
  '朋友圈文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业营销文案专家，擅长创作引人入胜的朋友圈文案，能够激发客户的兴趣和购买欲望。',
  '请根据以下信息生成一篇朋友圈文案：

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【发圈目的】
{{purpose}}

【风格要求】
{{style}}

【字数要求】
{{wordCount}}

要求：
1. 文案要贴近朋友圈风格，自然亲切
2. 根据目的和风格灵活调整语气
3. 突出产品或服务的价值主张
4. 引发客户的共鸣和兴趣
5. 按照字数要求严格控制
6. 直接输出文案，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('painPoints', 'needs', 'interests', 'purpose', 'style', 'wordCount'),
  '【变量说明】
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
purpose: 发圈目的，如引流获客/促进成交/品牌宣传/活动推广/客户维护
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
wordCount: 字数要求，如20字以内/20-50字/50-100字/100-200字等'
);

-- ================================================================
-- 2. 微信群发文案生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_wechat',
  '微信群发文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业微信营销专家，擅长创作高转化率的微信群发文案，能够精准击中客户痛点并促进成交。',
  '请根据以下信息生成一篇微信群发文案：

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【群发目的】
{{purpose}}

【风格要求】
{{style}}

【字数要求】
{{wordCount}}

要求：
1. 文案要切合微信群发的特点，引起注意
2. 根据目的和风格调整文案策略
3. 针对痛点和需求进行有效的价值诠释
4. 能够刺激客户的行动欲望
5. 按照字数要求严格控制
6. 直接输出文案，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('painPoints', 'needs', 'interests', 'purpose', 'style', 'wordCount'),
  '【变量说明】
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
purpose: 群发目的，如二次跟进/唤醒客户/节日问候/优惠促销/产品上新
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
wordCount: 字数要求，如20字以内/20-50字/50-100字/100-200字等'
);

-- ================================================================
-- 3. 抖音营销文案生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_douyin',
  '抖音营销文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的短视频营销专家，擅长创作抖音平台上的爆款文案，能够在短时间内吸引用户注意力并驱动转化。',
  '请根据以下信息生成一篇抖音营销文案：

【主题】
{{topic}}

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【风格要求】
{{style}}

【内容要求】
{{contentRequirements}}

【视频时长】
{{videoDuration}}

要求：
1. 文案要适配抖音平台的节奏和特点
2. 开头要有强吸引力，快速引起注意
3. 结合主题、痛点和兴趣点有效组织内容
4. 根据风格和内容要求调整表达方式
5. 考虑视频时长安排叙述节奏
6. 直接输出文案，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('topic', 'painPoints', 'needs', 'interests', 'style', 'contentRequirements', 'videoDuration'),
  '【变量说明】
topic: 主题，用户输入的产品或服务主题
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
contentRequirements: 内容要求，如尽量口语化的表述/引用名言或权威数据增强信任感等
videoDuration: 视频时长，如30秒/1分钟/2分钟等'
);

-- ================================================================
-- 4. 小红书营销文案生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_xiaohongshu',
  '小红书营销文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的小红书营销专家，擅长创作能够引发用户共鸣的小红书笔记，能够讲述品牌故事并驱动转化。',
  '请根据以下信息生成一篇小红书营销文案：

【主题】
{{topic}}

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【风格要求】
{{style}}

【字数要求】
{{wordCount}}

要求：
1. 文案要符合小红书的分享风格，真实亲切
2. 通过讲述故事引发用户共鸣
3. 结合主题和客户痛点有效组织内容
4. 根据风格要求调整表达方式
5. 按照字数要求严格控制
6. 可以包含小红书常见的#话题标签
7. 直接输出文案，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('topic', 'painPoints', 'needs', 'interests', 'style', 'wordCount'),
  '【变量说明】
topic: 主题，用户输入的产品或服务主题
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
wordCount: 字数要求，如200字以内/200-500字/500-1000字等'
);

-- ================================================================
-- 5. 短视频拍摄脚本生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_video_script',
  '短视频拍摄脚本生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的短视频脚本编写专家，擅长创作高质量的短视频脚本，能够清晰表达创意并指导拍摄执行。',
  '请根据以下信息生成一份短视频拍摄脚本：

【主题】
{{topic}}

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【风格要求】
{{style}}

【视频时长】
{{videoDuration}}

【内容要求】
{{contentRequirements}}

要求：
1. 脚本要包括开场、中间、结尾三个部分
2. 清晰标注每个场景的描述和旁白内容
3. 根据视频时长合理安排内容和节奏
4. 结合痛点、需求和兴趣点有效组织故事线
5. 根据风格要求和内容要求调整表达方式
6. 脚本要具有可执行性，便于拍摄
7. 直接输出脚本内容，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('topic', 'painPoints', 'needs', 'interests', 'style', 'videoDuration', 'contentRequirements'),
  '【变量说明】
topic: 主题，用户输入的产品或服务主题
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
videoDuration: 视频时长，如30秒/1分钟/2分钟等
contentRequirements: 内容要求，如尽量口语化的表述/引用名言或权威数据增强信任感等'
);

-- ================================================================
-- 6. 公众号推文生成
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_official',
  '公众号推文生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的公众号运营专家，擅长创作高阅读量的公众号推文，能够通过优质内容提升粉丝粘性和转化。',
  '请根据以下信息生成一篇公众号推文：

【主题】
{{topic}}

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【风格要求】
{{style}}

【字数要求】
{{wordCount}}

要求：
1. 推文要有吸引人的标题或开头
2. 结构清晰，易于阅读（可以分段落、加小标题）
3. 根据风格要求调整语气和表达方式
4. 结合痛点、需求和兴趣点有效组织内容
5. 可以包含故事、数据或案例来增强说服力
6. 在结尾可以包含互动或行动号召
7. 按照字数要求严格控制
8. 直接输出推文内容，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('topic', 'painPoints', 'needs', 'interests', 'style', 'wordCount'),
  '【变量说明】
topic: 主题，用户输入的产品或服务主题
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
style: 风格要求，如正常/幽默/深情/热情/急迫/深沉/亲切/共情/说服/鼓励/崇敬
wordCount: 字数要求，如20字以内/20-50字/50-100字/100-200字等'
);

-- ================================================================
-- 7. 纯AI模式（知识库不足时的降级方案）
-- ================================================================

INSERT IGNORE INTO `ai_prompt_configs` (
  `scenario_category`,
  `scenario_key`,
  `scenario_name`,
  `model_provider`,
  `model_name`,
  `system_prompt`,
  `prompt_content`,
  `temperature`,
  `max_tokens`,
  `is_active`,
  `variables`,
  `variable_description`
) VALUES (
  'AI营销助手',
  'marketing_pure_ai',
  '纯AI模式营销文案生成',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的教育培训行业营销文案专家，擅长创作各类营销内容。在没有知识库支持的情况下，基于客户信息和要求直接生成高质量的营销文案。',
  '请根据以下信息生成营销文案：

【内容类型】
{{contentType}}

【客户痛点】
{{painPoints}}

【客户需求】
{{needs}}

【客户兴趣点】
{{interests}}

【配置参数】
{{configParams}}

要求：
1. 根据内容类型和客户信息生成相应的文案
2. 充分考虑客户的痛点、需求和兴趣
3. 应用配置参数中指定的风格、字数等要求
4. 文案要有说服力和吸引力
5. 直接输出文案内容，不要其他说明文字',
  0.8,
  2000,
  1,
  JSON_ARRAY('contentType', 'painPoints', 'needs', 'interests', 'configParams'),
  '【变量说明】
contentType: 内容类型，如朋友圈文案/微信群发等
painPoints: 客户痛点，多个用换行分隔
needs: 客户需求，多个用换行分隔
interests: 客户兴趣点，多个用换行分隔
configParams: 配置参数，包含风格、字数、目的等要求的JSON字符串'
);

-- ================================================================
-- 配置完成提示
-- ================================================================

SELECT
  '✅ AI营销助手提示词配置完成！' AS message,
  COUNT(*) AS total_marketing_prompts
FROM ai_prompt_configs
WHERE scenario_key LIKE 'marketing_%'
AND is_active = 1;

SELECT
  scenario_key AS '场景标识',
  scenario_name AS '场景名称',
  model_provider AS 'AI供应商',
  is_active AS '启用状态'
FROM ai_prompt_configs
WHERE scenario_key LIKE 'marketing_%'
ORDER BY scenario_key;
