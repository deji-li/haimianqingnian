@echo off
echo ========================================
echo  CRM System - Clean Ports
echo ========================================
echo.
echo Cleaning ports: 3000, 5174, 5175
echo.

echo [1/3] Cleaning port 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Port 3000 cleaned

echo.
echo [2/3] Cleaning port 5174...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5174" ^| findstr "LISTENING"') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Port 5174 cleaned

echo.
echo [3/3] Cleaning port 5175...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5175" ^| findstr "LISTENING"') do (
    echo   Killing PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Port 5175 cleaned

echo.
echo ========================================
echo  Port Cleanup Complete
echo ========================================
echo.
echo Current port status:
netstat -ano 2>nul | findstr ":3000 :5174 :5175" | findstr "LISTENING"
if errorlevel 1 (
    echo   All target ports are free [OK]
)
echo.
pause
