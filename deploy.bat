@echo off
chcp 65001 >nul
echo ====================================================
echo    企业知识库系统 - 一键部署脚本 (Windows)
echo ====================================================
echo.

:: 设置颜色
color 0A

:: 检查是否有管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [警告] 建议以管理员身份运行此脚本
    echo.
    pause
)

:: 读取配置
echo [1/6] 读取配置...
set /p DB_HOST="请输入数据库地址 (默认 localhost): " || set DB_HOST=localhost
set /p DB_PORT="请输入数据库端口 (默认 3306): " || set DB_PORT=3306
set /p DB_NAME="请输入数据库名称: "
set /p DB_USER="请输入数据库用户名 (默认 root): " || set DB_USER=root
set /p DB_PASS="请输入数据库密码: "

if "%DB_NAME%"=="" (
    echo [错误] 数据库名称不能为空！
    pause
    exit /b 1
)

echo.
echo 配置信息：
echo - 数据库地址: %DB_HOST%:%DB_PORT%
echo - 数据库名称: %DB_NAME%
echo - 数据库用户: %DB_USER%
echo.
set /p CONFIRM="确认以上信息正确吗? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消部署
    pause
    exit /b 0
)

echo.
echo [2/6] 更新数据库...
cd backend\database
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% < update_all.sql
if %errorLevel% neq 0 (
    echo [错误] 数据库更新失败！
    echo 请检查：
    echo 1. MySQL是否已安装并运行
    echo 2. 数据库连接信息是否正确
    echo 3. 数据库用户是否有足够权限
    cd ..\..
    pause
    exit /b 1
)
echo [成功] 数据库更新完成！
cd ..\..

echo.
echo [3/6] 更新后端依赖...
cd backend
call npm install
if %errorLevel% neq 0 (
    echo [警告] 依赖安装可能出现问题
)
echo [成功] 后端依赖更新完成！
cd ..

echo.
echo [4/6] 构建后端项目...
cd backend
call npm run build
if %errorLevel% neq 0 (
    echo [错误] 后端构建失败！
    cd ..
    pause
    exit /b 1
)
echo [成功] 后端构建完成！
cd ..

echo.
echo [5/6] 更新前端依赖...
cd frontend
call npm install
if %errorLevel% neq 0 (
    echo [警告] 依赖安装可能出现问题
)
echo [成功] 前端依赖更新完成！
cd ..

echo.
echo [6/6] 构建前端项目...
cd frontend
call npm run build
if %errorLevel% neq 0 (
    echo [错误] 前端构建失败！
    cd ..
    pause
    exit /b 1
)
echo [成功] 前端构建完成！
cd ..

echo.
echo ====================================================
echo    ✅ 部署完成！
echo ====================================================
echo.
echo 下一步操作：
echo 1. 重启后端服务 (pm2 restart your-app 或手动重启)
echo 2. 部署前端dist目录到Web服务器
echo 3. 访问系统并验证功能
echo.
echo 验证清单：
echo ✓ 访问 /knowledge/init 确认初始化页面
echo ✓ 访问 /knowledge/list 确认知识管理页面
echo ✓ 访问 /knowledge/search 确认智能搜索页面
echo ✓ 访问 /knowledge/mining 确认AI挖掘页面
echo ✓ 访问 /knowledge/feedback 确认负反馈页面
echo ✓ 访问 /knowledge/statistics 确认统计页面
echo.
echo 技术支持：查看 DEPLOYMENT_GUIDE.md
echo ====================================================
echo.

pause
