@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0reset-and-insert-data.ps1"
pause
