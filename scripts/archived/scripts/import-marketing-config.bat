@echo off
chcp 65001 >nul
echo ========================================
echo 导入AI营销助手配置到数据库
echo ========================================
echo.

echo 请选择操作：
echo 1. 导入AI营销场景配置
echo 2. 查看当前营销配置
echo 3. 退出
echo.

set /p choice=请输入选项 (1-3):

if "%choice%"=="1" (
    echo.
    echo 正在导入营销场景配置...
    mysql -h localhost -u root -p haimianqingnian < backend\insert-marketing-ai-scenarios.sql
    echo.
    echo 导入完成！
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo 当前营销场景配置：
    mysql -h localhost -u root -p haimianqingnian -e "SELECT id, scenario_key, scenario_name, scenario_category, model_provider, is_active FROM ai_prompt_configs WHERE scenario_category = 'AI营销助手' ORDER BY id;"
    echo.
    pause
) else (
    exit
)
