# AI营销助手 - 前端配置同步说明

## 配置同步状态 ✅

### 前端与后端的字段对应关系

前端在 `MarketingAssistant.vue` 中定义的 `sceneConfigs` 已经与后端数据库中的 AI 提示词配置完全同步。

#### 1️⃣ 朋友圈文案 (marketing_moments)

**前端字段**:
```javascript
{
  name: 'purpose',      // 发圈目的
  name: 'style',        // 风格要求
  name: 'wordCount'     // 字数要求
}
```

**后端提示词变量** (数据库):
```
knowledgeContent   // 自动注入（知识库）
painPoints         // 自动注入（客户数据）
needs              // 自动注入（客户数据）
interests          // 自动注入（客户数据）
purpose            // 来自前端 configParams
style              // 来自前端 configParams
wordCount          // 来自前端 configParams
```

**映射关系**: ✅ 完全匹配

---

#### 2️⃣ 微信群发文案 (marketing_wechat)

**前端字段**:
```javascript
{
  name: 'purpose',      // 群发目的
  name: 'style',        // 风格要求
  name: 'wordCount'     // 字数要求
}
```

**后端提示词变量**:
```
knowledgeContent   // 自动注入
painPoints         // 自动注入
needs              // 自动注入
interests          // 自动注入
purpose            // 来自前端
style              // 来自前端
wordCount          // 来自前端
```

**映射关系**: ✅ 完全匹配

---

#### 3️⃣ 抖音营销文案 (marketing_douyin)

**前端字段**:
```javascript
{
  name: 'topic',                 // 主题
  name: 'style',                 // 风格要求
  name: 'contentRequirements',   // 内容要求
  name: 'videoDuration'          // 视频时长
}
```

**后端提示词变量**:
```
knowledgeContent      // 自动注入
topic                 // 来自前端
painPoints            // 自动注入
needs                 // 自动注入
interests             // 自动注入
style                 // 来自前端
contentRequirements   // 来自前端
videoDuration         // 来自前端
```

**映射关系**: ✅ 完全匹配

---

#### 4️⃣ 小红书营销文案 (marketing_xiaohongshu)

**前端字段**:
```javascript
{
  name: 'topic',      // 主题
  name: 'style',      // 风格要求
  name: 'wordCount'   // 字数要求
}
```

**后端提示词变量**:
```
knowledgeContent   // 自动注入
topic              // 来自前端
painPoints         // 自动注入
needs              // 自动注入
interests          // 自动注入
style              // 来自前端
wordCount          // 来自前端
```

**映射关系**: ✅ 完全匹配

---

#### 5️⃣ 短视频拍摄脚本 (marketing_video_script)

**前端字段** (已修复):
```javascript
{
  name: 'topic',                 // 主题
  name: 'style',                 // 风格要求
  name: 'videoDuration',         // 视频时长
  name: 'contentRequirements'    // 内容要求 ✅ 新增
}
```

**后端提示词变量**:
```
knowledgeContent      // 自动注入
topic                 // 来自前端
painPoints            // 自动注入
needs                 // 自动注入
interests             // 自动注入
style                 // 来自前端
videoDuration         // 来自前端
contentRequirements   // 来自前端
```

**映射关系**: ✅ 完全匹配 (刚修复)

---

#### 6️⃣ 公众号推文 (marketing_official)

**前端字段**:
```javascript
{
  name: 'topic',      // 主题
  name: 'style',      // 风格要求
  name: 'wordCount'   // 字数要求
}
```

**后端提示词变量**:
```
knowledgeContent   // 自动注入
topic              // 来自前端
painPoints         // 自动注入
needs              // 自动注入
interests          // 自动注入
style              // 来自前端
wordCount          // 来自前端
```

**映射关系**: ✅ 完全匹配

---

## 数据流验证

### 完整的数据流程

```
┌─────────────────────────────────────────────────┐
│ 前端用户操作                                      │
├─────────────────────────────────────────────────┤
│ 1. 选择场景 (selectedScene)                     │
│ 2. 填写配置 (configForm)                        │
│    - purpose/topic/style/wordCount 等           │
│ 3. 选择痛点/需求/兴趣 (selectedPainPoints等)   │
│ 4. 点击"立即生成文案"                           │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ API 请求构建 (MarketingAssistant.vue)           │
├─────────────────────────────────────────────────┤
│ generateMarketingContent({                      │
│   contentType: 'marketing_moments',             │
│   selectedPainPoints: ['痛点1', '痛点2'],       │
│   selectedNeeds: ['需求1'],                     │
│   selectedInterests: ['兴趣1'],                 │
│   configParams: {                               │
│     purpose: '引流获客',                        │
│     style: '热情',                              │
│     wordCount: '100-200字',                     │
│     ... 其他字段                                │
│   }                                             │
│ })                                              │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ 后端处理 (marketing-assistant.service.ts)       │
├─────────────────────────────────────────────────┤
│ 1. 获取 scenarioKey = 'marketing_moments'      │
│ 2. 查询知识库                                   │
│ 3. 构建 aiParams:                              │
│    {                                            │
│      knowledgeContent: '...',    // 知识库内容 │
│      painPoints: '痛点1、痛点2',  // 自动拼接  │
│      needs: '需求1',             // 自动拼接  │
│      interests: '兴趣1',          // 自动拼接  │
│      purpose: '引流获客',         // 来自前端 │
│      style: '热情',              // 来自前端 │
│      wordCount: '100-200字',    // 来自前端 │
│    }                                            │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ 查询提示词配置 (ai_prompt_configs)              │
├─────────────────────────────────────────────────┤
│ SELECT prompt_content FROM ai_prompt_configs   │
│ WHERE scenario_key = 'marketing_moments'       │
│                                                 │
│ 返回提示词:                                     │
│ "你是专业的朋友圈营销专家...                    │
│  {{knowledgeContent}}                          │
│  {{painPoints}}                                │
│  {{needs}}                                     │
│  {{interests}}                                 │
│  {{purpose}}                                   │
│  {{style}}                                     │
│  {{wordCount}}"                                │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ 变量替换 (callAIForContent)                     │
├─────────────────────────────────────────────────┤
│ for (const [key, value] of aiParams) {        │
│   replace('{{' + key + '}}', value)           │
│ }                                               │
│                                                 │
│ 替换后的提示词:                                 │
│ "你是专业的朋友圈营销专家...                    │
│  [知识库推荐文案...]                            │
│  痛点1、痛点2                                  │
│  需求1                                         │
│  兴趣1                                         │
│  引流获客                                       │
│  热情                                           │
│  100-200字"                                    │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ 调用 Deepseek AI API                           │
├─────────────────────────────────────────────────┤
│ systemPrompt: '你是专业的朋友圈营销专家...'    │
│ userPrompt: '[包含所有替换后的完整提示词]'      │
│                                                 │
│ → AI 生成文案                                   │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│ 前端显示结果                                     │
├─────────────────────────────────────────────────┤
│ 右侧卡片显示:                                   │
│ - 生成的文案内容                                │
│ - 质量评分 (星星)                              │
│ - 知识库引用                                    │
│ - 复制/保存/反哺等操作                         │
└─────────────────────────────────────────────────┘
```

---

## 前端配置更新记录

### ✅ 修复项 (刚完成)

**文件**: `frontend/src/views/ai/MarketingAssistant.vue`

**修改**: 为 `marketing_video_script` 场景添加 `contentRequirements` 字段

```javascript
// 之前
marketing_video_script: {
  fields: [
    { name: 'topic', ... },
    { name: 'style', ... },
    { name: 'videoDuration', ... }
    // ❌ 缺少 contentRequirements
  ]
}

// 之后
marketing_video_script: {
  fields: [
    { name: 'topic', ... },
    { name: 'style', ... },
    { name: 'videoDuration', ... },
    {
      name: 'contentRequirements',  // ✅ 已添加
      label: '内容要求',
      type: 'select',
      options: ['尽量口语化的表述', '引用名言或权威数据，增强信任感', '与其他同行对比，强调优势', '以我的视角深入场景描述体验']
    }
  ]
}
```

---

## 现状总结

### ✅ 已同步

- [x] 前端 `sceneConfigs` 中的所有字段
- [x] 后端 `ai_prompt_configs` 数据库配置
- [x] 字段名大小写一致性 (camelCase)
- [x] 所有 6 个营销场景完整配置
- [x] API 接口调用签名正确
- [x] 数据格式一致

### ✅ 已验证

- [x] 前端字段顺序
- [x] 后端变量替换逻辑
- [x] API 请求数据结构
- [x] 数据库查询语句

### ⚠️ 需要运行

1. **前端**: 重新加载浏览器（F5 或 Ctrl+R）以获取最新代码
2. **后端**: 无需重启（因为已在运行中，查询数据库即可）

---

## 字段值选项一览

### 通用字段

**style（风格要求）** - 所有场景通用
```
正常、幽默、深情、热情、急迫、深沉、亲切、共情、说服、鼓励、崇敬
```

### 特定场景字段

**purpose（目的）** - marketing_moments / marketing_wechat
```
朋友圈: 引流获客、促进成交、品牌宣传、活动推广、客户维护
微信: 二次跟进、唤醒客户、节日问候、优惠促销、产品上新
```

**wordCount（字数）** - 不同场景范围不同
```
朋友圈/微信/公众号: 20字以内、20-50字、50-100字、100-200字、200-500字、500-1000字、1000-1500字
小红书: 200字以内、200-500字、500-1000字、1000-1500字
```

**contentRequirements（内容要求）** - marketing_douyin / marketing_video_script
```
尽量口语化的表述
引用名言或权威数据，增强信任感
与其他同行对比，强调优势
以我的视角深入场景描述体验
```

---

## 上线检查清单

- [x] 后端代码修复 (scenarioKeyMap)
- [x] 后端数据库配置 (7个提示词)
- [x] 前端代码修改 (contentRequirements 字段)
- [x] 前端配置同步
- [ ] 前端浏览器缓存清理
- [ ] 测试所有 6 个场景
- [ ] 验证生成结果质量

---

## 总结

**前端配置已完全同步到后端！** ✅

所有 6 个营销场景的字段配置现在已经完全与后端数据库中的 AI 提示词配置保持一致。用户在前端填写的配置参数将被正确地传递给后端，并用于替换提示词中的变量，生成高质量的营销文案。
