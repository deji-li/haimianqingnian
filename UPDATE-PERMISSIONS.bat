@echo off
echo ========================================
echo Update AI Permissions
echo ========================================
echo.

:: Check if MySQL container is running
docker ps | findstr mysql >nul
if errorlevel 1 (
    echo ERROR: MySQL container is not running
    echo Please run: docker-compose up -d
    pause
    exit /b 1
)

echo [1/2] Copying SQL file to MySQL container...
docker cp backend\update-ai-permissions.sql crm-mysql:/tmp/update-ai-permissions.sql

if errorlevel 1 (
    echo ERROR: Failed to copy SQL file
    pause
    exit /b 1
)

echo Done
echo.

echo [2/2] Executing SQL script...
docker exec -i crm-mysql mysql -uroot -p123456 crm_db < backend\update-ai-permissions.sql

if errorlevel 1 (
    echo ERROR: Failed to execute SQL script
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: AI permissions updated!
echo ========================================
echo.
echo Please:
echo 1. Refresh your browser (F5)
echo 2. Or logout and login again
echo.
echo You should now see:
echo   - AI Marketing Assistant
echo   - AI Analytics Dashboard
echo   - AI Diagnostic Reports
echo   - CRM Statistics
echo.

pause
