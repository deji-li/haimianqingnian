# 百度OCR配置和使用指南

## 📋 功能说明

为AI话术助手添加百度OCR作为备选OCR服务，提升微信聊天截图识别准确率。系统支持在**豆包OCR**和**百度OCR**之间动态切换，通过数据库配置即时生效。

### 识别准确率对比

| OCR服务 | 准确率 | 优势 | 劣势 |
|---------|--------|------|------|
| 豆包OCR | 60-70% | 成本低、响应快 | 复杂字符识别弱、数字"0"易错 |
| 百度OCR | 85-90% (预期) | 高精度版、复杂场景强 | 成本较高、需要额外配置 |

---

## 🚀 快速开始

### 步骤1: 执行数据库迁移

按顺序执行以下SQL脚本：

```bash
# 1. 添加secret_key字段并更新provider枚举
mysql -u root -p your_database < backend/add-secret-key-to-ai-api-keys.sql

# 2. 插入OCR提供商选择配置
mysql -u root -p your_database < backend/insert-ocr-provider-config.sql

# 3. 插入百度OCR API配置（需要先修改密钥）
mysql -u root -p your_database < backend/insert-baidu-ocr-config.sql
```

### 步骤2: 获取百度OCR密钥

1. 访问百度智能云控制台：https://console.bce.baidu.com/ai/#/ai/ocr/overview/index
2. 创建应用并开通"**通用文字识别-高精度版**"服务
3. 获取 **API Key** 和 **Secret Key**

### 步骤3: 配置百度OCR密钥

**方式一：直接修改SQL脚本（推荐）**

编辑 `backend/insert-baidu-ocr-config.sql`，替换以下内容：

```sql
'your_baidu_api_key',      -- 替换为实际的 API Key
'your_baidu_secret_key',   -- 替换为实际的 Secret Key
```

然后执行：
```bash
mysql -u root -p your_database < backend/insert-baidu-ocr-config.sql
```

**方式二：通过系统设置页面配置**

1. 登录系统后台
2. 进入"系统设置" → "AI配置"
3. 找到"百度OCR"配置项
4. 填写API Key和Secret Key
5. 点击保存

**方式三：直接更新数据库**

```sql
UPDATE ai_api_keys
SET api_key = '你的API_Key',
    secret_key = '你的Secret_Key'
WHERE provider = 'baidu';
```

### 步骤4: 切换OCR服务

**启用百度OCR：**

```sql
UPDATE business_config
SET config_value = 'baidu'
WHERE config_key = 'ocr_provider';
```

**切换回豆包OCR：**

```sql
UPDATE business_config
SET config_value = 'doubao'
WHERE config_key = 'ocr_provider';
```

**查看当前配置：**

```sql
SELECT * FROM business_config WHERE config_key = 'ocr_provider';
```

---

## 🔧 技术实现细节

### 架构设计

```
用户上传聊天截图
    ↓
AI话术助手 (ai-chat.service.ts)
    ↓
读取OCR提供商配置 (business_config.ocr_provider)
    ↓
动态选择OCR服务
    ├─ config_value = 'doubao' → DoubaoOcrService
    └─ config_value = 'baidu'  → BaiduOcrService
    ↓
OCR识别文字
    ↓
Deepseek分析对话内容
    ↓
生成销售话术
```

### 百度OCR服务特性

**D:\CC\1.1\backend\src\common\services\ai\baidu-ocr.service.ts**

1. **OAuth 2.0认证** - 自动获取并缓存Access Token（30天有效期）
2. **配置优先级** - 数据库配置 > 环境变量
3. **智能缓存** - 配置缓存1分钟，减少数据库查询
4. **图片预处理** - 使用Jimp增强图片（放大、对比度、锐化）
5. **错误处理** - 详细日志记录，失败自动fallback

### 配置读取流程

```typescript
// 1. 从数据库读取配置（带1分钟缓存）
private async getApiConfig() {
  if (this.cachedConfig && Date.now() - this.cachedConfig.lastUpdate < 60000) {
    return this.cachedConfig; // 返回缓存
  }

  // 2. 查询数据库
  const dbConfig = await this.aiApiKeyService.findByProvider('baidu');

  // 3. 获取Access Token（30天缓存）
  const accessToken = await this.getAccessToken(dbConfig.apiKey, dbConfig.secretKey);

  // 4. 更新缓存
  this.cachedConfig = { apiKey, secretKey, accessToken, tokenExpireTime, lastUpdate };
}
```

### 动态服务选择

**D:\CC\1.1\backend\src\modules\ai-chat\ai-chat.service.ts:getOcrService()**

```typescript
private async getOcrService() {
  const ocrProvider = await this.businessConfigService.getConfig('ocr_provider');

  if (ocrProvider === 'baidu') {
    this.logger.log('使用百度OCR服务');
    return this.baiduOcrService;
  }

  this.logger.log('使用豆包OCR服务');
  return this.doubaoOcrService; // 默认
}
```

---

## 📊 测试和验证

### 1. 验证配置是否正确

```sql
-- 检查百度OCR密钥配置
SELECT provider, api_key, secret_key, is_active
FROM ai_api_keys
WHERE provider = 'baidu';

-- 检查OCR提供商选择
SELECT config_key, config_value
FROM business_config
WHERE config_key = 'ocr_provider';
```

### 2. 测试百度OCR识别

1. 登录系统，进入"AI话术助手"
2. 上传一张微信聊天截图
3. 查看后端日志，确认使用的OCR服务：
   ```
   [AiChatService] 使用百度OCR服务
   [BaiduOcrService] 使用数据库中的百度OCR配置
   [BaiduOcrService] 成功识别图片文字
   ```
4. 检查识别结果准确性

### 3. 对比测试建议

准备相同的测试图片，分别测试两种OCR服务：

| 测试项 | 豆包OCR | 百度OCR | 对比结果 |
|--------|---------|---------|----------|
| 简单文字 | ✓ | ✓ | - |
| 复杂字符 | ✗ | ✓ | **百度OCR更强** |
| 数字"0" | ✗ | ✓ | **百度OCR更准** |
| 识别速度 | 快 | 中等 | 豆包略快 |
| 成本 | 低 | 中 | 豆包更低 |

---

## ⚠️ 注意事项

### 1. 配置生效时间
- **OCR提供商切换**：立即生效（有1分钟缓存）
- **API密钥更新**：立即生效（Access Token 30天缓存）

### 2. 成本控制
- 百度OCR按次计费，建议先小规模测试
- 可以根据客户类型动态选择OCR服务（VIP客户用百度，普通客户用豆包）

### 3. 错误排查

**问题：切换到百度OCR后报错"access_token invalid"**
- 检查API Key和Secret Key是否正确
- 确认百度云账户已开通"通用文字识别-高精度版"服务
- 查看后端日志中的详细错误信息

**问题：识别结果仍然不准确**
- 尝试调整图片预处理参数（baidu-ocr.service.ts:preprocessImage）
- 检查原始图片质量（分辨率、清晰度）
- 考虑使用百度OCR的其他API（如带位置信息的版本）

**问题：配置不生效**
- 等待1分钟让缓存过期
- 检查数据库配置是否正确保存
- 重启后端服务强制刷新缓存

---

## 🎯 提示词优化建议

虽然百度OCR本身不需要提示词（直接调用API），但后续的Deepseek分析环节仍需要优化提示词：

### 当前Deepseek分析提示词

**D:\CC\1.1\backend\src\modules\ai-chat\ai-chat.service.ts** (使用场景：分析OCR识别结果)

建议在 `ai_prompt_configs` 表中为 `chat_analysis` 场景优化提示词：

```sql
-- 优化Deepseek分析OCR结果的提示词
UPDATE ai_prompt_configs
SET system_prompt = '你是一个专业的客户对话分析专家。你擅长从微信聊天记录中提取关键信息，包括：
1. 客户需求和痛点
2. 购买意向强度
3. 预算范围
4. 决策时间线
5. 竞品对比情况

请基于OCR识别的文字（可能有少量识别错误），进行智能理解和分析。',
prompt_content = '请分析这段微信聊天记录，提取以下信息：
- 客户基本信息（称呼、身份）
- 主要需求和关键问题
- 购买意向评分（1-10分）
- 推荐的跟进话术方向

OCR识别文字（可能有轻微错误，请智能理解）：
{ocr_text}'
WHERE scenario_key = 'chat_analysis' AND provider = 'deepseek';
```

### 提示词优化要点

1. **容错性**：明确告知AI"OCR结果可能有错误，需要智能理解"
2. **结构化输出**：要求AI按固定格式输出，便于前端解析
3. **领域知识**：加入销售、客户服务的领域知识
4. **上下文感知**：结合客户历史记录进行分析

---

## 📈 后续优化方向

1. **智能OCR选择** - 根据图片复杂度自动选择OCR服务
2. **成本监控** - 统计百度OCR调用次数和费用
3. **A/B测试** - 收集准确率数据，对比两种OCR效果
4. **自定义预处理** - 针对不同截图类型优化图片预处理参数
5. **OCR结果后处理** - 基于业务规则修正常见错误（如"0"和"O"混淆）

---

## 📞 支持

如有问题，请查看：
1. 后端日志：`backend/logs/application.log`
2. 数据库配置表：`ai_api_keys`, `business_config`
3. 百度OCR文档：https://cloud.baidu.com/doc/OCR/s/zk3h7xz52

---

**最后更新时间**：2025-11-22
**版本**：v1.0.0
