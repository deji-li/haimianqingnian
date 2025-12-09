# Git Auto Push Script
Set-Location "D:\CC\1.1"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Git Auto Push Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "[1/4] Checking git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Add all changes
Write-Host "[2/4] Adding all changes..." -ForegroundColor Yellow
git add .
Write-Host "Changes staged." -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "[3/4] Committing..." -ForegroundColor Yellow
$msg = Read-Host "Enter commit message (or press Enter for 'update: auto commit')"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "update: auto commit"
}
git commit -m $msg
Write-Host ""

# Push
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin master
Write-Host ""

Write-Host "================================" -ForegroundColor Green
Write-Host "Push completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
