@echo off
title 停止CRM系统服务
color 0C

echo ========================================
echo    停止教育CRM系统服务
echo ========================================
echo.

echo 🛑 正在查找并停止CRM相关进程...

REM 停止后端服务 (端口3000)
echo 📦 停止后端服务 (端口3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo    - 终止进程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

REM 停止前端服务 (端口5174)
echo 🌐 停止前端服务 (端口5174)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174') do (
    echo    - 终止进程 PID: %%a
    taskkill /F /PID %%a 2>nul
)

REM 强制关闭相关窗口
echo 🔧 关闭命令窗口...
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq CRM Backend*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq CRM Frontend*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Backend Server*" 2>nul
taskkill /F /IM cmd.exe /FI "WINDOWTITLE eq Frontend Server*" 2>nul

echo.
echo ========================================
echo ✅ 服务已停止！
echo ========================================
echo.
echo 💡 所有CRM相关进程已终止
echo 💡 如需重新启动，请运行 QUICK-START.bat
echo.
pause