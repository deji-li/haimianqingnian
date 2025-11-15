#!/bin/bash
# 强制更新脚本 - 彻底清理缓存并重新构建

set -e  # 遇到错误立即退出

echo "========================================="
echo "🔥 强制更新前端（彻底清理缓存）"
echo "========================================="

cd /root/crm

echo ""
echo "[1/6] 📥 拉取最新代码..."
git pull origin master

echo ""
echo "[2/6] 🛑 停止并删除前端容器..."
docker stop crm-frontend 2>/dev/null || true
docker rm crm-frontend 2>/dev/null || true

echo ""
echo "[3/6] 🗑️  删除前端镜像..."
docker rmi crm-frontend 2>/dev/null || true

echo ""
echo "[4/6] 🧹 清理Docker构建缓存..."
docker builder prune -f

echo ""
echo "[5/6] 🔨 重新构建前端（不使用缓存）..."
docker-compose build --no-cache --pull frontend

echo ""
echo "[6/6] 🚀 启动前端容器..."
docker-compose up -d frontend

echo ""
echo "⏳ 等待Nginx启动..."
sleep 5

echo ""
echo "========================================="
echo "✅ 更新完成！"
echo "========================================="
echo ""
echo "📋 容器状态："
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | grep crm

echo ""
echo "🔍 前端文件版本："
docker exec crm-frontend cat /usr/share/nginx/html/index.html | grep "assets/index"

echo ""
echo "💡 请按 Ctrl+Shift+R 强制刷新浏览器"
echo "💡 或使用无痕模式：Ctrl+Shift+N"
echo ""
