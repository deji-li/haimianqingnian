#!/bin/bash

# 企业知识库系统 - 一键部署脚本 (Linux/Mac)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo ""
    echo "===================================================="
    echo "   $1"
    echo "===================================================="
    echo ""
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 主脚本开始
print_header "企业知识库系统 - 一键部署脚本"

# 检查必要的命令
print_message "[检查] 检查系统环境..." "$BLUE"

if ! command_exists mysql; then
    print_message "[错误] 未找到 mysql 命令，请先安装 MySQL 客户端" "$RED"
    exit 1
fi

if ! command_exists node; then
    print_message "[错误] 未找到 node 命令，请先安装 Node.js" "$RED"
    exit 1
fi

if ! command_exists npm; then
    print_message "[错误] 未找到 npm 命令，请先安装 npm" "$RED"
    exit 1
fi

print_message "[成功] 环境检查通过" "$GREEN"

# 读取配置
echo ""
print_message "[1/6] 读取配置..." "$BLUE"

read -p "请输入数据库地址 (默认 localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "请输入数据库端口 (默认 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "请输入数据库名称: " DB_NAME
if [ -z "$DB_NAME" ]; then
    print_message "[错误] 数据库名称不能为空！" "$RED"
    exit 1
fi

read -p "请输入数据库用户名 (默认 root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "请输入数据库密码: " DB_PASS
echo ""

echo ""
echo "配置信息："
echo "- 数据库地址: $DB_HOST:$DB_PORT"
echo "- 数据库名称: $DB_NAME"
echo "- 数据库用户: $DB_USER"
echo ""

read -p "确认以上信息正确吗? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    print_message "已取消部署" "$YELLOW"
    exit 0
fi

# 更新数据库
echo ""
print_message "[2/6] 更新数据库..." "$BLUE"

cd backend/database || exit 1

if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < update_all.sql; then
    print_message "[成功] 数据库更新完成！" "$GREEN"
else
    print_message "[错误] 数据库更新失败！" "$RED"
    echo "请检查："
    echo "1. MySQL是否已安装并运行"
    echo "2. 数据库连接信息是否正确"
    echo "3. 数据库用户是否有足够权限"
    cd ../.. || exit 1
    exit 1
fi

cd ../.. || exit 1

# 更新后端依赖
echo ""
print_message "[3/6] 更新后端依赖..." "$BLUE"

cd backend || exit 1

if npm install; then
    print_message "[成功] 后端依赖更新完成！" "$GREEN"
else
    print_message "[警告] 依赖安装可能出现问题" "$YELLOW"
fi

cd .. || exit 1

# 构建后端项目
echo ""
print_message "[4/6] 构建后端项目..." "$BLUE"

cd backend || exit 1

if npm run build; then
    print_message "[成功] 后端构建完成！" "$GREEN"
else
    print_message "[错误] 后端构建失败！" "$RED"
    cd .. || exit 1
    exit 1
fi

cd .. || exit 1

# 更新前端依赖
echo ""
print_message "[5/6] 更新前端依赖..." "$BLUE"

cd frontend || exit 1

if npm install; then
    print_message "[成功] 前端依赖更新完成！" "$GREEN"
else
    print_message "[警告] 依赖安装可能出现问题" "$YELLOW"
fi

cd .. || exit 1

# 构建前端项目
echo ""
print_message "[6/6] 构建前端项目..." "$BLUE"

cd frontend || exit 1

if npm run build; then
    print_message "[成功] 前端构建完成！" "$GREEN"
else
    print_message "[错误] 前端构建失败！" "$RED"
    cd .. || exit 1
    exit 1
fi

cd .. || exit 1

# 部署完成
print_header "✅ 部署完成！"

echo "下一步操作："
echo "1. 重启后端服务 (pm2 restart your-app 或 systemctl restart your-service)"
echo "2. 部署前端dist目录到Web服务器 (nginx/apache)"
echo "3. 访问系统并验证功能"
echo ""
echo "验证清单："
echo "✓ 访问 /knowledge/init 确认初始化页面"
echo "✓ 访问 /knowledge/list 确认知识管理页面"
echo "✓ 访问 /knowledge/search 确认智能搜索页面"
echo "✓ 访问 /knowledge/mining 确认AI挖掘页面"
echo "✓ 访问 /knowledge/feedback 确认负反馈页面"
echo "✓ 访问 /knowledge/statistics 确认统计页面"
echo ""
echo "技术支持：查看 DEPLOYMENT_GUIDE.md"

print_header "感谢使用！"

exit 0
