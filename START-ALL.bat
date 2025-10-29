@echo off
chcp 65001 >nul
echo ========================================
echo    Education CRM System - Full Startup
echo ========================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this script as Administrator
    pause
    exit /b 1
)

echo [Step 1] Cleaning old Node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorLevel% equ 0 (
    echo [SUCCESS] Cleaned old Node processes
) else (
    echo [INFO] No running Node processes found
)
echo.

echo [Step 2] Cleaning ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr LISTENING') do (
    echo [INFO] Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5174" ^| findstr LISTENING') do (
    echo [INFO] Killing process %%a on port 5174...
    taskkill /F /PID %%a >nul 2>&1
)
echo [SUCCESS] Ports cleaned
echo.

echo [Step 3] Starting Backend (Port 3000)...
cd /d "%~dp0backend"
if %errorLevel% neq 0 (
    echo [ERROR] Cannot enter backend directory
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [WARNING] node_modules not found, installing dependencies...
    call npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Backend dependency installation failed
        pause
        exit /b 1
    )
)

echo [INFO] Backend starting at http://localhost:3000
start "Backend Server" cmd /c "npm run start:dev"
timeout /t 3 /nobreak >nul
echo.

echo [Step 4] Starting Frontend (Port 5174)...
cd /d "%~dp0frontend"
if %errorLevel% neq 0 (
    echo [ERROR] Cannot enter frontend directory
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [WARNING] node_modules not found, installing dependencies...
    call npm install
    if %errorLevel% neq 0 (
        echo [ERROR] Frontend dependency installation failed
        pause
        exit /b 1
    )
)

echo [INFO] Frontend starting at http://localhost:5174
start "Frontend Server" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul
echo.

echo ========================================
echo [SUCCESS] All services started!
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5174
echo.
echo [INFO] Press any key to open browser...
echo ========================================
pause >nul

start http://localhost:5174

echo.
echo [INFO] Services are running in background
echo [INFO] To stop services, run STOP.bat
echo.
pause
