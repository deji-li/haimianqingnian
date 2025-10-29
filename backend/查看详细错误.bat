@echo off
echo ========================================
echo 清理缓存并重新启动后端（显示详细错误）
echo ========================================
echo.

echo [1/4] 清理编译缓存...
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo 完成
echo.

echo [2/4] 清理并重新编译...
call npx nest build
echo.

echo [3/4] 检查编译结果...
if exist "dist\main.js" (
    echo [成功] 编译完成
) else (
    echo [失败] 编译失败，请查看上面的错误
    pause
    exit /b 1
)
echo.

echo [4/4] 启动应用...
echo.
echo 如果看到错误，请复制所有红色文字
echo ========================================
echo.
call npm run start:dev
