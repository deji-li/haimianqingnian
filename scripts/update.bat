@echo off
chcp 65001 >nul
echo 🚀 开始更新部署...
echo.

REM 进入项目目录
cd /d %~dp0..

REM 拉取最新代码
echo 📦 拉取最新代码...
git pull origin master
if errorlevel 1 (
    echo ❌ 拉取代码失败
    pause
    exit /b 1
)

REM 更新前端依赖
echo.
echo 🎨 更新前端依赖...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)

REM 构建前端
echo.
echo 🎨 构建前端...
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    cd ..
    pause
    exit /b 1
)

REM 更新后端依赖
echo.
echo ⚙️  更新后端依赖...
cd ..\backend
call npm install
if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    cd ..
    pause
    exit /b 1
)

REM 构建后端
echo.
echo ⚙️  构建后端...
call npm run build
if errorlevel 1 (
    echo ❌ 后端构建失败
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ 本地更新完成！
echo.
echo 📝 提示：如需部署到服务器，请执行以下命令：
echo    1. git add .
echo    2. git commit -m "your commit message"
echo    3. git push origin master
echo.
pause
