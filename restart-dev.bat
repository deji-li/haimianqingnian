@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0restart-dev.ps1"
pause
