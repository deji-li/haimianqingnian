#!/bin/bash
# 一键快速更新脚本

echo "🚀 开始快速更新..."

cd /root/crm

echo "📥 拉取最新代码..."
git pull origin master

echo "🔨 重新构建前端..."
docker-compose build frontend

echo "🔄 重启前端容器..."
docker-compose up -d frontend

echo ""
echo "✅ 更新完成！"
echo ""
echo "📋 容器状态："
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep crm

echo ""
echo "💡 请刷新浏览器 (Ctrl+Shift+R 强制刷新) 查看更新"
