@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0insert-test-data.ps1"
pause
