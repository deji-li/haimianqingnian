# AI功能完整部署方案

## 📦 本次更新内容

### 1. AI提示词数据库配置系统
- **数据表**: `ai_prompt_configs`
- **功能**: 支持DeepSeek和豆包的提示词在线配置
- **场景支持**: chat_deep_analysis、chat_ocr_extract、customer_recovery_script等
- **管理界面**: PC端 系统设置 > AI配置

### 2. PC端AI智能创建客户
- **入口**: 客户管理 > AI智能创建
- **功能**: Ctrl+V粘贴聊天截图 → AI识别 → 创建客户
- **识别内容**: 基础信息、意向信息、标签画像、跟进建议（20+维度）

### 3. 移动端AI智能识别客户
- **入口**: 客户页面 > 智能创建
- **功能**: 拍照/相册选择 → AI识别 → 创建客户
- **完全兼容**: 与PC端使用相同的后端API

### 4. 菜单路由重构
- **删除模块**: OKR模块完全移除
- **新结构**: 按业务域组织（销售工具、数据分析、财务提成、系统管理）

---

## 🗄️ 数据库部署

### 1. 创建AI配置表

```sql
-- 在您的数据库中执行以下SQL
CREATE TABLE `ai_prompt_configs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scenario_key` varchar(50) NOT NULL COMMENT '场景标识：chat_deep_analysis, chat_ocr_extract等',
  `scenario_name` varchar(100) NOT NULL COMMENT '场景名称',
  `scenario_category` varchar(50) NOT NULL COMMENT '场景分类：客户管理、聊天分析等',
  `model_provider` enum('deepseek','doubao') NOT NULL COMMENT 'AI模型供应商',
  `model_name` varchar(100) DEFAULT NULL COMMENT '模型名称',
  `system_prompt` text COMMENT '系统提示词',
  `prompt_content` text NOT NULL COMMENT '用户提示词模板',
  `temperature` decimal(3,2) DEFAULT '0.30' COMMENT '温度参数',
  `max_tokens` int DEFAULT '2000' COMMENT '最大token数',
  `variables` json DEFAULT NULL COMMENT '支持的变量列表',
  `variable_description` text COMMENT '变量说明',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_scenario_provider` (`scenario_key`,`model_provider`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI提示词配置表';
```

### 2. 插入默认配置

```sql
-- 插入默认的AI配置
INSERT INTO `ai_prompt_configs`
  (`scenario_key`, `scenario_name`, `scenario_category`, `model_provider`, `model_name`, `system_prompt`, `prompt_content`, `temperature`, `max_tokens`, `variables`, `variable_description`, `is_active`)
VALUES
  ('chat_deep_analysis', '聊天深度分析', '聊天分析', 'deepseek', 'deepseek-chat',
   '你是一个专业的教育培训行业销售分析专家，擅长分析微信聊天记录并提供深度洞察。\n\n你的任务是：\n1. 深入分析销售与客户的微信聊天记录\n2. 从20+个维度全面评估客户情况\n3. 识别客户需求、痛点、异议和风险\n4. 评估商机价值和成交可能性\n5. 提供具体可执行的销售策略和话术建议\n\n分析要求：\n- 客观准确，基于事实证据\n- 洞察深入，发现隐藏信息\n- 建议具体，可直接执行\n- 输出格式为严格的JSON，方便系统解析',
   '请深度分析以下微信聊天记录，并按照JSON格式输出分析结果。\n\n【聊天记录】\n{{chatText}}\n\n【分析要求】\n请严格按照以下JSON格式输出分析结果（不要添加任何markdown格式符号）',
   0.30, 4000,
   '["chatText", "customerName", "customerPhone", "customerIntent"]',
   'chatText: 聊天记录文本\ncustomerName: 客户姓名\ncustomerPhone: 客户电话\ncustomerIntent: 客户意向等级',
   1),

  ('chat_ocr_extract', '聊天OCR识别', '聊天分析', 'doubao', 'your_doubao_endpoint_id',
   '你是一个专业的OCR文字识别助手。请提取图片中的所有文字内容，保持原有格式和顺序。',
   '请识别这张微信聊天截图中的所有文字内容，包括发送者、时间和消息内容。',
   0.10, 2000,
   NULL,
   NULL,
   1),

  ('customer_recovery_script', '客户复苏话术', '客户管理', 'deepseek', 'deepseek-chat',
   '你是一个教育培训销售话术专家',
   '请为以下沉睡客户生成一条复苏话术：\n\n客户信息：\n- 姓名：{{customerName}}\n- 上次沟通时间：{{lastContactTime}}\n- 客户需求：{{needs}}\n- 之前顾虑：{{objections}}\n\n要求：\n1. 话术自然、不生硬\n2. 提供新的价值点或福利\n3. 给客户一个回复的理由\n4. 100字以内\n\n请直接输出话术内容，不要其他说明。',
   0.70, 500,
   '["customerName", "lastContactTime", "needs", "objections"]',
   'customerName: 客户姓名\nlastContactTime: 上次沟通时间\nneeds: 客户需求\nobjections: 客户顾虑',
   1);
```

---

## 🚀 后端部署

### 1. 环境变量配置

确保 `.env` 文件包含以下AI相关配置：

```env
# DeepSeek配置
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# 豆包配置（火山方舟）
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_ENDPOINT_ID=your_doubao_endpoint_id

# AI通用配置
AI_TIMEOUT=30000
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=4000
IMAGE_DOWNLOAD_TIMEOUT=30000
```

### 2. 安装依赖

```bash
cd backend
pnpm install
```

### 3. 数据库同步

如果您的环境变量中 `DB_SYNCHRONIZE=true`，TypeORM会自动创建表。

如果是生产环境，请手动执行上面的SQL创建语句。

### 4. 启动后端服务

```bash
# 开发环境
pnpm run start:dev

# 生产环境
pnpm run build
pnpm run start:prod
```

### 5. 验证API

访问以下接口测试：

```bash
# 测试AI配置API
curl http://localhost:3000/api/ai-config

# 测试智能创建客户API（需要token）
curl -X POST http://localhost:3000/api/customer/smart-create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageBase64List": ["data:image/jpeg;base64,..."],
    "knownInfo": {}
  }'
```

---

## 🖥️ PC端部署

### 1. 安装依赖

```bash
cd frontend
pnpm install
```

### 2. 环境变量

确保 `.env` 文件配置正确：

```env
VITE_API_BASE_URL=http://localhost:3000
# 生产环境改为：VITE_API_BASE_URL=https://your-domain.com
```

### 3. 构建生产版本

```bash
pnpm run build
```

### 4. 部署静态文件

将 `dist` 目录的内容部署到Nginx或其他Web服务器。

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/crm-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📱 移动端部署

### 1. 安装依赖

```bash
cd mobile
pnpm install
```

### 2. 配置API地址

确保移动端的API地址配置正确（通常在 `manifest.json` 或环境变量中）。

### 3. 构建H5版本

```bash
pnpm run build:h5
```

### 4. 发布到小程序/App

根据您的需求，可以编译为：
- H5网页版
- 微信小程序
- 支付宝小程序
- iOS/Android App

```bash
# 微信小程序
pnpm run build:mp-weixin

# Android App
pnpm run build:app-android

# iOS App
pnpm run build:app-ios
```

---

## 🔐 权限配置

### 1. 添加新权限

在数据库的 `permissions` 表中添加：

```sql
INSERT INTO `permissions` (`permission_key`, `permission_name`, `permission_group`, `description`, `sort`)
VALUES
  ('system:ai-config', 'AI配置管理', '系统管理', '管理AI提示词配置', 100),
  ('customer:smart-create', '智能创建客户', '客户管理', 'AI智能识别创建客户', 10);
```

### 2. 分配权限给角色

```sql
-- 假设管理员角色ID为1
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions` WHERE permission_key IN ('system:ai-config', 'customer:smart-create');
```

---

## 📋 功能使用指南

### PC端操作流程

#### 1. AI配置管理
1. 登录系统
2. 进入 **系统设置** > **AI配置**
3. 选择左侧场景列表中的场景
4. 切换 DeepSeek 或 豆包
5. 编辑系统提示词、用户提示词
6. 调整温度、Token等参数
7. 点击 **保存配置**

#### 2. AI智能创建客户
1. 进入 **客户管理**
2. 点击 **AI智能创建** 按钮
3. 按 `Ctrl+V` 粘贴聊天截图（或点击上传按钮）
4. 可以粘贴多张图片
5. 点击 **开始AI识别**
6. 等待AI分析完成（约10-30秒）
7. 查看并编辑识别结果（4个Tab页）
8. 点击 **创建客户**

### 移动端操作流程

#### AI智能识别客户
1. 打开移动端应用
2. 进入客户页面
3. 点击 **智能创建** 或扫描按钮
4. 选择 **拍照** 或 **相册**
5. 可以选择多张聊天截图
6. 点击 **开始AI识别**
7. 等待AI分析（显示进度提示）
8. 查看识别结果（4个section）
9. 确认信息后点击 **创建客户**

---

## 🔧 故障排查

### 1. AI识别失败

**现象**: 点击"开始AI识别"后提示失败

**排查步骤**:
1. 检查环境变量中的API Key是否正确
2. 检查网络连接，确保能访问DeepSeek和豆包API
3. 查看后端日志: `backend/logs/error.log`
4. 检查图片是否过大（建议<5MB）
5. 检查数据库中 `ai_prompt_configs` 表是否有数据

### 2. 图片识别不准确

**现象**: OCR识别的文字错误或不完整

**优化方案**:
1. 确保聊天截图清晰，文字可见
2. 调整豆包OCR的提示词，在AI配置中修改 `chat_ocr_extract` 场景
3. 提高图片分辨率
4. 多张截图时，保持顺序正确

### 3. 客户信息提取不准确

**现象**: AI识别的客户信息不符合预期

**优化方案**:
1. 进入 **系统设置** > **AI配置**
2. 选择 `chat_deep_analysis` 场景
3. 修改系统提示词，增加更详细的指导
4. 调整温度参数（提高准确性降低温度，提高创意性提高温度）
5. 增加示例对话样本

### 4. API超时

**现象**: 请求超时，识别失败

**解决方案**:
1. 增加后端超时配置: `AI_TIMEOUT=60000` (60秒)
2. 检查AI服务商的API限流策略
3. 优化图片大小，减少OCR处理时间
4. 考虑使用缓存机制

---

## 📊 监控与日志

### 1. 查看日志

```bash
# 后端日志
tail -f backend/logs/error.log
tail -f backend/logs/combined.log

# AI请求日志（在代码中已添加Logger）
grep "AI分析" backend/logs/combined.log
grep "OCR识别" backend/logs/combined.log
```

### 2. 监控指标

建议监控以下指标：
- AI API调用次数
- AI API成功率
- 平均响应时间
- 每日智能创建客户数量

---

## 🔄 数据迁移

### 从旧版本升级

如果您已经有旧的客户数据，无需迁移。新功能完全独立，不影响现有数据。

### AI配置备份

```bash
# 导出AI配置
mysqldump -u root -p your_database ai_prompt_configs > ai_configs_backup.sql

# 导入AI配置
mysql -u root -p your_database < ai_configs_backup.sql
```

---

## 🎯 最佳实践

### 1. AI提示词优化

- **定期review**: 每周查看AI分析结果，优化提示词
- **A/B测试**: 对比不同提示词的效果
- **场景化**: 为不同业务场景创建专门的提示词
- **变量使用**: 充分利用变量替换功能，提高复用性

### 2. 图片处理

- **建议分辨率**: 1080x1920 或更高
- **格式**: JPEG/PNG
- **大小**: 单张<5MB
- **数量**: 一次上传不超过9张

### 3. 安全建议

- **敏感信息**: 确保聊天记录不包含高度敏感信息
- **权限控制**: 严格控制AI配置管理权限
- **API Key保护**: 不要将API Key提交到代码仓库
- **日志审计**: 定期审查AI使用日志

---

## 📞 技术支持

### 问题反馈

如遇到问题，请提供以下信息：
1. 错误截图
2. 浏览器控制台错误信息
3. 后端日志（脱敏后）
4. 操作步骤复现

### 联系方式

- GitHub Issues: [项目地址]/issues
- 邮箱: [技术支持邮箱]

---

## 🎉 部署完成检查清单

- [ ] 数据库已创建 `ai_prompt_configs` 表
- [ ] 数据库已插入默认AI配置
- [ ] 后端环境变量配置完成（DeepSeek、豆包API Key）
- [ ] 后端服务启动成功
- [ ] 前端构建并部署完成
- [ ] 移动端构建完成
- [ ] 权限已配置并分配给相应角色
- [ ] 测试PC端AI智能创建功能
- [ ] 测试移动端AI智能识别功能
- [ ] 测试AI配置管理界面
- [ ] 查看日志，确认无错误

---

## 📝 更新日志

### v2.0.0 (2025-01-12)

**新增功能**:
- ✅ AI提示词数据库配置系统
- ✅ PC端AI智能创建客户
- ✅ 移动端AI智能识别客户
- ✅ 菜单路由重构（删除OKR，优化业务分组）
- ✅ DeepSeek和豆包服务支持数据库配置
- ✅ 20+维度客户画像分析
- ✅ 智能标签生成
- ✅ 跟进建议和销售策略推荐

**优化改进**:
- 🔧 AI服务降级机制（配置缺失时使用默认提示词）
- 🔧 图片base64转换优化
- 🔧 错误处理和用户提示完善
- 🔧 响应式布局适配移动端

**技术架构**:
- NestJS 10.x + TypeORM
- Vue 3 + Element Plus
- uni-app跨平台
- DeepSeek + 豆包双AI引擎

---

祝您部署顺利！🎊
