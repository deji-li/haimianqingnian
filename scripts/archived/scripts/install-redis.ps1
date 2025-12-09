# Install Redis on Windows using Chocolatey

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Install Redis for Windows" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Chocolatey is installed
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoInstalled) {
    Write-Host "Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "Chocolatey installed!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Installing Redis..." -ForegroundColor Yellow
choco install redis-64 -y

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Redis Installation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Redis is now installed and running as a Windows service" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start Redis: redis-server" -ForegroundColor White
Write-Host "To test Redis: redis-cli ping" -ForegroundColor White
Write-Host ""
