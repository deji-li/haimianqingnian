@echo off
echo ========================================
echo 启动教育CRM系统
echo ========================================
echo.

echo [1/2] 启动后端服务 (端口3000)...
start "Backend Server" cmd /k "cd /d D:\CC\1.1\backend && npm run start:dev"
timeout /t 5 /nobreak > nul

echo [2/2] 启动前端服务 (端口5174)...
start "Frontend Server" cmd /k "cd /d D:\CC\1.1\frontend && npm run dev"

echo.
echo ========================================
echo 服务启动完成！
echo ========================================
echo 前端地址: http://localhost:5174
echo 后端地址: http://localhost:3000
echo.
echo 提示：请等待30秒让后端完全启动
echo ========================================
pause
