#!/bin/bash
# 前端部署状态检查脚本

echo "========================================="
echo "🔍 前端部署诊断"
echo "========================================="

echo ""
echo "[1/4] 检查前端构建产物..."
if [ -d "/root/crm/frontend/dist" ]; then
  echo "✅ dist目录存在"
  echo "📊 dist目录大小："
  du -sh /root/crm/frontend/dist
  echo "📂 dist目录文件列表（前10个）："
  ls -lh /root/crm/frontend/dist | head -11
else
  echo "❌ dist目录不存在！需要重新构建前端"
  exit 1
fi

echo ""
echo "[2/4] 检查Nginx配置..."
if [ -f "/etc/nginx/sites-enabled/crm" ]; then
  echo "✅ Nginx配置文件存在"
  echo "📄 配置内容："
  cat /etc/nginx/sites-enabled/crm
elif [ -f "/etc/nginx/conf.d/crm.conf" ]; then
  echo "✅ Nginx配置文件存在"
  echo "📄 配置内容："
  cat /etc/nginx/conf.d/crm.conf
else
  echo "⚠️  未找到CRM的Nginx配置文件"
  echo "📋 查找可能的配置文件："
  find /etc/nginx -name "*crm*" -o -name "*default*" 2>/dev/null
fi

echo ""
echo "[3/4] 检查Nginx状态..."
systemctl status nginx --no-pager | head -10

echo ""
echo "[4/4] 检查前端文件时间戳..."
echo "📅 最新构建文件的修改时间："
find /root/crm/frontend/dist -type f -name "*.js" -o -name "*.html" | head -5 | xargs ls -lh

echo ""
echo "========================================="
echo "🔧 建议操作"
echo "========================================="
echo ""
echo "如果前端未更新，请执行以下步骤："
echo ""
echo "1️⃣  重新加载Nginx配置："
echo "   nginx -s reload"
echo ""
echo "2️⃣  清除浏览器缓存（Ctrl+Shift+Delete）"
echo ""
echo "3️⃣  如果还不行，重启Nginx："
echo "   systemctl restart nginx"
echo ""
