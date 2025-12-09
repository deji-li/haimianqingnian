@echo off
chcp 65001 >nul
echo ========================================
echo    Backend Health Monitor
echo ========================================
echo.
echo Checking backend status every 5 seconds...
echo Press Ctrl+C to stop monitoring
echo.

:loop
echo [%date% %time%] Checking...

REM Check if port 3000 is listening
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] Port 3000 is LISTENING
) else (
    echo   [ERROR] Port 3000 is NOT listening!
    goto :error
)

REM Test API health
curl -s http://localhost:3000 >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] Backend is responding
) else (
    echo   [ERROR] Backend is NOT responding!
    goto :error
)

REM Test team-stats API
curl -s "http://localhost:3000/api/team-stats/member-performance?limit=1" >nul 2>&1
if %errorLevel% equ 0 (
    echo   [OK] Team-stats API is accessible
) else (
    echo   [WARNING] Team-stats API returned error (may need auth)
)

echo.
timeout /t 5 /nobreak >nul
goto :loop

:error
echo.
echo ========================================
echo [CRITICAL] Backend has crashed or stopped!
echo ========================================
pause
exit /b 1
