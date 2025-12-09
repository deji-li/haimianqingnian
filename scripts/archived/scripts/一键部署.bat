@echo off
chcp 65001 >nul
echo ======================================
echo AI功能一键部署 (Windows)
echo ======================================
echo.

:: 1. 数据库初始化
echo [1/5] 初始化数据库...
mysql -u root -p7821630lideji education_crm < database\ai_init.sql
if %errorlevel% equ 0 (echo ✅ 数据库初始化成功) else (echo ❌ 数据库初始化失败 && pause && exit)

:: 2. 配置权限
echo [2/5] 配置权限...
mysql -u root -p7821630lideji education_crm -e "INSERT INTO role_permissions (role_id, permission_id) SELECT 1, id FROM permissions WHERE permission_key IN ('system:ai-config', 'customer:smart-create') ON DUPLICATE KEY UPDATE role_id=role_id;"
echo ✅ 权限配置完成

:: 3. 后端依赖
echo [3/5] 安装后端依赖...
cd backend
call pnpm install
cd ..
echo ✅ 后端依赖完成

:: 4. 前端依赖
echo [4/5] 安装前端依赖...
cd frontend
call pnpm install
cd ..
echo ✅ 前端依赖完成

:: 5. 移动端依赖
echo [5/5] 安装移动端依赖...
cd mobile
call pnpm install
cd ..
echo ✅ 移动端依赖完成

echo.
echo ======================================
echo ⚠️  配置环境变量
echo ======================================
echo 编辑文件: backend\.env
echo 需要配置:
echo   DEEPSEEK_API_KEY=sk-你的密钥
echo   DOUBAO_API_KEY=你的密钥
echo   DOUBAO_ENDPOINT_ID=ep-你的端点ID
echo.
echo 配置完成后运行:
echo   cd backend ^&^& pnpm run start:dev
echo   cd frontend ^&^& pnpm run dev
echo   cd mobile ^&^& pnpm run dev:h5
echo.
echo ======================================
echo ✅ 部署准备完成！
echo ======================================
pause
