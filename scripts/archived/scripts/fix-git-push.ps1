# Fix Git Push Issues

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Fix Git Push" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "D:\CC\1.1"

Write-Host "[1/4] Removing database backup from staging..." -ForegroundColor Yellow
git rm --cached server-database-backup.sql 2>&1 | Out-Null
git add .gitignore 2>&1 | Out-Null
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Checking current remote URL..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>&1
Write-Host "Current: $remoteUrl" -ForegroundColor Gray

if ($remoteUrl -like "*git@github.com*") {
    Write-Host "Using SSH URL (port 22 is blocked)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Switching to HTTPS..." -ForegroundColor Yellow

    # Extract repo path from SSH URL
    $repoPath = $remoteUrl -replace "git@github.com:", "" -replace ".git", ""
    $httpsUrl = "https://github.com/$repoPath.git"

    git remote set-url origin $httpsUrl 2>&1 | Out-Null
    Write-Host "Changed to: $httpsUrl" -ForegroundColor Green
} else {
    Write-Host "Already using HTTPS" -ForegroundColor Green
}
Write-Host ""

Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
git add . 2>&1 | Out-Null
git commit -m "chore: add database sync scripts and update gitignore" 2>&1 | Out-Null
Write-Host "Committed" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This may prompt for GitHub username and password/token..." -ForegroundColor Gray
Write-Host ""

git push origin master 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Push Successful!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "Push Failed" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to configure GitHub credentials:" -ForegroundColor Yellow
    Write-Host "  1. Use GitHub Personal Access Token" -ForegroundColor White
    Write-Host "  2. Or configure Git Credential Manager" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
