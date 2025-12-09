# AI聊天分析超时问题修复说明

## 问题描述
上传800KB图片时，AI分析超时失败（30秒超时）

## 修复内容

### 1. 代码修改
**文件**: `backend/src/common/services/ai/doubao-ocr.service.ts`

- 新增 `imageDownloadTimeout` 配置项，从环境变量 `IMAGE_DOWNLOAD_TIMEOUT` 读取（默认30秒）
- 将原硬编码的10秒图片下载超时改为可配置
- OCR API 调用超时已支持 `AI_TIMEOUT` 环境变量（默认30秒）

### 2. 环境变量配置
**文件**: `/root/crm/.env`

添加以下配置：
```bash
AI_TIMEOUT=120000                    # OCR API调用超时：2分钟
IMAGE_DOWNLOAD_TIMEOUT=30000         # 图片下载超时：30秒
```

### 3. Docker Compose 配置
**文件**: `/root/crm/docker-compose.yml`

在 backend 服务的 environment 部分添加：
```yaml
environment:
  AI_TIMEOUT: ${AI_TIMEOUT:-120000}
  IMAGE_DOWNLOAD_TIMEOUT: ${IMAGE_DOWNLOAD_TIMEOUT:-30000}
```

## 快速部署（使用脚本）

```bash
# 在本地 D:\CC\1.1 目录下执行：
bash deploy_timeout_fix.sh
```

## 手动部署步骤

### 步骤1：上传代码文件
```bash
scp ./backend/src/common/services/ai/doubao-ocr.service.ts root@106.53.77.212:/root/crm/backend/src/common/services/ai/
```

### 步骤2：SSH登录服务器
```bash
ssh root@106.53.77.212
cd /root/crm
```

### 步骤3：更新 .env 文件
```bash
# 添加超时配置
echo "AI_TIMEOUT=120000" >> .env
echo "IMAGE_DOWNLOAD_TIMEOUT=30000" >> .env

# 验证配置
cat .env | grep TIMEOUT
```

### 步骤4：更新 docker-compose.yml
```bash
# 在 DEEPSEEK_API_KEY 行后添加超时配置
# 手动编辑或使用以下命令：
sed -i '/DEEPSEEK_API_KEY: .*/a\      AI_TIMEOUT: ${AI_TIMEOUT:-120000}\n      IMAGE_DOWNLOAD_TIMEOUT: ${IMAGE_DOWNLOAD_TIMEOUT:-30000}' docker-compose.yml

# 验证 YAML 语法
docker-compose config
```

### 步骤5：重新构建并启动
```bash
# 停止后端
docker-compose stop backend

# 重新构建（包含新代码）
docker-compose build backend

# 启动后端
docker-compose up -d backend

# 查看日志
docker-compose logs -f backend
```

### 步骤6：验证配置
```bash
# 检查环境变量是否生效
docker exec crm-backend env | grep TIMEOUT

# 应该看到：
# AI_TIMEOUT=120000
# IMAGE_DOWNLOAD_TIMEOUT=30000
```

## 测试

1. 访问前端页面：http://106.53.77.212:3000
2. 进入 AI聊天记录分析
3. 上传微信聊天截图（支持最大10MB）
4. 等待AI分析（最多2分钟）

## 如果仍然超时

如果2分钟仍不够，可以进一步增加超时：

```bash
# 修改 .env
sed -i 's/AI_TIMEOUT=120000/AI_TIMEOUT=180000/' /root/crm/.env

# 重启后端
cd /root/crm
docker-compose restart backend
```

## 超时时间说明

- **IMAGE_DOWNLOAD_TIMEOUT**: 30秒
  - 用于从服务器下载上传的图片
  - 800KB图片在正常网络下1-2秒足够

- **AI_TIMEOUT**: 120秒（2分钟）
  - 用于调用豆包OCR API
  - 包括：上传base64图片 + OCR识别 + 返回结果
  - 大图片或网络较慢时可能需要更长时间

## 技术细节

### 处理流程
1. 用户上传图片 → 保存到服务器 → 返回文件URL
2. 后端从URL下载图片（IMAGE_DOWNLOAD_TIMEOUT）
3. 转换为base64编码
4. 调用豆包OCR API 识别文字（AI_TIMEOUT）
5. 调用豆包AI分析客户意向（AI_TIMEOUT）
6. 保存分析结果到数据库

### 超时位置
- ❌ 旧代码：图片下载10秒，OCR调用30秒
- ✅ 新代码：图片下载30秒，OCR调用120秒

## 故障排查

### 查看完整错误日志
```bash
docker-compose logs --tail=100 backend | grep -A 10 "OCR识别"
```

### 测试豆包API连接
```bash
docker exec crm-backend curl -X POST https://ark.cn-beijing.volces.com/api/v3/chat/completions \
  -H "Authorization: Bearer 13d8df92-1b2c-41e5-90b9-2317441cafa5" \
  -H "Content-Type: application/json" \
  -d '{"model":"ep-20251107145646-tkrmq","messages":[{"role":"user","content":"Hello"}]}'
```

### 检查容器状态
```bash
docker-compose ps
docker-compose logs backend --tail=50
```
