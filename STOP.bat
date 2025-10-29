@echo off
chcp 65001 >nul
echo ========================================
echo    Education CRM System - Stop Services
echo ========================================
echo.

echo [Step 1] Stopping Backend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr LISTENING') do (
    echo [INFO] Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
echo [SUCCESS] Backend stopped
echo.

echo [Step 2] Stopping Frontend (Port 5174)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr LISTENING') do (
    echo [INFO] Killing process %%a on port 5174...
    taskkill /F /PID %%a >nul 2>&1
)
echo [SUCCESS] Frontend stopped
echo.

echo [Step 3] Cleaning all Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] All Node processes cleaned
) else (
    echo [INFO] No Node processes found
)
echo.

echo ========================================
echo [SUCCESS] All Services Stopped!
echo ========================================
echo.
pause
