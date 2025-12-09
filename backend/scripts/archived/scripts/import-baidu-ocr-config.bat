@echo off
chcp 65001 >nul
echo ========================================
echo 百度OCR配置导入脚本
echo ========================================
echo.

REM 检查是否提供了数据库连接信息
if "%1"=="" (
    echo 使用方法: import-baidu-ocr-config.bat [数据库名] [用户名] [密码]
    echo.
    echo 示例: import-baidu-ocr-config.bat haimiandb root 123456
    echo.
    pause
    exit /b 1
)

set DB_NAME=%1
set DB_USER=%2
set DB_PASS=%3

echo 数据库名称: %DB_NAME%
echo 用户名: %DB_USER%
echo.
echo ========================================
echo 步骤 1/3: 添加secret_key字段和provider枚举
echo ========================================
mysql -u%DB_USER% -p%DB_PASS% %DB_NAME% < add-secret-key-to-ai-api-keys.sql
if %errorlevel% neq 0 (
    echo [错误] 数据库迁移失败
    pause
    exit /b 1
)
echo [完成] 数据库迁移成功
echo.

echo ========================================
echo 步骤 2/3: 插入OCR提供商选择配置
echo ========================================
mysql -u%DB_USER% -p%DB_PASS% %DB_NAME% < insert-ocr-provider-config.sql
if %errorlevel% neq 0 (
    echo [错误] OCR提供商配置插入失败
    pause
    exit /b 1
)
echo [完成] OCR提供商配置插入成功
echo.

echo ========================================
echo 步骤 3/3: 插入百度OCR API配置
echo ========================================
echo.
echo [重要提示] 请先编辑 insert-baidu-ocr-config.sql 文件
echo 将 'your_baidu_api_key' 和 'your_baidu_secret_key' 替换为实际密钥
echo.
set /p confirm="确认已修改密钥？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 已取消。请先修改 insert-baidu-ocr-config.sql 文件
    pause
    exit /b 0
)

mysql -u%DB_USER% -p%DB_PASS% %DB_NAME% < insert-baidu-ocr-config.sql
if %errorlevel% neq 0 (
    echo [错误] 百度OCR配置插入失败
    pause
    exit /b 1
)
echo [完成] 百度OCR配置插入成功
echo.

echo ========================================
echo 配置导入完成！
echo ========================================
echo.
echo 后续步骤:
echo 1. 登录系统设置页面，验证百度OCR配置
echo 2. 执行以下SQL切换到百度OCR:
echo    UPDATE business_config SET config_value = 'baidu' WHERE config_key = 'ocr_provider';
echo 3. 上传测试图片验证识别效果
echo.
echo 详细使用说明请查看: 百度OCR配置和使用指南.md
echo.
pause
