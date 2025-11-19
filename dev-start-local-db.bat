@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0dev-start-local-db.ps1"
