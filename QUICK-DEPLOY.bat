@echo off
echo ========================================
echo CRM System - Quick Deploy
echo ========================================
echo.
echo This update includes:
echo   - AI Marketing Assistant (6 scenarios)
echo   - AI Efficiency Analytics Dashboard
echo   - AI Diagnostic Reports (Weekly/Monthly)
echo   - CRM Statistics Page
echo.
echo Deploy Method: GitHub Actions Auto Deploy
echo.

:: Check if in Git repository
if not exist ".git" (
    echo ERROR: Not in Git repository
    echo Please run this script in D:\CC\1.1 directory
    pause
    exit /b 1
)

echo [1/4] Checking Git status...
git status
echo.

echo [2/4] Adding files to Git...
git add .
echo Done
echo.

echo [3/4] Creating commit...
git commit -m "feat: Add AI Marketing Assistant, Analytics Dashboard, Diagnostic Reports and CRM Statistics module"

if errorlevel 1 (
    echo.
    echo WARNING: No changes to commit or commit failed
    pause
    exit /b 1
)

echo Done
echo.

echo [4/4] Pushing to GitHub (will trigger auto deploy)...
git push origin master

if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo Possible reasons:
    echo   - Network connection issue
    echo   - SSH key not configured
    echo   - Branch name incorrect
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS: Code pushed to GitHub!
echo ========================================
echo.
echo Auto deployment will start...
echo.
echo View deployment progress:
echo    https://github.com/deji-li/haimianqingnian/actions
echo.
echo Deploy time: About 3-5 minutes
echo.
echo After deployment, you need to configure:
echo    1. SSH login to server
echo    2. Edit /var/www/crm/.env
echo    3. Add DEEPSEEK_API_KEY=your_key
echo    4. Restart backend: docker-compose restart backend
echo.
echo See UPDATE-DEPLOYMENT.md for details
echo ========================================
echo.

set /p OPEN_GITHUB="Open GitHub Actions now? (Y/N): "
if /i "%OPEN_GITHUB%"=="Y" (
    start https://github.com/deji-li/haimianqingnian/actions
)

pause
