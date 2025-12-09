@echo off
echo ========================================
echo Fixing bcrypt compilation issue
echo ========================================
echo.

echo [1/3] Installing ignore-loader...
call npm install --save-dev ignore-loader

echo.
echo [2/3] Rebuilding bcrypt...
call npm rebuild bcrypt

echo.
echo [3/3] Cleaning and reinstalling...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q dist 2>nul

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Now try starting the backend:
echo   npm run start:dev
echo.
pause
