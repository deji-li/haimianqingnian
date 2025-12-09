#!/bin/bash
# AI分析结果同步到客户资料 - 部署脚本

set -e

SERVER="root@106.53.77.212"
PROJECT_PATH="/root/crm"

echo "========================================="
echo "部署AI画像同步功能"
echo "========================================="

# 1. 推送代码到Git
echo ""
echo "[1/5] 推送代码到Git仓库..."
git add .
git commit -m "feat: AI分析结果自动同步到客户资料

新增功能：
1. Customer表新增AI分析字段（学生年级、家庭经济、决策角色等）
2. 自动同步AI分析的客户画像到客户档案
3. 保存详细的需求、痛点、兴趣等信息到JSON字段

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master

# 2. 服务器拉取代码
echo ""
echo "[2/5] 服务器拉取最新代码..."
ssh $SERVER << 'ENDSSH'
cd /root/crm
git pull origin master
ENDSSH

# 3. 执行数据库迁移
echo ""
echo "[3/5] 执行数据库迁移（添加AI分析字段）..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

# 连接MySQL执行迁移
docker exec -i crm-mysql mysql -uroot -p7821630lideji crm < backend/src/database/migrations/005-add-ai-profile-fields.sql

echo "✓ 数据库迁移完成"
ENDSSH

# 4. 重新构建并启动后端
echo ""
echo "[4/5] 重新构建并启动后端..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

echo "停止后端..."
docker-compose stop backend

echo "重新构建..."
docker-compose build backend

echo "启动后端..."
docker-compose up -d backend

echo "等待服务启动..."
sleep 10
ENDSSH

# 5. 验证部署
echo ""
echo "[5/5] 验证部署结果..."
ssh $SERVER << 'ENDSSH'
cd /root/crm

echo "检查后端状态："
docker-compose ps backend

echo ""
echo "检查数据库表结构："
docker exec crm-mysql mysql -uroot -p7821630lideji crm -e "
  SHOW COLUMNS FROM customers LIKE '%student%';
  SHOW COLUMNS FROM customers LIKE '%ai_%';
" 2>/dev/null || echo "数据库检查完成"

echo ""
echo "查看最近日志："
docker-compose logs --tail=30 backend
ENDSSH

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "新增字段："
echo "- student_grade: 学生年级"
echo "- student_age: 学生年龄"
echo "- family_economic_level: 家庭经济水平"
echo "- decision_maker_role: 决策角色"
echo "- parent_role: 家长身份"
echo "- location: 所在地区"
echo "- estimated_value: 预估成交金额"
echo "- quality_level: AI质量等级"
echo "- ai_profile: 详细画像（JSON）"
echo "- last_ai_analysis_time: 最后分析时间"
echo ""
echo "测试方法："
echo "1. 重新上传聊天记录进行AI分析"
echo "2. 在客户管理页面查看客户详情"
echo "3. 应该能看到AI自动填充的年级、经济水平等信息"
echo ""
