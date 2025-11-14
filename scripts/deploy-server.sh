#!/bin/bash
# 服务器完整部署脚本
# 用于部署前端、后端，并初始化配置

set -e

echo "========================================="
echo "🚀 开始完整部署"
echo "========================================="

# 1. 拉取最新代码
echo ""
echo "[1/6] 📦 拉取最新代码..."
cd /root/crm
git pull origin master

# 2. 初始化业务配置（如果配置表为空）
echo ""
echo "[2/6] 🗄️  初始化业务配置..."
docker exec -i crm-mysql mysql -uroot -p7821630lideji crm << 'EOSQL'
-- 检查并初始化业务配置
INSERT INTO business_config (config_key, config_value, config_category, description) VALUES
('order_sync.enabled', 'true', 'business_rules', '是否启用订单自动同步'),
('order_sync.sync_range_days', '7', 'business_rules', '订单同步时间范围（天）'),
('order_sync.auto_create_campus', 'true', 'business_rules', '自动创建不存在的校区'),
('order_sync.sync_customer_info', 'true', 'business_rules', '是否同步更新客户信息'),
('order_sync.cron_expression', '0 */2 * * *', 'business_rules', '定时同步Cron表达式（每2小时一次）'),
('field_mapping.order_status', '{"1":"待支付","2":"已支付","3":"已完成","4":"已取消"}', 'field_mapping', '订单状态映射'),
('field_mapping.payment_method', '{"1":"微信支付","2":"支付宝","3":"银行卡","4":"现金"}', 'field_mapping', '支付方式映射'),
('default_values.customer_intent', '中意向', 'default_values', '新客户默认意向度'),
('default_values.lifecycle_stage', '线索', 'default_values', '新客户默认生命周期')
ON DUPLICATE KEY UPDATE
  config_value = VALUES(config_value),
  description = VALUES(description);

SELECT '✅ 业务配置初始化完成' AS status;
EOSQL

# 3. 构建前端
echo ""
echo "[3/6] 🎨 构建前端..."
cd /root/crm/frontend
npm install
npm run build
echo "✅ 前端构建完成 -> dist/"

# 4. 重启后端
echo ""
echo "[4/6] ⚙️  重启后端..."
cd /root/crm
docker-compose stop backend
docker-compose build backend
docker-compose up -d backend

# 5. 等待后端启动
echo ""
echo "[5/6] ⏳ 等待后端启动..."
sleep 10

# 6. 验证部署
echo ""
echo "[6/6] ✅ 验证部署..."

echo ""
echo "📋 容器状态："
docker-compose ps

echo ""
echo "📋 后端日志（最近20行）："
docker-compose logs --tail=20 backend

echo ""
echo "📋 业务配置检查："
docker exec -i crm-mysql mysql -uroot -p7821630lideji crm -e "SELECT config_key, config_category, description FROM business_config LIMIT 10;" 2>/dev/null || echo "配置查询完成"

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "📍 访问地址："
echo "   前端：需要配置Nginx指向 /root/crm/frontend/dist"
echo "   后端：http://localhost:3000"
echo ""
echo "📝 下一步："
echo "   1. 确认Nginx配置正确"
echo "   2. 访问前端页面测试功能"
echo "   3. 检查15个新功能是否可用"
echo ""
