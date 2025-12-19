# AI营销助手 - 提示词配置修复总结

## 问题分析

### 1. **前后端数据结构不匹配**
- **前端发送**: `contentType` = `'marketing_moments'`, `'marketing_wechat'`, `'marketing_douyin'`, `'marketing_xiaohongshu'`, `'marketing_video_script'`, `'marketing_official'`
- **后端期望**: `scenarioKeyMap` 映射短名称 (`'moments'`, `'wechat'` 等) 到完整名称
- **结果**: 映射失败，默认使用 `'marketing_moments'`

### 2. **AI提示词变量格式错误**
- **后端代码期望**: `{{variableName}}` 格式 (双大括号)
- **数据库原有格式**: `{variableName}` 格式 (单大括号)
- **结果**: 变量无法正确替换

### 3. **缺少特定场景的提示词配置**
- **前端需要**: 6个营销场景各有专门的提示词
  - marketing_moments (朋友圈文案)
  - marketing_wechat (微信群发文案)
  - marketing_douyin (抖音营销文案)
  - marketing_xiaohongshu (小红书营销文案)
  - marketing_video_script (短视频拍摄脚本)
  - marketing_official (公众号推文)
- **纯AI降级方案**: marketing_pure_ai

## 已实施的修复

### 1. ✅ 修复后端 scenarioKeyMap

**文件**: `backend/src/modules/ai-marketing/marketing-assistant.service.ts` (第 209-211 行)

**修改前**:
```typescript
const scenarioKeyMap = {
  moments: 'marketing_moments',
  wechat: 'marketing_wechat',
  douyin: 'marketing_douyin',
  xiaohongshu: 'marketing_xiaohongshu',
  video_script: 'marketing_video_script',
  official: 'marketing_official',
};
const scenarioKey = scenarioKeyMap[dto.contentType] || 'marketing_moments';
```

**修改后**:
```typescript
// 直接使用前端传来的contentType作为scenarioKey
// 前端已经发送了完整的场景标识
const scenarioKey = dto.contentType || 'marketing_moments';
```

### 2. ✅ 创建6个特定场景的提示词配置

**SQL文件**: `backend/init-marketing-assistant-prompts.sql`

创建了以下提示词配置:

| 场景标识 | 场景名称 | 主要变量 | 特点 |
|---------|--------|--------|------|
| marketing_moments | 朋友圈文案 | painPoints, needs, interests, purpose, style, wordCount | 短小精悍，情感丰富 |
| marketing_wechat | 微信群发文案 | painPoints, needs, interests, purpose, style, wordCount | 转化导向，行动力强 |
| marketing_douyin | 抖音营销文案 | topic, painPoints, needs, interests, style, contentRequirements, videoDuration | 快速吸引，节奏明快 |
| marketing_xiaohongshu | 小红书营销文案 | topic, painPoints, needs, interests, style, wordCount | 种草风格，故事导向 |
| marketing_video_script | 短视频脚本 | topic, painPoints, needs, interests, style, videoDuration, contentRequirements | 可执行性强，场景清晰 |
| marketing_official | 公众号推文 | topic, painPoints, needs, interests, style, wordCount | 专业深入，逻辑完整 |
| marketing_pure_ai | 纯AI模式 | contentType, painPoints, needs, interests, configParams | 降级方案，无知识库时使用 |

### 3. ✅ 修复已有提示词的变量格式

**SQL文件**: `backend/fix-marketing-prompt-variables.sql`

- 将所有 `{variableName}` 替换为 `{{variableName}}`
- 更新变量列表以匹配新的字段名
- 确保所有变量都能被后端正确替换

## 数据流验证

### 前端 → 后端

```
前端 MarketingAssistant.vue:
├─ selectedScene = 'marketing_moments'
├─ selectedPainPoints = [{content: '...', count: N}, ...]
├─ selectedNeeds = [{content: '...', count: N}, ...]
├─ selectedInterests = [{content: '...', count: N}, ...]
└─ configForm = {purpose: '...', style: '...', wordCount: '...', ...}

↓ 转换为请求数据

RequestData:
{
  contentType: 'marketing_moments',
  selectedPainPoints: ['痛点1', '痛点2', ...],
  selectedNeeds: ['需求1', '需求2', ...],
  selectedInterests: ['兴趣1', '兴趣2', ...],
  configParams: {purpose, style, wordCount, ...}
}
```

### 后端 → AI

```
GenerateMarketingContentDto:
{
  contentType: 'marketing_moments',
  selectedPainPoints: ['痛点1', '痛点2'],
  selectedNeeds: ['需求1', '需求2'],
  selectedInterests: ['兴趣1', '兴趣2'],
  configParams: {purpose, style, wordCount}
}

↓ 转换为aiParams

aiParams:
{
  knowledgeContent: '...',        // 知识库内容
  knowledgeReferences: [...],      // 知识库ID
  painPoints: '痛点1、痛点2',      // 用中文逗号连接
  needs: '需求1、需求2',          // 用中文逗号连接
  interests: '兴趣1、兴趣2',       // 用中文逗号连接
  customerInsights: {...},
  customerType: '中意向',
  purpose: '...',                  // 来自configParams
  style: '...',                    // 来自configParams
  wordCount: '...',                // 来自configParams
  ...其他configParams字段...
}

↓ 变量替换 (callAIForContent)

从数据库获取场景提示词:
SELECT prompt_content FROM ai_prompt_configs
WHERE scenario_key = 'marketing_moments'

将 {{painPoints}} 替换为 '痛点1、痛点2'
将 {{needs}} 替换为 '需求1、需求2'
将 {{interests}} 替换为 '兴趣1、兴趣2'
将 {{purpose}} 替换为 '...'
...以此类推

↓ 调用Deepseek AI

最终发送给AI的prompt包含所有替换后的具体值
```

## 关键配置参数

### 朋友圈文案 (marketing_moments)
```javascript
{
  purpose: '引流获客' | '促进成交' | '品牌宣传' | '活动推广' | '客户维护',
  style: '正常' | '幽默' | '深情' | '热情' | '急迫' | '深沉' | '亲切' | '共情' | '说服' | '鼓励' | '崇敬',
  wordCount: '20字以内' | '20-50字' | '50-100字' | '100-200字' | '200-500字' | '500-1000字' | '1000-1500字'
}
```

### 微信群发文案 (marketing_wechat)
```javascript
{
  purpose: '二次跟进' | '唤醒客户' | '节日问候' | '优惠促销' | '产品上新',
  style: [同上],
  wordCount: [同上]
}
```

### 抖音营销文案 (marketing_douyin)
```javascript
{
  topic: '用户输入的产品/服务主题',
  style: [见上],
  contentRequirements: '尽量口语化的表述' | '引用名言或权威数据增强信任感' | '与其他同行对比强调优势' | '以我的视角深入场景描述体验',
  videoDuration: '用户输入的视频时长，如30秒、1分钟等'
}
```

### 小红书营销文案 (marketing_xiaohongshu)
```javascript
{
  topic: '用户输入的产品/服务主题',
  style: [见上],
  wordCount: '200字以内' | '200-500字' | '500-1000字' | '1000-1500字'
}
```

### 短视频拍摄脚本 (marketing_video_script)
```javascript
{
  topic: '用户输入的产品/服务主题',
  style: [见上],
  videoDuration: '用户输入的视频时长',
  contentRequirements: [同抖音]
}
```

### 公众号推文 (marketing_official)
```javascript
{
  topic: '用户输入的产品/服务主题',
  style: [见上],
  wordCount: [同朋友圈]
}
```

## 测试检查清单

- [ ] **后端代码修改验证**
  - [ ] scenarioKeyMap 已被移除，直接使用 contentType
  - [ ] callAIForContent 使用 `{{variable}}` 格式进行替换

- [ ] **数据库配置验证**
  - [ ] 查询：`SELECT COUNT(*) FROM ai_prompt_configs WHERE scenario_key LIKE 'marketing_%' AND is_active = 1`
  - [ ] 预期结果：8 (6个特定场景 + 1个纯AI + 1个stats配置)
  - [ ] 验证所有提示词使用 `{{variable}}` 格式

- [ ] **端到端测试**
  - [ ] 选择朋友圈文案 → 填写配置 → 点击生成 → 验证文案输出
  - [ ] 选择抖音营销文案 → 填写主题和视频时长 → 生成 → 验证输出包含主题内容
  - [ ] 选择短视频脚本 → 验证输出格式正确（场景/旁白等）
  - [ ] 验证知识库优先模式和纯AI降级模式都能工作

- [ ] **错误处理验证**
  - [ ] 提示词不存在时是否正确报错
  - [ ] AI调用失败时是否能正确降级到纯AI模式
  - [ ] 变量替换失败时是否有正确的日志输出

## 文件修改清单

### 已修改文件
1. ✅ `backend/src/modules/ai-marketing/marketing-assistant.service.ts` (第209-211行)
   - 简化scenarioKey的获取逻辑

### 已创建文件
1. ✅ `backend/init-marketing-assistant-prompts.sql`
   - 6个特定场景的新提示词配置

2. ✅ `backend/fix-marketing-prompt-variables.sql`
   - 修复已有提示词的变量格式

## 后续工作

### 立即执行
1. ✅ 执行 `init-marketing-assistant-prompts.sql`
2. ✅ 执行 `fix-marketing-prompt-variables.sql`
3. ✅ 验证后端代码修改

### 建议验证
1. 在浏览器中测试每个营销场景
2. 查看浏览器控制台日志验证数据流
3. 查看后端日志验证提示词的加载和变量替换

### 可选优化
1. 为每个场景添加特定的系统提示词 (systemPrompt)
2. 根据实际生成效果调整提示词内容
3. 为不同的知识库集成添加特定逻辑

## 常见问题排查

**Q: 提示 "场景 {scenarioKey} 的 AI配置不存在或未启用"**
- A: 检查数据库 `ai_prompt_configs` 中该 scenarioKey 是否存在且 `is_active = 1`
- 执行: `SELECT * FROM ai_prompt_configs WHERE scenario_key = 'marketing_moments'`

**Q: 变量没有被替换，输出包含 {{variableName}}**
- A: 检查提示词中是否使用了 `{{` 和 `}}` 的双大括号格式
- 验证变量名是否与后端发送的变量一致 (区分大小写)

**Q: AI返回500错误**
- A: 检查后端日志中的具体错误信息
- 查看 DeepSeek API 的响应状态
- 检查 maxTokens 是否合理

**Q: 知识库优先模式不工作，总是降级到纯AI**
- A: 验证知识库搜索是否正常工作
- 检查 `KnowledgeIntegrationService.searchRelevantKnowledge()` 的输出
- 确认知识库中是否有相关内容
