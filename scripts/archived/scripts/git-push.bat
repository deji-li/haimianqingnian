@echo off
chcp 65001 >nul
cd /d D:\CC\1.1

echo ================================
echo Git Auto Push Script
echo ================================
echo.

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding changes...
git add .
echo.

echo [3/4] Committing...
set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" (
    git commit -m "update: auto commit"
) else (
    git commit -m "%msg%"
)
echo.

echo [4/4] Pushing to GitHub...
git push origin master
echo.

echo ================================
echo Push completed!
echo ================================
pause
