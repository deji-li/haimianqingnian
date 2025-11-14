#!/bin/bash

set -e

echo "🚀 开始更新部署..."

# 进入项目目录
cd /var/www/crm

# 拉取最新代码
echo "📦 拉取最新代码..."
git pull origin master

# 更新前端
echo "🎨 构建前端..."
cd frontend
npm install
npm run build

# 更新后端
echo "⚙️  构建后端..."
cd ../backend
npm install
npm run build

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart crm-api

# 显示状态
echo "✅ 更新完成！"
pm2 status

echo "📋 最近日志："
pm2 logs crm-api --lines 20 --nostream
