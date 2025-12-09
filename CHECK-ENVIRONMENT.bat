@echo off
title CRM系统环境检查
color 0B

echo ========================================
echo    教育CRM系统 - 环境检查
echo ========================================
echo.

echo 🔍 检查系统环境...
echo.

REM 检查Node.js
echo [1/6] 检查 Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
) else (
    echo ❌ Node.js 未安装
    echo 💡 请访问 https://nodejs.org 下载安装
)

REM 检查npm
echo [2/6] 检查 npm...
npm --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    for /f "tokens=*" %%i in ('npm --version') do echo ✅ npm: %%i
) else (
    echo ❌ npm 未安装
)

REM 检查MySQL
echo [3/6] 检查 MySQL...
netstat -an | findstr :3306 >nul
if %ERRORLEVEL% == 0 (
    echo ✅ MySQL: 端口3306已监听
) else (
    echo ❌ MySQL: 未检测到端口3306
    echo 💡 请确保MySQL服务已启动
)

REM 检查Redis
echo [4/6] 检查 Redis...
netstat -an | findstr :6379 >nul
if %ERRORLEVEL% == 0 (
    echo ✅ Redis: 端口6379已监听
) else (
    echo ❌ Redis: 未检测到端口6379
    echo 💡 请确保Redis服务已启动
)

REM 检查项目依赖
echo [5/6] 检查前端依赖...
if exist "frontend\node_modules" (
    echo ✅ 前端依赖已安装
) else (
    echo ❌ 前端依赖未安装
    echo 💡 请运行: cd frontend && npm install
)

echo [6/6] 检查后端依赖...
if exist "backend\node_modules" (
    echo ✅ 后端依赖已安装
) else (
    echo ❌ 后端依赖未安装
    echo 💡 请运行: cd backend && npm install
)

echo.
echo ========================================
echo 📊 端口占用检查
echo ========================================
echo.

REM 检查端口占用
echo 检查常用端口占用情况:
echo.

netstat -an | findstr :3000 >nul
if %ERRORLEVEL% == 0 (
    echo ⚠️  端口3000 (后端): 已占用
) else (
    echo ✅ 端口3000 (后端): 空闲
)

netstat -an | findstr :5174 >nul
if %ERRORLEVEL% == 0 (
    echo ⚠️  端口5174 (前端): 已占用
) else (
    echo ✅ 端口5174 (前端): 空闲
)

netstat -an | findstr :8080 >nul
if %ERRORLEVEL% == 0 (
    echo ⚠️  端口8080: 已占用
) else (
    echo ✅ 端口8080: 空闲
)

echo.
echo ========================================
echo 📝 配置文件检查
echo ========================================
echo.

REM 检查配置文件
if exist "backend\.env.development" (
    echo ✅ 后端配置文件: .env.development
) else (
    echo ❌ 后端配置文件: .env.development 不存在
)

if exist "frontend\.env.development" (
    echo ✅ 前端配置文件: .env.development
) else (
    echo ❌ 前端配置文件: .env.development 不存在
)

if exist "package.json" (
    echo ✅ 根目录配置: package.json
) else (
    echo ❌ 根目录配置: package.json 不存在
)

echo.
echo ========================================
echo 🎯 环境检查完成
echo ========================================
echo.
echo 💡 下一步操作建议：
echo 1. 如果有❌项，请先解决相关问题
echo 2. 确保MySQL和Redis已启动
echo 3. 运行 QUICK-START.bat 启动系统
echo 4. 运行 STOP-SERVICES.bat 停止系统
echo.
pause