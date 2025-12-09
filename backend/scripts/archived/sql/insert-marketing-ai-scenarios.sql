-- ========================================
-- AI营销助手场景配置
-- 创建时间：2025-11-20
-- ========================================

-- 1. 朋友圈文案生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_moments',
  '朋友圈文案生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的营销文案专家，擅长创作吸引人的朋友圈内容。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【发圈要求】
发圈目的：{{purpose}}
风格要求：{{style}}
字数要求：{{wordCount}}

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点，精准定位客户关注点
3. 符合发圈目的，采用指定风格
4. 控制在指定字数范围内
5. 内容要有吸引力，能够引起客户共鸣

请生成符合要求的朋友圈文案。',
  0.6,
  2000,
  '["knowledgeBase", "painPoints", "needs", "interests", "purpose", "style", "wordCount"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\npurpose: 发圈目的\nstyle: 风格要求\nwordCount: 字数要求',
  1,
  1
);

-- 2. 微信群发文案生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_wechat',
  '微信群发文案生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的营销文案专家，擅长创作个性化的微信群发内容。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【群发要求】
群发目的：{{purpose}}
风格要求：{{style}}
字数要求：{{wordCount}}

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点，打造个性化内容
3. 符合群发目的（如二次跟进、节日问候等）
4. 采用指定风格，语言亲切自然
5. 控制在指定字数范围内
6. 避免群发感，增加互动性

请生成符合要求的微信群发文案。',
  0.6,
  2000,
  '["knowledgeBase", "painPoints", "needs", "interests", "purpose", "style", "wordCount"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\npurpose: 群发目的\nstyle: 风格要求\nwordCount: 字数要求',
  1,
  1
);

-- 3. 抖音营销文案生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_douyin',
  '抖音营销文案生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的短视频营销专家，擅长创作抖音平台的吸睛文案。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【文案要求】
主题：{{topic}}
风格要求：{{style}}
内容要求：{{contentRequirement}}
视频时长：{{videoLength}}秒

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点
3. 符合抖音平台特点：短平快、吸引眼球
4. 采用指定风格和内容要求
5. 文案要适配视频时长
6. 前3秒要有强烈吸引力，引导用户看完

请生成符合要求的抖音营销文案。',
  0.7,
  2500,
  '["knowledgeBase", "painPoints", "needs", "interests", "topic", "style", "contentRequirement", "videoLength"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\ntopic: 文案主题\nstyle: 风格要求\ncontentRequirement: 内容要求\nvideoLength: 视频时长（秒）',
  1,
  1
);

-- 4. 小红书营销文案生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_xiaohongshu',
  '小红书营销文案生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的小红书内容创作专家，擅长通过故事化场景吸引读者。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【文案要求】
主题：{{topic}}
风格要求：{{style}}
字数要求：{{wordCount}}

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点
3. 符合小红书平台特点：真实、种草、故事化
4. 通过场景描述和体验分享引起共鸣
5. 采用指定风格，语言生活化
6. 控制在指定字数范围内
7. 可以适当使用emoji，增加视觉效果

请生成符合要求的小红书营销文案。',
  0.7,
  2500,
  '["knowledgeBase", "painPoints", "needs", "interests", "topic", "style", "wordCount"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\ntopic: 文案主题\nstyle: 风格要求\nwordCount: 字数要求',
  1,
  1
);

-- 5. 短视频拍摄脚本生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_video_script',
  '短视频拍摄脚本生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的视频脚本策划专家，擅长创作结构完整的短视频脚本。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【脚本要求】
主题：{{topic}}
风格要求：{{style}}
视频时长：{{videoLength}}秒

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点
3. 提供完整的视频脚本，包括：
   - 开场（前3-5秒抓眼球）
   - 主体内容（问题-解决方案）
   - 结尾（引导行动）
4. 采用指定风格
5. 脚本要适配视频时长
6. 标注关键镜头和拍摄建议

请按以下格式输出视频脚本：
【开场】（X秒）
镜头：xxx
文案：xxx

【主体】（X秒）
镜头：xxx
文案：xxx

【结尾】（X秒）
镜头：xxx
文案：xxx',
  0.6,
  3000,
  '["knowledgeBase", "painPoints", "needs", "interests", "topic", "style", "videoLength"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\ntopic: 脚本主题\nstyle: 风格要求\nvideoLength: 视频时长（秒）',
  1,
  1
);

-- 6. 公众号推文生成
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_official',
  '公众号推文生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的公众号内容运营专家，擅长创作深度有价值的推文。',
  '【企业知识库】
{{knowledgeBase}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【推文要求】
主题：{{topic}}
风格要求：{{style}}
字数要求：{{wordCount}}

【任务要求】
1. 优先基于企业知识库的准确信息
2. 结合客户痛点、需求和兴趣点
3. 提供完整的公众号推文结构：
   - 吸引人的标题
   - 引言（引起兴趣）
   - 正文（有价值的内容）
   - 结尾（引导互动/转发）
4. 采用指定风格
5. 控制在指定字数范围内
6. 内容要有深度和可读性

请生成符合要求的公众号推文。',
  0.6,
  4000,
  '["knowledgeBase", "painPoints", "needs", "interests", "topic", "style", "wordCount"]',
  'knowledgeBase: 企业知识库相关内容\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\ntopic: 推文主题\nstyle: 风格要求\nwordCount: 字数要求',
  1,
  1
);

-- 7. 纯AI生成（降级方案）
INSERT INTO ai_prompt_configs (
  scenario_key,
  scenario_name,
  scenario_category,
  model_provider,
  model_name,
  system_prompt,
  prompt_content,
  temperature,
  max_tokens,
  variables,
  variable_description,
  is_active,
  version
) VALUES (
  'marketing_pure_ai',
  '纯AI营销文案生成',
  'AI营销助手',
  'deepseek',
  'deepseek-chat',
  '你是一个专业的营销文案专家，能够为各种营销场景创作优质文案。',
  '【场景类型】
{{contentType}}

【客户洞察】
客户痛点：{{painPoints}}
客户需求：{{needs}}
客户兴趣点：{{interests}}

【文案要求】
{{configParams}}

【任务要求】
1. 结合客户痛点、需求和兴趣点
2. 创作符合场景特点的营销文案
3. 符合指定的风格和字数/时长要求
4. 内容要有吸引力，能够打动目标客户

请生成符合要求的营销文案。',
  0.7,
  3000,
  '["contentType", "painPoints", "needs", "interests", "configParams"]',
  'contentType: 营销场景类型\npainPoints: 客户痛点列表\nneeds: 客户需求列表\ninterests: 客户兴趣点列表\nconfigParams: 配置参数（JSON格式）',
  1,
  1
);

-- ========================================
-- 完成
-- ========================================
-- 说明：
-- 1. 共添加7个AI营销场景配置
-- 2. 6个主要场景 + 1个降级方案
-- 3. 所有场景都优先使用企业知识库
-- 4. 包含完整的变量和提示词
-- ========================================
