# AI营销助手 - 完整测试检查清单

## ✅ 已完成的工作

### 1. 后端代码修复
- [x] 移除过时的 `scenarioKeyMap` 映射逻辑
- [x] 直接使用前端发来的 `contentType` 作为 `scenarioKey`
- [x] 文件: `backend/src/modules/ai-marketing/marketing-assistant.service.ts` (第209-211行)

### 2. 数据库提示词配置
- [x] 创建6个特定营销场景的提示词 (marketing_moments, marketing_wechat, marketing_douyin, marketing_xiaohongshu, marketing_video_script, marketing_official)
- [x] 创建纯AI降级方案提示词 (marketing_pure_ai)
- [x] 修复所有提示词的变量格式: `{var}` → `{{var}}`
- [x] 执行SQL: `init-marketing-assistant-prompts.sql` 和 `fix-marketing-prompt-variables.sql`

### 3. 数据结构对齐
- [x] 前端 `configParams` 字段名与提示词变量名对齐
- [x] 后端 `aiParams` 包含所有需要的变量
- [x] 变量替换逻辑正确 (双大括号格式)

---

## 🧪 测试步骤

### Step 1: 数据库验证

在MySQL中执行以下查询:

```sql
-- 验证营销提示词数量
SELECT COUNT(*) as total_marketing_configs
FROM ai_prompt_configs
WHERE scenario_key LIKE 'marketing_%'
AND is_active = 1;
-- 预期: 8

-- 验证每个场景的提示词配置
SELECT
  scenario_key,
  scenario_name,
  SUBSTRING(prompt_content, 1, 50) as prompt_preview,
  variables
FROM ai_prompt_configs
WHERE scenario_key LIKE 'marketing_%'
ORDER BY scenario_key;

-- 验证所有提示词使用 {{}} 格式
SELECT
  scenario_key,
  IF(prompt_content LIKE '%{{%}}%', '✓ 使用{{}}格式', '✗ 格式错误') as format_check
FROM ai_prompt_configs
WHERE scenario_key LIKE 'marketing_%';
```

### Step 2: 浏览器前端测试

#### 2.1 朋友圈文案 (marketing_moments)
1. 打开 AI营销助手 页面
2. 在左侧选择 "朋友圈文案"
3. 填写配置:
   - 发圈目的: 选择 "引流获客"
   - 风格要求: 选择 "热情"
   - 字数要求: 选择 "100-200字"
4. 点击 "立即生成文案"
5. **验证**:
   - ✅ 生成了文案内容
   - ✅ 文案内容符合热情风格
   - ✅ 文案长度在100-200字
   - ✅ 包含客户痛点/需求内容

#### 2.2 微信群发文案 (marketing_wechat)
1. 选择 "微信群发文案"
2. 填写配置:
   - 群发目的: "促销优惠"
   - 风格要求: "说服"
   - 字数要求: "50-100字"
3. 生成文案
4. **验证**:
   - ✅ 文案具有说服力
   - ✅ 长度在指定范围

#### 2.3 抖音营销文案 (marketing_douyin)
1. 选择 "抖音营销文案"
2. 填写配置:
   - 主题: "在线教育课程"
   - 风格要求: "幽默"
   - 内容要求: "尽量口语化的表述"
   - 视频时长: "30秒"
3. 生成文案
4. **验证**:
   - ✅ 文案包含主题内容
   - ✅ 语言风格幽默口语
   - ✅ 内容考虑了30秒时长

#### 2.4 小红书营销文案 (marketing_xiaohongshu)
1. 选择 "小红书营销文案"
2. 填写配置:
   - 主题: "职业培训"
   - 风格要求: "深情"
   - 字数要求: "200-500字"
3. 生成文案
4. **验证**:
   - ✅ 具有小红书的种草风格
   - ✅ 带有情感共鸣
   - ✅ 字数符合要求

#### 2.5 短视频拍摄脚本 (marketing_video_script)
1. 选择 "短视频拍摄脚本"
2. 填写配置:
   - 主题: "产品演示"
   - 风格要求: "正常"
   - 内容要求: "以我的视角深入场景描述体验"
   - 视频时长: "1分钟"
3. 生成脚本
4. **验证**:
   - ✅ 脚本包含明确的场景描述
   - ✅ 有旁白和对话内容
   - ✅ 结构清晰(开场/中间/结尾)
   - ✅ 时长在1分钟内

#### 2.6 公众号推文 (marketing_official)
1. 选择 "公众号推文"
2. 填写配置:
   - 主题: "学习方法论"
   - 风格要求: "鼓励"
   - 字数要求: "200-500字"
3. 生成推文
4. **验证**:
   - ✅ 推文结构完整(标题+内容+号召)
   - ✅ 语言具有鼓励性
   - ✅ 有行动号召

### Step 3: 浏览器控制台验证

在浏览器F12开发者工具中:

#### Network 标签
1. 找到 `/ai-marketing/assistant/generate` 请求
2. **查看请求体 (Request Payload)**:
   ```json
   {
     "contentType": "marketing_moments",
     "selectedPainPoints": [...],
     "selectedNeeds": [...],
     "selectedInterests": [...],
     "configParams": {
       "purpose": "...",
       "style": "...",
       "wordCount": "..."
     }
   }
   ```
3. **查看响应 (Response)**:
   ```json
   {
     "content": "生成的文案内容",
     "historyId": 123,
     "generationMode": "knowledge_ai",
     "knowledgeCount": 5,
     "knowledgeReferences": [...],
     "qualityScore": 3.5,
     "customerInsights": {...}
   }
   ```

#### Console 标签
- [x] 没有 JavaScript 错误
- [x] 请求数据正确打印
- [x] API 响应正确

### Step 4: 后端日志验证

在后端启动的终端中查看日志:

```
[NestFactory] Starting Nest application...
[InstanceLoader] AppModule dependencies initialized
...
[MarketingAssistantService] 开始生成营销文案, 场景: marketing_moments, 用户: 1
[MarketingAssistantService] 知识库搜索结果: 找到 N 条相关内容
[MarketingAssistantService] 知识库优先生成成功, 质量评分: 3.5
...
```

**查看项**:
- [x] 场景识别正确 (marketing_moments)
- [x] 知识库搜索完成
- [x] AI调用成功
- [x] 质量评分正常 (通常在 0-5 之间)
- [x] 没有异常错误

### Step 5: 边界条件测试

#### 5.1 知识库为空的情况
1. 生成文案时，如果知识库没有相关内容
2. **验证**:
   - ✅ 自动降级到纯AI模式 (generationMode: 'pure_ai')
   - ✅ 仍然能生成有效的文案
   - ✅ qualityScore 为 0.6

#### 5.2 配置参数不完整
1. 选择场景后，不填写所有配置项
2. **验证**:
   - ✅ 系统为缺失项设置默认值
   - ✅ 仍然能生成有效的文案

#### 5.3 大量内容输入
1. 在主题或其他文本框中输入大量内容
2. **验证**:
   - ✅ 系统能正确处理
   - ✅ 文案仍然在预期长度

---

## 🐛 常见错误及解决方案

### 错误1: "场景 marketing_moments 的 AI配置不存在或未启用"

**原因**: 数据库中没有该场景的提示词配置或配置未启用

**解决**:
```sql
-- 检查配置是否存在
SELECT * FROM ai_prompt_configs WHERE scenario_key = 'marketing_moments';

-- 如果不存在，执行
mysql -u root -p123456 education_crm < init-marketing-assistant-prompts.sql

-- 检查是否启用
UPDATE ai_prompt_configs SET is_active = 1 WHERE scenario_key LIKE 'marketing_%';
```

### 错误2: "生成文案失败" 且看不到具体错误

**原因**: 后端可能抛出异常，需要查看后端日志

**解决**:
1. 打开后端启动的终端
2. 查看错误日志: `[MarketingAssistantService] ERROR ...`
3. 常见问题:
   - DeepSeek API Key 无效
   - 超时 (检查 AI_TIMEOUT 配置)
   - JSON解析失败

### 错误3: 生成的文案包含 "{{variableName}}"

**原因**: 提示词中的变量没有被正确替换

**解决**:
1. 检查提示词格式: `SELECT prompt_content FROM ai_prompt_configs WHERE scenario_key = 'marketing_moments' LIMIT 1;`
2. 应该看到 `{{variableName}}` 的格式
3. 如果还是 `{variableName}`，需要执行 `fix-marketing-prompt-variables.sql`
4. 检查变量名是否一致(区分大小写):
   - 前端发送: `painPoints` (camelCase)
   - 提示词应使用: `{{painPoints}}`

### 错误4: 超时问题

**原因**: Deepseek API 响应太慢或网络问题

**解决**:
```javascript
// 增加超时时间，编辑 .env.development
AI_TIMEOUT=300000  // 从 120000 增加到 300000 (5分钟)

// 然后重启后端
```

---

## ✨ 验收标准

所有以下条件都满足，则功能可认为完成:

- [ ] 6个营销场景都能正确生成文案
- [ ] 生成的文案符合对应场景的特点和要求
- [ ] 每个场景的配置参数都能正确应用
- [ ] 知识库优先模式和纯AI降级都能工作
- [ ] 质量评分能正确显示
- [ ] 前端无JavaScript错误
- [ ] 后端日志无异常错误
- [ ] 生成速度在可接受范围 (通常5-15秒)

---

## 📝 上线前检查

- [ ] 所有SQL已执行
- [ ] 后端代码已修改
- [ ] 测试环境已验证所有场景
- [ ] 生产环境 `.env` 文件已配置 Deepseek API Key
- [ ] 文档已更新
- [ ] 团队已培训

---

## 🔧 快速命令参考

```bash
# 验证数据库配置
mysql -u root -p123456 education_crm -e "SELECT COUNT(*) FROM ai_prompt_configs WHERE scenario_key LIKE 'marketing_%';"

# 查看特定场景的提示词
mysql -u root -p123456 education_crm -e "SELECT scenario_key, scenario_name FROM ai_prompt_configs WHERE scenario_key = 'marketing_moments';"

# 启用所有营销提示词
mysql -u root -p123456 education_crm -e "UPDATE ai_prompt_configs SET is_active = 1 WHERE scenario_key LIKE 'marketing_%';"

# 查看后端日志 (实时)
tail -f backend.log | grep MarketingAssistant

# 重启后端
cd backend && npm run start:dev
```
