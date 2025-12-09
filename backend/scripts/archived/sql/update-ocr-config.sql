-- ======================================================
-- OCR配置优化 - 提升微信聊天记录识别准确率至85-90%
-- 创建日期: 2025-11-22
-- 阶段1: 配置优化（预计提升+5-10%）
-- ======================================================

-- 1. 更新豆包OCR配置参数
-- ======================================================

UPDATE ai_prompt_configs
SET
  -- 温度参数降低到0.01，确保输出更加确定性和一致性
  temperature = 0.01,

  -- 增加最大tokens到4096，支持更长的聊天记录识别
  max_tokens = 4096,

  -- 增强型系统提示词
  system_prompt = '你是微信聊天记录OCR识别专家，拥有99%准确率。

核心要求：
1. 字符级精准：每个中文字、英文字母、数字必须100%准确
2. 格式严格保持：换行、空格、缩进完全一致
3. 标点符号：中英文标点严格区分（。vs.）
4. 特殊处理：
   - 表情符号：用[emoji:描述]标记
   - 图片/视频：标记为[图片] [视频]
   - 不确定字符：用[?可能是X]标注
5. 微信特有元素识别：系统提示、语音、红包等
6. 时间格式：严格按"HH:MM"或"MM-DD HH:MM"

关键原则：
- 宁可标注不确定，不可猜测
- 相似字符优先选常用字（0vsO，1vsl）
- 保持对话完整性和连贯性',

  -- 增强型用户提示词
  prompt_content = '请识别此微信聊天截图，按以下格式输出：

【昵称】时间
消息内容（完整保留格式）

识别检查清单：
✓ 每个字符是否清晰准确
✓ 中英文标点是否正确
✓ 时间格式是否标准
✓ 昵称是否完整
✓ 表情/图片是否标注
✓ 系统消息是否识别

对不确定的内容标注[?]，不要猜测。',

  -- 更新修改时间
  update_time = NOW()

WHERE
  scenario_key = 'chat_ocr_extract'
  AND model_provider = 'doubao';

-- 2. 验证更新结果
-- ======================================================

SELECT '✅ OCR配置优化完成！' AS message;
SELECT '' AS blank1;

SELECT
  scenario_key AS '场景Key',
  model_provider AS '模型供应商',
  model_name AS '模型名称',
  temperature AS '温度参数',
  max_tokens AS '最大Tokens',
  CHAR_LENGTH(system_prompt) AS '系统提示词长度',
  CHAR_LENGTH(prompt_content) AS '用户提示词长度',
  update_time AS '更新时间'
FROM ai_prompt_configs
WHERE scenario_key = 'chat_ocr_extract' AND model_provider = 'doubao';

SELECT '' AS blank2;

-- 3. 配置详情查看
-- ======================================================

SELECT '📋 系统提示词（前200字符）：' AS title1;
SELECT LEFT(system_prompt, 200) AS system_prompt_preview
FROM ai_prompt_configs
WHERE scenario_key = 'chat_ocr_extract' AND model_provider = 'doubao';

SELECT '' AS blank3;

SELECT '📋 用户提示词（前200字符）：' AS title2;
SELECT LEFT(prompt_content, 200) AS prompt_content_preview
FROM ai_prompt_configs
WHERE scenario_key = 'chat_ocr_extract' AND model_provider = 'doubao';

SELECT '' AS blank4;

-- 4. 后续阶段说明
-- ======================================================

SELECT '📝 OCR优化5阶段计划进度：' AS progress_title;
SELECT '' AS blank5;

SELECT '✅ 阶段1: 配置优化（预计+5-10%）- 已完成' AS stage1;
SELECT '⏳ 阶段2: 双重识别+对比（预计+12-15%）- 待实施' AS stage2;
SELECT '⏳ 阶段3: 图像预处理（预计+5%）- 待实施' AS stage3;
SELECT '⏳ 阶段4: 后处理纠错（预计+8%）- 待实施' AS stage4;
SELECT '⏳ 阶段5: 置信度检测（预计+7%）- 待实施' AS stage5;

SELECT '' AS blank6;

SELECT '🎯 目标准确率: 85-90%' AS target;
SELECT '📊 当前阶段完成后预计准确率: 65-80%' AS estimated_accuracy;

SELECT '' AS blank7;

-- 5. 重要提示
-- ======================================================

SELECT '⚠️ 重要提示：' AS notice_title;
SELECT '1. 执行此脚本后，需要重启后端服务以加载新配置' AS tip1;
SELECT '2. 建议使用实际微信截图测试识别效果' AS tip2;
SELECT '3. 如需回滚配置，请查看 ai_prompt_config 表的历史记录' AS tip3;
SELECT '4. 后续阶段需要修改代码实现，将在 doubao-ocr.service.ts 中完成' AS tip4;

-- Migration completed
