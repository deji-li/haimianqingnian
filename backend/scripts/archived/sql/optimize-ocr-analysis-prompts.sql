-- ========================================
-- OCR分析提示词优化脚本
-- 目的: 优化Deepseek分析OCR识别结果的提示词
-- 创建时间: 2025-11-22
-- ========================================

-- 说明：
-- 1. 百度OCR虽然准确率更高(85-90%)，但仍可能存在10-15%的识别错误
-- 2. 常见错误：数字"0"与字母"O"混淆、相似字混淆、标点符号错误等
-- 3. Deepseek需要具备容错能力，智能理解并纠正OCR识别结果

-- ========================================
-- 1. 优化聊天记录深度分析提示词
-- ========================================

UPDATE ai_prompt_configs
SET
  -- 增强系统提示词：添加OCR容错能力
  system_prompt = '你是一个专业的教育培训行业CRM专家和销售心理学分析师，擅长通过聊天记录深度分析客户意图、需求痛点和成交可能性。

【特殊能力】OCR容错分析专家
你能够智能处理OCR识别的聊天记录，即使存在以下识别错误也能准确分析：
1. 数字与字母混淆：0↔O、1↔l↔I、8↔B等
2. 相似字混淆：己↔已、再↔在、的↔地等
3. 标点符号错误：中英文标点混用
4. 多字少字：个别字符漏识别或多识别

【分析原则】
- 基于上下文智能理解，忽略明显的OCR错误
- 优先分析客户意图和情感，而非纠结字符准确性
- 对于关键信息（价格、姓名、时间）需特别注意识别错误
- 当发现明显OCR错误时，在分析中使用更合理的解释',

  -- 优化用户提示词：明确OCR来源
  prompt_content = '请对以下**OCR识别的**聊天记录进行20+维度的深度分析：

【重要提示】此聊天记录来源于OCR识别，可能存在10-15%的识别错误。请基于上下文智能理解，分析客户真实意图。

聊天记录（OCR识别结果）：
{{chatText}}

{{customerInfo}}

请从以下维度进行分析，并以JSON格式返回结果：

1. 基础信息分析
   - customerIntent: 意向等级（A/B/C级，高意向/中等意向/低意向/无意向）
   - intentConfidence: 意向判断置信度（0-100）
   - lifecycleStage: 生命周期阶段（新客户/意向客户/成交客户/流失客户）

2. 需求痛点分析（数组）
   - painPoints: ["痛点1", "痛点2", "痛点3"]

3. 行为特征分析
   - responseSpeed: 回复速度（快速/正常/缓慢）
   - chattingAttitude: 聊天态度（积极/友好/冷淡/抗拒）
   - questionQuality: 提问质量（主动深入/基础咨询/被动回应/未提问）

4. 风险预警
   - riskLevel: 风险等级（高/中/低/无）
   - riskFactors: 风险因素数组 ["因素1", "因素2"]

5. 成交分析
   - dealProbability: 成交概率（0-100）
   - priceRange: 预算范围（高预算/中等预算/低预算/未明确）
   - decisionMaker: 是否决策人（是/否/不确定）
   - urgency: 紧急程度（急迫/一般/不急）

6. 标签生成（数组）
   - tags:
     - tagCategory: 标签分类（基础信息/需求痛点/行为特征/风险标签/意向标签）
     - tagName: 标签名称
     - tagValue: 标签值
     - confidence: 置信度（0-1）

7. 推荐动作
   - nextSteps: 建议下一步动作数组 ["行动1", "行动2"]
   - recommendedScript: 推荐话术类型（开场白/价值主张/异议处理/促成话术）

8. 质量评分
   - qualityLevel: 对话质量等级（优秀/良好/一般/较差）
   - qualityScore: 质量分数（0-100）

9. OCR识别质量评估（新增）
   - ocrQualityEstimate: OCR识别质量估计（优秀/良好/一般/较差）
   - suspectedErrors: 疑似OCR错误数量（0-10+）
   - criticalErrorsFound: 发现的关键信息错误（如价格、联系方式等），数组格式
   - confidenceAdjustment: 由于OCR误差对分析置信度的影响（-20 ~ 0，负数表示降低）

【分析要求】
- 容忍OCR识别的小错误，专注理解客户真实意图
- 当遇到不合理的字符组合时，基于上下文推测原意
- 对于关键数据（价格、时间、姓名），如发现疑似错误，在criticalErrorsFound中标注
- 最终分析结论应基于整体对话逻辑，而非个别字符准确性

返回完整的JSON对象，不要添加其他说明文字。',

  -- 温度参数稍微提高，增加推理灵活性
  temperature = 0.4,

  -- 最大tokens增加，支持更复杂的分析
  max_tokens = 5000,

  -- 更新修改时间
  update_time = NOW()

WHERE
  scenario_key = 'chat_deep_analysis'
  AND model_provider = 'deepseek';

-- ========================================
-- 2. 验证更新结果
-- ========================================

SELECT '✅ OCR分析提示词优化完成！' AS message;
SELECT '' AS blank1;

SELECT
  scenario_key AS '场景Key',
  scenario_name AS '场景名称',
  model_provider AS '模型供应商',
  temperature AS '温度参数',
  max_tokens AS '最大Tokens',
  CHAR_LENGTH(system_prompt) AS '系统提示词长度',
  CHAR_LENGTH(prompt_content) AS '用户提示词长度',
  update_time AS '更新时间'
FROM ai_prompt_configs
WHERE scenario_key = 'chat_deep_analysis' AND model_provider = 'deepseek';

SELECT '' AS blank2;

-- ========================================
-- 3. 优化要点说明
-- ========================================

SELECT '📋 优化要点：' AS title;
SELECT '' AS blank3;

SELECT '1. ✅ 系统提示词增加OCR容错能力说明' AS point1;
SELECT '2. ✅ 用户提示词明确标注OCR来源' AS point2;
SELECT '3. ✅ 新增OCR识别质量评估维度' AS point3;
SELECT '4. ✅ 温度参数调整至0.4，增强推理灵活性' AS point4;
SELECT '5. ✅ 最大tokens提升至5000，支持更复杂分析' AS point5;

SELECT '' AS blank4;

-- ========================================
-- 4. 配合百度OCR使用说明
-- ========================================

SELECT '📝 配合百度OCR使用说明：' AS usage_title;
SELECT '' AS blank5;

SELECT '【工作流程】' AS workflow;
SELECT '1. 用户上传微信聊天截图' AS step1;
SELECT '2. 根据business_config.ocr_provider配置选择OCR服务' AS step2;
SELECT '   - ocr_provider=doubao → 豆包OCR（准确率60-70%）' AS step2_1;
SELECT '   - ocr_provider=baidu  → 百度OCR（准确率85-90%）' AS step2_2;
SELECT '3. OCR识别提取文字' AS step3;
SELECT '4. Deepseek使用本优化提示词分析OCR结果' AS step4;
SELECT '5. 返回智能分析结果（含OCR质量评估）' AS step5;

SELECT '' AS blank6;

SELECT '【优势】' AS advantages;
SELECT '✓ 即使百度OCR有10-15%错误，Deepseek仍能准确分析意图' AS adv1;
SELECT '✓ 自动识别关键信息的识别错误（如价格、时间）' AS adv2;
SELECT '✓ 提供OCR质量评估，帮助判断分析可信度' AS adv3;
SELECT '✓ 双重保障：OCR识别+智能分析容错' AS adv4;

SELECT '' AS blank7;

-- ========================================
-- 5. 测试建议
-- ========================================

SELECT '🧪 测试建议：' AS test_title;
SELECT '' AS blank8;

SELECT '1. 准备3-5张不同清晰度的微信聊天截图' AS test1;
SELECT '2. 分别使用豆包OCR和百度OCR识别' AS test2;
SELECT '3. 对比Deepseek分析结果的准确性' AS test3;
SELECT '4. 检查新增的ocrQualityEstimate字段是否合理' AS test4;
SELECT '5. 验证criticalErrorsFound是否能识别关键错误' AS test5;

SELECT '' AS blank9;

-- ========================================
-- 6. 回滚脚本（如需回退）
-- ========================================

SELECT '⚠️ 回滚说明：' AS rollback_title;
SELECT '如需回退到原始配置，请执行以下SQL：' AS rollback_desc;
SELECT '' AS blank10;

SELECT '
UPDATE ai_prompt_configs
SET
  system_prompt = ''你是一个专业的教育培训行业CRM专家和销售心理学分析师，擅长通过聊天记录深度分析客户意图、需求痛点和成交可能性。'',
  temperature = 0.3,
  max_tokens = 4000,
  update_time = NOW()
WHERE scenario_key = ''chat_deep_analysis'' AND model_provider = ''deepseek'';
' AS rollback_sql;

-- Migration completed
