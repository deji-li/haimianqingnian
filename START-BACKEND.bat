@echo off
chcp 65001 >nul
echo ========================================
echo    教育CRM系统 - 后端启动脚本
echo ========================================
echo.

REM 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本
    pause
    exit /b 1
)

echo [步骤1] 清理旧的Node进程...
taskkill /F /IM node.exe >nul 2>&1
if %errorLevel% equ 0 (
    echo [成功] 已清理旧的Node进程
) else (
    echo [信息] 没有发现运行中的Node进程
)
echo.

echo [步骤2] 清理端口3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo [信息] 发现进程 %%a 占用端口3000，正在清理...
    taskkill /F /PID %%a >nul 2>&1
)
echo [成功] 端口3000已清理
echo.

echo [步骤3] 进入后端目录...
cd /d "%~dp0backend"
if %errorLevel% neq 0 (
    echo [错误] 无法进入backend目录
    pause
    exit /b 1
)
echo [成功] 已进入backend目录
echo.

echo [步骤4] 检查依赖...
if not exist "node_modules" (
    echo [警告] node_modules不存在，正在安装依赖...
    call npm install
    if %errorLevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [成功] 依赖已安装
)
echo.

echo [步骤5] 启动后端服务...
echo [信息] 后端将在 http://localhost:3000 启动
echo [信息] 按 Ctrl+C 可停止服务
echo.
echo ========================================
echo.

npm run start:dev

REM 如果启动失败
if %errorLevel% neq 0 (
    echo.
    echo [错误] 后端启动失败
    echo [提示] 请检查：
    echo   1. MySQL是否已启动
    echo   2. backend/.env.development配置是否正确
    echo   3. 数据库连接信息是否正确
    pause
    exit /b 1
)
