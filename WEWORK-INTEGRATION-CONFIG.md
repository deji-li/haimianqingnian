# 企业微信集成配置指南

## 📋 环境配置

### 后端环境变量配置 (.env.development)

```bash
# 企业微信基础配置
WEWORK_CORP_ID=your_corp_id_here
WEWORK_AGENT_ID=your_agent_id_here
WEWORK_APP_SECRET=your_app_secret_here

# 企业微信回调配置
WEWORK_TOKEN=your_callback_token_here
WEWORK_AES_KEY=your_aes_key_here
WEWORK_CALLBACK_URL=https://your-domain.com/api/wework/webhook

# 企业微信同步配置
WEWORK_SYNC_ENABLED=true
WEWORK_SYNC_INTERVAL=300000  # 5分钟（毫秒）
WEWORK_AUTO_SYNC=true

# 企业微信功能开关
WEWORK_CONTACT_SYNC=true
WEWORK_CHAT_ANALYSIS=true
WEWORK_MESSAGE_PUSH=true
WEWORK_CHAT_ARCHIVE=false

# 企业微信API配置
WEWORK_API_BASE_URL=https://qyapi.weixin.qq.com/cgi-bin
WEWORK_API_TIMEOUT=30000
WEWORK_RETRY_ATTEMPTS=3

# 企业微信存储配置
WEWORK_UPLOAD_DIR=./uploads/wework
WEWORK_MAX_FILE_SIZE=10485760  # 10MB

# 企业微信缓存配置
WEWORK_CACHE_TTL=3600  # 1小时
WEWORK_TOKEN_CACHE_KEY=wework_access_token

# 企业微信AI集成配置
WEWORK_AI_CHAT_ANALYSIS=true
WEWORK_AI_VOICE_RECOGNITION=true
WEWORK_AI_AUTO_TAGGING=true

# 企业微信安全配置
WEWORK_WEBHOOK_SIGNATURE_CHECK=true
WEWORK_ENCRYPT_ENABLED=true
```

### 前端环境变量配置 (.env.development)

```bash
# 企业微信前端配置
VUE_APP_WEWORK_CORP_ID=your_corp_id_here
VUE_APP_WEWORK_AGENT_ID=your_agent_id_here
VUE_APP_WEWORK_CALLBACK_URL=https://your-domain.com/wework/auth-callback

# 企业微信API配置
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_WEWORK_API_URL=/api/wework

# 企业微信功能配置
VUE_APP_WEWORK_ENABLED=true
VUE_APP_WEWORK_AUTO_REDIRECT=true

# 企业微信JS-SDK配置
VUE_APP_WEWORK_JS_SDK_VERSION=1.2.0
VUE_APP_WEWORK_DEBUG=false

# 企业微信应用配置
VUE_APP_WEWORK_APP_NAME=CRM管理系统
VUE_APP_WEWORK_APP_DESCRIPTION=企业微信CRM管理应用

# 企业微信UI配置
VUE_APP_WEWORK_THEME_PRIMARY=#667eea
VUE_APP_WEWORK_THEME_SECONDARY=#764ba2
```

### 移动端环境变量配置 (mobile/.env.development)

```bash
# 企业微信移动端配置
VUE_APP_WEWORK_CORP_ID=your_corp_id_here
VUE_APP_WEWORK_AGENT_ID=your_agent_id_here
VUE_APP_WEWORK_REDIRECT_URI=https://your-domain.com/mobile/wework/auth-callback

# 企业微信API配置
VUE_APP_API_BASE_URL=http://localhost:3000/api
VUE_APP_WEWORK_API_URL=/api/wework

# 企业微信移动端功能
VUE_APP_WEWORK_MOBILE_ENABLED=true
VUE_APP_WEWORK_NATIVE_INTEGRATION=true

# 企业微信移动端路由配置
VUE_APP_WEWORK_BASE_PATH=/wework
VUE_APP_WEWORK_AUTO_ROUTE=true

# 企业微信移动端UI配置
VUE_APP_WEWORK_MOBILE_THEME=#FFB800
VUE_APP_WEWORK_NATIVE_COMPONENTS=true
```

## 🔧 应用配置

### 数据库配置

```sql
-- 企业微信配置表初始数据
INSERT INTO wework_configs (
  corp_id,
  agent_id,
  app_secret,
  token,
  aes_key,
  callback_url,
  sync_strategy,
  is_active,
  created_time,
  updated_time
) VALUES (
  'your_corp_id_here',
  'your_agent_id_here',
  'your_app_secret_here',
  'your_callback_token_here',
  'your_aes_key_here',
  'https://your-domain.com/api/wework/webhook',
  JSON_OBJECT(
    'interval', 60,
    'autoSync', true,
    'incrementalSync', true
  ),
  1,
  NOW(),
  NOW()
);
```

### 企业微信Webhook配置

```bash
# 企业微信管理后台配置
1. 登录企业微信管理后台 (https://work.weixin.qq.com)
2. 进入"应用管理" → "自建应用" → 创建应用
3. 配置应用基本信息：
   - 应用名称: CRM管理系统
   - 应用介绍: 企业微信CRM管理应用
   - 应用logo: 上传应用图标

4. 配置企业微信授权登录:
   - 可信域名: https://your-domain.com
   - 授权回调域: https://your-domain.com

5. 配置接收消息:
   - URL: https://your-domain.com/api/wework/webhook/{corp_id}
   - Token: your_callback_token_here
   - EncodingAESKey: your_aes_key_here

6. 配置应用权限:
   - 联系人权限: 读取外部联系人
   - 客户联系权限: 客户联系功能
   - 应用权限: 发送消息到企业微信
```

## 🚀 启动配置

### 后端启动命令

```bash
# 开发环境
cd backend
npm run start:dev

# 生产环境
cd backend
npm run build
npm run start:prod
```

### 前端启动命令

```bash
# 企业版管理端
cd frontend
npm run dev

# 移动端
cd mobile
npm run dev:mp-weixin  # 小程序模式
npm run dev:h5        # H5模式
npm run dev:app-plus  # App模式
```

## 📱 移动端配置

### 小程序配置

```json
// mobile/src/manifest.json
{
  "mp-weixin": {
    "appid": "your_miniprogram_appid",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    },
    "permission": {
      "scope.userInfo": {
        "desc": "用于获取用户信息"
      }
    }
  }
}
```

### H5配置

```json
// mobile/src/manifest.json
{
  "h5": {
    "title": "CRM管理系统",
    "template": "index.html",
    "router": {
      "mode": "hash",
      "base": "/mobile/"
    },
    "optimization": {
      "treeShaking": {
        "enable": true
      }
    }
  }
}
```

## 🔍 验证配置

### 配置验证脚本

```bash
#!/bin/bash
# 企业微信配置验证脚本

echo "=== 企业微信配置验证 ==="

# 检查环境变量
echo "检查后端环境变量..."
if [ -z "$WEWORK_CORP_ID" ]; then
    echo "❌ WEWORK_CORP_ID 未配置"
else
    echo "✅ WEWORK_CORP_ID 已配置"
fi

if [ -z "$WEWORK_AGENT_ID" ]; then
    echo "❌ WEWORK_AGENT_ID 未配置"
else
    echo "✅ WEWORK_AGENT_ID 已配置"
fi

if [ -z "$WEWORK_APP_SECRET" ]; then
    echo "❌ WEWORK_APP_SECRET 未配置"
else
    echo "✅ WEWORK_APP_SECRET 已配置"
fi

# 检查API连接
echo "检查API连接..."
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ 后端API连接正常"
else
    echo "❌ 后端API连接失败"
fi

# 检查数据库连接
echo "检查数据库连接..."
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE -e "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接失败"
fi

echo "=== 配置验证完成 ==="
```

## 📞 技术支持

如需技术支持，请检查：
1. 环境变量配置是否正确
2. 数据库连接是否正常
3. 企业微信应用权限是否完整
4. 网络防火墙是否允许企业微信API访问

## 📚 相关文档

- [企业微信开发文档](https://developer.work.weixin.qq.com/)
- [NestJS官方文档](https://nestjs.com/)
- [uni-app官方文档](https://uniapp.dcloud.net.cn/)
- [Vue3官方文档](https://vuejs.org/)