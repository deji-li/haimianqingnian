@echo off
chcp 65001 >nul
echo ========================================
echo 一键修复所有编译问题
echo ========================================
echo.

echo [1/4] 删除父目录 node_modules (rxjs冲突根源)...
cd ..
if exist "node_modules" (
    rmdir /s /q node_modules
    echo [成功] 已删除 D:\CC\1.1\node_modules
) else (
    echo [信息] 父目录没有 node_modules
)
echo.

echo [2/4] 删除父目录 package-lock.json...
if exist "package-lock.json" (
    del /f /q package-lock.json
    echo [成功] 已删除 package-lock.json
)
if exist "package.json" (
    del /f /q package.json
    echo [成功] 已删除 package.json
)
echo.

echo [3/4] 清理后端编译缓存...
cd backend
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo [成功] 编译缓存已清理
echo.

echo [4/4] 重新编译项目...
call npx nest build
echo.

if exist "dist\main.js" (
    echo ========================================
    echo [√] 所有问题已修复！编译成功！
    echo ========================================
    echo.
    echo 现在可以启动后端了:
    echo   npm run start:dev
    echo.
) else (
    echo ========================================
    echo [×] 编译仍有错误
    echo ========================================
    echo.
    echo 请查看上面的错误信息
    echo.
)

pause
