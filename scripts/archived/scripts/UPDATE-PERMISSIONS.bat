@echo off
chcp 65001 >nul
echo ========================================
echo Update AI Permissions
echo ========================================
echo.

echo [1/2] Checking MySQL container...
docker ps --filter "name=crm-mysql" --filter "status=running" --format "{{.Names}}" | findstr crm-mysql >nul

if errorlevel 1 (
    echo ERROR: MySQL container is not running
    echo.
    echo Please run: docker-compose up -d
    echo.
    pause
    exit /b 1
)

echo Container is running
echo.

echo [2/2] Executing SQL script...
type backend\update-ai-permissions.sql | docker exec -i crm-mysql mysql -uroot -p7821630lideji education_crm

if errorlevel 1 (
    echo.
    echo ERROR: Failed to execute SQL script
    echo.
    echo Possible reasons:
    echo   - MySQL password incorrect
    echo   - Database name incorrect
    echo   - SQL syntax error
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: AI permissions updated!
echo ========================================
echo.
echo Please:
echo   1. Refresh your browser (F5)
echo   2. Or logout and login again
echo.
echo You should now see 4 new features:
echo   - AI Marketing Assistant
echo   - AI Analytics Dashboard
echo   - AI Diagnostic Reports
echo   - CRM Statistics
echo.

pause
