@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0dev-start-background.ps1"
pause
