@echo off
title 教育CRM系统 - 快速启动
color 0A

echo ========================================
echo    教育CRM管理系统 - 快速启动
echo ========================================
echo.
echo 🚀 正在启动前后端服务...
echo.

REM 检查后端端口
netstat -an | findstr :3000 >nul
if %ERRORLEVEL% == 0 (
    echo ⚠️  端口3000已被占用，正在尝试关闭现有进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 2 /nobreak >nul
)

REM 检查前端端口
netstat -an | findstr :5174 >nul
if %ERRORLEVEL% == 0 (
    echo ⚠️  端口5174已被占用，正在尝试关闭现有进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 2 /nobreak >nul
)

echo 📦 [1/2] 启动后端服务 (端口3000)...
cd /d "%~dp0backend"
start "CRM Backend" cmd /k "echo 🔧 CRM后端服务启动中... && npm run start:dev"

echo ⏳ 等待后端服务启动 (10秒)...
timeout /t 10 /nobreak >nul

echo 🌐 [2/2] 启动前端服务 (端口5174)...
cd /d "%~dp0frontend"
start "CRM Frontend" cmd /k "echo 💻 CRM前端服务启动中... && npm run dev"

echo.
echo ========================================
echo ✅ 服务启动完成！
echo ========================================
echo 📱 前端地址: http://localhost:5174
echo 🔧 后端地址: http://localhost:3000
echo 📚 API文档: http://localhost:3000/api
echo.
echo 💡 提示：
echo    - 请等待30秒让服务完全启动
echo    - 如果遇到错误，请检查MySQL和Redis是否已启动
echo    - 默认账号: admin / admin123
echo ========================================
echo.
echo 🌐 正在打开前端页面...
start http://localhost:5174

timeout /t 5 /nobreak >nul
echo 📚 正在打开API文档...
start http://localhost:3000/api

echo.
echo 🎉 启动完成！如果需要停止服务，请关闭对应的命令窗口。
echo.
pause