@echo off
chcp 65001 >nul
PowerShell -ExecutionPolicy Bypass -File "%~dp0fix-git-pull.ps1"
