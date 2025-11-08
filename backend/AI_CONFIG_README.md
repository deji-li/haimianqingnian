# AI服务配置说明

## 必需的环境变量配置

在使用AI功能之前，需要在服务器的 `.env.production` 文件中配置以下环境变量：

### 1. DeepSeek API配置（用于AI文本分析）

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
```

**如何获取：**
1. 访问 https://platform.deepseek.com/
2. 注册并登录账号
3. 在"API密钥"页面创建新的API Key
4. 复制API Key并填入上述配置

### 2. 豆包OCR API配置（用于图像文字识别）

```bash
DOUBAO_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAO_ENDPOINT_ID=ep-xxxxxxxxxxxxxxxxxxxxxxxx
```

**如何获取：**
1. 访问火山引擎控制台 https://console.volcengine.com/
2. 开通"豆包大模型"服务
3. 创建一个支持视觉的模型端点（Endpoint）
4. 获取 API Key 和 Endpoint ID
5. 填入上述配置

### 3. Redis配置（用于AI缓存）

```bash
REDIS_HOST=redis          # Docker环境使用服务名
REDIS_PORT=6379
REDIS_PASSWORD=           # 如果Redis有密码则填写
REDIS_DB=0
```

## 配置检查

启动服务后，查看日志确认配置是否正确：

```bash
docker-compose logs backend | grep -i "api\|redis"
```

应该看到：
- `Redis连接成功` - Redis连接正常
- 如果看到 `豆包API密钥未配置` 或 `DeepSeek API密钥未配置` 则需要补充配置

## 功能降级说明

- 如果**Redis未连接**：AI功能仍可用，但无缓存，响应会较慢
- 如果**AI API未配置**：上传聊天记录时会返回500错误，需先配置API密钥

## 配置后重启服务

```bash
docker-compose restart backend
```

## 测试AI功能

配置完成后，访问系统：
1. 进入"AI聊天分析"页面
2. 上传一张微信聊天截图
3. 如果正常识别并分析，说明配置成功
