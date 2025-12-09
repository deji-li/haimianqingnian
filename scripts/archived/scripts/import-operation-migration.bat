@echo off
chcp 65001 >nul
echo ========================================
echo 运营管理系统数据库升级工具
echo ========================================
echo.
echo ⚠️  执行前请注意：
echo 1. 本脚本将升级运营管理相关数据表
echo 2. 建议先在测试环境执行
echo 3. 执行前会自动备份相关表数据
echo.

set /p confirm=确认继续执行？(yes/no):

if /i not "%confirm%"=="yes" (
    echo 操作已取消
    pause
    exit
)

echo.
echo 正在执行数据库升级...
echo.

mysql -h localhost -u root -p haimianqingnian < backend\migrate-operation-system.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ 数据库升级成功！
    echo.
    echo 升级内容：
    echo - 运营账号表优化
    echo - 运营日报表重构
    echo - 客户表扩展
    echo - 日报模板功能
    echo - 内容标签字典
    echo.
) else (
    echo.
    echo ❌ 数据库升级失败，请检查错误信息
    echo.
)

pause
