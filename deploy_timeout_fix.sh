#!/bin/bash
# 超时问题一次性修复脚本
# 此脚本将：
# 1. 更新代码文件到服务器
# 2. 配置环境变量
# 3. 重新构建并启动后端服务

set -e  # 遇到错误立即退出

SERVER="root@106.53.77.212"
BACKEND_PATH="/root/crm/backend"
PROJECT_PATH="/root/crm"

echo "========================================="
echo "开始修复超时问题"
echo "========================================="

# 1. 上传更新后的代码文件
echo ""
echo "[1/5] 上传更新后的代码文件..."
scp "./backend/src/common/services/ai/doubao-ocr.service.ts" "$SERVER:$BACKEND_PATH/src/common/services/ai/doubao-ocr.service.ts"

# 2. 更新 .env 配置文件
echo ""
echo "[2/5] 更新环境变量配置..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

# 添加或更新 AI_TIMEOUT（2分钟）
if grep -q "^AI_TIMEOUT=" .env; then
  sed -i 's/^AI_TIMEOUT=.*/AI_TIMEOUT=120000/' .env
  echo "✓ 更新 AI_TIMEOUT=120000 (2分钟)"
else
  echo "AI_TIMEOUT=120000" >> .env
  echo "✓ 添加 AI_TIMEOUT=120000 (2分钟)"
fi

# 添加或更新 IMAGE_DOWNLOAD_TIMEOUT（30秒）
if grep -q "^IMAGE_DOWNLOAD_TIMEOUT=" .env; then
  sed -i 's/^IMAGE_DOWNLOAD_TIMEOUT=.*/IMAGE_DOWNLOAD_TIMEOUT=30000/' .env
  echo "✓ 更新 IMAGE_DOWNLOAD_TIMEOUT=30000 (30秒)"
else
  echo "IMAGE_DOWNLOAD_TIMEOUT=30000" >> .env
  echo "✓ 添加 IMAGE_DOWNLOAD_TIMEOUT=30000 (30秒)"
fi

echo ""
echo "当前超时配置："
grep "TIMEOUT" .env

ENDSSH

# 3. 更新 docker-compose.yml 环境变量
echo ""
echo "[3/5] 更新 docker-compose.yml..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

# 检查是否已经有这些环境变量
if ! grep -q "AI_TIMEOUT:" docker-compose.yml; then
  # 在 DEEPSEEK_API_KEY 后添加超时配置
  sed -i '/DEEPSEEK_API_KEY: .*/a\      AI_TIMEOUT: ${AI_TIMEOUT:-120000}\n      IMAGE_DOWNLOAD_TIMEOUT: ${IMAGE_DOWNLOAD_TIMEOUT:-30000}' docker-compose.yml
  echo "✓ 添加超时环境变量到 docker-compose.yml"
else
  echo "✓ 超时环境变量已存在"
fi

# 验证 YAML 语法
if docker-compose config > /dev/null 2>&1; then
  echo "✓ docker-compose.yml 语法正确"
else
  echo "✗ docker-compose.yml 语法错误！"
  exit 1
fi

ENDSSH

# 4. 重新构建并启动后端
echo ""
echo "[4/5] 重新构建并启动后端服务..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

echo "停止后端服务..."
docker-compose stop backend

echo "重新构建后端镜像..."
docker-compose build backend

echo "启动后端服务..."
docker-compose up -d backend

echo "等待服务启动..."
sleep 10

ENDSSH

# 5. 验证部署
echo ""
echo "[5/5] 验证部署结果..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

echo "检查容器状态："
docker-compose ps backend

echo ""
echo "检查环境变量是否生效："
docker exec crm-backend env | grep TIMEOUT

echo ""
echo "查看最近日志："
docker-compose logs --tail=20 backend

ENDSSH

echo ""
echo "========================================="
echo "修复完成！"
echo "========================================="
echo ""
echo "配置说明："
echo "- AI_TIMEOUT: 120000ms (2分钟) - OCR API调用超时"
echo "- IMAGE_DOWNLOAD_TIMEOUT: 30000ms (30秒) - 图片下载超时"
echo ""
echo "请尝试重新上传聊天记录截图进行测试。"
echo ""
echo "如果仍然超时，可能的原因："
echo "1. 网络连接到豆包API较慢"
echo "2. 图片处理需要更长时间"
echo "3. 可以进一步增加 AI_TIMEOUT 到 180000 (3分钟)"
echo ""
