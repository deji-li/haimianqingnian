#!/bin/bash
# ========================================
# AI功能一键部署脚本
# ========================================

echo "======================================"
echo "开始AI功能一键部署"
echo "======================================"

# 1. 数据库初始化
echo ">>> 步骤1: 初始化数据库"
mysql -u root -p7821630lideji education_crm < database/ai_init.sql && echo "✅ 数据库初始化成功" || echo "❌ 数据库初始化失败"

# 2. 配置权限
echo ">>> 步骤2: 配置权限"
mysql -u root -p7821630lideji education_crm <<EOF
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE permission_key IN ('system:ai-config', 'customer:smart-create')
ON DUPLICATE KEY UPDATE role_id=role_id;
EOF
echo "✅ 权限配置完成"

# 3. 后端依赖安装
echo ">>> 步骤3: 安装后端依赖"
cd backend && pnpm install && echo "✅ 后端依赖安装完成" && cd ..

# 4. 前端依赖安装
echo ">>> 步骤4: 安装前端依赖"
cd frontend && pnpm install && echo "✅ 前端依赖安装完成" && cd ..

# 5. 移动端依赖安装
echo ">>> 步骤5: 安装移动端依赖"
cd mobile && pnpm install && echo "✅ 移动端依赖安装完成" && cd ..

# 6. 提示配置环境变量
echo ""
echo "======================================"
echo "⚠️  请手动配置环境变量"
echo "======================================"
echo "编辑文件: backend/.env"
echo "需要配置:"
echo "  DEEPSEEK_API_KEY=sk-你的密钥"
echo "  DOUBAO_API_KEY=你的密钥"
echo "  DOUBAO_ENDPOINT_ID=ep-你的端点ID"
echo ""
echo "配置完成后运行:"
echo "  cd backend && pnpm run start:dev"
echo "  cd frontend && pnpm run dev"
echo "  cd mobile && pnpm run dev:h5"
echo ""
echo "======================================"
echo "✅ 部署准备完成！"
echo "======================================"
