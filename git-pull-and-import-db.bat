@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0git-pull-and-import-db.ps1"
