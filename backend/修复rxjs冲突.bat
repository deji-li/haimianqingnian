@echo off
echo ========================================
echo 修复 rxjs 版本冲突
echo ========================================
echo.

echo [1/2] 删除父目录的 node_modules（导致版本冲突）...
cd ..
if exist "node_modules" (
    echo 正在删除 D:\CC\1.1\node_modules...
    rmdir /s /q node_modules
    echo [成功] 已删除父目录 node_modules
) else (
    echo [信息] 父目录没有 node_modules
)
echo.

echo [2/2] 清理 backend 编译缓存...
cd backend
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.cache 2>nul
echo [完成] 缓存已清理
echo.

echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 现在请运行: npm run start:dev
echo.
pause
